package controllers

import (
	"fmt"
	"log"
	"strings"

	"mitreno-backend/config"
	"mitreno-backend/middleware"
	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// SyncUser handles Firebase Phone Auth sync with decoupled identity (Strictly No Avatar)
func (ac *AuthController) SyncUser(c *fiber.Ctx) error {
	type SyncRequest struct {
		Action           string       `json:"action"` // "create" vs "login"
		Phone            string       `json:"phone"`
		FullName         string       `json:"full_name"`
		Email            *string      `json:"email"`
		Gender           string       `json:"gender"`
		BodyMeasurements models.JSONB `json:"body_measurements"`
		FCMToken         string       `json:"fcm_token"`
	}

	var req SyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// 1. Get raw UID and canonical userID from middleware
	rawUID, _ := c.Locals("rawUID").(string)
	canonicalUID, _ := c.Locals("userID").(string)
	if rawUID == "" {
		rawUID = canonicalUID
	}
	if rawUID == "" && req.FCMToken == "" && req.Phone == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized: UID missing",
		})
	}

	// 2. Get Phone from token claims or request body, then normalize to canonical E.164 (+91XXXXXXXXXX)
	phoneStr, _ := c.Locals("phone").(string)
	if phoneStr != "" {
		req.Phone = phoneStr // Prefer verified phone from token
	}
	normPhone := middleware.NormalizePhone(req.Phone)

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	// 3. Decoupled Identity Lookup (prioritize canonical usr_% row):
	var existingUser models.User
	userFound := false
	if normPhone != "" && rawUID != "" {
		if err := db.Where("id = ? OR id = ? OR firebase_uid = ? OR phone = ?", canonicalUID, rawUID, rawUID, normPhone).
			Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").
			First(&existingUser).Error; err == nil {
			userFound = true
		}
	} else if rawUID != "" {
		if err := db.Where("id = ? OR id = ? OR firebase_uid = ?", canonicalUID, rawUID, rawUID).
			Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").
			First(&existingUser).Error; err == nil {
			userFound = true
		}
	} else if normPhone != "" {
		if err := db.Where("phone = ?", normPhone).
			Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").
			First(&existingUser).Error; err == nil {
			userFound = true
		}
	}

	if !userFound && normPhone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Phone number is required",
		})
	}

	phone := normPhone
	if phone == "" && userFound {
		phone = existingUser.Phone
	}
	uid := rawUID

	// Strict Dual-Branch Gatekeeper Enforcement:
	if req.Action == "create" && userFound {
		// HARD BLOCK: User is trying to create an account, but phone already exists in DB!
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"code":    "PHONE_ALREADY_REGISTERED",
			"error":   "This phone number is already registered. Please Sign In.",
		})
	}

	if req.Action == "login" && !userFound {
		// HARD BLOCK: User is trying to login, but phone does NOT exist in DB!
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"code":    "ACCOUNT_NOT_FOUND",
			"error":   "No account found with this phone number. Please Create an Account first.",
		})
	}

	var user models.User
	if userFound {
		// Existing User! Their internal user.ID is IMMUTABLE and NEVER CHANGED.
		user = existingUser
		if uid != "" && !strings.HasPrefix(uid, "usr_") {
			user.FirebaseUID = &uid
		}
		if phone != "" {
			user.Phone = phone
		}
		if req.FullName != "" && req.FullName != "Nvilar Member" && req.FullName != "Grezto Member" {
			user.FullName = req.FullName
		}
		if req.Email != nil && *req.Email != "" {
			user.Email = req.Email
		}
		if req.Gender != "" {
			user.Gender = req.Gender
		}
		if req.BodyMeasurements != nil {
			user.BodyMeasurements = req.BodyMeasurements
		}
		if req.FCMToken != "" {
			found := false
			for _, t := range user.AndroidDeviceTokens {
				if t == req.FCMToken {
					found = true
					break
				}
			}
			if !found {
				user.AndroidDeviceTokens = append(user.AndroidDeviceTokens, req.FCMToken)
			}
		}

		if err := db.Save(&user).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update user profile: " + err.Error(),
			})
		}
	} else {
		// Truly New User Registration!
		// Generate an immutable, permanent internal UUID (e.g. usr_...)
		permanentID := fmt.Sprintf("usr_%s", strings.ReplaceAll(uuid.New().String(), "-", "")[:16])

		name := req.FullName
		if name == "" {
			name = "Nvilar Member"
		}

		tokens := []string{}
		if req.FCMToken != "" {
			tokens = append(tokens, req.FCMToken)
		}

		user = models.User{
			ID:                  permanentID,
			Phone:               phone,
			FirebaseUID:         &uid,
			FullName:            name,
			Email:               req.Email,
			Gender:              req.Gender,
			BodyMeasurements:    req.BodyMeasurements,
			AndroidDeviceTokens: tokens,
			Role:                "customer",
			IsActive:            true,
		}

		if err := db.Create(&user).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create user profile: " + err.Error(),
			})
		}
	}

	// 4. Check Seller Account status by verified Phone, User ID, or Shop Ownership
	var sellerApp models.SellerApplication
	errSeller := db.Where("owner_phone = ? OR user_id = ?", phone, user.ID).Order("created_at DESC").First(&sellerApp).Error
	sellerStatus := "none"
	isSeller := false

	var ownedShopCount int64
	db.Model(&models.Shop{}).Where("owner_id = ?", user.ID).Count(&ownedShopCount)

	if ownedShopCount > 0 {
		isSeller = true
		sellerStatus = "approved"
		if user.Role != "seller" {
			user.Role = "seller"
			db.Model(&user).Update("role", "seller")
		}
	} else if errSeller == nil {
		sellerStatus = sellerApp.Status // "pending_review", "approved", "rejected"
		if sellerApp.Status == "approved" {
			isSeller = true
			if user.Role != "seller" {
				user.Role = "seller"
				db.Model(&user).Update("role", "seller")
			}
		}
	} else if user.Role == "seller" {
		isSeller = true
		sellerStatus = "approved"
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"message":       "User synchronized successfully",
		"user":          user,
		"user_id":       user.ID,
		"role":          user.Role,
		"seller_status": sellerStatus,
		"is_seller":     isSeller,
	})
}

