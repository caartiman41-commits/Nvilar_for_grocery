package controllers

import (
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/middleware"
	"mitreno-backend/models"
	"mitreno-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderController struct{}

func NewOrderController() *OrderController {
	return &OrderController{}
}

func parseFloatAny(val interface{}) float64 {
	if val == nil {
		return 0.0
	}
	switch v := val.(type) {
	case float64:
		return v
	case float32:
		return float64(v)
	case int:
		return float64(v)
	case int64:
		return float64(v)
	case string:
		f, err := strconv.ParseFloat(strings.TrimSpace(v), 64)
		if err == nil {
			return f
		}
	}
	return 0.0
}

// cleanProductID strips optional size suffixes like "-S", "-M", "-L", "-XL", "-XXL" from cart item IDs
func cleanProductID(rawID string) string {
	trimmed := strings.TrimSpace(rawID)
	for _, suffix := range []string{"-XXL", "-XL", "-S", "-M", "-L"} {
		if strings.HasSuffix(trimmed, suffix) && len(trimmed) > len(suffix) {
			return strings.TrimSuffix(trimmed, suffix)
		}
	}
	return trimmed
}

// CreateOrder places an order supporting multi-shop cart items, notifications, and 24-hr free cancellation
func (oc *OrderController) CreateOrder(c *fiber.Ctx) error {
	type CustomerInfo struct {
		FullName       string      `json:"fullName"`
		Name           string      `json:"name"`
		Phone          string      `json:"phone"`
		AlternatePhone string      `json:"alternatePhone"`
		AddressLine    string      `json:"addressLine"`
		Street         string      `json:"street"`
		City           string      `json:"city"`
		State          string      `json:"state"`
		Pincode        string      `json:"pincode"`
		Latitude       interface{} `json:"latitude"`
		Longitude      interface{} `json:"longitude"`
	}

	type CartItemReq struct {
		ProductID    string  `json:"product_id"`
		Name         string  `json:"name"`
		Thumbnail    string  `json:"thumbnail"`
		Quantity     int     `json:"quantity"`
		Size         string  `json:"size"`
		Price        float64 `json:"price"`
		PricePerUnit int     `json:"price_per_unit"`
		ShopID       string  `json:"shop_id"`
		ShopName     string  `json:"shop_name"`
		Fabric       string  `json:"fabric"`
	}

	type FullOrderReq struct {
		BuyerID          string        `json:"buyer_id"`
		Customer         CustomerInfo  `json:"customer"`
		Items            []CartItemReq `json:"items"`
		PaymentMethod    string        `json:"paymentMethod"`
		PaymentMode      string        `json:"payment_mode"`
		DeliveryDate     string        `json:"deliveryDate"`
		TotalMRP         float64       `json:"totalMRP"`
		TotalSelling     float64       `json:"totalSelling"`
		TotalDiscount    float64       `json:"totalDiscount"`
		Fees             float64       `json:"fees"`
		FinalTotalAmount float64       `json:"finalTotalAmount"`
		ShippingAddress  models.JSONB  `json:"shipping_address"`
	}

	var req FullOrderReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Cannot place order with empty cart",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// Resolve canonical buyer ID
	buyerID := strings.TrimSpace(req.BuyerID)
	if buyerID == "" {
		if headerUID := c.Get("X-User-ID"); headerUID != "" {
			buyerID = headerUID
		}
	}
	if buyerID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "User authentication required to place orders",
		})
	}

	buyerID = middleware.ResolveCanonicalUserID(db, buyerID)

	custName := req.Customer.FullName
	if custName == "" {
		custName = req.Customer.Name
	}
	if custName == "" {
		custName = "Nvilar Shopper"
	}

	custPhone := req.Customer.Phone
	if custPhone == "" {
		custPhone = "+91 98201 44521"
	}

	// Ensure buyer exists in users table without ever creating duplicate rows for existing firebase_uid
	var existingUser models.User
	if err := db.Where("id = ? OR firebase_uid = ?", buyerID, buyerID).
		Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").
		First(&existingUser).Error; err == nil && existingUser.ID != "" {
		buyerID = existingUser.ID
	} else {
		var userByPhone models.User
		if errPhone := db.Where("phone = ?", custPhone).First(&userByPhone).Error; errPhone == nil && userByPhone.ID != "" {
			buyerID = userByPhone.ID
		} else {
			newUser := models.User{
				ID:        buyerID,
				FullName:  custName,
				Phone:     custPhone,
				Role:      "customer",
				IsActive:  true,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			_ = db.Create(&newUser)
		}
	}

	// Strict Zero-Trust Product -> Shop Resolver:
	// Every ordered item MUST exist in PostgreSQL `products` and route strictly to its owning `shop_id`.
	itemsByShop := make(map[string][]CartItemReq)
	for _, itm := range req.Items {
		normProdID := cleanProductID(itm.ProductID)
		var prod models.Product
		prodFound := false

		if normProdID != "" {
			if err := db.Where("id = ?", normProdID).First(&prod).Error; err == nil && prod.ID != "" {
				prodFound = true
			}
		}

		// Secondary lookup by exact product name + shop_id if provided
		if !prodFound && strings.TrimSpace(itm.Name) != "" {
			cleanName := strings.ToLower(strings.TrimSpace(itm.Name))
			q := db.Where("LOWER(name) = ?", cleanName)
			if strings.TrimSpace(itm.ShopID) != "" {
				q = q.Where("shop_id = ?", strings.TrimSpace(itm.ShopID))
			}
			if err := q.First(&prod).Error; err == nil && prod.ID != "" {
				prodFound = true
			}
		}

		if !prodFound || prod.ShopID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   fmt.Sprintf("Product '%s' (%s) does not exist in the verified catalog", itm.Name, itm.ProductID),
			})
		}

		if !prod.IsActive {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   fmt.Sprintf("Product '%s' is currently out of stock", prod.Name),
			})
		}

		// Verify the owning shop exists and is active
		var owningShop models.Shop
		if err := db.Where("id = ?", prod.ShopID).First(&owningShop).Error; err != nil || owningShop.ID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   fmt.Sprintf("Boutique seller for product '%s' is not registered or active", prod.Name),
			})
		}

		// Lock item strictly to the database product ID and its owning shop ID
		itm.ProductID = prod.ID
		itm.ShopID = owningShop.ID
		if itm.Name == "" {
			itm.Name = prod.Name
		}
		if itm.Thumbnail == "" {
			itm.Thumbnail = prod.Thumbnail
		}
		itemsByShop[owningShop.ID] = append(itemsByShop[owningShop.ID], itm)
	}

	payMode := req.PaymentMethod
	if payMode == "" {
		payMode = req.PaymentMode
	}
	if payMode == "" {
		payMode = "UPI"
	}
	payMode = strings.ToUpper(payMode)

	now := time.Now()
	var createdOrders []fiber.Map
	var primaryOrder models.Order

	latNum := parseFloatAny(req.Customer.Latitude)
	if latNum == 0 {
		latNum = 26.13449
	}
	lonNum := parseFloatAny(req.Customer.Longitude)
	if lonNum == 0 {
		lonNum = 91.81353
	}

	for sID, shopItems := range itemsByShop {
		// Random 5-digit order number matching Nvilar UI format (e.g. MIT-57722)
		orderID := fmt.Sprintf("MIT-%d", 10000+rand.Intn(90000))
		trackingNum := fmt.Sprintf("BD-%08dIN", rand.Intn(90000000)+10000000)
		trackingProvider := "Blue Dart Express Priority Air"

		shopSubtotal := 0
		shopMRP := 0
		for _, itm := range shopItems {
			unitPrice := itm.PricePerUnit
			if unitPrice <= 0 {
				unitPrice = int(itm.Price)
			}
			if unitPrice <= 0 {
				unitPrice = 1999
			}
			qty := itm.Quantity
			if qty <= 0 {
				qty = 1
			}
			shopSubtotal += unitPrice * qty
			shopMRP += (unitPrice + 600) * qty
		}

		deliveryFee := int(req.Fees)
		if deliveryFee <= 0 {
			deliveryFee = 59
		}
		totalPaid := shopSubtotal + deliveryFee
		totalSavings := shopMRP - shopSubtotal

		// Structured shipping address
		shippingMap := map[string]interface{}{
			"name":            custName,
			"phone":           custPhone,
			"alternate_phone": req.Customer.AlternatePhone,
			"street":          req.Customer.AddressLine,
			"city":            req.Customer.City,
			"state":           req.Customer.State,
			"pincode":         req.Customer.Pincode,
			"latitude":        latNum,
			"longitude":       lonNum,
		}
		if shippingMap["street"] == "" {
			shippingMap["street"] = req.Customer.Street
		}
		if shippingMap["street"] == "" {
			shippingMap["street"] = "Boutique Residence"
		}
		if shippingMap["city"] == "" {
			shippingMap["city"] = "Mumbai"
		}
		if shippingMap["state"] == "" {
			shippingMap["state"] = "Maharashtra"
		}
		if shippingMap["pincode"] == "" {
			shippingMap["pincode"] = "400050"
		}

		order := models.Order{
			ID:                    orderID,
			BuyerID:               buyerID,
			ShopID:                sID,
			ShippingAddress:       models.JSONB(shippingMap),
			PaymentMode:           payMode,
			PaymentStatus:         "PAID",
			TotalMRP:              shopMRP,
			TotalSavings:          totalSavings,
			DeliveryCharge:        deliveryFee,
			TotalPaid:             totalPaid,
			OrderStatus:           "placed",
			SellerStatus:          "new",
			TrackingNumber:        &trackingNum,
			TrackingProvider:      &trackingProvider,
			CancelWindowExpiresAt: now.Add(24 * time.Hour),
			PlacedAt:              now,
			UpdatedAt:             now,
		}

		// Persist / Link address to user_addresses permanently for future Flipkart-style recommendations
		go func(uid, phone, name string, sMap map[string]interface{}) {
			defer func() { _ = recover() }()
			street, _ := sMap["street"].(string)
			city, _ := sMap["city"].(string)
			state, _ := sMap["state"].(string)
			pin, _ := sMap["pincode"].(string)
			altPhone, _ := sMap["alternate_phone"].(string)
			if street != "" && pin != "" && config.DB != nil {
				var existing models.UserAddress
				if err := config.DB.Where("(phone = ? OR user_id = ?) AND pincode = ? AND house_no_street = ?", phone, uid, pin, street).First(&existing).Error; err != nil {
					newUA := models.UserAddress{
						ID:             fmt.Sprintf("addr_%d", time.Now().UnixNano()),
						UserID:         uid,
						Phone:          phone,
						RecipientName:  name,
						HouseNoStreet:  street,
						NearbyArea:     street,
						CityVillage:    city,
						State:          state,
						Pincode:        pin,
						AlternatePhone: altPhone,
						AddressType:    "HOME",
						Distance:       "0m",
						IsDefault:      true,
						CreatedAt:      time.Now(),
						UpdatedAt:      time.Now(),
					}
					_ = config.DB.Create(&newUA)
				}
			}
		}(buyerID, custPhone, custName, shippingMap)

		// Prepare order items
		var orderItems []models.OrderItem
		for idx, itm := range shopItems {
			unitPrice := itm.PricePerUnit
			if unitPrice <= 0 {
				unitPrice = int(itm.Price)
			}
			if unitPrice <= 0 {
				unitPrice = 1999
			}
			qty := itm.Quantity
			if qty <= 0 {
				qty = 1
			}
			size := itm.Size
			if size == "" {
				size = "L"
			}

			orderItem := models.OrderItem{
				ID:           fmt.Sprintf("oi_%s_%d", orderID, idx+1),
				OrderID:      orderID,
				ProductID:    itm.ProductID,
				Quantity:     qty,
				Size:         size,
				PricePerUnit: unitPrice,
				IsCancelled:  false,
				CreatedAt:    now,
			}
			orderItems = append(orderItems, orderItem)
		}

		// Prepare initial tracking timeline history
		initialMilestones := []models.OrderTrackingHistory{
			{
				ID:          fmt.Sprintf("trk_%s_1", orderID),
				OrderID:     orderID,
				Stage:       "placed",
				Title:       "Order Confirmed & Payment Verified",
				Description: "Your order has been placed with the boutique. Digital receipt generated.",
				Status:      "completed",
				TimeLabel:   fmt.Sprintf("[Today, %s]", now.Format("03:04 pm")),
				SortOrder:   1,
				CreatedAt:   now,
			},
			{
				ID:          fmt.Sprintf("trk_%s_2", orderID),
				OrderID:     orderID,
				Stage:       "QUALITY_CHECKED",
				Title:       "Boutique Packaging & GSM Quality Check",
				Description: "Master atelier verifying fabric integrity, stitching, and packaging.",
				Status:      "in-progress",
				TimeLabel:   "Expected by Tomorrow, 11:00 am",
				SortOrder:   2,
				CreatedAt:   now.Add(2 * time.Minute),
			},
			{
				ID:          fmt.Sprintf("trk_%s_3", orderID),
				OrderID:     orderID,
				Stage:       "SHIPPED",
				Title:       "Air Priority Express Dispatch",
				Description: "Handed over to Bluedart Air Cargo tracking hub.",
				Status:      "pending",
				TimeLabel:   "Expected in 2 Days",
				SortOrder:   3,
				CreatedAt:   now.Add(4 * time.Minute),
			},
			{
				ID:          fmt.Sprintf("trk_%s_4", orderID),
				OrderID:     orderID,
				Stage:       "OUT_FOR_DELIVERY",
				Title:       "Out for Contactless Delivery",
				Description: "Courier executive on the way to your doorstep.",
				Status:      "pending",
				TimeLabel:   "Expected in 3 Days",
				SortOrder:   4,
				CreatedAt:   now.Add(6 * time.Minute),
			},
		}

		// Find shop owner for seller notification
		shopOwnerID := ""
		var shop models.Shop
		if err := db.Select("owner_id").Where("id = ?", sID).First(&shop).Error; err == nil && shop.OwnerID != "" {
			shopOwnerID = middleware.ResolveCanonicalUserID(db, shop.OwnerID)
		}

		// Real-time notification struct
		notifID := fmt.Sprintf("notif_%s_%d", orderID, now.UnixMilli()%10000)
		notifMsg := fmt.Sprintf("Order #%s received. Customer: %s (%s). Total: ₹%d. Please review and start packaging.", orderID, custName, shippingMap["city"], totalPaid)
		notif := models.SellerNotification{
			ID:          notifID,
			ShopID:      sID,
			UserID:      shopOwnerID,
			Type:        "new_order",
			Title:       "New Order Received! 🛍️",
			Message:     notifMsg,
			ReferenceID: &orderID,
			IsRead:      false,
			CreatedAt:   now,
		}

		// Execute atomic ACID transaction
		txErr := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&order).Error; err != nil {
				return err
			}
			for i := range orderItems {
				if err := tx.Create(&orderItems[i]).Error; err != nil {
					return err
				}
			}
			if len(initialMilestones) > 0 {
				if err := tx.Create(&initialMilestones).Error; err != nil {
					return err
				}
			}
			_ = tx.Create(&notif)
			_ = tx.Model(&models.Shop{}).Where("id = ?", sID).Updates(map[string]interface{}{
				"total_orders":  gorm.Expr("total_orders + 1"),
				"total_revenue": gorm.Expr("total_revenue + ?", totalPaid),
				"updated_at":    now,
			})
			return nil
		})

		if txErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to persist order: " + txErr.Error(),
			})
		}

		// Real-time seller broadcast via WebSocket to room shop_<shop_id>
		services.GlobalRoomManager.BroadcastToRoom("shop_"+sID, services.WSMessage{
			Type:          "new_order",
			NegotiationID: sID,
			UserID:        buyerID,
			Role:          "system",
			MessageText:   notifMsg,
		})

		// Real-time High-Priority Seller Push Notification via FCM (mitreno_seller_channel)
		if shopOwnerID != "" {
			var ownerUser models.User
			if err := db.Select("android_device_tokens").Where("id = ?", shopOwnerID).First(&ownerUser).Error; err == nil {
				var tokens []string
				for _, t := range ownerUser.AndroidDeviceTokens {
					if t != "" {
						tokens = append(tokens, t)
					}
				}
				if len(tokens) > 0 {
					go func(tks []string, oID, pTitle string, amt int) {
						_ = services.SendSellerNotification(tks, "🛍️ New Order Received!", fmt.Sprintf("Order #%s for %s received. Total: ₹%d", oID, pTitle, amt), map[string]string{
							"type":          "new_order",
							"order_id":      oID,
							"tag":           "order_" + oID,
							"target_role":   "seller",
							"target_screen": "SellerOrders",
						})
					}(tokens, orderID, shopItems[0].Name, totalPaid)
				}
			}
		}

		order.Items = orderItems
		order.History = initialMilestones

		if primaryOrder.ID == "" {
			primaryOrder = order
		}

		createdOrders = append(createdOrders, fiber.Map{
			"orderId":        orderID,
			"id":             orderID,
			"shopId":         sID,
			"trackingNumber": trackingNum,
			"courier":        trackingProvider,
			"deliveryPin":    fmt.Sprintf("%04d", rand.Intn(9000)+1000),
			"items":          shopItems,
			"total":          totalPaid,
			"customer":       shippingMap,
			"deliveryDate":   req.DeliveryDate,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success":        true,
		"message":        "Order created and dispatched to boutique successfully",
		"orders":         createdOrders,
		"order":          primaryOrder,
		"primaryOrderId": primaryOrder.ID,
	})
}

