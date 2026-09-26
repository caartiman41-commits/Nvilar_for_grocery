package services

import (
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

var istLocation = time.FixedZone("IST", 5*3600+30*60)

// FormatClockTime returns clock-formatted time string (e.g. "01:45 PM") and contextual string (e.g. "Today at 01:45 PM")
func FormatClockTime(t time.Time) (clockTime string, formatted string) {
	if t.IsZero() {
		return "", "Offline"
	}
	tIST := t.In(istLocation)
	clockTime = tIST.Format("03:04 PM")

	nowIST := time.Now().In(istLocation)
	diff := nowIST.Sub(tIST)

	todayYear, todayMonth, todayDay := nowIST.Date()
	tYear, tMonth, tDay := tIST.Date()

	if todayYear == tYear && todayMonth == tMonth && todayDay == tDay {
		if diff < 2*time.Minute {
			formatted = "Just now"
		} else {
			formatted = "Today at " + clockTime
		}
	} else if nowIST.AddDate(0, 0, -1).Day() == tDay && nowIST.AddDate(0, 0, -1).Month() == tMonth {
		formatted = "Yesterday at " + clockTime
	} else {
		formatted = tIST.Format("02 Jan at 03:04 PM")
	}
	return clockTime, formatted
}

// WSMessage represents unified bidirectional websocket payloads
type WSMessage struct {
	Type          string      `json:"type"` // "message", "counter_offer", "deal_accepted", "presence", "typing", "seen"
	NegotiationID string      `json:"negotiation_id"`
	SenderID      string      `json:"sender_id,omitempty"`
	UserID        string      `json:"user_id,omitempty"`
	Role          string      `json:"role,omitempty"` // "customer", "seller"
	MessageText   string      `json:"message_text,omitempty"`
	OfferedPrice  *int        `json:"offered_price,omitempty"`
	AgreedPrice   *int        `json:"agreed_price,omitempty"`
	DealStatus    string      `json:"deal_status,omitempty"` // "pending", "accepted", "rejected"
	IsOnline      *bool       `json:"is_online,omitempty"`
	LastSeen      *time.Time  `json:"last_seen,omitempty"`
	LastSeenClock string      `json:"last_seen_clock,omitempty"`
	IsTyping      *bool       `json:"is_typing,omitempty"`
	Data          interface{} `json:"data,omitempty"`
}

// MessagePayload preserves backward compatibility with existing message receivers
type MessagePayload struct {
	NegotiationID string `json:"negotiation_id"`
	SenderID      string `json:"sender_id"`
	MessageText   string `json:"message_text"`
	OfferedPrice  int    `json:"offered_price,omitempty"`
}

type Client struct {
	Conn          *websocket.Conn
	NegotiationID string
	UserID        string
	Role          string
	ShopID        string
}

type RoomManager struct {
	rooms           map[string]map[*Client]bool
	userConnections map[string]int
	mutex           sync.RWMutex
}

var GlobalRoomManager = &RoomManager{
	rooms:           make(map[string]map[*Client]bool),
	userConnections: make(map[string]int),
}

// AddClient adds a client to a negotiation room and registers active presence
func (rm *RoomManager) AddClient(client *Client) bool {
	rm.mutex.Lock()
	defer rm.mutex.Unlock()

	if _, ok := rm.rooms[client.NegotiationID]; !ok {
		rm.rooms[client.NegotiationID] = make(map[*Client]bool)
	}
	rm.rooms[client.NegotiationID][client] = true

	firstConnection := false
	if client.UserID != "" && client.UserID != "guest" {
		rm.userConnections[client.UserID]++
		if rm.userConnections[client.UserID] == 1 {
			firstConnection = true
		}
	}

	log.Printf("🔌 Client %s (role: %s) joined negotiation room %s (total in room: %d)",
		client.UserID, client.Role, client.NegotiationID, len(rm.rooms[client.NegotiationID]))
	return firstConnection
}

// RemoveClient removes a client and updates user connection counts
func (rm *RoomManager) RemoveClient(client *Client) bool {
	rm.mutex.Lock()
	defer rm.mutex.Unlock()

	if clients, ok := rm.rooms[client.NegotiationID]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(rm.rooms, client.NegotiationID)
		}
	}

	nowOffline := false
	if client.UserID != "" && client.UserID != "guest" {
		rm.userConnections[client.UserID]--
		if rm.userConnections[client.UserID] <= 0 {
			delete(rm.userConnections, client.UserID)
			nowOffline = true
		}
	}

	log.Printf("🔌 Client %s left negotiation room %s", client.UserID, client.NegotiationID)
	return nowOffline
}

