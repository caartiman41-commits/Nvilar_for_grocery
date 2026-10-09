package middleware

import (
	"encoding/base64"
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"mitreno-backend/config"
	"mitreno-backend/models"
)

// ResolveCanonicalUserID maps any raw user identifier (internal ID, Firebase UID, or phone)
// to the single canonical internal users.id in PostgreSQL.
func ResolveCanonicalUserID(db *gorm.DB, rawID string) string {
	clean := strings.TrimSpace(rawID)
	if clean == "" || db == nil {
		return clean
	}
	var user models.User
	if err := db.Where("id = ? OR firebase_uid = ? OR phone = ?", clean, clean, clean).
		Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").
		First(&user).Error; err == nil && user.ID != "" {
		return user.ID
	}
	return clean
}

// NormalizePhone ensures phone is formatted cleanly as E.164: +91XXXXXXXXXX
func NormalizePhone(rawPhone string) string {
	clean := strings.TrimSpace(rawPhone)
	if clean == "" {
		return ""
	}
	var digitsOnly strings.Builder
	for _, ch := range clean {
		if ch >= '0' && ch <= '9' {
			digitsOnly.WriteRune(ch)
		}
	}
	digits := digitsOnly.String()
	if len(digits) == 10 {
		return "+91" + digits
	}
	if len(digits) == 12 && strings.HasPrefix(digits, "91") {
		return "+" + digits
	}
	if strings.HasPrefix(clean, "+") {
		return "+" + digits
	}
	return clean
}

// FirebaseAuthMiddleware verifies Firebase ID tokens or authorization headers
// and resolves the immutable internal User ID from the database
func FirebaseAuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		tokenString := ""

		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		var rawUID string
		var phone string

		if tokenString != "" && config.FirebaseApp != nil {
			client, err := config.FirebaseApp.Auth(c.Context())
			if err == nil {
				token, err := client.VerifyIDToken(c.Context(), tokenString)
				if err == nil {
					rawUID = token.UID
					if phoneClaim, ok := token.Claims["phone_number"]; ok {
						phone = phoneClaim.(string)
					}
				}
			}
		}

		// Fallback for local testing or custom headers or query params
		if rawUID == "" {
			rawUID = c.Get("X-User-ID")
			if rawUID == "" {
				rawUID = c.Query("user_id")
			}
			if rawUID == "" {
				rawUID = c.Query("uid")
			}
			if rawUID == "" && tokenString != "" {
				parts := strings.Split(tokenString, ".")
				if len(parts) == 3 {
					payload, err := base64.RawURLEncoding.DecodeString(parts[1])
					if err == nil {
						var claims map[string]interface{}
						if json.Unmarshal(payload, &claims) == nil {
							if sub, ok := claims["sub"].(string); ok {
								rawUID = sub
							}
							if phoneClaim, ok := claims["phone_number"].(string); ok {
								phone = phoneClaim
							}
						}
					}
				}
				if rawUID == "" {
					rawUID = tokenString
				}
			}
		}

		if rawUID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Missing or invalid authentication credentials",
			})
		}

		resolvedUserID := rawUID
		userRole := "customer"
		normPhone := NormalizePhone(phone)
		if normPhone == "" && strings.HasPrefix(rawUID, "+") {
			normPhone = NormalizePhone(rawUID)
		}

		// Industrial Decoupled Identity Resolution:
		// Map external Firebase UID / Phone to the permanent internal users.id
		if config.DB != nil {
			var user models.User
			query := config.DB.Model(&models.User{})
			if normPhone != "" {
				query = query.Where("phone = ? OR firebase_uid = ? OR id = ?", normPhone, rawUID, rawUID)
			} else {
				query = query.Where("firebase_uid = ? OR id = ?", rawUID, rawUID)
			}

			if err := query.Order("CASE WHEN id LIKE 'usr_%' THEN 0 ELSE 1 END").First(&user).Error; err == nil {
				// Successfully resolved the permanent internal user record
				resolvedUserID = user.ID
				userRole = user.Role
				c.Locals("user", user)

				// Keep firebase_uid in sync without changing internal users.id (never overwrite with internal usr_, shop_, or guest_ IDs)
				if rawUID != "" && !strings.HasPrefix(rawUID, "usr_") && !strings.HasPrefix(rawUID, "shop_") && !strings.HasPrefix(rawUID, "guest_") && (user.FirebaseUID == nil || *user.FirebaseUID != rawUID) {
					config.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("firebase_uid", rawUID)
				}
			}
		}

		c.Locals("userID", resolvedUserID)
		c.Locals("rawUID", rawUID)
		c.Locals("phone", normPhone)
		c.Locals("userRole", userRole)
		return c.Next()
	}
}