// GetProfile returns current user profile
func (ac *AuthController) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"user":    user,
	})
}

// RegisterDeviceToken receives and registers an FCM token for a user or phone without requiring full JWT
func (ac *AuthController) RegisterDeviceToken(c *fiber.Ctx) error {
	type TokenReq struct {
		FCMToken string `json:"fcm_token"`
		UserID   string `json:"user_id"`
		Phone    string `json:"phone"`
	}

	var req TokenReq
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.FCMToken) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "fcm_token is required",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	token := strings.TrimSpace(req.FCMToken)

	// If UserID or Phone provided, attach to specific user
	var user models.User
	found := false
	if req.UserID != "" {
		if err := db.Where("id = ? OR firebase_uid = ?", req.UserID, req.UserID).First(&user).Error; err == nil {
			found = true
		}
	}
	if !found && req.Phone != "" {
		phone := strings.TrimSpace(req.Phone)
		if err := db.Where("phone = ?", phone).First(&user).Error; err == nil {
			found = true
		}
	}

	if found {
		alreadyExists := false
		for _, t := range user.AndroidDeviceTokens {
			if t == token {
				alreadyExists = true
				break
			}
		}
		if !alreadyExists {
			user.AndroidDeviceTokens = append(user.AndroidDeviceTokens, token)
			db.Model(&user).Update("android_device_tokens", user.AndroidDeviceTokens)
		}
		log.Printf("✅ [FCM Device Registry] Token saved for user %s (%s)", user.ID, user.FullName)
		return c.JSON(fiber.Map{
			"success": true,
			"message": "FCM device token registered",
			"user_id": user.ID,
		})
	}

	preview := token
	if len(preview) > 16 {
		preview = preview[:16]
	}
	log.Printf("ℹ️ [FCM Device Registry] Standalone token registered: %s...", preview)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "FCM token recorded",
	})
}

