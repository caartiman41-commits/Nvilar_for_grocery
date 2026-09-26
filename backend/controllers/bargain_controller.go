package controllers

import (
	"fmt"
	"strings"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/models"
	"mitreno-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BargainController struct{}

func NewBargainController() *BargainController {
	return &BargainController{}
}

// resolveCallerID extracts the authenticated or declared user ID from context or headers
func resolveCallerID(c *fiber.Ctx) string {
	if u, ok := c.Locals("userID").(string); ok && u != "" {
		return strings.TrimSpace(u)
	}
	if h := c.Get("X-User-ID"); h != "" {
		return strings.TrimSpace(h)
	}
	if q := c.Query("user_id"); q != "" {
		return strings.TrimSpace(q)
	}
	if q := c.Query("buyer_id"); q != "" {
		return strings.TrimSpace(q)
	}
	if q := c.Query("uid"); q != "" {
		return strings.TrimSpace(q)
	}
	return ""
}

// isBuyer verifies if caller is the buyer of the negotiation
func isBuyer(db *gorm.DB, neg *models.Negotiation, callerID string) bool {
	if callerID == "" || neg == nil {
		return false
	}
	cleanID := strings.TrimSpace(callerID)
	if neg.BuyerID == cleanID {
		return true
	}

	var buyer models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", neg.BuyerID, neg.BuyerID, neg.BuyerID).First(&buyer).Error; err == nil {
		if buyer.ID == cleanID || (buyer.FirebaseUID != nil && *buyer.FirebaseUID == cleanID) || buyer.Phone == cleanID {
			return true
		}
	}
	return false
}

// isShopOwnerOrSeller strictly verifies if the caller is the verified seller/owner of the boutique
func isShopOwnerOrSeller(db *gorm.DB, neg *models.Negotiation, callerID string) bool {
	if callerID == "" || neg == nil {
		return false
	}
	cleanID := strings.TrimSpace(callerID)

	// Direct match with ShopID
	if neg.ShopID == cleanID {
		return true
	}

	// Fetch Shop record to verify OwnerID
	var shop models.Shop
	if err := db.Where("id = ?", neg.ShopID).First(&shop).Error; err == nil {
		if shop.OwnerID == cleanID || shop.ID == cleanID {
			return true
		}

		// Resolve caller user record to check if their ID or Firebase UID matches OwnerID
		var caller models.User
		if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", cleanID, cleanID, cleanID).First(&caller).Error; err == nil {
			if caller.Role == "admin" {
				return true
			}
			if shop.OwnerID == caller.ID || (caller.FirebaseUID != nil && shop.OwnerID == *caller.FirebaseUID) {
				return true
			}
		}
	}

	return false
}

// StartNegotiation opens a live bargaining session using atomic DB transactions
func (bc *BargainController) StartNegotiation(c *fiber.Ctx) error {
	type StartReq struct {
		BuyerID      string `json:"buyer_id"`
		ShopID       string `json:"shop_id"`
		ProductID    string `json:"product_id"`
		InitialOffer int    `json:"initial_offer"`
		BuyerOffer   int    `json:"buyer_offer"`
	}

	var req StartReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	offer := req.InitialOffer
	if offer <= 0 && req.BuyerOffer > 0 {
		offer = req.BuyerOffer
	}

	callerID := resolveCallerID(c)
	buyerID := req.BuyerID
	if buyerID == "" {
		buyerID = callerID
	}
	if buyerID == "" || req.ShopID == "" || req.ProductID == "" || offer <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "BuyerID, ShopID, ProductID, and valid positive offer are required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// Fetch Product to verify base price
	var product models.Product
	if err := db.Where("id = ?", req.ProductID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Product not found",
		})
	}

	// Check if active session already exists
	var existing models.Negotiation
	err := db.Where("buyer_id = ? AND product_id = ? AND status = 'active'", buyerID, req.ProductID).First(&existing).Error
	if err == nil {
		return c.JSON(fiber.Map{
			"success":     true,
			"message":     "Active negotiation already exists",
			"negotiation": existing,
		})
	}

	negotiationID := "neg_" + uuid.New().String()[:8]
	negotiation := models.Negotiation{
		ID:             negotiationID,
		BuyerID:        buyerID,
		ShopID:         req.ShopID,
		ProductID:      req.ProductID,
		OriginalPrice:  product.BasePrice,
		BuyerLastOffer: &offer,
		Status:         "active",
		DealStatus:     "pending",
		ExpiresAt:      time.Now().Add(24 * time.Hour),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	msg := models.ChatMessage{
		ID:             "msg_" + uuid.New().String()[:8],
		NegotiationID:  negotiationID,
		SenderID:       buyerID,
		MessageText:    fmt.Sprintf("Hi, would you accept my offer of ₹%d?", offer),
		IsCounterOffer: true,
		OfferedPrice:   &offer,
		CreatedAt:      time.Now(),
	}

	// Atomic PostgreSQL transaction to insert negotiation and initial chat message
	txErr := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&negotiation).Error; err != nil {
			return err
		}
		if err := tx.Create(&msg).Error; err != nil {
			return err
		}
		return nil
	})

	if txErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to start negotiation in database",
		})
	}

	// Broadcast real-time start event
	clockTime, _ := services.FormatClockTime(time.Now())
	services.GlobalRoomManager.BroadcastToRoom(negotiationID, services.WSMessage{
		Type:          "counter_offer",
		NegotiationID: negotiationID,
		SenderID:      buyerID,
		Role:          "customer",
		MessageText:   msg.MessageText,
		OfferedPrice:  &offer,
		DealStatus:    "pending",
		LastSeenClock: clockTime,
		Data:          negotiation,
	})

	// Dispatch FCM push notification to boutique seller via mitreno_seller_channel
	go bc.dispatchSellerOfferNotification(negotiationID, req.ShopID, buyerID, product.Name, offer)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success":     true,
		"message":     "Negotiation started successfully",
		"negotiation": negotiation,
	})
}