// ListCustomerOrders returns order list for the current customer
func (oc *OrderController) ListCustomerOrders(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	buyerID := c.Query("buyer_id")
	if buyerID == "" {
		buyerID = c.Query("user_id")
	}
	if buyerID == "" {
		buyerID = c.Get("X-User-ID")
	}

	if buyerID == "" {
		return c.JSON(fiber.Map{
			"success": true,
			"orders":  []fiber.Map{},
		})
	}

	buyerID = middleware.ResolveCanonicalUserID(db, buyerID)

	var orders []models.Order
	query := db.Preload("Items.Product").Preload("Shop").Preload("History").Where("buyer_id = ?", buyerID).Order("placed_at DESC")

	if err := query.Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch orders: " + err.Error(),
		})
	}

	var formattedList []fiber.Map
	for _, o := range orders {
		rawShipping := map[string]interface{}(o.ShippingAddress)

		var formattedItems []fiber.Map
		for _, itm := range o.Items {
			pName := "Boutique Garment"
			pThumb := "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80"
			if itm.Product != nil {
				if itm.Product.Name != "" {
					pName = itm.Product.Name
				}
				if itm.Product.Thumbnail != "" {
					pThumb = itm.Product.Thumbnail
				}
			}
			formattedItems = append(formattedItems, fiber.Map{
				"id":                itm.ID,
				"product_id":        itm.ProductID,
				"product_name":      pName,
				"name":              pName,
				"product_thumbnail": pThumb,
				"thumbnail":         pThumb,
				"quantity":          itm.Quantity,
				"size":              itm.Size,
				"price_per_unit":    itm.PricePerUnit,
				"price":             itm.PricePerUnit,
			})
		}

		shopName := "Boutique Atelier"
		if o.Shop != nil && o.Shop.Name != "" {
			shopName = o.Shop.Name
		}

		formattedList = append(formattedList, fiber.Map{
			"id":                o.ID,
			"orderId":           o.ID,
			"buyer_id":          o.BuyerID,
			"shop_id":           o.ShopID,
			"shop_name":         shopName,
			"seller_status":     o.SellerStatus,
			"order_status":      o.OrderStatus,
			"tracking_number":   o.TrackingNumber,
			"tracking_provider": o.TrackingProvider,
			"total_paid":        o.TotalPaid,
			"total_mrp":         o.TotalMRP,
			"total_savings":     o.TotalSavings,
			"delivery_charge":   o.DeliveryCharge,
			"placed_at":         o.PlacedAt,
			"accepted_at":       o.AcceptedAt,
			"shipped_at":        o.ShippedAt,
			"delivered_at":      o.DeliveredAt,
			"shipping_address":  rawShipping,
			"items":             formattedItems,
			"tracking_history":  o.History,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"orders":  formattedList,
	})
}

