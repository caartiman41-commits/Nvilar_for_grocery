package controllers

import (
	"fmt"
	"log"
	"strings"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
)

type GeographyController struct{}

func NewGeographyController() *GeographyController {
	return &GeographyController{}
}

// =============================================
// ADMIN ENDPOINTS (Protected by AdminAuthMiddleware)
// =============================================

// ListStates returns all states with aggregated city and shop counts
func (gc *GeographyController) ListStates(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var states []models.State
	if err := db.Order("sort_order ASC, name ASC").Find(&states).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch states",
		})
	}

	// Build enriched response with city counts and shop counts
	type StateResponse struct {
		models.State
		CityCount int   `json:"city_count"`
		ShopCount int   `json:"shop_count"`
		Revenue   int64 `json:"total_revenue"`
	}

	var result []StateResponse
	for _, state := range states {
		var cityCount int64
		var shopCount int64
		db.Model(&models.City{}).Where("state_id = ?", state.ID).Count(&cityCount)
		db.Model(&models.Shop{}).Where("state_id = ?", state.ID).Count(&shopCount)

		// Revenue for shops in this state
		type RevResult struct{ Total int64 }
		var rev RevResult
		db.Model(&models.Order{}).
			Joins("JOIN order_items ON order_items.order_id = orders.id").
			Joins("JOIN products ON products.id = order_items.product_id").
			Joins("JOIN shops ON shops.id = products.shop_id").
			Where("shops.state_id = ? AND orders.payment_status = 'PAID' AND orders.order_status != 'CANCELLED'", state.ID).
			Select("COALESCE(SUM(orders.total_paid), 0) as total").
			Scan(&rev)

		result = append(result, StateResponse{
			State:     state,
			CityCount: int(cityCount),
			ShopCount: int(shopCount),
			Revenue:   rev.Total,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"states":  result,
		"total":   len(result),
	})
}

// CreateState registers a new state
func (gc *GeographyController) CreateState(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	type CreateStateRequest struct {
		Name string `json:"name"`
		Code string `json:"code"`
	}

	var req CreateStateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Name == "" || req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "State name and code are required",
		})
	}

	stateID := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "_"))
	state := models.State{
		ID:       stateID,
		Name:     strings.TrimSpace(req.Name),
		Code:     strings.ToUpper(strings.TrimSpace(req.Code)),
		IsActive: true,
	}

	if err := db.Create(&state).Error; err != nil {
		log.Printf("Failed to create state: %v", err)
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "State already exists or creation failed",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"state":   state,
		"message": fmt.Sprintf("State '%s' (%s) registered successfully", state.Name, state.Code),
	})
}

// ListCitiesByState returns all cities in a given state with shop data
func (gc *GeographyController) ListCitiesByState(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	stateID := c.Params("id")
	if stateID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "State ID is required",
		})
	}

	// Verify state exists
	var state models.State
	if err := db.Where("id = ?", stateID).First(&state).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "State not found",
		})
	}

	var cities []models.City
	db.Where("state_id = ?", stateID).Order("sort_order ASC, name ASC").Find(&cities)

	// Enrich with live shop counts
	type CityResponse struct {
		models.City
		LiveShopCount  int   `json:"live_shop_count"`
		TotalRevenue   int64 `json:"total_revenue"`
		TotalOrders    int64 `json:"total_orders"`
		ActiveShops    int64 `json:"active_shops"`
		SuspendedShops int64 `json:"suspended_shops"`
	}

	var result []CityResponse
	for _, city := range cities {
		var liveCount, activeCount, suspendedCount int64
		db.Model(&models.Shop{}).Where("city_id = ?", city.ID).Count(&liveCount)
		db.Model(&models.Shop{}).Where("city_id = ? AND status = 'active'", city.ID).Count(&activeCount)
		db.Model(&models.Shop{}).Where("city_id = ? AND status = 'suspended'", city.ID).Count(&suspendedCount)

		result = append(result, CityResponse{
			City:           city,
			LiveShopCount:  int(liveCount),
			ActiveShops:    activeCount,
			SuspendedShops: suspendedCount,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"state":   state,
		"cities":  result,
		"total":   len(result),
	})
}

