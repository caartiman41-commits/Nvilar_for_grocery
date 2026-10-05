package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

// JSONB is a custom type for handling JSONB fields in PostgreSQL
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(map[string]interface{})
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed for JSONB")
	}
	return json.Unmarshal(bytes, j)
}

// JSONAny represents arbitrary JSON data (objects, arrays, or primitives) in PostgreSQL jsonb columns
type JSONAny []byte

func (j JSONAny) Value() (driver.Value, error) {
	if len(j) == 0 {
		return "[]", nil
	}
	return string(j), nil
}

func (j *JSONAny) Scan(value interface{}) error {
	if value == nil {
		*j = []byte("[]")
		return nil
	}
	switch v := value.(type) {
	case []byte:
		*j = append((*j)[0:0], v...)
	case string:
		*j = append((*j)[0:0], []byte(v)...)
	default:
		bytes, err := json.Marshal(v)
		if err != nil {
			return err
		}
		*j = append((*j)[0:0], bytes...)
	}
	return nil
}

func (j JSONAny) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("[]"), nil
	}
	return j, nil
}

func (j *JSONAny) UnmarshalJSON(data []byte) error {
	if j == nil {
		return errors.New("UnmarshalJSON on nil pointer")
	}
	*j = append((*j)[0:0], data...)
	return nil
}

// StringArray is a resilient custom type for array columns in PostgreSQL (handles JSON, Postgres array format {}, empty strings, and null)
type StringArray []string

func (sa StringArray) Value() (driver.Value, error) {
	if len(sa) == 0 {
		return "[]", nil
	}
	bytes, err := json.Marshal(sa)
	if err != nil {
		return "[]", nil
	}
	return string(bytes), nil
}

func (sa *StringArray) Scan(value interface{}) error {
	if value == nil {
		*sa = StringArray{}
		return nil
	}
	var str string
	switch v := value.(type) {
	case []byte:
		str = string(v)
	case string:
		str = v
	default:
		*sa = StringArray{}
		return nil
	}
	str = strings.TrimSpace(str)
	if str == "" || str == "{}" || str == "[]" || str == "<nil>" {
		*sa = StringArray{}
		return nil
	}
	var list []string
	if err := json.Unmarshal([]byte(str), &list); err == nil {
		*sa = list
		return nil
	}
	if strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}") {
		inner := str[1 : len(str)-1]
		if inner == "" {
			*sa = StringArray{}
			return nil
		}
		parts := strings.Split(inner, ",")
		var cleaned []string
		for _, p := range parts {
			cleaned = append(cleaned, strings.Trim(strings.TrimSpace(p), `"`))
		}
		*sa = cleaned
		return nil
	}
	*sa = StringArray{str}
	return nil
}

// State represents an Indian state for geographic hierarchy
type State struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Code      string    `gorm:"size:10;uniqueIndex;not null" json:"code"`
	IconURL   *string   `json:"icon_url"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Cities []City `gorm:"foreignKey:StateID" json:"cities,omitempty"`
}

// City represents a city within a state
type City struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	StateID       string    `gorm:"size:50;not null" json:"state_id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	PincodePrefix *string   `gorm:"size:10" json:"pincode_prefix"`
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	IsFeatured    bool      `gorm:"default:false" json:"is_featured"`
	ShopCount     int       `gorm:"default:0" json:"shop_count"`
	TotalRevenue  int       `gorm:"default:0" json:"total_revenue"`
	SortOrder     int       `gorm:"default:0" json:"sort_order"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	State *State `gorm:"foreignKey:StateID" json:"state,omitempty"`
	Shops []Shop `gorm:"foreignKey:CityID" json:"shops,omitempty"`
}

// User represents an authenticated app user (No Avatar, strictly Native Android spec)
type User struct {
	ID                  string    `gorm:"primaryKey" json:"id"`
	FullName            string    `gorm:"size:120;not null" json:"full_name"`
	Email               *string   `gorm:"size:255;unique" json:"email"`
	Phone               string    `gorm:"size:20;unique;not null" json:"phone"`
	FirebaseUID         *string   `gorm:"size:255;index" json:"firebase_uid"`
	Gender              string    `gorm:"size:20;default:'unisex'" json:"gender"`
	BodyMeasurements    JSONB     `gorm:"type:jsonb" json:"body_measurements"` // { "height_cm": 178, "chest_inch": 40, "usual_size": "L" }
	AndroidDeviceTokens StringArray `gorm:"type:text" json:"android_device_tokens"` // FCM push notification tokens
	Role                string    `gorm:"size:30;default:'customer'" json:"role"`   // customer, boutique_owner, admin
	IsActive            bool      `gorm:"default:true" json:"is_active"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// Shop represents a verified boutique partner (No GPS Coordinates, Address is managed in Bio)