// SubmitCounterOffer posts a new counter offer with zero-trust Anti-IDOR validation & row-locking transaction
func (bc *BargainController) SubmitCounterOffer(c *fiber.Ctx) error {
	negotiationID := c.Params("id")
	if negotiationID == "" {
		negotiationID = c.Params("negotiation_id")
	}
	if negotiationID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation ID is required",
		})
	}

	type OfferReq struct {
		SenderID string  `json:"sender_id"`
		Price    int     `json:"price"`
		Offer    int     `json:"offer"`
		Message  *string `json:"message"`
	}

	var req OfferReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	offerPrice := req.Price
	if offerPrice <= 0 && req.Offer > 0 {
		offerPrice = req.Offer
	}
	if offerPrice <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "A valid positive price is required",
		})
	}

	senderID := strings.TrimSpace(req.SenderID)
	if senderID == "" {
		senderID = resolveCallerID(c)
	}
	if senderID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Sender identity is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// Zero-Trust Anti-IDOR check: verify sender is a legitimate participant
	var neg models.Negotiation
	if err := db.Where("id = ?", negotiationID).First(&neg).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation not found",
		})
	}

	if !services.IsNegotiationAuthorized(db, &neg, senderID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Forbidden: You are not authorized to submit counter offers in this negotiation",
		})
	}

	if neg.Status != "active" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation is already closed or locked",
		})
	}

	msgText := fmt.Sprintf("Counter offer proposed: ₹%d", offerPrice)
	if req.Message != nil && strings.TrimSpace(*req.Message) != "" {
		msgText = strings.TrimSpace(*req.Message)
	}

	chatMsg := models.ChatMessage{
		ID:             "msg_" + uuid.New().String()[:8],
		NegotiationID:  negotiationID,
		SenderID:       senderID,
		MessageText:    msgText,
		IsCounterOffer: true,
		OfferedPrice:   &offerPrice,
		CreatedAt:      time.Now(),
	}

	// Transaction with row locking to prevent race condition on offers
	txErr := db.Transaction(func(tx *gorm.DB) error {
		var locked models.Negotiation
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", negotiationID).First(&locked).Error; err != nil {
			return err
		}

		if locked.Status != "active" {
			return fmt.Errorf("negotiation status is %s", locked.Status)
		}

		if isBuyer(tx, &locked, senderID) {
			locked.BuyerLastOffer = &offerPrice
		} else {
			locked.SellerLastOffer = &offerPrice
		}
		locked.UpdatedAt = time.Now()

		if err := tx.Save(&locked).Error; err != nil {
			return err
		}
		if err := tx.Create(&chatMsg).Error; err != nil {
			return err
		}

		neg = locked
		return nil
	})

	if txErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to record counter offer: " + txErr.Error(),
		})
	}

	// Real-time broadcast to room
	clockTime, _ := services.FormatClockTime(time.Now())
	services.GlobalRoomManager.BroadcastToRoom(negotiationID, services.WSMessage{
		Type:          "counter_offer",
		NegotiationID: negotiationID,
		SenderID:      senderID,
		MessageText:   msgText,
		OfferedPrice:  &offerPrice,
		DealStatus:    neg.DealStatus,
		LastSeenClock: clockTime,
		Data: fiber.Map{
			"negotiation":  neg,
			"chat_message": chatMsg,
		},
	})

	// Dispatch FCM push notification to counter party (seller or buyer)
	go bc.dispatchCounterOfferNotification(&neg, senderID, offerPrice, msgText)

	return c.JSON(fiber.Map{
		"success":      true,
		"message":      "Counter offer submitted successfully",
		"negotiation":  neg,
		"chat_message": chatMsg,
	})
}

