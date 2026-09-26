package models

import (
	"time"
)

// BargainSlotConfig represents a single category card in the 3x2 Bento Grid
type BargainSlotConfig struct {
	SlotKey        string `json:"slot_key" gorm:"primaryKey;type:varchar(50)"`
	Title          string `json:"title" gorm:"type:varchar(150);not null"`
	Subtitle       string `json:"subtitle" gorm:"type:varchar(255)"`
	Badge          string `json:"badge" gorm:"type:varchar(100);not null"`
	ImageURL       string `json:"image_url" gorm:"type:text;not null"`
	TargetCategory string `json:"target_category" gorm:"type:varchar(100)"`
	SortOrder      int    `json:"sort_order" gorm:"default:0"`
	IsActive       bool   `json:"is_active" gorm:"default:true"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// TopBrandInviteConfig represents a verified boutique brand invited to Tile 6
type TopBrandInviteConfig struct {
	ID                string    `json:"id" gorm:"primaryKey;type:varchar(100)"`
	ShopID            string    `json:"shop_id" gorm:"type:varchar(100);not null"`
	ShopName          string    `json:"shop_name" gorm:"type:varchar(255);not null"`
	BrandTier         string    `json:"brand_tier" gorm:"type:varchar(100);default:'Verified Boutique'"`
	CommissionPercent float64   `json:"commission_percent" gorm:"default:6.0"`
	Status            string    `json:"status" gorm:"type:varchar(50);default:'pending'"` // 'pending', 'accepted', 'declined'
	ProductsCount     int       `json:"products_count" gorm:"default:0"`
	InvitedAt         time.Time `json:"invited_at"`
	RespondedAt       *time.Time `json:"responded_at,omitempty"`
}

// BargainCampaignConfig represents the overall live campaign state, timer, and master switch
type BargainCampaignConfig struct {
	ID                       string                 `json:"id" gorm:"primaryKey;type:varchar(100)"`
	Title                    string                 `json:"title" gorm:"type:varchar(255);not null"`
	IsActive                 bool                   `json:"is_active" gorm:"default:true"`
	StartTime                time.Time              `json:"start_time"`
	EndTime                  time.Time              `json:"end_time"`
	CountdownDurationMinutes int                    `json:"countdown_duration_minutes" gorm:"default:240"`
	HideWhenExpired          bool                   `json:"hide_when_expired" gorm:"default:true"`
	Slots                    []BargainSlotConfig    `json:"slots" gorm:"-"`
	TopBrands                []TopBrandInviteConfig `json:"top_brands" gorm:"-"`
	UpdatedAt                time.Time              `json:"updated_at"`
	UpdatedBy                string                 `json:"updated_by" gorm:"type:varchar(100);default:'admin'"`
}
