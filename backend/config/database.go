package config

import (
	"log"
	"time"

	"mitreno-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase initializes the PostgreSQL connection pool
func InitDatabase(databaseURL string) (*gorm.DB, error) {
	log.Println("🔌 Connecting to PostgreSQL Database...")

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(databaseURL), gormConfig)
	if err != nil {
		log.Printf("⚠️ Database connection failed: %v", err)
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// Production connection pool tuning
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	log.Println("✅ Database connection established successfully.")

	// Auto-migrate tables
	log.Println("🔄 Running AutoMigrations for Native Schemas...")
	err = db.AutoMigrate(
		&models.State{},
		&models.City{},
		&models.User{},
		&models.Shop{},
		&models.Product{},
		&models.ProductVariant{},
		&models.Reel{},
		&models.Negotiation{},
		&models.ChatMessage{},
		&models.Order{},
		&models.OrderItem{},
		&models.OrderTrackingHistory{},
		&models.SellerApplication{},
		&models.ShopFollower{},
		&models.ShopReview{},
		&models.UserWishlist{},
		&models.ShopStory{},
		&models.ShopNote{},
		&models.UserPresence{},
		&models.SearchTelemetry{},
		&models.FlashOffer{},
		&models.PriceHistory{},
		&models.UserAddress{},
	)
	if err != nil {
		log.Printf("⚠️ AutoMigrate warning: %v", err)
	} else {
		log.Println("✅ AutoMigrate completed successfully.")
	}

	DB = db
	return db, nil
}
