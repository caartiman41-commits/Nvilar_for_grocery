package controllers

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"mitreno-backend/config"
	"mitreno-backend/models"
)

type SocialController struct{}

func NewSocialController() *SocialController {
	return &SocialController{}
}

func resolveCanonicalUserID(rawID string) string {
	if rawID == "" || config.DB == nil {
		return rawID
	}
	var u models.User
	if err := config.DB.Where("id = ? OR firebase_uid = ? OR phone = ?", rawID, rawID, rawID).First(&u).Error; err == nil {
		return u.ID
	}
	// Normalized phone search for 10-digit format
	clean := strings.TrimPrefix(rawID, "+91")
	clean = strings.TrimPrefix(clean, "+")
	if len(clean) >= 10 {
		clean10 := clean[len(clean)-10:]
		if err := config.DB.Where("phone LIKE ?", "%"+clean10).First(&u).Error; err == nil {
			return u.ID
		}
	}
	return rawID
}

// FollowShop adds the authenticated user to the boutique's follower list
func (sc *SocialController) FollowShop(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		userID = c.Query("user_id")
	}
	if userID == "" {
		var req struct {
			UserID string `json:"user_id"`
		}
		_ = c.BodyParser(&req)
		userID = req.UserID
	}
	userID = resolveCanonicalUserID(userID)

	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Authentication required to follow boutique",
		})
	}

	shopID := c.Params("id")
	if shopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop ID is required",
		})
	}

	// Verify shop exists
	var shop models.Shop
	if err := db.Where("id = ?", shopID).First(&shop).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Boutique not found",
		})
	}

	// Insert follower record idempotently
	var userName string
	if phone, ok := c.Locals("phone").(string); ok && phone != "" {
		userName = phone
	}

	follower := models.ShopFollower{
		ID:        "fol_" + uuid.New().String()[:12],
		UserID:    userID,
		ShopID:    shopID,
		UserName:  userName,
		CreatedAt: time.Now(),
	}
	if err := db.Where("user_id = ? AND shop_id = ?", userID, shopID).FirstOrCreate(&follower).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Count real followers
	var count int64
	db.Model(&models.ShopFollower{}).Where("shop_id = ?", shopID).Count(&count)

	// Keep denormalized count synced in shops table
	db.Model(&models.Shop{}).Where("id = ?", shopID).Update("followers_count", count)

	return c.JSON(fiber.Map{
		"success":         true,
		"is_following":    true,
		"followers_count": count,
		"message":         "Successfully followed boutique",
	})
}

// UnfollowShop removes the authenticated user from the boutique's follower list
func (sc *SocialController) UnfollowShop(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		userID = c.Query("user_id")
	}
	if userID == "" {
		var req struct {
			UserID string `json:"user_id"`
		}
		_ = c.BodyParser(&req)
		userID = req.UserID
	}
	userID = resolveCanonicalUserID(userID)

	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Authentication required to unfollow boutique",
		})
	}

	shopID := c.Params("id")
	if shopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop ID is required",
		})
	}

	db.Where("user_id = ? AND shop_id = ?", userID, shopID).Delete(&models.ShopFollower{})

	var count int64
	db.Model(&models.ShopFollower{}).Where("shop_id = ?", shopID).Count(&count)

	// Update denormalized count
	db.Model(&models.Shop{}).Where("id = ?", shopID).Update("followers_count", count)

	return c.JSON(fiber.Map{
		"success":         true,
		"is_following":    false,
		"followers_count": count,
		"message":         "Successfully unfollowed boutique",
	})
}