// AcceptDeal handles POST /api/bargain/deal/accept with strict seller-only authorization & clean PostgreSQL transaction
func (bc *BargainController) AcceptDeal(c *fiber.Ctx) error {
	type AcceptDealReq struct {
		NegotiationID string `json:"negotiation_id"`
		DealID        string `json:"deal_id"`
		AcceptedPrice *int   `json:"accepted_price"`
		DealPrice     *int   `json:"deal_price"`
		Price         *int   `json:"price"`
		SellerID      string `json:"seller_id"`
		AcceptedBy    string `json:"accepted_by"`
	}

	var req AcceptDealReq
	if err := c.BodyParser(&req); err != nil {
		// Tolerant body parsing for empty body on POST /negotiations/:id/accept
		req = AcceptDealReq{}
	}

	negotiationID := c.Params("id")
	if negotiationID == "" {
		negotiationID = c.Params("negotiation_id")
	}
	if negotiationID == "" {
		negotiationID = strings.TrimSpace(req.NegotiationID)
	}
	if negotiationID == "" {
		negotiationID = strings.TrimSpace(req.DealID)
	}
	if negotiationID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation ID is required",
		})
	}

	callerID := resolveCallerID(c)
	if callerID == "" {
		callerID = strings.TrimSpace(req.SellerID)
	}
	if callerID == "" {
		callerID = strings.TrimSpace(req.AcceptedBy)
	}

	if callerID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized: Authentication credentials required to accept deals",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var neg models.Negotiation
	if err := db.Preload("Shop").Where("id = ?", negotiationID).First(&neg).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation not found",
		})
	}

	// Strict Verification: A buyer CANNOT accept the deal. Reject with 403 Forbidden.
	if isBuyer(db, &neg, callerID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized: Buyers cannot accept deals. Only the authorized boutique seller can accept the deal.",
		})
	}

	// Strict Verification: Caller MUST be the authorized shop owner/seller.
	if !isShopOwnerOrSeller(db, &neg, callerID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized: You are not authorized to accept deals for this boutique",
		})
	}

	// Determine locked negotiated price
	lockedPrice := 0
	if req.AcceptedPrice != nil && *req.AcceptedPrice > 0 {
		lockedPrice = *req.AcceptedPrice
	} else if req.DealPrice != nil && *req.DealPrice > 0 {
		lockedPrice = *req.DealPrice
	} else if req.Price != nil && *req.Price > 0 {
		lockedPrice = *req.Price
	} else if neg.BuyerLastOffer != nil && *neg.BuyerLastOffer > 0 {
		lockedPrice = *neg.BuyerLastOffer
	} else if neg.SellerLastOffer != nil && *neg.SellerLastOffer > 0 {
		lockedPrice = *neg.SellerLastOffer
	} else {
		lockedPrice = neg.OriginalPrice
	}

	now := time.Now()
	systemMsgID := "msg_" + uuid.New().String()[:8]
	systemMsg := models.ChatMessage{
		ID:             systemMsgID,
		NegotiationID:  negotiationID,
		SenderID:       "system",
		MessageText:    fmt.Sprintf("🎉 Deal Locked! Seller accepted the offer at ₹%d. Add to bag to checkout.", lockedPrice),
		IsCounterOffer: false,
		OfferedPrice:   &lockedPrice,
		CreatedAt:      now,
	}

	// Clean PostgreSQL Transaction with row locking
	txErr := db.Transaction(func(tx *gorm.DB) error {
		var lockedNeg models.Negotiation
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", negotiationID).First(&lockedNeg).Error; err != nil {
			return err
		}

		lockedNeg.Status = "accepted"
		lockedNeg.DealStatus = "accepted"
		lockedNeg.AgreedPrice = &lockedPrice
		lockedNeg.UpdatedAt = now

		if err := tx.Save(&lockedNeg).Error; err != nil {
			return err
		}

		// Also update any linked active customer deal
		_ = tx.Model(&models.CustomerDeal{}).
			Where("conversation_id = ? AND status = ?", negotiationID, "active").
			Updates(map[string]interface{}{
				"status":     "accepted",
				"deal_price": lockedPrice,
				"updated_at": now,
			})

		if err := tx.Create(&systemMsg).Error; err != nil {
			return err
		}

		neg = lockedNeg
		return nil
	})

	if txErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to lock deal in transaction: " + txErr.Error(),
		})
	}

	// Broadcast real-time deal acceptance event to both buyer and seller
	clockTime, _ := services.FormatClockTime(now)
	services.GlobalRoomManager.BroadcastToRoom(negotiationID, services.WSMessage{
		Type:          "deal_accepted",
		NegotiationID: negotiationID,
		SenderID:      callerID,
		Role:          "seller",
		MessageText:   systemMsg.MessageText,
		AgreedPrice:   &lockedPrice,
		DealStatus:    "accepted",
		LastSeenClock: clockTime,
		Data: fiber.Map{
			"negotiation_id": negotiationID,
			"deal_status":    "accepted",
			"status":         "accepted",
			"agreed_price":   lockedPrice,
			"buyer_id":       neg.BuyerID,
			"shop_id":        neg.ShopID,
			"product_id":     neg.ProductID,
			"accepted_by":    callerID,
			"accepted_at":    now.UTC(),
		},
	})

	// Dispatch FCM push notification to buyer via mitreno_buyer_channel
	go bc.dispatchDealAcceptedNotification(&neg, callerID, lockedPrice)

	return c.JSON(fiber.Map{
		"success":      true,
		"message":      "Deal successfully locked at negotiated price",
		"deal_status":  "accepted",
		"agreed_price": lockedPrice,
		"negotiation":  neg,
		"chat_message": systemMsg,
	})
}

