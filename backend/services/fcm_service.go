package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"mitreno-backend/config"

	"firebase.google.com/go/v4/messaging"
)

// Channel definitions for Android notification routing
const (
	ChannelSeller = "mitreno_seller_channel"
	ChannelBuyer  = "mitreno_buyer_channel"
	ChannelOrders = "mitreno_orders_channel"

	SoundCashChime   = "cash_chime"
	SoundLuxuryChime = "luxury_chime"
	SoundDefault     = "default"
)

var (
	// VibrationSellerPulse: Double fast pulse [0, 250, 200, 250] ms
	VibrationSellerPulse = []int64{0, 250, 200, 250}

	// VibrationBuyerWave: Single smooth wave [0, 400] ms
	VibrationBuyerWave = []int64{0, 400}

	// VibrationOrdersPulse: Order status alert [0, 300, 150, 300] ms
	VibrationOrdersPulse = []int64{0, 300, 150, 300}
)

type FCMNotificationPayload struct {
	Title            string            `json:"title"`
	Body             string            `json:"body"`
	ImageURL         string            `json:"image_url,omitempty"`
	ChannelID        string            `json:"channel_id,omitempty"`
	Sound            string            `json:"sound,omitempty"`
	VibrationPattern []int64           `json:"vibration_pattern,omitempty"`
	Priority         string            `json:"priority,omitempty"`
	ClickAction      string            `json:"click_action,omitempty"`
	Data             map[string]string `json:"data,omitempty"`
	Tokens           []string          `json:"tokens"`
}

type FCMService struct {
	ProjectID string
	client    *http.Client
}

func NewFCMService(projectID string) *FCMService {
	return &FCMService{
		ProjectID: projectID,
		client:    &http.Client{Timeout: 10 * time.Second},
	}
}