// GetShopFollowStatus returns whether the caller follows the shop, total count, and existing user rating
func (sc *SocialController) GetShopFollowStatus(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	shopID := c.Params("id")
	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		userID = c.Query("user_id")
	}
	userID = resolveCanonicalUserID(userID)

	var isFollowing bool
	var userRating int
	if userID != "" {
		var count int64
		db.Model(&models.ShopFollower{}).Where("user_id = ? AND shop_id = ?", userID, shopID).Count(&count)
		isFollowing = count > 0

		var existingReview models.ShopReview
		if err := db.Where("user_id = ? AND shop_id = ?", userID, shopID).First(&existingReview).Error; err == nil {
			userRating = existingReview.Rating
		}
	}

	var totalFollowers int64
	db.Model(&models.ShopFollower{}).Where("shop_id = ?", shopID).Count(&totalFollowers)

	return c.JSON(fiber.Map{
		"success":         true,
		"is_following":    isFollowing,
		"followers_count": totalFollowers,
		"user_rating":     userRating,
	})
}

// CreateShopReview creates or updates a verified review and recalculates boutique average rating
func (sc *SocialController) CreateShopReview(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		userID = c.Query("user_id")
	}
	if userID == "" {
		var reqUser struct {
			UserID string `json:"user_id"`
		}
		_ = c.BodyParser(&reqUser)
		userID = reqUser.UserID
	}
	userID = resolveCanonicalUserID(userID)

	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Authentication required to submit review",
		})
	}

	shopID := c.Params("id")
	if shopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop ID is required",
		})
	}

	type ReviewReq struct {
		OrderID *string `json:"order_id"`
		Rating  int     `json:"rating"`
		Review  string  `json:"review"`
	}

	var req ReviewReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Rating < 1 || req.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Rating must be between 1 and 5 stars",
		})
	}

	var review models.ShopReview
	isUpdate := false
	if err := db.Where("user_id = ? AND shop_id = ?", userID, shopID).First(&review).Error; err == nil {
		// Existing rating found -> Update rating and review text (idempotent, no duplicate counting!)
		review.Rating = req.Rating
		review.Review = req.Review
		if req.OrderID != nil {
			review.OrderID = req.OrderID
		}
		review.UpdatedAt = time.Now()
		if err := db.Save(&review).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update review: " + err.Error(),
			})
		}
		isUpdate = true
	} else {
		// New review record
		revID := fmt.Sprintf("rev_%d", time.Now().UnixNano()/1e6)
		review = models.ShopReview{
			ID:        revID,
			ShopID:    shopID,
			UserID:    userID,
			OrderID:   req.OrderID,
			Rating:    req.Rating,
			Review:    req.Review,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := db.Create(&review).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to save review: " + err.Error(),
			})
		}
	}

	// Dynamically recompute shop rating & review count
	type RatingStats struct {
		AvgRating float64
		Total     int
	}
	var stats RatingStats
	db.Raw(`
		SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total 
		FROM shop_reviews 
		WHERE shop_id = ?
	`, shopID).Scan(&stats)

	roundedRating := math.Round(stats.AvgRating*100) / 100
	db.Model(&models.Shop{}).Where("id = ?", shopID).Updates(map[string]interface{}{
		"rating":       roundedRating,
		"review_count": stats.Total,
	})

	return c.JSON(fiber.Map{
		"success":      true,
		"is_update":    isUpdate,
		"review":       review,
		"shop_rating":  roundedRating,
		"review_count": stats.Total,
		"user_rating":  review.Rating,
		"message":      "Review published successfully",
	})
}

// GetShopReviews returns all customer reviews for a boutique
func (sc *SocialController) GetShopReviews(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	shopID := c.Params("id")
	var reviews []models.ShopReview
	db.Preload("User").Where("shop_id = ?", shopID).Order("created_at DESC").Find(&reviews)

	// Summary stats
	type RatingStats struct {
		AvgRating float64
		Total     int
	}
	var stats RatingStats
	db.Raw(`
		SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total 
		FROM shop_reviews 
		WHERE shop_id = ?
	`, shopID).Scan(&stats)

	return c.JSON(fiber.Map{
		"success":      true,
		"shop_id":      shopID,
		"average_rating": math.Round(stats.AvgRating*100) / 100,
		"review_count": stats.Total,
		"reviews":      reviews,
	})
}