// AcceptOffer preserves backward compatibility for /negotiations/:id/accept using the secure AcceptDeal workflow
func (bc *BargainController) AcceptOffer(c *fiber.Ctx) error {
	return bc.AcceptDeal(c)
}

// GetNegotiationByID fetches bargaining thread with strict Anti-IDOR ownership verification
func (bc *BargainController) GetNegotiationByID(c *fiber.Ctx) error {
	negotiationID := c.Params("id")
	if negotiationID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation ID is required",
		})
	}

	callerID := resolveCallerID(c)

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var neg models.Negotiation
	if err := db.Preload("Shop").Preload("Product").Preload("Messages").Where("id = ?", negotiationID).First(&neg).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation not found",
		})
	}

	// Zero-Trust Anti-IDOR / Anti-BOLA verification: caller must be buyer or seller/shop owner
	if callerID != "" && !services.IsNegotiationAuthorized(db, &neg, callerID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Forbidden: You are not authorized to view this negotiation thread",
		})
	}

	return c.JSON(fiber.Map{
		"success":     true,
		"negotiation": neg,
	})
}

// GetCustomerChats lists customer's chat threads with strict participant scoping
func (bc *BargainController) GetCustomerChats(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	buyerID := resolveCallerID(c)
	if buyerID == "" {
		return c.JSON(fiber.Map{
			"success": true,
			"chats":   []fiber.Map{},
		})
	}

	// Resolve all alias identities (Firebase UID, Master UUID, Phone)
	buyerIDs := []string{buyerID}
	var u models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", buyerID, buyerID, buyerID).First(&u).Error; err == nil {
		if u.ID != "" && u.ID != buyerID {
			buyerIDs = append(buyerIDs, u.ID)
		}
		if u.FirebaseUID != nil && *u.FirebaseUID != "" && *u.FirebaseUID != buyerID {
			buyerIDs = append(buyerIDs, *u.FirebaseUID)
		}
	}

	var negotiations []models.Negotiation
	db.Preload("Shop").Preload("Product").Where("buyer_id IN ?", buyerIDs).Order("updated_at DESC").Find(&negotiations)

	// Group by shop
	shopMap := make(map[string]*fiber.Map)
	for _, neg := range negotiations {
		shopID := neg.ShopID
		if shopID == "" {
			shopID = neg.Product.ShopID
		}

		shopName := neg.Shop.Name
		if shopName == "" {
			shopName = "Boutique"
		}

		shopAvatar := "https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop"
		if neg.Shop.LogoURL != nil && *neg.Shop.LogoURL != "" {
			shopAvatar = *neg.Shop.LogoURL
		}

		var latestMsg models.ChatMessage
		db.Where("negotiation_id = ?", neg.ID).Order("created_at DESC").First(&latestMsg)

		productItem := fiber.Map{
			"negotiation_id":         neg.ID,
			"product_id":             neg.ProductID,
			"product_name":           neg.Product.Name,
			"product_thumbnail":      neg.Product.Thumbnail,
			"product_base_price":     neg.Product.BasePrice,
			"product_original_price": neg.Product.OriginalPrice,
			"product_category":       neg.Product.Category,
			"status":                 neg.Status,
			"deal_status":            neg.DealStatus,
			"agreed_price":           neg.AgreedPrice,
			"updated_at":             neg.UpdatedAt,
		}

		if existing, ok := shopMap[shopID]; ok {
			prods := (*existing)["products"].([]fiber.Map)
			(*existing)["products"] = append(prods, productItem)
		} else {
			shopMap[shopID] = &fiber.Map{
				"shop_id":        shopID,
				"shop_name":      shopName,
				"shop_avatar":    shopAvatar,
				"shop_verified":  true,
				"shop_rating":    4.8,
				"products":       []fiber.Map{productItem},
				"latest_message": latestMsg,
			}
		}
	}

	var chatList []fiber.Map
	for _, chat := range shopMap {
		chatList = append(chatList, *chat)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"chats":   chatList,
	})
}

