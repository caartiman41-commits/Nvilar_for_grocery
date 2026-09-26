package controllers

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"mitreno-backend/config"
	"mitreno-backend/middleware"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
)

type AddressController struct{}

func NewAddressController() *AddressController {
	return &AddressController{}
}

// ListUserAddresses fetches all saved addresses for a user or phone number
func (ac *AddressController) ListUserAddresses(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database unavailable",
		})
	}

	phone := strings.TrimSpace(c.Query("phone"))
	userID := strings.TrimSpace(c.Get("X-User-ID"))
	if rawUID, ok := c.Locals("userID").(string); ok && rawUID != "" {
		userID = rawUID
	}

	normPhone := middleware.NormalizePhone(phone)

	var addresses []models.UserAddress
	query := db.Model(&models.UserAddress{})

	if normPhone != "" && userID != "" {
		query = query.Where("phone = ? OR phone = ? OR user_id = ?", normPhone, phone, userID)
	} else if normPhone != "" {
		query = query.Where("phone = ? OR phone = ?", normPhone, phone)
	} else if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Order("is_default DESC, updated_at DESC").Find(&addresses).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Smart Flipkart Fallback 1: If no address found in user_addresses, check past orders for this user/phone!
	if len(addresses) == 0 && (normPhone != "" || userID != "") {
		var pastOrders []models.Order
		orderQuery := db.Model(&models.Order{})
		if userID != "" {
			orderQuery = orderQuery.Where("buyer_id = ?", userID)
		}
		if err := orderQuery.Order("created_at DESC").Limit(5).Find(&pastOrders).Error; err == nil {
			for _, ord := range pastOrders {
				if len(ord.ShippingAddress) > 0 {
					name, _ := ord.ShippingAddress["name"].(string)
					ordPhone, _ := ord.ShippingAddress["phone"].(string)
					street, _ := ord.ShippingAddress["street"].(string)
					city, _ := ord.ShippingAddress["city"].(string)
					state, _ := ord.ShippingAddress["state"].(string)
					pin, _ := ord.ShippingAddress["pincode"].(string)
					altPhone, _ := ord.ShippingAddress["alternate_phone"].(string)

					if name != "" && street != "" {
						recovered := models.UserAddress{
							ID:             fmt.Sprintf("addr_%d", time.Now().UnixNano()+int64(rand.Intn(1000))),
							UserID:         ord.BuyerID,
							Phone:          ordPhone,
							RecipientName:  name,
							HouseNoStreet:  street,
							NearbyArea:     street,
							CityVillage:    city,
							State:          state,
							Pincode:        pin,
							AlternatePhone: altPhone,
							AddressType:    "HOME",
							Distance:       "0m",
							IsDefault:      len(addresses) == 0,
							CreatedAt:      time.Now(),
							UpdatedAt:      time.Now(),
						}
						_ = db.Create(&recovered)
						addresses = append(addresses, recovered)
					}
				}
			}
		}
	}

	// Smart Flipkart Fallback 2: Default Ashraf address if requested for Ashraf's phone number
	if len(addresses) == 0 && (strings.Contains(normPhone, "9864975438") || strings.Contains(phone, "9864975438") || userID == "usr_ashraf_01" || phone == "") {
		ashrafDefault := models.UserAddress{
			ID:             "addr_ashraf_sixmile",
			UserID:         userID,
			Phone:          "9864975438",
			RecipientName:  "ASHAFUL ISLAM",
			HouseNoStreet:  "Six Mile",
			NearbyArea:     "Six Mile, 781005",
			CityVillage:    "Six Mile",
			State:          "Assam",
			Pincode:        "781005",
			AddressType:    "HOME",
			GpsLocation:    "26.134456, 91.813250",
			Distance:       "0m",
			IsDefault:      true,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}
		_ = db.Create(&ashrafDefault)
		addresses = append(addresses, ashrafDefault)
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"addresses": addresses,
	})
}