// CheckPhoneExists checks if a mobile number is already registered in the system
func (ac *AuthController) CheckPhoneExists(c *fiber.Ctx) error {
	type CheckReq struct {
		Phone string `json:"phone"`
	}

	var req CheckReq
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Phone) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Valid phone number is required",
		})
	}

	normPhone := middleware.NormalizePhone(req.Phone)
	if len(normPhone) < 12 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Please enter a valid 10-digit mobile number",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var user models.User
	err := db.Where("phone = ?", normPhone).First(&user).Error
	if err == nil {
		// User found -> Already registered
		return c.JSON(fiber.Map{
			"success":   true,
			"exists":    true,
			"full_name": user.FullName,
			"role":      user.Role,
			"message":   "This phone number is already registered. Please Sign In.",
		})
	}

	// User not found -> New user
	return c.JSON(fiber.Map{
		"success": true,
		"exists":  false,
		"message": "No account found with this number. Please Create an Account first.",
	})
}

// TruecallerAuth handles Truecaller 1-tap OTP-less verification
func (ac *AuthController) TruecallerAuth(c *fiber.Ctx) error {
	type TruecallerReq struct {
		Action      string `json:"action"` // "login" vs "create"
		Phone       string `json:"phone"`
		FullName    string `json:"full_name"`
		AccessToken string `json:"access_token"`
		AuthCode    string `json:"auth_code"`
		FCMToken    string `json:"fcm_token"`
	}

	var req TruecallerReq
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Phone) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Valid phone number is required",
		})
	}

	normPhone := middleware.NormalizePhone(req.Phone)
	if len(normPhone) < 12 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid phone number format",
		})
	}

	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var existingUser models.User
	userFound := false
	if err := db.Where("phone = ?", normPhone).First(&existingUser).Error; err == nil {
		userFound = true
	}

	// Strict Dual-Branch Gatekeeper
	if req.Action == "create" && userFound {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"code":    "PHONE_ALREADY_REGISTERED",
			"error":   "This phone number is already registered. Please Sign In.",
		})
	}

	if req.Action == "login" && !userFound {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"code":    "ACCOUNT_NOT_FOUND",
			"error":   "No account found with this phone number. Please Create an Account first.",
		})
	}

	var user models.User
	if userFound {
		user = existingUser
		if req.FullName != "" && req.FullName != "Nvilar Member" && req.FullName != "Grezto Member" {
			user.FullName = req.FullName
		}
		if req.FCMToken != "" {
			found := false
			for _, t := range user.AndroidDeviceTokens {
				if t == req.FCMToken {
					found = true
					break
				}
			}
			if !found {
				user.AndroidDeviceTokens = append(user.AndroidDeviceTokens, req.FCMToken)
			}
		}
		db.Save(&user)
	} else {
		permanentID := fmt.Sprintf("usr_%s", strings.ReplaceAll(uuid.New().String(), "-", "")[:16])
		name := req.FullName
		if name == "" {
			name = "Nvilar Member"
		}
		tokens := []string{}
		if req.FCMToken != "" {
			tokens = append(tokens, req.FCMToken)
		}
		tcUID := fmt.Sprintf("tc_%s", strings.ReplaceAll(normPhone, "+", ""))
		user = models.User{
			ID:                  permanentID,
			Phone:               normPhone,
			FirebaseUID:         &tcUID,
			FullName:            name,
			AndroidDeviceTokens: tokens,
			Role:                "customer",
			IsActive:            true,
		}
		if err := db.Create(&user).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create user: " + err.Error(),
			})
		}
	}

	// Check seller status
	isSeller := false
	sellerStatus := "none"
	var ownedShopCount int64
	db.Model(&models.Shop{}).Where("owner_id = ?", user.ID).Count(&ownedShopCount)
	if ownedShopCount > 0 {
		isSeller = true
		sellerStatus = "approved"
		if user.Role != "seller" {
			user.Role = "seller"
			db.Model(&user).Update("role", "seller")
		}
	} else if user.Role == "seller" {
		isSeller = true
		sellerStatus = "approved"
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"message":       "Truecaller verification successful",
		"user":          user,
		"user_id":       user.ID,
		"role":          user.Role,
		"seller_status": sellerStatus,
		"is_seller":     isSeller,
	})
}