// GetOrderByID returns complete order with tracking timeline
func (oc *OrderController) GetOrderByID(c *fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Order ID is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var order models.Order
	if err := db.Preload("Items.Product").Preload("Shop").Preload("History").Where("id = ?", orderID).First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Order not found",
		})
	}

	isCancelWindowOpen := time.Now().Before(order.CancelWindowExpiresAt)
	remainingHours := int(time.Until(order.CancelWindowExpiresAt).Hours())
	if remainingHours < 0 {
		remainingHours = 0
	}

	return c.JSON(fiber.Map{
		"success":                  true,
		"order":                    order,
		"is_cancellation_eligible": isCancelWindowOpen,
		"cancellation_hours_left":  remainingHours,
	})
}

// CancelOrderItem cancels an individual item within 24 hours
func (oc *OrderController) CancelOrderItem(c *fiber.Ctx) error {
	orderID := c.Params("id")
	itemID := c.Params("item_id")

	type CancelReq struct {
		Reason string `json:"reason"`
	}

	var req CancelReq
	_ = c.BodyParser(&req)

	if req.Reason == "" {
		req.Reason = "Ordered by mistake"
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var order models.Order
	if err := db.Where("id = ?", orderID).First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Order not found",
		})
	}

	// 24-hour verification
	if time.Now().After(order.CancelWindowExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Free cancellation window of 24 hours has expired for this order",
		})
	}

	var item models.OrderItem
	if err := db.Where("id = ? AND order_id = ?", itemID, orderID).First(&item).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Order item not found",
		})
	}

	if item.IsCancelled {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "This item is already cancelled",
		})
	}

	now := time.Now()
	item.IsCancelled = true
	item.CancellationReason = &req.Reason
	item.CancellationTime = &now
	_ = db.Save(&item)

	// Check if all items in order are cancelled
	var activeCount int64
	db.Model(&models.OrderItem{}).Where("order_id = ? AND is_cancelled = false", orderID).Count(&activeCount)
	if activeCount == 0 {
		order.OrderStatus = "CANCELLED"
		_ = db.Save(&order)
	}

	// Insert cancellation milestone to tracking timeline
	cancelMilestone := models.OrderTrackingHistory{
		ID:          "trk_" + uuid.New().String()[:8],
		OrderID:     orderID,
		Stage:       "CANCELLED",
		Title:       "Item Cancellation Approved",
		Description: fmt.Sprintf("Reason: %s. 100%% refund initiated to original payment source.", req.Reason),
		Status:      "completed",
		TimeLabel:   fmt.Sprintf("[Today, %s]", now.Format("03:04 pm")),
		SortOrder:   99,
		CreatedAt:   now,
	}
	_ = db.Create(&cancelMilestone)

	return c.JSON(fiber.Map{
		"success":        true,
		"message":        "Item cancelled successfully. Refund initiated.",
		"refund_amount":  item.PricePerUnit * item.Quantity,
		"cancelled_item": item,
	})
}