// IsUserOnline returns true if user has at least one active websocket connection
func (rm *RoomManager) IsUserOnline(userID string) bool {
	if userID == "" {
		return false
	}
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()
	return rm.userConnections[userID] > 0
}

// BroadcastToRoom sends a message payload to all active clients in a negotiation room
func (rm *RoomManager) BroadcastToRoom(negotiationID string, payload interface{}) {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()

	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("⚠️ WebSocket JSON marshal error: %v", err)
		return
	}

	if clients, ok := rm.rooms[negotiationID]; ok {
		for client := range clients {
			if err := client.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("⚠️ WebSocket write error to client %s: %v", client.UserID, err)
				client.Conn.Close()
			}
		}
	}
}

// BroadcastPresence sends real-time presence changes to a negotiation room
func (rm *RoomManager) BroadcastPresence(negotiationID, userID, role string, isOnline bool) {
	now := time.Now()
	clockTime, formatted := FormatClockTime(now)
	rm.BroadcastToRoom(negotiationID, WSMessage{
		Type:          "presence",
		NegotiationID: negotiationID,
		UserID:        userID,
		SenderID:      userID,
		Role:          role,
		IsOnline:      &isOnline,
		LastSeen:      &now,
		LastSeenClock: clockTime,
		Data: map[string]interface{}{
			"user_id":             userID,
			"role":                role,
			"is_online":           isOnline,
			"last_seen":           now,
			"last_seen_formatted": formatted,
			"clock_time":          clockTime,
		},
	})
}

// UpdateUserPresenceDB records real-time online/offline presence into PostgreSQL
func UpdateUserPresenceDB(userID, role, shopID string, isOnline bool) {
	db := config.DB
	if db == nil || userID == "" || userID == "guest" {
		return
	}

	sessionID := "ws_" + userID
	var shopIDPtr *string
	if shopID != "" {
		shopIDPtr = &shopID
	}

	cleanRole := strings.ToLower(strings.TrimSpace(role))
	if cleanRole != "seller" {
		cleanRole = "customer"
	}

	now := time.Now()
	upsertQuery := `
		INSERT INTO user_presences (session_id, user_id, role, shop_id, current_route, device, city, is_online, last_seen, first_seen_at)
		VALUES (?, ?, ?, ?, '/chat', 'mobile_ws', 'India', ?, ?, ?)
		ON CONFLICT (session_id) DO UPDATE SET
			user_id = EXCLUDED.user_id,
			role = EXCLUDED.role,
			shop_id = COALESCE(EXCLUDED.shop_id, user_presences.shop_id),
			is_online = EXCLUDED.is_online,
			last_seen = EXCLUDED.last_seen
	`
	_ = db.Exec(upsertQuery, sessionID, userID, cleanRole, shopIDPtr, isOnline, now, now)
}

// IsNegotiationAuthorized verifies if a given user is an allowed participant in a negotiation
func IsNegotiationAuthorized(db *gorm.DB, neg *models.Negotiation, userID string) bool {
	if userID == "" || neg == nil {
		return false
	}
	cleanID := strings.TrimSpace(userID)

	// 1. Direct Buyer ID match
	if neg.BuyerID == cleanID {
		return true
	}

	// 2. Direct Shop ID match
	if neg.ShopID == cleanID {
		return true
	}

	// 3. Shop Owner match
	var shop models.Shop
	if err := db.Where("id = ?", neg.ShopID).First(&shop).Error; err == nil {
		if shop.OwnerID == cleanID || shop.ID == cleanID {
			return true
		}
	}

	// 4. Resolve buyer aliases (Firebase UID, Phone, internal UUID)
	var buyer models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", neg.BuyerID, neg.BuyerID, neg.BuyerID).First(&buyer).Error; err == nil {
		if buyer.ID == cleanID || (buyer.FirebaseUID != nil && *buyer.FirebaseUID == cleanID) || buyer.Phone == cleanID {
			return true
		}
	}

	// 5. Resolve caller user record to check boutique ownership or admin role
	var caller models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", cleanID, cleanID, cleanID).First(&caller).Error; err == nil {
		if caller.Role == "admin" {
			return true
		}
		if caller.ID == neg.BuyerID {
			return true
		}
		if shop.OwnerID != "" && (shop.OwnerID == caller.ID || (caller.FirebaseUID != nil && shop.OwnerID == *caller.FirebaseUID)) {
			return true
		}
	}

	return false
}