// SendPushNotification sends an alert to Android device tokens with channel routing & sound/vibration
func (fs *FCMService) SendPushNotification(payload FCMNotificationPayload) error {
	if len(payload.Tokens) == 0 {
		return nil
	}

	channelID := payload.ChannelID
	if channelID == "" {
		channelID = ChannelOrders
	}

	sound := payload.Sound
	if sound == "" {
		switch channelID {
		case ChannelSeller:
			sound = SoundCashChime
		case ChannelBuyer:
			sound = SoundLuxuryChime
		default:
			sound = SoundDefault
		}
	}

	vibration := payload.VibrationPattern
	if len(vibration) == 0 {
		switch channelID {
		case ChannelSeller:
			vibration = VibrationSellerPulse
		case ChannelBuyer:
			vibration = VibrationBuyerWave
		case ChannelOrders:
			vibration = VibrationOrdersPulse
		}
	}

	priority := payload.Priority
	if priority == "" {
		priority = "HIGH"
	}

	clickAction := payload.ClickAction
	if clickAction == "" {
		notifType := ""
		targetRole := ""
		if payload.Data != nil {
			notifType = payload.Data["type"]
			targetRole = payload.Data["target_role"]
		}
		switch {
		case notifType == "new_order" || (notifType == "order" && targetRole == "seller"):
			clickAction = "OPEN_SELLER_ORDERS"
		case notifType == "order_update" || (notifType == "order" && targetRole == "buyer"):
			clickAction = "OPEN_BUYER_ORDERS"
		case channelID == ChannelSeller || targetRole == "seller":
			clickAction = "OPEN_SELLER_CHAT"
		case channelID == ChannelBuyer || targetRole == "buyer":
			clickAction = "OPEN_BUYER_CHAT"
		default:
			clickAction = "OPEN_ORDER_DETAILS"
		}
	}

	// Format vibration timings in seconds for FCM v1 specification (e.g. "0s", "0.25s", "0.2s", "0.25s")
	var vibrateTimings []string
	for _, ms := range vibration {
		vibrateTimings = append(vibrateTimings, fmt.Sprintf("%gs", float64(ms)/1000.0))
	}

	// Ensure Data map is initialized and carries routing metadata for client apps
	if payload.Data == nil {
		payload.Data = make(map[string]string)
	}
	payload.Data["title"] = payload.Title
	payload.Data["body"] = payload.Body
	payload.Data["click_action"] = clickAction
	payload.Data["from_notification_tap"] = "true"
	if payload.ImageURL != "" {
		payload.Data["image_url"] = payload.ImageURL
	}
	if _, ok := payload.Data["channel_id"]; !ok {
		payload.Data["channel_id"] = channelID
	}
	if _, ok := payload.Data["sound"]; !ok {
		payload.Data["sound"] = sound
	}
	if len(vibration) > 0 {
		if _, ok := payload.Data["vibration_pattern"]; !ok {
			vibBytes, _ := json.Marshal(vibration)
			payload.Data["vibration_pattern"] = string(vibBytes)
		}
	}

	log.Printf("🔔 [FCM Dispatcher] Channel: %s | Sending push to %d devices: %s - %s", channelID, len(payload.Tokens), payload.Title, payload.Body)

	// Fast-path: Reusable persistent HTTP/2 messaging client with cached OAuth2 tokens
	msgClient := config.FirebaseMessaging
	if msgClient == nil && config.FirebaseApp != nil {
		if c, err := config.FirebaseApp.Messaging(context.Background()); err == nil {
			msgClient = c
			config.FirebaseMessaging = c
		}
	}

	for _, token := range payload.Tokens {
		if token == "" {
			continue
		}

		tag := ""
		if payload.Data != nil {
			if t, ok := payload.Data["tag"]; ok && t != "" {
				tag = t
			} else if oid, ok := payload.Data["order_id"]; ok && oid != "" {
				tag = "order_" + oid
			}
		}

		if msgClient != nil {
			notif := &messaging.Notification{
				Title:    payload.Title,
				Body:     payload.Body,
				ImageURL: payload.ImageURL,
			}
			// Leave ClickAction empty on AndroidNotification so Android OS always launches
			// the package default launcher MainActivity with all payload.Data extras attached.
			androidNotif := &messaging.AndroidNotification{
				Title:               payload.Title,
				Body:                payload.Body,
				ImageURL:            payload.ImageURL,
				Icon:                "ic_notification",
				Color:               "#00863A",
				Tag:                 tag,
				ChannelID:           channelID,
				Sound:               sound,
				VibrateTimingMillis: vibration,
				Priority:            messaging.PriorityHigh,
				Visibility:          messaging.VisibilityPublic,
			}

			fcmMsg := &messaging.Message{
				Token:        token,
				Notification: notif,
				Data:         payload.Data,
				Android: &messaging.AndroidConfig{
					Priority:     "high", // Required for Android Doze Mode immediate wake
					Notification: androidNotif,
				},
			}

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			resp, sendErr := msgClient.Send(ctx, fcmMsg)
			cancel()
			if sendErr != nil {
				log.Printf("⚠️ [FCM Dispatcher] Firebase API Send error for token %s: %v", token[:min(len(token), 15)]+"...", sendErr)
			} else {
				log.Printf("✅ [FCM Dispatcher] Push delivered to token %s (ID: %s | Tag: %s)", token[:min(len(token), 15)]+"...", resp, tag)
			}
		}

		// Structured Android FCM v1 JSON payload for screen-off delivery and system-level handling
		androidNotification := map[string]interface{}{
			"title":                   payload.Title,
			"body":                    payload.Body,
			"sound":                   sound,
			"channel_id":              channelID,
			"click_action":            clickAction,
			"priority":                "HIGH",
			"visibility":              "PUBLIC",
			"default_sound":           false,
			"default_vibrate_timings": false,
		}
		if tag != "" {
			androidNotification["tag"] = tag
		}
		if len(vibrateTimings) > 0 {
			androidNotification["vibrate_timings"] = vibrateTimings
		}

		message := map[string]interface{}{
			"message": map[string]interface{}{
				"token": token,
				"notification": map[string]string{
					"title": payload.Title,
					"body":  payload.Body,
				},
				"data": payload.Data,
				"android": map[string]interface{}{
					"priority":     "HIGH",
					"notification": androidNotification,
				},
			},
		}

		jsonData, err := json.Marshal(message)
		if err == nil {
			fmt.Printf("📲 Dispatched Android Push [%s] -> Token: %s | Payload: %s\n", channelID, token[:min(len(token), 15)]+"...", string(jsonData))
		}
	}

	return nil
}