type Shop struct {
	ID           string     `gorm:"primaryKey" json:"id"`
	OwnerID      string     `gorm:"size:255;not null" json:"owner_id"`
	Name         string     `gorm:"size:150;not null" json:"name"`
	LogoURL      *string    `json:"logo_url"`
	CoverImage   *string    `json:"cover_image"`
	Bio          string     `gorm:"type:text;not null;default:''" json:"bio"`
	Rating       float64    `gorm:"type:numeric(3,2);default:0.00" json:"rating"`
	ReviewCount    int        `gorm:"default:0" json:"review_count"`
	FollowersCount int        `gorm:"default:0" json:"followers_count"`
	IsVerified     bool       `gorm:"default:true" json:"is_verified"`
	PlanType       string     `gorm:"size:50;default:'pay_as_you_sell'" json:"plan_type"`
	PlanExpiresAt  *time.Time `json:"plan_expires_at"`
	CommissionRate float64    `gorm:"type:numeric(4,2);default:4.50" json:"commission_rate"`
	PayoutUpiID    *string    `gorm:"size:100" json:"payout_upi_id"`
	CityID       *string    `gorm:"size:50" json:"city_id"`
	StateID      *string    `gorm:"size:50" json:"state_id"`
	Status       string     `gorm:"size:30;default:'active'" json:"status"`
	StatusReason *string    `gorm:"type:text" json:"status_reason"`
	SuspendedAt  *time.Time `json:"suspended_at"`
	Username     *string    `gorm:"size:100" json:"username,omitempty"`
	CityName     *string    `gorm:"size:100" json:"city,omitempty"`
	MarketName   *string    `gorm:"size:150" json:"market_name,omitempty"`
	Category     *string    `gorm:"size:100" json:"category,omitempty"`
	Latitude     *float64   `json:"latitude,omitempty"`
	Longitude    *float64   `json:"longitude,omitempty"`
	SocialLinks  JSONAny    `gorm:"type:jsonb" json:"social_links,omitempty"`
	Policies     JSONAny    `gorm:"type:jsonb" json:"policies,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	Owner    *User     `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Products []Product `gorm:"foreignKey:ShopID" json:"products,omitempty"`
	City     *City     `gorm:"foreignKey:CityID" json:"city_ref,omitempty"`
	StateRef *State    `gorm:"foreignKey:StateID" json:"state_ref,omitempty"`
}

// Product represents a designer apparel item
type Product struct {
	ID              string           `gorm:"primaryKey" json:"id"`
	ShopID          string           `gorm:"size:255;not null" json:"shop_id"`
	Name            string           `gorm:"size:255;not null" json:"name"`
	Description     string           `gorm:"type:text" json:"description"`
	Category        string           `gorm:"size:100;default:'Fashion'" json:"category"`
	BasePrice       int              `gorm:"not null" json:"base_price"`     // INR e.g. 2499
	OriginalPrice   int              `gorm:"not null" json:"original_price"` // MRP e.g. 3499
	DiscountPercent int              `gorm:"default:0" json:"discount_percent"`
	Thumbnail       string           `gorm:"not null" json:"thumbnail"`
	GalleryImages   StringArray      `gorm:"type:text" json:"gallery_images"`
	Fabric          string           `gorm:"size:100;default:'Premium Blend'" json:"fabric"`
	GSM             int              `gorm:"default:220" json:"gsm"`
	Fit             string           `gorm:"size:60;default:'Aero-Fit'" json:"fit"`
	IsActive        bool             `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`

	Shop     *Shop            `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Variants []ProductVariant `gorm:"foreignKey:ProductID" json:"variants,omitempty"`
}

// ProductVariant tracks inventory stock per size
type ProductVariant struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	ProductID string    `gorm:"size:255;not null" json:"product_id"`
	Size      string    `gorm:"size:15;not null" json:"size"` // S, M, L, XL, XXL
	Color     string    `gorm:"size:50;default:'Standard'" json:"color"`
	Stock     int       `gorm:"default:0" json:"stock"`
	SKU       *string   `gorm:"size:100;unique" json:"sku"`
	CreatedAt time.Time `json:"created_at"`
}

// Reel represents a vertical discovery video (integrated with Cloudflare R2)
type Reel struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	ShopID          string    `gorm:"size:255;not null" json:"shop_id"`
	CreatorID       *string   `gorm:"size:255" json:"creator_id"`
	VideoURL        string    `gorm:"not null" json:"video_url"` // Cloudflare R2 Streaming URL
	ThumbnailURL    *string   `json:"thumbnail_url"`
	Caption         string    `gorm:"type:text" json:"caption"`
	TaggedProductID *string   `gorm:"size:255" json:"tagged_product_id"`
	LikesCount      int       `gorm:"default:0" json:"likes_count"`
	ViewsCount      int       `gorm:"default:0" json:"views_count"`
	IsActive        bool      `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`

	Shop          *Shop    `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	TaggedProduct *Product `gorm:"foreignKey:TaggedProductID" json:"tagged_product,omitempty"`
}