// CreateCity registers a new city under a state
func (gc *GeographyController) CreateCity(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	type CreateCityRequest struct {
		StateID       string `json:"state_id"`
		Name          string `json:"name"`
		PincodePrefix string `json:"pincode_prefix"`
		IsFeatured    bool   `json:"is_featured"`
	}

	var req CreateCityRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.StateID == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "State ID and city name are required",
		})
	}

	// Verify state exists
	var state models.State
	if err := db.Where("id = ?", req.StateID).First(&state).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Parent state not found",
		})
	}

	cityID := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "_"))

	var pincodePtr *string
	if req.PincodePrefix != "" {
		pincodePtr = &req.PincodePrefix
	}

	city := models.City{
		ID:            cityID,
		StateID:       req.StateID,
		Name:          strings.TrimSpace(req.Name),
		PincodePrefix: pincodePtr,
		IsActive:      true,
		IsFeatured:    req.IsFeatured,
	}

	if err := db.Create(&city).Error; err != nil {
		log.Printf("Failed to create city: %v", err)
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "City already exists or creation failed",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"city":    city,
		"message": fmt.Sprintf("City '%s' registered under %s", city.Name, state.Name),
	})
}

// GetCityDetail returns full city detail with all shops and their metrics
func (gc *GeographyController) GetCityDetail(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	cityID := c.Params("id")
	if cityID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "City ID is required",
		})
	}

	var city models.City
	if err := db.Preload("State").Where("id = ?", cityID).First(&city).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "City not found",
		})
	}

	// Fetch shops in this city with owner info
	var shops []models.Shop
	db.Preload("Owner").Where("city_id = ?", cityID).Order("created_at DESC").Find(&shops)

	// Build enriched shop data with revenue/order metrics
	type ShopDetail struct {
		models.Shop
		TotalRevenue    int64 `json:"total_revenue"`
		TotalOrders     int64 `json:"total_orders"`
		CancelledOrders int64 `json:"cancelled_orders"`
		ProductCount    int64 `json:"product_count"`
	}

	var shopDetails []ShopDetail
	for _, shop := range shops {
		var orderCount, cancelledCount, productCount int64
		db.Model(&models.OrderItem{}).
			Joins("JOIN products ON products.id = order_items.product_id").
			Where("products.shop_id = ?", shop.ID).
			Count(&orderCount)
		db.Model(&models.OrderItem{}).
			Joins("JOIN products ON products.id = order_items.product_id").
			Where("products.shop_id = ? AND order_items.is_cancelled = true", shop.ID).
			Count(&cancelledCount)
		db.Model(&models.Product{}).Where("shop_id = ?", shop.ID).Count(&productCount)

		shopDetails = append(shopDetails, ShopDetail{
			Shop:            shop,
			TotalOrders:     orderCount,
			CancelledOrders: cancelledCount,
			ProductCount:    productCount,
		})
	}

	// Aggregate metrics
	var totalShops int64
	var activeShops int64
	var suspendedShops int64
	db.Model(&models.Shop{}).Where("city_id = ?", cityID).Count(&totalShops)
	db.Model(&models.Shop{}).Where("city_id = ? AND status = 'active'", cityID).Count(&activeShops)
	db.Model(&models.Shop{}).Where("city_id = ? AND status = 'suspended'", cityID).Count(&suspendedShops)

	return c.JSON(fiber.Map{
		"success": true,
		"city":    city,
		"shops":   shopDetails,
		"metrics": fiber.Map{
			"total_shops":     totalShops,
			"active_shops":    activeShops,
			"suspended_shops": suspendedShops,
		},
	})
}

// UpdateCity updates city properties (featured, active, etc.)
func (gc *GeographyController) UpdateCity(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	cityID := c.Params("id")

	var city models.City
	if err := db.Where("id = ?", cityID).First(&city).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "City not found",
		})
	}

	type UpdateCityRequest struct {
		IsFeatured *bool   `json:"is_featured"`
		IsActive   *bool   `json:"is_active"`
		Name       *string `json:"name"`
	}

	var req UpdateCityRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.IsFeatured != nil {
		city.IsFeatured = *req.IsFeatured
	}
	if req.IsActive != nil {
		city.IsActive = *req.IsActive
	}
	if req.Name != nil && *req.Name != "" {
		city.Name = *req.Name
	}

	db.Save(&city)

	return c.JSON(fiber.Map{
		"success": true,
		"city":    city,
		"message": "City updated successfully",
	})
}

