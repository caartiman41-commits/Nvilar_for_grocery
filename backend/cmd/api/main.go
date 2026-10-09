package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"mitreno-backend/config"
	"mitreno-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	log.Println("🚀 Initializing Nvilar High-Power Native Go Backend...")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// Initialize Firebase Admin
	config.InitFirebase()

	// 2. Connect to Database (PostgreSQL / Supabase)
	_, err := config.InitDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Printf("⚠️ Note: Running with offline/in-memory resilience. DB error: %v", err)
	}

	// 3. Initialize Fiber App with Performance Optimizations
	app := fiber.New(fiber.Config{
		AppName:      "Nvilar High-Performance Native API v1.0",
		ServerHeader: "Nvilar-Engine",
		Prefork:      false,
		BodyLimit:    50 * 1024 * 1024, // 50MB for video/media uploads
	})

	// 4. Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-User-ID, X-Admin-Key",
		AllowCredentials: false,
	}))

	// 5. Register Routes
	routes.SetupRoutes(app, cfg)

	// 6. Graceful Shutdown listener
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-shutdownChan
		log.Println("🛑 Shutting down Nvilar server gracefully...")
		_ = app.Shutdown()
	}()

	// 7. Start listening
	listenAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🔥mitreno Go Backend running on port %s", cfg.Port)
	if err := app.Listen(listenAddr); err != nil {
		log.Fatalf("❌ Server listen error: %v", err)
	}
}