// Negotiation tracks a live bargaining session
type Negotiation struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	BuyerID         string    `gorm:"size:255;not null" json:"buyer_id"`
	ShopID          string    `gorm:"size:255;not null" json:"shop_id"`
	ProductID       string    `gorm:"size:255;not null" json:"product_id"`
	OriginalPrice   int       `gorm:"not null" json:"original_price"`
	BuyerLastOffer  *int      `json:"buyer_last_offer"`
	SellerLastOffer *int      `json:"seller_last_offer"`
	AgreedPrice     *int      `json:"agreed_price"` // Locked price when accepted
	Status          string    `gorm:"size:50;default:'active'" json:"status"` // active, accepted, rejected, checkout_locked
	DealStatus      string    `gorm:"size:50;default:'pending'" json:"deal_status"` // pending, accepted, rejected
	ExpiresAt       time.Time `json:"expires_at"` // 24 hours expiry
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Buyer    *User         `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	Shop     *Shop         `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Product  *Product      `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Messages []ChatMessage `gorm:"foreignKey:NegotiationID" json:"messages,omitempty"`
}

// ChatMessage represents a bargaining interaction message
type ChatMessage struct {
	ID              string     `gorm:"primaryKey" json:"id"`
	ClientMessageID string     `gorm:"size:255;index" json:"client_message_id,omitempty"`
	NegotiationID   string     `gorm:"size:255;not null" json:"negotiation_id"`
	SenderID        string     `gorm:"size:255;not null" json:"sender_id"`
	SenderRole      string     `gorm:"size:50;not null;default:'buyer'" json:"sender_role"`
	Role            string     `gorm:"size:50;default:'buyer'" json:"role,omitempty"`
	MessageText     string     `gorm:"type:text" json:"message_text"`
	IsCounterOffer  bool       `gorm:"default:false" json:"is_counter_offer"`
	OfferedPrice    *int       `json:"offered_price"`
	SeenAt          *time.Time `gorm:"column:seen_at" json:"seen_at"` // Set when receiver reads the message (drives blue ✓✓)
	CreatedAt       time.Time  `json:"created_at"`
}

// Order represents a confirmed e-commerce transaction (With 24h Free Cancellation)
type Order struct {
	ID                    string    `gorm:"primaryKey" json:"id"` // e.g. AFZ-46804229
	BuyerID               string    `gorm:"size:255;not null" json:"buyer_id"`
	ShippingAddress       JSONB     `gorm:"type:jsonb;not null" json:"shipping_address"`
	PaymentMode           string    `gorm:"size:50;default:'UPI'" json:"payment_mode"` // UPI, CARD, COD
	PaymentStatus         string    `gorm:"size:50;default:'PAID'" json:"payment_status"`
	TotalMRP              int       `gorm:"not null" json:"total_mrp"`
	TotalSavings          int       `gorm:"default:0" json:"total_savings"`
	DeliveryCharge        int       `gorm:"default:0" json:"delivery_charge"`
	TotalPaid             int        `gorm:"not null" json:"total_paid"`
	OrderStatus           string     `gorm:"size:50;default:'placed'" json:"order_status"` // placed, accepted, packaging, shipped, delivered, cancelled
	ShopID                string     `gorm:"size:255" json:"shop_id"`
	SellerStatus          string     `gorm:"size:50;default:'new'" json:"seller_status"`
	TrackingNumber        *string    `gorm:"size:255" json:"tracking_number"`
	TrackingProvider      *string    `gorm:"size:255" json:"tracking_provider"`
	DeliveryTier          *string    `gorm:"size:50" json:"delivery_tier"`
	SellerNotes           *string    `gorm:"type:text" json:"seller_notes"`
	AcceptedAt            *time.Time `json:"accepted_at"`
	ShippedAt             *time.Time `json:"shipped_at"`
	DeliveredAt           *time.Time `json:"delivered_at"`
	CancelWindowExpiresAt time.Time  `json:"cancel_window_expires_at"` // PlacedAt + 24 hours
	PlacedAt              time.Time  `json:"placed_at"`
	UpdatedAt             time.Time  `json:"updated_at"`

	Buyer   *User                  `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	Shop    *Shop                  `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Items   []OrderItem            `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	History []OrderTrackingHistory `gorm:"foreignKey:OrderID" json:"tracking_history,omitempty"`
}

