package controllers

import (
	"mitreno-backend/config"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProductController struct{}

func NewProductController() *ProductController {
	return &ProductController{}
}

// ListProducts returns products with flexible filtering and count metrics
func (pc *ProductController) ListProducts(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var products []models.Product
	query := db.Model(&models.Product{})

	// Handle shop_id vs user_id resolution
	shopID := c.Query("shop_id")
	userID := c.Query("user_id")

	if shopID == "" {
		if s, ok := c.Locals("shopID").(string); ok && s != "" {
			shopID = s
		}
	}
	if userID == "" {
		if u, ok := c.Locals("userID").(string); ok && u != "" {
			userID = u
		}
	}

	if shopID == "" && userID != "" {
		var shop models.Shop
		if err := db.Where("owner_id = ?", userID).First(&shop).Error; err == nil {
			shopID = shop.ID
		}
	}

	if shopID != "" {
		query = query.Where("shop_id = ?", shopID)
	}

	// Status filter: active, out_of_stock, or all
	status := c.Query("status")
	if status == "active" {
		query = query.Where("is_active = ?", true)
	} else if status == "out_of_stock" {
		query = query.Where("is_active = ?", false)
	}
	// NOTE: For public storefront (no shopID, no status filter), we return ALL products
	// including out-of-stock ones. The frontend marks them with isOutOfStock=true
	// and shows an "Out of Stock" badge — they remain visible but cannot be ordered.

	if category := c.Query("category"); category != "" && category != "all" {
		query = query.Where("category ILIKE ?", "%"+category+"%")
	}

	if search := c.Query("q"); search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ? OR fabric ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Preload Shop and Variants for rich response
	if err := query.Preload("Shop").Preload("Variants").Order("created_at desc").Find(&products).Error; err != nil {
		// Fallback query if preloading fails
		var fallbackProducts []models.Product
		qFallback := db.Order("created_at desc")
		if shopID != "" {
			qFallback = qFallback.Where("shop_id = ?", shopID)
		}
		if err2 := qFallback.Find(&fallbackProducts).Error; err2 != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to retrieve products: " + err.Error(),
			})
		}
		products = fallbackProducts
	}

	// Compute total, active, out_of_stock metrics
	var totalCount int64 = 0
	var activeCount int64 = 0
	var outCount int64 = 0

	countQuery := db.Model(&models.Product{})
	if shopID != "" {
		countQuery = countQuery.Where("shop_id = ?", shopID)
	}
	countQuery.Count(&totalCount)
	db.Model(&models.Product{}).Where("shop_id = ? AND is_active = ?", shopID, true).Count(&activeCount)
	db.Model(&models.Product{}).Where("shop_id = ? AND is_active = ?", shopID, false).Count(&outCount)

	return c.JSON(fiber.Map{
		"success":  true,
		"count":    len(products),
		"products": products,
		"counts": fiber.Map{
			"total":              totalCount,
			"active_count":       activeCount,
			"out_of_stock_count": outCount,
		},
	})
}

// GetProductByID returns single product with full specs
func (pc *ProductController) GetProductByID(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Product ID is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var product models.Product
	if err := db.Preload("Shop").Preload("Variants").Where("id = ?", productID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Product not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"product": product,
	})
}

// CreateProduct creates a new designer apparel entry
func (pc *ProductController) CreateProduct(c *fiber.Ctx) error {
	type CreateVariantReq struct {
		Size  string `json:"size"`
		Color string `json:"color"`
		Stock int    `json:"stock"`
	}

	type CreateProductReq struct {
		ShopID        string             `json:"shop_id"`
		Name          string             `json:"name"`
		Description   string             `json:"description"`
		Category      string             `json:"category"`
		BasePrice     int                `json:"base_price"`
		OriginalPrice int                `json:"original_price"`
		Thumbnail     string             `json:"thumbnail"`
		GalleryImages []string           `json:"gallery_images"`
		Fabric        string             `json:"fabric"`
		GSM           int                `json:"gsm"`
		Fit           string             `json:"fit"`
		IsActive      *bool              `json:"is_active"`
		Variants      []CreateVariantReq `json:"variants"`
	}

	var req CreateProductReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Name == "" || req.BasePrice <= 0 || req.Thumbnail == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Name, BasePrice, and Thumbnail are required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// Resolve shop_id and user_id
	userID := ""
	if u, ok := c.Locals("userID").(string); ok && u != "" {
		userID = u
	} else if headerUid := c.Get("X-User-ID"); headerUid != "" {
		userID = headerUid
	}

	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "User authentication required to create products",
		})
	}

	targetShopID := req.ShopID
	if targetShopID == "" {
		if s, ok := c.Locals("shopID").(string); ok && s != "" {
			targetShopID = s
		}
	}
	if targetShopID == "" {
		var shop models.Shop
		if err := db.Where("owner_id = ?", userID).First(&shop).Error; err == nil {
			targetShopID = shop.ID
		}
	}
	if targetShopID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Shop not found for seller",
		})
	}

	// Ensure target shop exists in database to avoid foreign key violations
	var shopCount int64
	db.Model(&models.Shop{}).Where("id = ?", targetShopID).Count(&shopCount)
	if shopCount == 0 {
		db.Create(&models.Shop{
			ID:         targetShopID,
			OwnerID:    userID,
			Name:       "Mitreno Boutique",
			Bio:        "Premium designer apparel.",
			IsVerified: true,
			Status:     "active",
		})
	}

	discountPercent := 0
	if req.OriginalPrice > req.BasePrice {
		discountPercent = int(((float64(req.OriginalPrice) - float64(req.BasePrice)) / float64(req.OriginalPrice)) * 100)
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	productID := "prod_" + uuid.New().String()[:8]
	product := models.Product{
		ID:              productID,
		ShopID:          targetShopID,
		Name:            req.Name,
		Description:     req.Description,
		Category:        req.Category,
		BasePrice:       req.BasePrice,
		OriginalPrice:   req.OriginalPrice,
		DiscountPercent: discountPercent,
		Thumbnail:       req.Thumbnail,
		GalleryImages:   req.GalleryImages,
		Fabric:          req.Fabric,
		GSM:             req.GSM,
		Fit:             req.Fit,
		IsActive:        isActive,
	}

	if err := db.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create product: " + err.Error(),
		})
	}

	// Insert variants
	if len(req.Variants) > 0 {
		var variants []models.ProductVariant
		for _, v := range req.Variants {
			variants = append(variants, models.ProductVariant{
				ID:        "var_" + uuid.New().String()[:8],
				ProductID: productID,
				Size:      v.Size,
				Color:     v.Color,
				Stock:     v.Stock,
			})
		}
		_ = db.Create(&variants)
		product.Variants = variants
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Product created successfully",
		"product": product,
	})
}