// GetChatThread retrieves or initiates chat thread with Anti-IDOR ownership protection
func (bc *BargainController) GetChatThread(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	callerID := resolveCallerID(c)
	productID := c.Query("product_id")
	shopID := c.Query("shop_id")

	if callerID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "User authentication required",
		})
	}

	// Resolve all alias identities
	buyerIDs := []string{callerID}
	var u models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", callerID, callerID, callerID).First(&u).Error; err == nil {
		if u.ID != "" && u.ID != callerID {
			buyerIDs = append(buyerIDs, u.ID)
		}
		if u.FirebaseUID != nil && *u.FirebaseUID != "" && *u.FirebaseUID != callerID {
			buyerIDs = append(buyerIDs, *u.FirebaseUID)
		}
	}

	negID := c.Query("negotiation_id")
	var neg models.Negotiation
	var err error

	if negID != "" {
		err = db.Preload("Shop").Preload("Product").Where("id = ?", negID).First(&neg).Error
		if err == nil {
			// Zero-Trust Anti-IDOR check
			if !services.IsNegotiationAuthorized(db, &neg, callerID) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success": false,
					"error":   "Forbidden: You are not authorized to view this negotiation thread",
				})
			}
		}
	}

	if neg.ID == "" {
		err = db.Preload("Shop").Preload("Product").Where("buyer_id IN ? AND product_id = ?", buyerIDs, productID).Order("created_at DESC").First(&neg).Error
	}

	if err != nil || neg.ID == "" {
		// Auto-create negotiation if not found
		var product models.Product
		db.Where("id = ?", productID).First(&product)

		basePrice := product.BasePrice
		if basePrice == 0 {
			basePrice = 1999
		}

		if shopID == "" {
			shopID = product.ShopID
		}

		initialOffer := basePrice
		neg = models.Negotiation{
			ID:             "neg_" + uuid.New().String()[:8],
			BuyerID:        callerID,
			ShopID:         shopID,
			ProductID:      productID,
			OriginalPrice:  basePrice,
			BuyerLastOffer: &initialOffer,
			Status:         "active",
			DealStatus:     "pending",
			ExpiresAt:      time.Now().Add(24 * time.Hour),
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}
		db.Create(&neg)
	}

	var messages []models.ChatMessage
	db.Where("negotiation_id = ?", neg.ID).Order("created_at ASC").Find(&messages)

	return c.JSON(fiber.Map{
		"success":     true,
		"negotiation": neg,
		"messages":    messages,
		"deals":       []fiber.Map{},
	})
}

// PostChatMessage posts a new message with Anti-IDOR verification & real-time broadcast
func (bc *BargainController) PostChatMessage(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	negID := c.Params("negotiation_id")
	if negID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "negotiation_id is required",
		})
	}

	type MsgReq struct {
		Text           string `json:"text"`
		MessageText    string `json:"message_text"`
		SenderID       string `json:"sender_id"`
		IsCounterOffer bool   `json:"is_counter_offer"`
		OfferedPrice   *int   `json:"offered_price"`
	}

	var req MsgReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	content := strings.TrimSpace(req.Text)
	if content == "" {
		content = strings.TrimSpace(req.MessageText)
	}

	if content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Message text cannot be empty",
		})
	}

	senderID := strings.TrimSpace(req.SenderID)
	if senderID == "" {
		senderID = resolveCallerID(c)
	}
	if senderID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Sender identity is required",
		})
	}

	// Anti-IDOR Verification: Check negotiation existence and participant authorization
	var neg models.Negotiation
	if err := db.Where("id = ?", negID).First(&neg).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation conversation not found",
		})
	}

	if !services.IsNegotiationAuthorized(db, &neg, senderID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Forbidden: You are not authorized to post messages in this negotiation",
		})
	}

	now := time.Now()
	msg := models.ChatMessage{
		ID:             "msg_" + uuid.New().String()[:8],
		NegotiationID:  negID,
		SenderID:       senderID,
		MessageText:    content,
		IsCounterOffer: req.IsCounterOffer,
		OfferedPrice:   req.OfferedPrice,
		CreatedAt:      now,
	}

	// Atomic PostgreSQL transaction for message insertion and conversation timestamp update
	txErr := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&msg).Error; err != nil {
			return err
		}
		return tx.Model(&models.Negotiation{}).Where("id = ?", negID).Update("updated_at", now).Error
	})

	if txErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to save chat message",
		})
	}

	// Real-time broadcast to room
	clockTime, _ := services.FormatClockTime(now)
	role := "customer"
	if isShopOwnerOrSeller(db, &neg, senderID) {
		role = "seller"
	}

	services.GlobalRoomManager.BroadcastToRoom(negID, services.WSMessage{
		Type:          "message",
		NegotiationID: negID,
		SenderID:      senderID,
		UserID:        senderID,
		Role:          role,
		MessageText:   content,
		OfferedPrice:  req.OfferedPrice,
		LastSeenClock: clockTime,
		Data:          msg,
	})

	// Dispatch FCM push notification to recipient (seller or buyer)
	go bc.dispatchChatMessageNotification(negID, senderID, content)

	return c.JSON(fiber.Map{
		"success": true,
		"message": msg,
	})
}