// SellerNotification tracks notifications for boutique owners
type SellerNotification struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	ShopID      string    `gorm:"size:255;not null" json:"shop_id"`
	UserID      string    `gorm:"size:255;not null" json:"user_id"`
	Type        string    `gorm:"size:50;not null" json:"type"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Message     string    `gorm:"type:text;not null" json:"message"`
	ReferenceID *string   `gorm:"size:255" json:"reference_id"`
	IsRead      bool      `gorm:"default:false" json:"is_read"`
	CreatedAt   time.Time `json:"created_at"`
}

// OrderItem represents a line item in an order
type OrderItem struct {
	ID                 string     `gorm:"primaryKey" json:"id"`
	OrderID            string     `gorm:"size:255;not null" json:"order_id"`
	ProductID          string     `gorm:"size:255;not null" json:"product_id"`
	Quantity           int        `gorm:"default:1" json:"quantity"`
	Size               string     `gorm:"size:15;not null" json:"size"`
	PricePerUnit       int        `gorm:"not null" json:"price_per_unit"`
	IsCancelled        bool       `gorm:"default:false" json:"is_cancelled"`
	CancellationReason *string    `gorm:"size:255" json:"cancellation_reason"`
	CancellationTime   *time.Time `json:"cancellation_time"`
	CreatedAt          time.Time  `json:"created_at"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// OrderTrackingHistory represents a milestone in the logistics journey
type OrderTrackingHistory struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	OrderID     string    `gorm:"size:255;not null" json:"order_id"`
	Stage       string    `gorm:"size:50;not null" json:"stage"` // RECEIVED, QUALITY_CHECKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
	Title       string    `gorm:"size:255;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"size:50;not null" json:"status"` // completed, in-progress, pending
	TimeLabel   string    `gorm:"size:100" json:"time_label"`     // [Today, 11:42 pm]
	SortOrder   int       `gorm:"default:1" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
}

// SellerApplication tracks a seller onboarding request with KYC documents
type SellerApplication struct {
	ID                  string     `gorm:"primaryKey" json:"id"` // e.g. sa_xxxx
	UserID              string     `gorm:"size:255;not null" json:"user_id"`

	// Business Info
	BusinessName        string     `gorm:"size:150;not null" json:"business_name"`
	BusinessType        string     `gorm:"size:50;not null;default:'individual'" json:"business_type"` // individual, partnership, company
	BusinessCategory    string     `gorm:"size:100;not null;default:'Fashion'" json:"business_category"`
	BusinessDescription string     `gorm:"type:text;default:''" json:"business_description"`

	// Owner KYC
	OwnerFullName       string     `gorm:"size:120;not null" json:"owner_full_name"`
	OwnerPhone          string     `gorm:"size:20;not null" json:"owner_phone"`
	OwnerEmail          *string    `gorm:"size:255" json:"owner_email"`

	// KYC Documents (Numbers + R2 Photo URLs)
	AadharNumber        string     `gorm:"size:12;not null" json:"aadhar_number"`
	AadharPhotoURL      string     `gorm:"type:text;not null" json:"aadhar_photo_url"`
	PanNumber           string     `gorm:"size:10;not null" json:"pan_number"`
	PanPhotoURL         string     `gorm:"type:text;not null" json:"pan_photo_url"`
	VoterIDNumber       *string    `gorm:"size:20" json:"voter_id_number"`
	VoterIDPhotoURL     *string    `gorm:"type:text" json:"voter_id_photo_url"`
	DLNumber            *string    `gorm:"size:20" json:"dl_number"`
	DLPhotoURL          *string    `gorm:"type:text" json:"dl_photo_url"`
	GSTNumber           *string    `gorm:"size:15" json:"gst_number"`

	// Business KYC Documents & Entity Specifics (Dynamic JSONB & Convenience Fields)
	BusinessDocuments   JSONB      `gorm:"type:jsonb" json:"business_documents,omitempty"`
	CINNumber           *string    `gorm:"size:25" json:"cin_number,omitempty"`
	COIPhotoURL         *string    `gorm:"type:text" json:"coi_photo_url,omitempty"`
	FirmPanNumber       *string    `gorm:"size:10" json:"firm_pan_number,omitempty"`
	PartnershipDeedURL  *string    `gorm:"type:text" json:"partnership_deed_url,omitempty"`

	// Shop Address
	ShopAddress         JSONB      `gorm:"type:jsonb;not null" json:"shop_address"` // { "street", "city", "state", "pincode", "landmark" }

	// Payout
	PayoutUpiID         string     `gorm:"size:100;not null" json:"payout_upi_id"`
	BankAccountNumber   *string    `gorm:"size:20" json:"bank_account_number"`
	BankIFSC            *string    `gorm:"size:11" json:"bank_ifsc"`

	// Application Lifecycle
	Status              string     `gorm:"size:30;not null;default:'pending_review'" json:"status"` // pending_review, approved, rejected
	AdminNotes          *string    `gorm:"type:text" json:"admin_notes"`
	RejectionReason     *string    `gorm:"type:text" json:"rejection_reason"`
	ReviewedBy          *string    `gorm:"size:255" json:"reviewed_by"`
	ReviewedAt          *time.Time `json:"reviewed_at"`

	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`

	// Relations
	User                *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// ShopFollower tracks persistent boutique followers
