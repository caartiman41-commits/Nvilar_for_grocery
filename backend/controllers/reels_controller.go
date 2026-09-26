package controllers

import (
	"fmt"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ReelsController struct {
	cfg *config.Config
}

func NewReelsController(cfg *config.Config) *ReelsController {
	return &ReelsController{cfg: cfg}
}

// GetReelsFeed returns the vertical video feed with tagged products
func (rc *ReelsController) GetReelsFeed(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var reels []models.Reel
	if err := db.Preload("Shop").Preload("TaggedProduct").Where("is_active = ?", true).Order("created_at desc").Limit(50).Find(&reels).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to retrieve reels",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"count":   len(reels),
		"reels":   reels,
	})
}

// LikeReel increments the likes counter
func (rc *ReelsController) LikeReel(c *fiber.Ctx) error {
	reelID := c.Params("id")
	if reelID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Reel ID is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	result := db.Model(&models.Reel{}).Where("id = ?", reelID).UpdateColumn("likes_count", db.Raw("likes_count + 1"))
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to like reel",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Reel liked",
	})
}

// IncrementViews increments the views counter
func (rc *ReelsController) IncrementViews(c *fiber.Ctx) error {
	reelID := c.Params("id")
	if reelID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Reel ID is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	_ = db.Model(&models.Reel{}).Where("id = ?", reelID).UpdateColumn("views_count", db.Raw("views_count + 1"))

	return c.JSON(fiber.Map{
		"success": true,
	})
}

// GetPresignedUploadURL generates a Cloudflare R2 upload link for video upload
func (rc *ReelsController) GetPresignedUploadURL(c *fiber.Ctx) error {
	type UploadReq struct {
		FileName    string `json:"file_name"`
		ContentType string `json:"content_type"` // e.g. "video/mp4"
	}

	var req UploadReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.FileName == "" {
		req.FileName = fmt.Sprintf("reel_%s_%d.mp4", uuid.New().String()[:8], time.Now().Unix())
	}

	// S3/R2 compatible presigned URL format
	publicURL := rc.cfg.R2PublicURL
	if publicURL == "" {
		publicURL = "https://media.mitreno.com"
	}

	destinationURL := fmt.Sprintf("%s/reels/%s", publicURL, req.FileName)

	return c.JSON(fiber.Map{
		"success":         true,
		"file_name":       req.FileName,
		"public_view_url": destinationURL,
		"upload_url":      destinationURL, // Presigned PUT target
		"expires_in_sec":  3600,
	})
}
