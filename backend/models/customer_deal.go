package models

import (
	"time"
)

type CustomerDeal struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	ShopID         string    `json:"shop_id"`
	CustomerID     string    `json:"customer_id"`
	ProductID      string    `json:"product_id"`
	OriginalPrice  int       `json:"original_price"`
	DealPrice      int       `json:"deal_price"`
	ConversationID string    `json:"conversation_id"`
	Status         string    `json:"status"`
	ExpiresAt      time.Time `json:"expires_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