// SendSellerNotification sends an alert specifically for boutique sellers on mitreno_seller_channel
func (fs *FCMService) SendSellerNotification(tokens []string, title, body string, data map[string]string) error {
	if data == nil {
		data = make(map[string]string)
	}
	data["target_role"] = "seller"
	data["channel_id"] = ChannelSeller

	return fs.SendPushNotification(FCMNotificationPayload{
		Title:            title,
		Body:             body,
		ChannelID:        ChannelSeller,
		Sound:            SoundCashChime,
		VibrationPattern: VibrationSellerPulse,
		Priority:         "HIGH",
		Data:             data,
		Tokens:           tokens,
	})
}

// SendBuyerNotification sends an alert specifically for buyers on mitreno_buyer_channel
func (fs *FCMService) SendBuyerNotification(tokens []string, title, body string, data map[string]string) error {
	if data == nil {
		data = make(map[string]string)
	}
	data["target_role"] = "buyer"
	data["channel_id"] = ChannelBuyer

	return fs.SendPushNotification(FCMNotificationPayload{
		Title:            title,
		Body:             body,
		ChannelID:        ChannelBuyer,
		Sound:            SoundLuxuryChime,
		VibrationPattern: VibrationBuyerWave,
		Priority:         "HIGH",
		Data:             data,
		Tokens:           tokens,
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// SendPushNotification keeps backward compatibility for single token notifications
func SendPushNotification(token, title, body string) error {
	svc := NewFCMService("")
	return svc.SendPushNotification(FCMNotificationPayload{
		Tokens: []string{token},
		Title:  title,
		Body:   body,
	})
}

// SendSellerNotification is a package-level helper to dispatch seller notifications
func SendSellerNotification(tokens []string, title, body string, data map[string]string) error {
	svc := NewFCMService("")
	return svc.SendSellerNotification(tokens, title, body, data)
}

// SendBuyerNotification is a package-level helper to dispatch buyer notifications
func SendBuyerNotification(tokens []string, title, body string, data map[string]string) error {
	svc := NewFCMService("")
	return svc.SendBuyerNotification(tokens, title, body, data)
}

// SendProductPromoNotification sends an e-commerce rich banner notification with product photo and action buttons
func (fs *FCMService) SendProductPromoNotification(tokens []string, title, body, imageURL, productID string, data map[string]string) error {
	if data == nil {
		data = make(map[string]string)
	}
	data["target_role"] = "buyer"
	data["channel_id"] = ChannelBuyer
	data["product_id"] = productID
	data["image_url"] = imageURL
	data["action_label"] = "🛍️ Shop Now"
	data["action_secondary"] = "✨ Visit Now"

	return fs.SendPushNotification(FCMNotificationPayload{
		Title:            title,
		Body:             body,
		ImageURL:         imageURL,
		ChannelID:        ChannelBuyer,
		Sound:            SoundLuxuryChime,
		VibrationPattern: VibrationBuyerWave,
		Priority:         "HIGH",
		Data:             data,
		Tokens:           tokens,
	})
}

// SendProductPromoNotification is a package-level helper for rich product promo notifications
func SendProductPromoNotification(tokens []string, title, body, imageURL, productID string, data map[string]string) error {
	svc := NewFCMService("")
	return svc.SendProductPromoNotification(tokens, title, body, imageURL, productID, data)
}