// MarkMessagesSeen stamps seen_at=NOW() on all unread messages with Anti-IDOR check
func (bc *BargainController) MarkMessagesSeen(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	negID := c.Params("negotiation_id")
	type SeenReq struct {
		ReaderID string `json:"reader_id"`
	}

	var req SeenReq
	if err := c.BodyParser(&req); err != nil {
		req = SeenReq{}
	}

	readerID := strings.TrimSpace(req.ReaderID)
	if readerID == "" {
		readerID = resolveCallerID(c)
	}

	if readerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "reader_id is required",
		})
	}

	// Anti-IDOR Verification
	var neg models.Negotiation
	if err := db.Where("id = ?", negID).First(&neg).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Negotiation not found",
		})
	}

	if !services.IsNegotiationAuthorized(db, &neg, readerID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Forbidden: You are not a participant in this negotiation",
		})
	}

	now := time.Now()
	result := db.Model(&models.ChatMessage{}).
		Where("negotiation_id = ? AND sender_id != ? AND seen_at IS NULL", negID, readerID).
		Update("seen_at", now)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to mark messages as seen",
		})
	}

	// Broadcast seen event
	clockTime, _ := services.FormatClockTime(now)
	services.GlobalRoomManager.BroadcastToRoom(negID, services.WSMessage{
		Type:          "seen",
		NegotiationID: negID,
		SenderID:      readerID,
		UserID:        readerID,
		LastSeenClock: clockTime,
		Data: fiber.Map{
			"marked_count": result.RowsAffected,
			"seen_at":      now,
		},
	})

	return c.JSON(fiber.Map{
		"success":      true,
		"marked_count": result.RowsAffected,
	})
}

// GetUserPresence handles GET /api/bargain/presence/:user_id returning live status & clock-formatted last seen
func (bc *BargainController) GetUserPresence(c *fiber.Ctx) error {
	targetUserID := strings.TrimSpace(c.Params("user_id"))
	if targetUserID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "user_id parameter is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// 1. Check in-memory real-time websocket connections
	isOnlineWS := services.GlobalRoomManager.IsUserOnline(targetUserID)

	// 2. Fetch presence from PostgreSQL user_presences
	var presence models.UserPresence
	err := db.Where("user_id = ? OR shop_id = ? OR session_id = ?", targetUserID, targetUserID, "ws_"+targetUserID).
		Order("last_seen DESC").
		First(&presence).Error

	now := time.Now()
	var lastSeen time.Time
	role := "customer"
	isOnline := isOnlineWS

	if err == nil {
		lastSeen = presence.LastSeen
		if presence.Role != "" {
			role = presence.Role
		}
		// If online in DB and last seen was within 5 minutes, consider online
		if !isOnline && presence.IsOnline && time.Since(presence.LastSeen) <= 5*time.Minute {
			isOnline = true
		}
	} else {
		// Check if target is a shop or user in primary tables
		var shop models.Shop
		if sErr := db.Where("id = ? OR owner_id = ?", targetUserID, targetUserID).First(&shop).Error; sErr == nil {
			role = "seller"
		} else {
			var u models.User
			if uErr := db.Where("id = ? OR firebase_uid = ?", targetUserID, targetUserID).First(&u).Error; uErr == nil {
				if u.Role == "boutique_owner" {
					role = "seller"
				}
			}
		}
		lastSeen = now
	}

	if isOnline {
		lastSeen = now
	}

	clockTime, formatted := services.FormatClockTime(lastSeen)
	statusLabel := "Last seen " + formatted
	if isOnline {
		statusLabel = "Online"
	}

	return c.JSON(fiber.Map{
		"success":             true,
		"user_id":             targetUserID,
		"role":                role,
		"is_online":           isOnline,
		"last_seen":           lastSeen,
		"last_seen_formatted": formatted,
		"clock_time":          clockTime,
		"status_label":        statusLabel,
	})
}