type ShopFollower struct {
	ID        string    `gorm:"primaryKey;size:255" json:"id"`
	UserID    string    `gorm:"size:255;not null;uniqueIndex:idx_user_shop_follower" json:"user_id"`
	ShopID    string    `gorm:"size:255;not null;uniqueIndex:idx_user_shop_follower" json:"shop_id"`
	UserName  string    `gorm:"size:255" json:"user_name"`
	CreatedAt time.Time `json:"created_at"`

	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Shop      *Shop     `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

// ShopReview tracks verified customer ratings and reviews
type ShopReview struct {
	ID        string    `gorm:"primaryKey" json:"id"` // e.g. rev_xxxx
	ShopID    string    `gorm:"size:255;not null;uniqueIndex:idx_user_shop_review" json:"shop_id"`
	UserID    string    `gorm:"size:255;not null;uniqueIndex:idx_user_shop_review" json:"user_id"`
	OrderID   *string   `gorm:"size:255" json:"order_id"`
	Rating    int       `gorm:"not null" json:"rating"` // 1 to 5 stars
	Review    string    `gorm:"type:text;default:''" json:"review"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Shop      *Shop     `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

// UserWishlist tracks liked/wishlisted garments
type UserWishlist struct {
	UserID    string    `gorm:"primaryKey;size:255" json:"user_id"`
	ProductID string    `gorm:"primaryKey;size:255;index" json:"product_id"`
	CreatedAt time.Time `json:"created_at"`

	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product   *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// ShopStory represents a 24-hour ephemeral boutique story
type ShopStory struct {
	ID               string    `gorm:"primaryKey;size:255" json:"id"`
	ShopID           string    `gorm:"size:255;not null;index" json:"shop_id"`
	Type             string    `gorm:"size:30;default:'image'" json:"type"` // image, video
	MediaURL         string    `gorm:"type:text;not null" json:"media_url"`
	TextContent      string    `gorm:"type:text;default:''" json:"text_content"`
	TaggedProductID  *string   `gorm:"size:255" json:"tagged_product_id"`
	ProductName      *string   `gorm:"size:255" json:"product_name,omitempty"`
	ProductThumbnail *string   `gorm:"type:text" json:"product_thumbnail,omitempty"`
	ViewsCount       int       `gorm:"default:0" json:"views_count"`
	LikesCount       int       `gorm:"default:0" json:"likes_count"`
	ExpiresAt        time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt        time.Time `json:"created_at"`

	Shop          *Shop    `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	TaggedProduct *Product `gorm:"foreignKey:TaggedProductID" json:"tagged_product,omitempty"`
}