// SuspendShopInCity suspends a shop within a city (admin action)
func (gc *GeographyController) SuspendShopInCity(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	shopID := c.Params("shopId")

	type SuspendRequest struct {
		Reason string `json:"reason"`
	}

	var req SuspendRequest
	if err := c.BodyParser(&req); err != nil || req.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Suspension reason is required",
		})
	}

	var shop models.Shop
	if err := db.Where("id = ?", shopID).First(&shop).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Shop not found",
		})
	}

	now := time.Now()
	shop.Status = "suspended"
	shop.StatusReason = &req.Reason
	shop.SuspendedAt = &now
	db.Save(&shop)

	return c.JSON(fiber.Map{
		"success": true,
		"shop":    shop,
		"message": fmt.Sprintf("Shop '%s' suspended: %s", shop.Name, req.Reason),
	})
}

// ActivateShopInCity reactivates a suspended shop
func (gc *GeographyController) ActivateShopInCity(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	shopID := c.Params("shopId")

	var shop models.Shop
	if err := db.Where("id = ?", shopID).First(&shop).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Shop not found",
		})
	}

	shop.Status = "active"
	shop.StatusReason = nil
	shop.SuspendedAt = nil
	db.Save(&shop)

	return c.JSON(fiber.Map{
		"success": true,
		"shop":    shop,
		"message": fmt.Sprintf("Shop '%s' reactivated", shop.Name),
	})
}

// =============================================
// PUBLIC EXPLORE ENDPOINTS (No auth required)
// =============================================

// ExploreStates returns states with their active cities for customer app
func (gc *GeographyController) ExploreStates(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var states []models.State
	db.Where("is_active = true").Order("sort_order ASC, name ASC").Find(&states)

	type ExploreCityItem struct {
		ID         string `json:"id"`
		Name       string `json:"name"`
		ShopCount  int64  `json:"shop_count"`
		IsFeatured bool   `json:"is_featured"`
	}

	type ExploreStateItem struct {
		ID        string            `json:"id"`
		Name      string            `json:"name"`
		Code      string            `json:"code"`
		CityCount int               `json:"city_count"`
		ShopCount int64             `json:"shop_count"`
		Cities    []ExploreCityItem `json:"cities"`
	}

	var result []ExploreStateItem
	for _, state := range states {
		var cities []models.City
		db.Where("state_id = ? AND is_active = true", state.ID).Order("sort_order ASC").Find(&cities)

		var stateCities []ExploreCityItem
		var stateShopCount int64

		for _, city := range cities {
			var shopCount int64
			db.Model(&models.Shop{}).Where("city_id = ? AND status = 'active'", city.ID).Count(&shopCount)

			stateCities = append(stateCities, ExploreCityItem{
				ID:         city.ID,
				Name:       city.Name,
				ShopCount:  shopCount,
				IsFeatured: city.IsFeatured,
			})
			stateShopCount += shopCount
		}

		// Only include states that have at least one city
		if len(stateCities) > 0 {
			result = append(result, ExploreStateItem{
				ID:        state.ID,
				Name:      state.Name,
				Code:      state.Code,
				CityCount: len(stateCities),
				ShopCount: stateShopCount,
				Cities:    stateCities,
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"states":  result,
	})
}

// ExploreCityDetail returns city's shops and products for customer browsing
func (gc *GeographyController) ExploreCityDetail(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	cityID := c.Params("id")

	var city models.City
	if err := db.Preload("State").Where("id = ? AND is_active = true", cityID).First(&city).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "City not found",
		})
	}

	// Active shops in this city
	var shops []models.Shop
	db.Where("city_id = ? AND status = 'active'", cityID).
		Order("rating DESC, review_count DESC").
		Find(&shops)

	type ShopCard struct {
		ID         string   `json:"id"`
		Name       string   `json:"name"`
		LogoURL    *string  `json:"logo_url"`
		Rating     float64  `json:"rating"`
		IsVerified bool     `json:"is_verified"`
		Latitude   *float64 `json:"latitude,omitempty"`
		Longitude  *float64 `json:"longitude,omitempty"`
	}

	var shopCards []ShopCard
	for _, s := range shops {
		shopCards = append(shopCards, ShopCard{
			ID:         s.ID,
			Name:       s.Name,
			LogoURL:    s.LogoURL,
			Rating:     s.Rating,
			IsVerified: s.IsVerified,
			Latitude:   s.Latitude,
			Longitude:  s.Longitude,
		})
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"city":       city,
		"shops":      shopCards,
		"shop_count": len(shopCards),
	})
}
