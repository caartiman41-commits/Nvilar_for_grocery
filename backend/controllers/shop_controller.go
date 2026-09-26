package controllers

import (
	"time"

	"mitreno-backend/config"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShopController struct{}

func NewShopController() *ShopController {
	return &ShopController{}
}

// ListShops returns verified boutique shops
func (sc *ShopController) ListShops(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var shops []models.Shop
	query := db.Preload("Products")

	verifiedOnly := c.Query("verified_only")
	if verifiedOnly == "true" {
		query = query.Where("is_verified = ?", true)
	}

	if err := query.Order("rating desc").Find(&shops).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to retrieve shops",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"count":   len(shops),
		"shops":   shops,
	})
}

// GetShopByID returns boutique details and catalog
func (sc *ShopController) GetShopByID(c *fiber.Ctx) error {
	shopID := c.Params("id")
	if shopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop ID is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var shop models.Shop
	if err := db.Preload("Products").Where("id = ? OR owner_id = ?", shopID, shopID).First(&shop).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Shop not found",
		})
	}

	var followersCount int64
	db.Model(&models.ShopFollower{}).Where("shop_id = ?", shop.ID).Count(&followersCount)

	type RatingStats struct {
		AvgRating float64
		Total     int
	}
	var stats RatingStats
	db.Raw(`
		SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total 
		FROM shop_reviews 
		WHERE shop_id = ?
	`, shop.ID).Scan(&stats)

	if stats.Total > 0 {
		shop.Rating = stats.AvgRating
		shop.ReviewCount = stats.Total
	} else if shop.Rating == 0 {
		shop.Rating = 5.00
		shop.ReviewCount = 1
	}
	shop.FollowersCount = int(followersCount)

	var activeNote *models.ShopNote
	var noteRecord models.ShopNote
	if err := db.Where("shop_id = ? AND expires_at > ?", shop.ID, time.Now()).First(&noteRecord).Error; err == nil {
		activeNote = &noteRecord
	}

	// Auto purge expired 24h stories
	db.Where("expires_at <= ?", time.Now()).Delete(&models.ShopStory{})

	var stories []models.ShopStory
	db.Where("shop_id = ? AND expires_at > ?", shop.ID, time.Now()).Order("created_at ASC").Find(&stories)

	// Fetch active reels
	var reels []models.Reel
	db.Where("shop_id = ? AND is_active = ?", shop.ID, true).Order("created_at DESC").Find(&reels)

	return c.JSON(fiber.Map{
		"success":     true,
		"shop":        shop,
		"latitude":    shop.Latitude,
		"longitude":   shop.Longitude,
		"active_note": activeNote,
		"stories":     stories,
		"reels":       reels,
	})
}

// CreateShop registers a new boutique (Address info strictly in Bio)
func (sc *ShopController) CreateShop(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized",
		})
	}

	type CreateShopReq struct {
		Name        string   `json:"name"`
		Bio         string   `json:"bio"` // Plain-text store profile, timing & address info
		LogoURL     *string  `json:"logo_url"`
		CoverImage  *string  `json:"cover_image"`
		PayoutUpiID *string  `json:"payout_upi_id"`
		Latitude    *float64 `json:"latitude"`
		Longitude   *float64 `json:"longitude"`
	}

	var req CreateShopReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop name is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	shop := models.Shop{
		ID:          "shop_" + uuid.New().String()[:8],
		OwnerID:     userID.(string),
		Name:        req.Name,
		Bio:         req.Bio,
		LogoURL:     req.LogoURL,
		CoverImage:  req.CoverImage,
		PayoutUpiID: req.PayoutUpiID,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		Rating:      4.9,
		ReviewCount: 1,
		IsVerified:  true,
	}

	if err := db.Create(&shop).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create shop",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Shop created successfully",
		"shop":    shop,
	})
}

// RecordStoryView increments the views_count for a story
func (sc *ShopController) RecordStoryView(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "error": "Database unavailable"})
	}

	storyID := c.Params("storyId")
	if storyID == "" {
		storyID = c.Params("id")
	}
	if storyID != "" {
		_ = db.Model(&models.ShopStory{}).Where("id = ?", storyID).UpdateColumn("views_count", gorm.Expr("views_count + 1"))
	}

	return c.JSON(fiber.Map{"success": true})
}

// LikeStory increments the likes_count for a story
func (sc *ShopController) LikeStory(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "error": "Database unavailable"})
	}

	storyID := c.Params("storyId")
	if storyID == "" {
		storyID = c.Params("id")
	}
	if storyID != "" {
		_ = db.Model(&models.ShopStory{}).Where("id = ?", storyID).UpdateColumn("likes_count", gorm.Expr("likes_count + 1"))
	}

	return c.JSON(fiber.Map{"success": true})
}