// ShopNote represents a 24-hour status note (Instagram style, up to 60 chars)
type ShopNote struct {
	ID        string    `gorm:"primaryKey;size:255" json:"id"`
	ShopID    string    `gorm:"size:255;not null;uniqueIndex" json:"shop_id"`
	UserID    string    `gorm:"size:255;not null;index" json:"user_id"`
	Content   string    `gorm:"size:100;not null" json:"content"`
	ExpiresAt time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`

	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// UserPresence tracks real-time heartbeat and screen routes for live analytics
type UserPresence struct {
	SessionID    string    `gorm:"primaryKey;size:64" json:"session_id"`
	UserID       *string   `gorm:"size:255;index" json:"user_id,omitempty"`
	Role         string    `gorm:"size:20;default:'customer';index" json:"role"` // customer, seller
	ShopID       *string   `gorm:"size:255;index" json:"shop_id,omitempty"`
	CurrentRoute string    `gorm:"size:255;default:'/'" json:"current_route"`
	Device       string    `gorm:"size:30;default:'mobile'" json:"device"`
	City         string    `gorm:"size:100;default:'India'" json:"city"`
	IsOnline     bool      `gorm:"default:true;index" json:"is_online"`
	LastSeen     time.Time `gorm:"not null;index" json:"last_seen"`
	FirstSeenAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"first_seen_at"`
}

// SearchTelemetry records actual customer search queries
type SearchTelemetry struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Query        string    `gorm:"size:255;not null;index" json:"query"`
	UserSession  string    `gorm:"size:64;index" json:"user_session"`
	ResultsCount int       `gorm:"default:0" json:"results_count"`
	SearchedAt   time.Time `gorm:"not null;index;default:CURRENT_TIMESTAMP" json:"searched_at"`
}

// FlashOffer represents a high-intensity, time-limited surge drop (15, 20, or 30 mins)
type FlashOffer struct {
	ID              string    `gorm:"primaryKey;size:255" json:"id"`
	ProductID       string    `gorm:"size:255;not null;index" json:"product_id"`
	ShopID          string    `gorm:"size:255;not null;index" json:"shop_id"`
	OriginalPrice   int       `gorm:"not null" json:"original_price"`
	FlashPrice      int       `gorm:"not null" json:"flash_price"`
	DiscountPercent int       `gorm:"not null" json:"discount_percent"`
	DurationMinutes int       `gorm:"not null;default:15" json:"duration_minutes"`
	StartsAt        time.Time `gorm:"not null" json:"starts_at"`
	ExpiresAt       time.Time `gorm:"not null;index" json:"expires_at"`
	StockLimit      int       `gorm:"default:10" json:"stock_limit"`
	SoldQuantity    int       `gorm:"default:0" json:"sold_quantity"`
	Status          string    `gorm:"size:30;default:'active';index" json:"status"` // active, expired, sold_out
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Shop    *Shop    `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

// PriceHistory records authentic chronological price points for every product
type PriceHistory struct {
	ID         string    `gorm:"primaryKey;size:255" json:"id"`
	ProductID  string    `gorm:"size:255;not null;index" json:"product_id"`
	Price      int       `gorm:"not null" json:"price"`
	Event      string    `gorm:"size:50;default:'normal'" json:"event"` // normal, flash_surge, price_drop, revert
	RecordedAt time.Time `gorm:"not null;index" json:"recorded_at"`
}

// UserAddress stores permanent delivery addresses associated with a user account and phone number
type UserAddress struct {
	ID             string    `gorm:"primaryKey;size:64" json:"id"`
	UserID         string    `gorm:"size:255;not null;index" json:"user_id"`
	Phone          string    `gorm:"size:20;not null;index" json:"phone"`
	RecipientName  string    `gorm:"size:120;not null" json:"recipient_name"`
	HouseNoStreet  string    `gorm:"type:text;not null" json:"house_no_street"`
	NearbyArea     string    `gorm:"type:text" json:"nearby_area"`
	CityVillage    string    `gorm:"size:100;not null" json:"city_village"`
	State          string    `gorm:"size:100;not null" json:"state"`
	Pincode        string    `gorm:"size:10;not null" json:"pincode"`
	AlternatePhone string    `gorm:"size:20" json:"alternate_phone"`
	AddressType    string    `gorm:"size:20;default:'HOME'" json:"address_type"` // HOME, WORK, OTHER
	GpsLocation    string    `gorm:"size:100" json:"gps_location"`
	Distance       string    `gorm:"size:50;default:'0m'" json:"distance"`
	IsDefault      bool      `gorm:"default:false" json:"is_default"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