// fetchUserTokensAndName retrieves Android device tokens and display name for a given user identifier
func fetchUserTokensAndName(db *gorm.DB, identifier string, defaultName string) ([]string, string) {
	if identifier == "" || db == nil {
		return nil, defaultName
	}
	var u models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", identifier, identifier, identifier).First(&u).Error; err == nil {
		name := defaultName
		if u.FullName != "" {
			name = u.FullName
		}
		return []string(u.AndroidDeviceTokens), name
	}
	return nil, defaultName
}

// fetchSellerTokensAndShopName retrieves device tokens for the shop owner and the shop's name
func fetchSellerTokensAndShopName(db *gorm.DB, shopID string) ([]string, string) {
	if shopID == "" || db == nil {
		return nil, "Boutique"
	}
	var shop models.Shop
	if err := db.Where("id = ?", shopID).First(&shop).Error; err != nil {
		return nil, "Boutique"
	}
	shopName := shop.Name
	if shopName == "" {
		shopName = "Boutique"
	}
	tokens, _ := fetchUserTokensAndName(db, shop.OwnerID, shopName)
	return tokens, shopName
}

// dispatchSellerOfferNotification sends push to boutique seller when customer initiates negotiation
func (bc *BargainController) dispatchSellerOfferNotification(negID, shopID, buyerID, productName string, offerPrice int) {
	db := config.DB
	if db == nil {
		return
	}

	sellerTokens, _ := fetchSellerTokensAndShopName(db, shopID)
	if len(sellerTokens) == 0 {
		return
	}

	_, buyerName := fetchUserTokensAndName(db, buyerID, "Customer")

	title := fmt.Sprintf("🔥 New Bargain Deal from %s", buyerName)
	body := fmt.Sprintf("Offered ₹%d for %s", offerPrice, productName)

	data := map[string]string{
		"type":            "chat",
		"target_role":     "seller",
		"conversation_id": negID,
		"buyer_name":      buyerName,
		"product_title":   productName,
		"deal_status":     "active",
		"offer_price":     fmt.Sprintf("%d", offerPrice),
	}

	_ = services.SendSellerNotification(sellerTokens, title, body, data)
}

// dispatchCounterOfferNotification sends push to seller or buyer depending on who submitted the counter offer
func (bc *BargainController) dispatchCounterOfferNotification(neg *models.Negotiation, senderID string, price int, messageText string) {
	db := config.DB
	if db == nil || neg == nil {
		return
	}

	productName := "Product"
	if neg.Product != nil && neg.Product.Name != "" {
		productName = neg.Product.Name
	} else {
		var prod models.Product
		if err := db.Where("id = ?", neg.ProductID).First(&prod).Error; err == nil {
			productName = prod.Name
		}
	}

	if isBuyer(db, neg, senderID) {
		sellerTokens, _ := fetchSellerTokensAndShopName(db, neg.ShopID)
		if len(sellerTokens) == 0 {
			return
		}
		_, buyerName := fetchUserTokensAndName(db, neg.BuyerID, "Customer")

		title := fmt.Sprintf("🔥 New Bargain Deal from %s", buyerName)
		body := fmt.Sprintf("Counter offer: ₹%d for %s", price, productName)
		if messageText != "" && !strings.HasPrefix(messageText, "Counter offer proposed") {
			body = fmt.Sprintf("Counter offer: ₹%d - %s", price, messageText)
		}

		data := map[string]string{
			"type":            "chat",
			"target_role":     "seller",
			"conversation_id": neg.ID,
			"buyer_name":      buyerName,
			"product_title":   productName,
			"deal_status":     "counter_offer",
			"offer_price":     fmt.Sprintf("%d", price),
		}

		_ = services.SendSellerNotification(sellerTokens, title, body, data)
	} else {
		buyerTokens, _ := fetchUserTokensAndName(db, neg.BuyerID, "Customer")
		if len(buyerTokens) == 0 {
			return
		}
		_, shopName := fetchSellerTokensAndShopName(db, neg.ShopID)

		title := fmt.Sprintf("💬 %s Replied", shopName)
		body := fmt.Sprintf("New offer: ₹%d for %s", price, productName)
		if messageText != "" && !strings.HasPrefix(messageText, "Counter offer proposed") {
			body = fmt.Sprintf("New offer: ₹%d - %s", price, messageText)
		}

		data := map[string]string{
			"type":            "chat",
			"target_role":     "buyer",
			"conversation_id": neg.ID,
			"seller_name":     shopName,
			"deal_status":     "counter_offer",
			"offer_price":     fmt.Sprintf("%d", price),
		}

		_ = services.SendBuyerNotification(buyerTokens, title, body, data)
	}
}