// UpdateProduct updates an existing product
func (pc *ProductController) UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Product ID required"})
	}

	type UpdateVariantReq struct {
		Size  string `json:"size"`
		Color string `json:"color"`
		Stock int    `json:"stock"`
	}

	type UpdateProductReq struct {
		Name          string             `json:"name"`
		Description   string             `json:"description"`
		Category      string             `json:"category"`
		BasePrice     int                `json:"base_price"`
		OriginalPrice int                `json:"original_price"`
		Thumbnail     string             `json:"thumbnail"`
		GalleryImages []string           `json:"gallery_images"`
		Fabric        string             `json:"fabric"`
		GSM           int                `json:"gsm"`
		Fit           string             `json:"fit"`
		IsActive      *bool              `json:"is_active"`
		Variants      []UpdateVariantReq `json:"variants"`
	}

	var req UpdateProductReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid request body"})
	}

	db := config.DB
	var product models.Product
	if err := db.Where("id = ?", productID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": "Product not found"})
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Category != "" {
		product.Category = req.Category
	}
	if req.BasePrice > 0 {
		product.BasePrice = req.BasePrice
	}
	if req.OriginalPrice > 0 {
		product.OriginalPrice = req.OriginalPrice
	}
	if req.Thumbnail != "" {
		product.Thumbnail = req.Thumbnail
	}
	if req.GalleryImages != nil {
		product.GalleryImages = req.GalleryImages
	}
	if req.Fabric != "" {
		product.Fabric = req.Fabric
	}
	if req.GSM > 0 {
		product.GSM = req.GSM
	}
	if req.Fit != "" {
		product.Fit = req.Fit
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	if product.OriginalPrice > product.BasePrice {
		product.DiscountPercent = int(((float64(product.OriginalPrice) - float64(product.BasePrice)) / float64(product.OriginalPrice)) * 100)
	}

	if err := db.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to update product"})
	}

	// Update variants if provided
	if len(req.Variants) > 0 {
		db.Where("product_id = ?", productID).Delete(&models.ProductVariant{})
		var variants []models.ProductVariant
		for _, v := range req.Variants {
			variants = append(variants, models.ProductVariant{
				ID:        "var_" + uuid.New().String()[:8],
				ProductID: productID,
				Size:      v.Size,
				Color:     v.Color,
				Stock:     v.Stock,
			})
		}
		_ = db.Create(&variants)
		product.Variants = variants
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product updated successfully",
		"product": product,
	})
}

// ToggleStock switches the is_active status of a product
func (pc *ProductController) ToggleStock(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Product ID required"})
	}
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "error": "Database not available"})
	}

	var product models.Product
	if err := db.Where("id = ?", productID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": "Product not found"})
	}

	product.IsActive = !product.IsActive
	if err := db.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to update stock"})
	}

	msg := "In Stock"
	if !product.IsActive {
		msg = "Out of Stock"
	}
	return c.JSON(fiber.Map{
		"success":   true,
		"message":   "Product marked as " + msg,
		"is_active": product.IsActive,
	})
}

// DeleteProduct deletes a product
func (pc *ProductController) DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Product ID required"})
	}
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "error": "Database not available"})
	}

	if err := db.Where("id = ?", productID).Delete(&models.Product{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to delete product"})
	}

	// Also delete variants
	db.Where("product_id = ?", productID).Delete(&models.ProductVariant{})
	return c.JSON(fiber.Map{"success": true, "message": "Product deleted successfully"})
}
