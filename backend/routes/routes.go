package routes

import (
	"strings"

	"mitreno-backend/config"
	"mitreno-backend/controllers"
	"mitreno-backend/middleware"
	"mitreno-backend/models"
	"mitreno-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// SetupRoutes registers all REST and WebSocket endpoints
func SetupRoutes(app *fiber.App, cfg *config.Config) {
	// Initialize Controllers
	authCtrl := controllers.NewAuthController()
	shopCtrl := controllers.NewShopController()
	prodCtrl := controllers.NewProductController()
	reelsCtrl := controllers.NewReelsController(cfg)
	bargainCtrl := controllers.NewBargainController()
	orderCtrl := controllers.NewOrderController()
	adminCtrl := controllers.NewAdminController()
	sellerCtrl := controllers.NewSellerController()
	geoCtrl := controllers.NewGeographyController()
	socialCtrl := controllers.NewSocialController()
	wishlistCtrl := controllers.NewWishlistController()
	telemetryCtrl := controllers.NewTelemetryController()
	campaignCtrl := controllers.GetCampaignController()
	addressCtrl := controllers.NewAddressController()

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "Mitreno High-Power Native Go Backend",
			"version": "1.0.0",
		})
	})

	api := app.Group("/api")

	// 1. Auth & Profiles
	authGroup := api.Group("/auth")
	authGroup.Post("/check-phone", authCtrl.CheckPhoneExists)
	authGroup.Post("/sync", middleware.FirebaseAuthMiddleware(), authCtrl.SyncUser)
	authGroup.Post("/truecaller", authCtrl.TruecallerAuth)
	authGroup.Get("/me", middleware.FirebaseAuthMiddleware(), authCtrl.GetProfile)
	authGroup.Post("/device-token", authCtrl.RegisterDeviceToken)

	// 1.1 Saved User Delivery Addresses (Flipkart Persistent Smart Address System)
	addressGroup := api.Group("/user/addresses")
	addressGroup.Get("/", addressCtrl.ListUserAddresses)
	addressGroup.Post("/", addressCtrl.CreateAddress)
	addressGroup.Put("/:id", addressCtrl.UpdateAddress)
	addressGroup.Delete("/:id", addressCtrl.DeleteAddress)
	addressGroup.Post("/:id/default", addressCtrl.SetDefaultAddress)

	// 2. Shops / Boutiques
	shopsGroup := api.Group("/shops")
	shopsGroup.Get("/", shopCtrl.ListShops)
	shopsGroup.Get("/:id", shopCtrl.GetShopByID)
	shopsGroup.Get("/:id/profile", sellerCtrl.GetShopProfile)
	shopsGroup.Get("/:id/stories", sellerCtrl.GetShopStories)
	shopsGroup.Post("/:id/stories/:storyId/view", shopCtrl.RecordStoryView)
	shopsGroup.Post("/:id/stories/:storyId/like", shopCtrl.LikeStory)
	shopsGroup.Get("/:id/note", sellerCtrl.GetShopNote)
	shopsGroup.Post("/", middleware.FirebaseAuthMiddleware(), shopCtrl.CreateShop)

	// 3. Products Catalog & Variants
	prodGroup := api.Group("/products")
	prodGroup.Get("/", prodCtrl.ListProducts)
	prodGroup.Get("/:id", prodCtrl.GetProductByID)
	prodGroup.Get("/:id/price-history", controllers.GetProductPriceHistory)
	prodGroup.Post("/", prodCtrl.CreateProduct)
	prodGroup.Put("/:id", prodCtrl.UpdateProduct)
	prodGroup.Post("/:id/toggle-stock", prodCtrl.ToggleStock)
	prodGroup.Delete("/:id", prodCtrl.DeleteProduct)

	// 3.1 Live Flash Surge Drops
	api.Get("/flash-drops/active", controllers.GetActiveFlashDrops)

	// 4. Reels & Cloudflare R2 Video Engine
	reelsGroup := api.Group("/reels")
	reelsGroup.Get("/", reelsCtrl.GetReelsFeed)
	reelsGroup.Post("/:id/like", reelsCtrl.LikeReel)
	reelsGroup.Post("/:id/view", reelsCtrl.IncrementViews)
	reelsGroup.Post("/upload-url", middleware.FirebaseAuthMiddleware(), reelsCtrl.GetPresignedUploadURL)

	// 5. Live Bargaining & Negotiations
	api.Get("/campaigns/bargain-engine", campaignCtrl.GetActiveBargainCampaign)
	api.Get("/campaigns/bargain-engine/metrics", campaignCtrl.GetBargainMetrics)
	api.Post("/campaigns/bargain-engine/click", campaignCtrl.TrackBargainClick)
	bargainGroup := api.Group("/negotiations")
	bargainGroup.Post("/start", middleware.FirebaseAuthMiddleware(), bargainCtrl.StartNegotiation)
	bargainGroup.Get("/:id", bargainCtrl.GetNegotiationByID)
	bargainGroup.Post("/:id/counter", middleware.FirebaseAuthMiddleware(), bargainCtrl.SubmitCounterOffer)
	bargainGroup.Post("/:id/accept", middleware.FirebaseAuthMiddleware(), bargainCtrl.AcceptDeal)

	// 5.0 Live Bargain Deal Acceptance & Real-time Presence
	bargainApi := api.Group("/bargain")
	bargainApi.Post("/deal/accept", middleware.FirebaseAuthMiddleware(), bargainCtrl.AcceptDeal)
	bargainApi.Get("/presence/:user_id", bargainCtrl.GetUserPresence)

	// 5.1 Customer Live Chat Engine
	customerChatsGroup := api.Group("/customer/chats")
	customerChatsGroup.Get("/", bargainCtrl.GetCustomerChats)
	customerChatsGroup.Get("/thread", bargainCtrl.GetChatThread)
	customerChatsGroup.Post("/:negotiation_id/messages", bargainCtrl.PostChatMessage)
	customerChatsGroup.Post("/:negotiation_id/seen", bargainCtrl.MarkMessagesSeen)

	// 5.2 Social Boutique Features (Followers & Reviews)
	api.Post("/shops/:id/follow", middleware.FirebaseAuthMiddleware(), socialCtrl.FollowShop)
	api.Delete("/shops/:id/follow", middleware.FirebaseAuthMiddleware(), socialCtrl.UnfollowShop)
	api.Get("/shops/:id/follow", socialCtrl.GetShopFollowStatus)
	api.Get("/shops/:id/follow-status", socialCtrl.GetShopFollowStatus)
	api.Post("/shops/:id/reviews", middleware.FirebaseAuthMiddleware(), socialCtrl.CreateShopReview)
	api.Get("/shops/:id/reviews", socialCtrl.GetShopReviews)

	// 5.3 Persistent User Wishlist
	api.Get("/wishlist", middleware.FirebaseAuthMiddleware(), wishlistCtrl.GetWishlist)
	api.Get("/wishlist/ids", middleware.FirebaseAuthMiddleware(), wishlistCtrl.GetWishlistIds)
	api.Post("/wishlist/toggle", middleware.FirebaseAuthMiddleware(), wishlistCtrl.ToggleWishlist)
	api.Post("/wishlist/:product_id", middleware.FirebaseAuthMiddleware(), wishlistCtrl.ToggleWishlist)
	api.Post("/wishlist/:product_id/toggle", middleware.FirebaseAuthMiddleware(), wishlistCtrl.ToggleWishlist)

	// 6. Orders, Checkout & 24-hr Free Cancellation
	ordersGroup := api.Group("/orders")
	ordersGroup.Get("/", orderCtrl.ListCustomerOrders)
	ordersGroup.Post("/", orderCtrl.CreateOrder)
	ordersGroup.Get("/:id", orderCtrl.GetOrderByID)
	ordersGroup.Post("/:id/items/:item_id/cancel", middleware.FirebaseAuthMiddleware(), orderCtrl.CancelOrderItem)

	// 7. Seller Registration & Onboarding
	sellerAuth := middleware.FirebaseAuthMiddleware()
	sellerGuard := middleware.SellerGuard()

	sellerGroup := api.Group("/seller")
	sellerGroup.Post("/register", sellerAuth, sellerCtrl.RegisterSeller)
	sellerGroup.Get("/status", sellerAuth, sellerCtrl.GetSellerStatus)
	sellerGroup.Post("/upload-doc", sellerAuth, sellerCtrl.GetUploadURL)
	sellerGroup.Get("/analytics", sellerCtrl.GetSellerAnalytics)
	sellerGroup.Get("/billing", sellerCtrl.GetSellerBilling)
	sellerGroup.Post("/plan/switch", sellerCtrl.SwitchSellerPlan)
	sellerGroup.Post("/flash-drop/launch", controllers.LaunchFlashDrop)
	sellerGroup.Post("/flash-drop/end", controllers.EndFlashDrop)
	sellerGroup.Get("/campaign/invites", campaignCtrl.GetSellerCampaignInvites)
	sellerGroup.Post("/campaign/invites/:id/respond", campaignCtrl.RespondToCampaignInvite)
	sellerGroup.Get("/profile", sellerCtrl.GetShopProfile)

	// Guarded Seller Operations (Enforces Verified, Approved Boutique Status)
	guardedSeller := sellerGroup.Group("", sellerAuth, sellerGuard)
	guardedSeller.Get("/dashboard", sellerCtrl.GetSellerDashboard)
	guardedSeller.Get("/analytics", sellerCtrl.GetSellerAnalytics)
	guardedSeller.Get("/billing", sellerCtrl.GetSellerBilling)
	guardedSeller.Post("/plan/switch", sellerCtrl.SwitchSellerPlan)
	guardedSeller.Post("/flash-drop/launch", controllers.LaunchFlashDrop)
	guardedSeller.Post("/flash-drop/end", controllers.EndFlashDrop)
	guardedSeller.Get("/profile", sellerCtrl.GetSellerProfile)
	guardedSeller.Put("/profile", sellerCtrl.UpdateSellerProfile)
	guardedSeller.Post("/profile/story", sellerCtrl.CreateShopStory)
	guardedSeller.Delete("/profile/story/:id", sellerCtrl.DeleteShopStory)
	guardedSeller.Post("/profile/note", sellerCtrl.CreateShopNote)
	guardedSeller.Delete("/profile/note", sellerCtrl.DeleteShopNote)
	guardedSeller.Get("/products", prodCtrl.ListProducts)
	guardedSeller.Post("/products", prodCtrl.CreateProduct)
	guardedSeller.Post("/products/:id/toggle-stock", prodCtrl.ToggleStock)
	guardedSeller.Delete("/products/:id", prodCtrl.DeleteProduct)

	// Seller Orders
	guardedSeller.Get("/orders", sellerCtrl.GetSellerOrders)
	guardedSeller.Get("/orders/:id", sellerCtrl.GetSellerOrderDetail)
	guardedSeller.Post("/orders/:id/status", sellerCtrl.UpdateSellerOrderStatus)
	guardedSeller.Post("/orders/:id/accept", sellerCtrl.AcceptSellerOrder)
	guardedSeller.Post("/orders/:id/reject", sellerCtrl.RejectSellerOrder)
	guardedSeller.Post("/orders/:id/notes", sellerCtrl.UpdateSellerOrderNotes)

	// Seller Notifications
	guardedSeller.Get("/notifications", sellerCtrl.GetSellerNotifications)
	guardedSeller.Post("/notifications/mark-read", sellerCtrl.MarkSellerNotificationsRead)

	// Seller Chats
	guardedSeller.Get("/chats", sellerCtrl.GetSellerChats)
	guardedSeller.Get("/chats/:id", sellerCtrl.GetSellerChatDetails)
	guardedSeller.Post("/chats/:id/messages", sellerCtrl.PostSellerChatMessage)
	guardedSeller.Post("/chats/:id/deals", sellerCtrl.PostSellerDeal)

	// 8. Global Admin Dashboard Group
	adminGroup := api.Group("/admin", middleware.AdminAuthMiddleware(cfg.AdminKey))
	adminGroup.Get("/dashboard", adminCtrl.GetDashboardStats)
	adminGroup.Get("/analytics", adminCtrl.GetMarketplaceAnalytics)

	// 8.0 Admin Live Bargain Campaign Engine & 6-Bento Slots
	adminGroup.Get("/campaigns/bargain-engine", campaignCtrl.GetActiveBargainCampaign)
	adminGroup.Get("/campaigns/bargain-engine/metrics", campaignCtrl.GetBargainMetrics)
	adminGroup.Put("/campaigns/bargain-engine", campaignCtrl.UpdateBargainCampaign)
	adminGroup.Put("/campaigns/slots/:key", campaignCtrl.UpdateBargainSlot)
	adminGroup.Post("/campaigns/invite-brand", campaignCtrl.InviteTopBrand)

	// 8.1 Admin Seller Application Review
	adminGroup.Get("/seller-applications", adminCtrl.ListSellerApplications)
	adminGroup.Get("/seller-applications/:id", adminCtrl.GetSellerApplication)
	adminGroup.Post("/seller-applications/:id/approve", adminCtrl.ApproveSellerApplication)
	adminGroup.Post("/seller-applications/:id/reject", adminCtrl.RejectSellerApplication)

	// 8.2 Admin Geographic Management (States → Cities → Shops)
	adminGroup.Get("/states", geoCtrl.ListStates)
	adminGroup.Post("/states", geoCtrl.CreateState)
	adminGroup.Get("/states/:id/cities", geoCtrl.ListCitiesByState)
	adminGroup.Post("/cities", geoCtrl.CreateCity)
	adminGroup.Get("/cities/:id", geoCtrl.GetCityDetail)
	adminGroup.Put("/cities/:id", geoCtrl.UpdateCity)
	adminGroup.Get("/shops", shopCtrl.ListShops)
	adminGroup.Post("/shops/:shopId/suspend", geoCtrl.SuspendShopInCity)
	adminGroup.Post("/shops/:shopId/activate", geoCtrl.ActivateShopInCity)

	// 9. Public Explore API (City Discovery for Customer App)
	exploreGroup := api.Group("/explore")
	exploreGroup.Get("/states", geoCtrl.ExploreStates)
	exploreGroup.Get("/cities/:id", geoCtrl.ExploreCityDetail)

	// 9.1 Real-time Telemetry & Heartbeat Pulse (Zero Fake Data)
	telemetryGroup := api.Group("/telemetry")
	telemetryGroup.Post("/heartbeat", telemetryCtrl.Heartbeat)
	telemetryGroup.Post("/search", telemetryCtrl.LogSearch)

	// 10. Real-time WebSocket Route for Bargaining
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws/bargain/:negotiation_id", websocket.New(services.HandleBargainWS))

	// 11. Marketing & Rich Push Notifications
	notificationsGroup := api.Group("/notifications")
	notificationsGroup.Post("/promo", func(c *fiber.Ctx) error {
		type PromoReq struct {
			Tokens          []string `json:"tokens"`
			Token           string   `json:"token"`
			Title           string   `json:"title"`
			Body            string   `json:"body"`
			ImageURL        string   `json:"image_url"`
			ProductID       string   `json:"product_id"`
			ActionLabel     string   `json:"action_label"`
			ActionSecondary string   `json:"action_secondary"`
		}
		var req PromoReq
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}
		if req.Token != "" && len(req.Tokens) == 0 {
			req.Tokens = []string{req.Token}
		}
		if len(req.Tokens) == 0 && config.DB != nil {
			var users []models.User
			if err := config.DB.Find(&users).Error; err == nil {
				for _, u := range users {
					for _, tok := range u.AndroidDeviceTokens {
						if strings.TrimSpace(tok) != "" {
							req.Tokens = append(req.Tokens, strings.TrimSpace(tok))
						}
					}
				}
			}
		}
		if req.Title == "" {
			req.Title = "🔥 Weekend Flash Drop: Flat 60% OFF!"
		}
		if req.Body == "" {
			req.Body = "Handcrafted Chikankari Kurta & Royal Silk Drops. Grab before sold out!"
		}
		if req.ImageURL == "" {
			req.ImageURL = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
		}
		if req.ProductID == "" {
			req.ProductID = "prod_chikankari_101"
		}
		fcm := services.NewFCMService("mitreno")
		data := map[string]string{
			"action_label":     req.ActionLabel,
			"action_secondary": req.ActionSecondary,
		}
		err := fcm.SendProductPromoNotification(req.Tokens, req.Title, req.Body, req.ImageURL, req.ProductID, data)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{
			"success":    true,
			"message":    "Rich push dispatched successfully",
			"recipients": len(req.Tokens),
		})
	})
}