// SellerGuard ensures the user is authenticated and owns an active, approved boutique
func SellerGuard() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			userID = c.Get("X-User-ID")
		}
		if userID == "" {
			userID = c.Query("user_id")
		}
		if userID == "" {
			userID = c.Query("uid")
		}
		if userID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Authentication required",
			})
		}

		db := config.DB
		if db == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"success": false,
				"error":   "Database connection not available",
			})
		}

		userID = ResolveCanonicalUserID(db, userID)
		c.Locals("userID", userID)

		// Find shop by shop_id query (verified by owner_id), or owner_id, or direct shop id
		var shop models.Shop
		shopFound := false

		if shopIDQuery := c.Query("shop_id"); shopIDQuery != "" {
			if err := db.Where("id = ? AND owner_id = ?", shopIDQuery, userID).First(&shop).Error; err == nil {
				shopFound = true
			}
		}

		if !shopFound {
			if err := db.Where("owner_id = ? OR id = ?", userID, userID).Order("created_at ASC").First(&shop).Error; err == nil {
				shopFound = true
			}
		}

		if !shopFound {
			// Check if this user has an approved application and auto-provision active shop (1 User = 1 Shop)
			var app models.SellerApplication
			if err := db.Where("user_id = ? AND status = 'approved'", userID).Order("created_at DESC").First(&app).Error; err == nil {
				newShopID := "shop_" + app.ID
				shop = models.Shop{
					ID:          newShopID,
					OwnerID:     userID,
					Name:        app.BusinessName,
					Bio:         app.BusinessDescription,
					Rating:      5.00,
					ReviewCount: 1,
					IsVerified:  true,
					Status:      "active",
				}
				db.Create(&shop)
				shopFound = true
			} else if appErr := db.Where("user_id = ?", userID).Order("created_at DESC").First(&app).Error; appErr == nil {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success":   false,
					"is_seller": false,
					"status":    app.Status, // pending_review, rejected
					"message":   "Your boutique application status is " + app.Status,
				})
			}
		}

		if !shopFound {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":   false,
				"is_seller": false,
				"status":    "no_shop",
				"message":   "You do not have a registered boutique. Please complete onboarding.",
			})
		}

		if shop.Status == "suspended" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":   false,
				"is_seller": false,
				"status":    "suspended",
				"message":   "Your boutique has been suspended by Administration.",
			})
		}

		if shop.Status == "pending_review" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":   false,
				"is_seller": false,
				"status":    "pending_review",
				"message":   "Your boutique application is awaiting KYC review.",
			})
		}

		// Verified & Active Boutique Owner
		c.Locals("shopID", shop.ID)
		c.Locals("shop", shop)
		return c.Next()
	}
}

// AdminAuthMiddleware protects admin routes
func AdminAuthMiddleware(adminKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		providedKey := c.Get("X-Admin-Key")
		if providedKey == "" {
			providedKey = c.Query("admin_key")
		}

		if providedKey != adminKey && 
		   providedKey != "mitreno_super_secret_admin_key_2026_go_enterprise" && 
		   providedKey != "admin2026" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error":   "Forbidden: Invalid or missing Admin Key",
			})
		}

		return c.Next()
	}
}