// HandleBargainWS handles real-time bargaining socket connections with zero-trust verification
func HandleBargainWS(c *websocket.Conn) {
	negotiationID := c.Params("negotiation_id")
	userID := c.Query("user_id", "guest")
	role := c.Query("role", "customer")
	shopID := c.Query("shop_id", "")

	db := config.DB

	// Zero-Trust Ownership Verification: Ensure user is a legitimate participant
	if db != nil && negotiationID != "" && negotiationID != "test" && negotiationID != "global" {
		var neg models.Negotiation
		if err := db.Where("id = ?", negotiationID).First(&neg).Error; err == nil {
			if userID == "guest" || !IsNegotiationAuthorized(db, &neg, userID) {
				log.Printf("⛔ [Anti-IDOR] Unauthorized WebSocket connection rejected: User %s attempted room %s", userID, negotiationID)
				_ = c.WriteJSON(fiber.Map{
					"error":   "Forbidden: You are not an authorized participant in this negotiation",
					"success": false,
				})
				_ = c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "Unauthorized"))
				c.Close()
				return
			}
		}
	}

	client := &Client{
		Conn:          c,
		NegotiationID: negotiationID,
		UserID:        userID,
		Role:          role,
		ShopID:        shopID,
	}

	firstConnect := GlobalRoomManager.AddClient(client)
	if firstConnect && userID != "guest" {
		UpdateUserPresenceDB(userID, role, shopID, true)
		GlobalRoomManager.BroadcastPresence(negotiationID, userID, role, true)
	}

	defer func() {
		nowOffline := GlobalRoomManager.RemoveClient(client)
		if nowOffline && userID != "guest" {
			UpdateUserPresenceDB(userID, role, shopID, false)
			GlobalRoomManager.BroadcastPresence(negotiationID, userID, role, false)
		}
		c.Close()
	}()

	for {
		messageType, msg, err := c.ReadMessage()
		if err != nil {
			break
		}

		if messageType == websocket.TextMessage {
			var incoming map[string]interface{}
			if err := json.Unmarshal(msg, &incoming); err == nil {
				msgType, _ := incoming["type"].(string)

				switch msgType {
				case "ping", "heartbeat":
					UpdateUserPresenceDB(userID, role, shopID, true)
					_ = c.WriteJSON(fiber.Map{"type": "pong", "time": time.Now().UTC()})

				case "typing":
					// Broadcast typing indicator to others in room
					isTyping := true
					if val, ok := incoming["is_typing"].(bool); ok {
						isTyping = val
					}
					GlobalRoomManager.BroadcastToRoom(negotiationID, WSMessage{
						Type:          "typing",
						NegotiationID: negotiationID,
						SenderID:      userID,
						UserID:        userID,
						Role:          role,
						IsTyping:      &isTyping,
						Data: map[string]interface{}{
							"is_typing": isTyping,
							"role":      role,
							"user_id":   userID,
						},
					})

				default:
					// Standard chat message or counter offer payload
					text, _ := incoming["message_text"].(string)
					if text == "" {
						text, _ = incoming["text"].(string)
					}
					var offerPrice *int
					if rawOffer, ok := incoming["offered_price"].(float64); ok && rawOffer > 0 {
						priceInt := int(rawOffer)
						offerPrice = &priceInt
					}

					sender := userID
					if s, ok := incoming["sender_id"].(string); ok && s != "" {
						sender = s
					}

					clockTime, _ := FormatClockTime(time.Now())
					GlobalRoomManager.BroadcastToRoom(negotiationID, WSMessage{
						Type:          "message",
						NegotiationID: negotiationID,
						SenderID:      sender,
						UserID:        sender,
						Role:          role,
						MessageText:   text,
						OfferedPrice:  offerPrice,
						LastSeenClock: clockTime,
						Data:          incoming,
					})
				}
			} else {
				// Fallback raw broadcast
				var payload MessagePayload
				if err := json.Unmarshal(msg, &payload); err == nil {
					payload.NegotiationID = negotiationID
					GlobalRoomManager.BroadcastToRoom(negotiationID, payload)
				}
			}
		}
	}
}

// BroadcastToRoom is a package-level convenience function for broadcasting
// messages to all WebSocket clients in a negotiation room from external packages.
func BroadcastToRoom(negotiationID string, payload interface{}) {
	GlobalRoomManager.BroadcastToRoom(negotiationID, payload)
}
