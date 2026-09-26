package controllers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"mitreno-backend/config"
	"mitreno-backend/models"
)

type TelemetryController struct{}

func NewTelemetryController() *TelemetryController {
	return &TelemetryController{}
}

// HeartbeatPayload represents the client presence ping
type HeartbeatPayload struct {
	SessionID    string  `json:"session_id"`
	UserID       *string `json:"user_id"`
	Role         string  `json:"role"` // customer, seller
	ShopID       *string `json:"shop_id"`
	CurrentRoute string  `json:"current_route"`
	Device       string  `json:"device"`
	City         string  `json:"city"`
}

// Heartbeat processes a client activity ping and records live presence in PostgreSQL
func (tc *TelemetryController) Heartbeat(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var payload HeartbeatPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid telemetry payload",
		})
	}

	sessionID := strings.TrimSpace(payload.SessionID)
	if sessionID == "" {
		sessionID = "sess_" + uuid.New().String()
	}

	role := strings.ToLower(strings.TrimSpace(payload.Role))
	if role != "seller" {
		role = "customer"
	}

	route := strings.TrimSpace(payload.CurrentRoute)
	if route == "" {
		route = "/"
	}

	device := strings.TrimSpace(payload.Device)
	if device == "" {
		device = "mobile"
	}

	city := strings.TrimSpace(payload.City)
	if city == "" {
		city = "India"
	}

	// Atomic UPSERT into user_presences
	upsertQuery := `
		INSERT INTO user_presences (session_id, user_id, role, shop_id, current_route, device, city, last_seen, first_seen_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
		ON CONFLICT (session_id) DO UPDATE SET
			user_id = EXCLUDED.user_id,
			role = EXCLUDED.role,
			shop_id = EXCLUDED.shop_id,
			current_route = EXCLUDED.current_route,
			device = EXCLUDED.device,
			city = EXCLUDED.city,
			last_seen = NOW()
	`

	if err := db.Exec(upsertQuery, sessionID, payload.UserID, role, payload.ShopID, route, device, city).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"session_id": sessionID,
		"last_seen":  time.Now().UTC(),
	})
}

// SearchLogPayload records customer search keywords
type SearchLogPayload struct {
	Query        string `json:"query"`
	UserSession  string `json:"user_session"`
	ResultsCount int    `json:"results_count"`
}

// LogSearch logs actual keyword searches to build search trend telemetry
func (tc *TelemetryController) LogSearch(c *fiber.Ctx) error {
	db := config.DB
	if db == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"error":   "Database connection not available",
		})
	}

	var payload SearchLogPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid search payload",
		})
	}

	q := strings.TrimSpace(payload.Query)
	if q == "" {
		return c.JSON(fiber.Map{"success": true})
	}

	item := models.SearchTelemetry{
		Query:        q,
		UserSession:  payload.UserSession,
		ResultsCount: payload.ResultsCount,
		SearchedAt:   time.Now(),
	}

	if err := db.Create(&item).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
	})
}