// CreateAddress saves a new delivery address
func (ac *AddressController) CreateAddress(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database unavailable",
		})
	}

	type AddressReq struct {
		ID             string `json:"id"`
		UserID         string `json:"user_id"`
		Phone          string `json:"phone"`
		RecipientName  string `json:"recipient_name"`
		HouseNoStreet  string `json:"house_no_street"`
		NearbyArea     string `json:"nearby_area"`
		CityVillage    string `json:"city_village"`
		State          string `json:"state"`
		Pincode        string `json:"pincode"`
		AlternatePhone string `json:"alternate_phone"`
		AddressType    string `json:"address_type"`
		GpsLocation    string `json:"gps_location"`
		Distance       string `json:"distance"`
		IsDefault      bool   `json:"is_default"`
	}

	var req AddressReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid address payload: " + err.Error(),
		})
	}

	userID := strings.TrimSpace(req.UserID)
	if userID == "" {
		userID = strings.TrimSpace(c.Get("X-User-ID"))
	}
	if rawUID, ok := c.Locals("userID").(string); ok && rawUID != "" {
		userID = rawUID
	}

	addrID := strings.TrimSpace(req.ID)
	if addrID == "" {
		addrID = fmt.Sprintf("addr_%d", time.Now().UnixNano())
	}

	phone := strings.TrimSpace(req.Phone)
	if phone == "" {
		phone = "9864975438"
	}

	addrType := strings.ToUpper(strings.TrimSpace(req.AddressType))
	if addrType == "" {
		addrType = "HOME"
	}

	dist := strings.TrimSpace(req.Distance)
	if dist == "" {
		dist = "0m"
	}

	if req.IsDefault {
		// Demote other addresses of this user/phone
		_ = db.Model(&models.UserAddress{}).Where("phone = ? OR user_id = ?", phone, userID).Update("is_default", false).Error
	}

	newAddr := models.UserAddress{
		ID:             addrID,
		UserID:         userID,
		Phone:          phone,
		RecipientName:  req.RecipientName,
		HouseNoStreet:  req.HouseNoStreet,
		NearbyArea:     req.NearbyArea,
		CityVillage:    req.CityVillage,
		State:          req.State,
		Pincode:        req.Pincode,
		AlternatePhone: req.AlternatePhone,
		AddressType:    addrType,
		GpsLocation:    req.GpsLocation,
		Distance:       dist,
		IsDefault:      req.IsDefault,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := db.Save(&newAddr).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to save address: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"address": newAddr,
	})
}

// UpdateAddress updates an existing delivery address
func (ac *AddressController) UpdateAddress(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database unavailable",
		})
	}

	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Address ID required",
		})
	}

	var existing models.UserAddress
	if err := db.Where("id = ?", id).First(&existing).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Address not found",
		})
	}

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid update body",
		})
	}

	updates["updated_at"] = time.Now()

	if isDef, ok := updates["is_default"].(bool); ok && isDef {
		_ = db.Model(&models.UserAddress{}).Where("phone = ? OR user_id = ?", existing.Phone, existing.UserID).Update("is_default", false).Error
	}

	if err := db.Model(&existing).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update address: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"address": existing,
	})
}

// DeleteAddress removes an address
func (ac *AddressController) DeleteAddress(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database unavailable",
		})
	}

	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Address ID required",
		})
	}

	if err := db.Where("id = ?", id).Delete(&models.UserAddress{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to delete address: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Address deleted successfully",
	})
}

// SetDefaultAddress marks an address as default
func (ac *AddressController) SetDefaultAddress(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database unavailable",
		})
	}

	id := c.Params("id")
	var addr models.UserAddress
	if err := db.Where("id = ?", id).First(&addr).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Address not found",
		})
	}

	// Demote all others
	_ = db.Model(&models.UserAddress{}).Where("phone = ? OR user_id = ?", addr.Phone, addr.UserID).Update("is_default", false).Error
	addr.IsDefault = true
	_ = db.Save(&addr)

	return c.JSON(fiber.Map{
		"success": true,
		"address": addr,
	})
}
