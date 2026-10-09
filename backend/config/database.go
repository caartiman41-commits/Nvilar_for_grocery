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

	// Auto-migrate tables only if schema is not yet initialized (avoids 60s remote schema introspection on restart)
	var tableCount int64
	db.Raw("SELECT count(*) FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA() AND table_name IN ('users', 'shops', 'products', 'orders', 'negotiations', 'user_addresses')").Scan(&tableCount)
	if tableCount < 6 {
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
			&models.PayoutSupportTicket{},
			&models.PayoutTicketMessage{},
			&models.DailyPayoutSettlement{},
		)
		if err != nil {
			log.Printf("⚠️ AutoMigrate warning: %v", err)
		} else {
			log.Println("✅ AutoMigrate completed successfully.")
		}
	} else {
		log.Println("⚡ Native PostgreSQL schema verified (fast-boot enabled).")
		var payoutTableCount int64
		db.Raw("SELECT count(*) FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA() AND table_name IN ('payout_support_tickets', 'daily_payout_settlements')").Scan(&payoutTableCount)
		if payoutTableCount < 2 {
			log.Println("🔄 Migrating PayoutSupportTicket, PayoutTicketMessage & DailyPayoutSettlement schemas...")
			_ = db.AutoMigrate(&models.PayoutSupportTicket{}, &models.PayoutTicketMessage{}, &models.DailyPayoutSettlement{})
		}
	}

	consolidateMultiTenantData(db)

	DB = db
	return db, nil
}

// consolidateMultiTenantData merges duplicate Firebase UID user rows and consolidates duplicate shops per owner
func consolidateMultiTenantData(db *gorm.DB) {
	if db == nil {
		return
	}

	// Ensure canonical seller usr_ashraf_01 retains its Firebase UID mapping
	db.Exec("UPDATE users SET firebase_uid = 'KD56AHEqvOWX322JKlVB4jkMoju2' WHERE id = 'usr_ashraf_01' AND (firebase_uid IS NULL OR firebase_uid = '' OR firebase_uid = 'usr_ashraf_01')")

	// 1. Merge duplicate user rows where a row's id equals another canonical usr_* row's firebase_uid
	var canonicalUsers []models.User
	if err := db.Where("id LIKE 'usr_%' AND firebase_uid IS NOT NULL AND firebase_uid != ''").Find(&canonicalUsers).Error; err == nil {
		for _, cu := range canonicalUsers {
			if cu.FirebaseUID == nil || *cu.FirebaseUID == "" || *cu.FirebaseUID == cu.ID {
				continue
			}
			dupID := *cu.FirebaseUID
			var dupUser models.User
			if err := db.Where("id = ?", dupID).First(&dupUser).Error; err == nil && dupUser.ID != "" {
				log.Printf("🔄 Consolidating duplicate user row %s into canonical user %s...", dupID, cu.ID)
				db.Exec("UPDATE orders SET buyer_id = ? WHERE buyer_id = ?", cu.ID, dupID)
				db.Exec("UPDATE negotiations SET buyer_id = ? WHERE buyer_id = ?", cu.ID, dupID)
				db.Exec("UPDATE chat_messages SET sender_id = ? WHERE sender_id = ?", cu.ID, dupID)
				db.Exec("UPDATE user_addresses SET user_id = ? WHERE user_id = ?", cu.ID, dupID)
				db.Exec("UPDATE shops SET owner_id = ? WHERE owner_id = ?", cu.ID, dupID)
				db.Exec("UPDATE seller_applications SET user_id = ? WHERE user_id = ?", cu.ID, dupID)
				db.Exec("UPDATE user_wishlists SET user_id = ? WHERE user_id = ?", cu.ID, dupID)
				db.Exec("DELETE FROM users WHERE id = ?", dupID)
			}
		}
	}

	// 2. Enforce 1 Owner = 1 Canonical Shop: consolidate extra shops for usr_ashraf_01 into shop_KD56AHEq_42723
	primaryShopID := "shop_KD56AHEq_42723"
	var primaryShop models.Shop
	if err := db.Where("id = ?", primaryShopID).First(&primaryShop).Error; err == nil && primaryShop.ID != "" {
		var extraShops []models.Shop
		if err := db.Where("owner_id = ? AND id != ?", primaryShop.OwnerID, primaryShopID).Find(&extraShops).Error; err == nil {
			for _, es := range extraShops {
				log.Printf("🔄 Consolidating duplicate shop %s (%s) into canonical shop %s...", es.ID, es.Name, primaryShopID)
				db.Exec("UPDATE products SET shop_id = ? WHERE shop_id = ?", primaryShopID, es.ID)
				db.Exec("UPDATE orders SET shop_id = ? WHERE shop_id = ?", primaryShopID, es.ID)
				db.Exec("UPDATE negotiations SET shop_id = ? WHERE shop_id = ?", primaryShopID, es.ID)
				db.Exec("UPDATE seller_notifications SET shop_id = ? WHERE shop_id = ?", primaryShopID, es.ID)
				db.Exec("UPDATE shop_stories SET shop_id = ? WHERE shop_id = ?", primaryShopID, es.ID)
				db.Exec("DELETE FROM shop_notes WHERE shop_id = ?", es.ID)
				db.Exec("DELETE FROM shop_followers WHERE shop_id = ?", es.ID)
				db.Exec("DELETE FROM shop_reviews WHERE shop_id = ?", es.ID)
				db.Exec("DELETE FROM shops WHERE id = ?", es.ID)
			}
		}
	}
}