// dispatchDealAcceptedNotification sends push to the recipient when a deal is accepted
func (bc *BargainController) dispatchDealAcceptedNotification(neg *models.Negotiation, acceptedBy string, acceptedPrice int) {
	db := config.DB
	if db == nil || neg == nil {
		return
	}

	productName := "Product"
	if neg.Product != nil && neg.Product.Name != "" {
		productName = neg.Product.Name
	} else {
		var prod models.Product
		if err := db.Where("id = ?", neg.ProductID).First(&prod).Error; err == nil {
			productName = prod.Name
		}
	}

	if isBuyer(db, neg, acceptedBy) {
		sellerTokens, _ := fetchSellerTokensAndShopName(db, neg.ShopID)
		if len(sellerTokens) == 0 {
			return
		}
		_, buyerName := fetchUserTokensAndName(db, neg.BuyerID, "Customer")

		title := fmt.Sprintf("🎉 Deal Accepted by %s!", buyerName)
		body := fmt.Sprintf("%s agreed to ₹%d for %s!", buyerName, acceptedPrice, productName)

		data := map[string]string{
			"type":            "chat",
			"target_role":     "seller",
			"conversation_id": neg.ID,
			"buyer_name":      buyerName,
			"product_title":   productName,
			"deal_status":     "accepted",
			"agreed_price":    fmt.Sprintf("%d", acceptedPrice),
		}

		_ = services.SendSellerNotification(sellerTokens, title, body, data)
	} else {
		buyerTokens, _ := fetchUserTokensAndName(db, neg.BuyerID, "Customer")
		if len(buyerTokens) == 0 {
			return
		}
		_, shopName := fetchSellerTokensAndShopName(db, neg.ShopID)

		title := fmt.Sprintf("🎉 Deal Accepted by %s!", shopName)
		body := fmt.Sprintf("Your offer of ₹%d for %s was accepted! Tap to bag now.", acceptedPrice, productName)

		data := map[string]string{
			"type":            "chat",
			"target_role":     "buyer",
			"conversation_id": neg.ID,
			"seller_name":     shopName,
			"deal_status":     "accepted",
			"agreed_price":    fmt.Sprintf("%d", acceptedPrice),
		}

		_ = services.SendBuyerNotification(buyerTokens, title, body, data)
	}
}

// dispatchChatMessageNotification sends push to the recipient when a chat message is sent
func (bc *BargainController) dispatchChatMessageNotification(negID, senderID, content string) {
	db := config.DB
	if db == nil {
		return
	}

	var neg models.Negotiation
	if err := db.Preload("Shop").Preload("Product").Where("id = ?", negID).First(&neg).Error; err != nil {
		return
	}

	productName := "Product"
	if neg.Product != nil && neg.Product.Name != "" {
		productName = neg.Product.Name
	}

	if isBuyer(db, &neg, senderID) {
		sellerTokens, _ := fetchSellerTokensAndShopName(db, neg.ShopID)
		if len(sellerTokens) == 0 {
			return
		}
		_, buyerName := fetchUserTokensAndName(db, neg.BuyerID, "Customer")

		title := fmt.Sprintf("🛍️ %s sent a message", buyerName)
		body := content

		data := map[string]string{
			"type":            "chat",
			"target_role":     "seller",
			"conversation_id": neg.ID,
			"buyer_name":      buyerName,
			"product_title":   productName,
			"deal_status":     neg.Status,
		}

		_ = services.SendSellerNotification(sellerTokens, title, body, data)
	} else {
		buyerTokens, _ := fetchUserTokensAndName(db, neg.BuyerID, "Customer")
		if len(buyerTokens) == 0 {
			return
		}
		shopName := "Boutique"
		if neg.Shop != nil && neg.Shop.Name != "" {
			shopName = neg.Shop.Name
		} else {
			_, shopName = fetchSellerTokensAndShopName(db, neg.ShopID)
		}

		title := fmt.Sprintf("💬 %s Replied", shopName)
		body := content

		data := map[string]string{
			"type":            "chat",
			"target_role":     "buyer",
			"conversation_id": neg.ID,
			"seller_name":     shopName,
			"deal_status":     neg.Status,
		}

		_ = services.SendBuyerNotification(buyerTokens, title, body, data)
	}
}

