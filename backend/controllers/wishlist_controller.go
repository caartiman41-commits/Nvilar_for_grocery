package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"mitreno-backend/config"
	"mitreno-backend/models"
)

type WishlistController struct{}

func NewWishlistController() *WishlistController {
	return &WishlistController{}
}

// GetWishlist returns all saved garments for the authenticated user
func (wc *WishlistController) GetWishlist(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Authentication required to view wishlist",
		})
	}

	var items []models.UserWishlist
	db.Preload("Product").Preload("Product.Shop").Where("user_id = ?", userID).Order("created_at DESC").Find(&items)

	products := make([]models.Product, 0)
	for _, item := range items {
		if item.Product != nil && item.Product.ID != "" {
			products = append(products, *item.Product)
		}
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"count":    len(products),
		"products": products,
	})
}

// ToggleWishlist adds or removes a product from the user's wishlist in PostgreSQL
func (wc *WishlistController) ToggleWishlist(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Authentication required to update wishlist",
		})
	}

	productID := c.Params("product_id")
	if productID == "" {
		type Body struct {
			ProductID string `json:"product_id"`
		}
		var b Body
		if err := c.BodyParser(&b); err == nil {
			productID = b.ProductID
		}
	}

	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Product ID is required",
		})
	}

	var existing models.UserWishlist
	err := db.Where("user_id = ? AND product_id = ?", userID, productID).First(&existing).Error

	if err == nil {
		// Already in wishlist -> remove
		db.Where("user_id = ? AND product_id = ?", userID, productID).Delete(&models.UserWishlist{})
		return c.JSON(fiber.Map{
			"success":       true,
			"is_wishlisted": false,
			"message":       "Removed from wishlist",
		})
	}

	// Not in wishlist -> insert
	newItem := models.UserWishlist{
		UserID:    userID,
		ProductID: productID,
		CreatedAt: time.Now(),
	}
	db.Create(&newItem)

	return c.JSON(fiber.Map{
		"success":       true,
		"is_wishlisted": true,
		"message":       "Added to wishlist",
	})
}

// GetWishlistIds returns a list of product IDs wishlisted by the user
func (wc *WishlistController) GetWishlistIds(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	userID, _ := c.Locals("userID").(string)
	if userID == "" {
		return c.JSON(fiber.Map{
			"success":     true,
			"ids":         []string{},
			"product_ids": []string{},
		})
	}

	var ids []string
	db.Model(&models.UserWishlist{}).Where("user_id = ?", userID).Pluck("product_id", &ids)

	return c.JSON(fiber.Map{
		"success":     true,
		"ids":         ids,
		"product_ids": ids,
	})
}
