package config

import (
	"context"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

var FirebaseApp *firebase.App
var FirebaseMessaging *messaging.Client

// InitFirebase initializes the Firebase Admin App with multi-source credential resolution
func InitFirebase() {
	var opts []option.ClientOption
	var credSource string

	// Priority 1: FIREBASE_CREDENTIALS file path
	if path := os.Getenv("FIREBASE_CREDENTIALS"); path != "" {
		if _, err := os.Stat(path); err == nil {
			opts = append(opts, option.WithCredentialsFile(path))
			credSource = "FIREBASE_CREDENTIALS=" + path
		} else {
			log.Printf("⚠️ FIREBASE_CREDENTIALS path '%s' not found: %v", path, err)
		}
	}

	// Priority 2: FIREBASE_SERVICE_ACCOUNT_PATH file path
	if len(opts) == 0 {
		if path := os.Getenv("FIREBASE_SERVICE_ACCOUNT_PATH"); path != "" {
			if _, err := os.Stat(path); err == nil {
				opts = append(opts, option.WithCredentialsFile(path))
				credSource = "FIREBASE_SERVICE_ACCOUNT_PATH=" + path
			} else {
				log.Printf("⚠️ FIREBASE_SERVICE_ACCOUNT_PATH '%s' not found: %v", path, err)
			}
		}
	}

	// Priority 3: FIREBASE_CREDENTIALS_JSON raw JSON string
	if len(opts) == 0 {
		if jsonStr := os.Getenv("FIREBASE_CREDENTIALS_JSON"); jsonStr != "" {
			opts = append(opts, option.WithCredentialsJSON([]byte(jsonStr)))
			credSource = "FIREBASE_CREDENTIALS_JSON (inline)"
		}
	}

	// Priority 4: GOOGLE_APPLICATION_CREDENTIALS (standard GCP default)
	if len(opts) == 0 {
		if path := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); path != "" {
			if _, err := os.Stat(path); err == nil {
				opts = append(opts, option.WithCredentialsFile(path))
				credSource = "GOOGLE_APPLICATION_CREDENTIALS=" + path
			}
		}
	}

	// Priority 5: Application Default Credentials (ADC) with explicit project ID
	if len(opts) == 0 {
		projectID := os.Getenv("FIREBASE_PROJECT_ID")
		if projectID != "" {
			log.Printf("🔄 Attempting Firebase init with ADC for project '%s'...", projectID)
			cfg := &firebase.Config{ProjectID: projectID}
			app, err := firebase.NewApp(context.Background(), cfg)
			if err != nil {
				log.Printf("⚠️ Firebase ADC init failed: %v. Running in mock mode.", err)
				return
			}
			FirebaseApp = app
			if client, err := app.Messaging(context.Background()); err == nil {
				FirebaseMessaging = client
				log.Println("⚡ [Firebase] Reusable HTTP/2 Persistent Messaging Client warmed up and ready!")
			}
			log.Printf("✅ Firebase Admin SDK initialized via ADC (Project: %s)", projectID)
			return
		}

		log.Println("⚠️ No Firebase credentials found. Running in mock mode.")
		log.Println("   Set one of: FIREBASE_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_CREDENTIALS_JSON, or GOOGLE_APPLICATION_CREDENTIALS")
		return
	}

	app, err := firebase.NewApp(context.Background(), nil, opts...)
	if err != nil {
		log.Printf("❌ Firebase Admin SDK initialization failed: %v", err)
		return
	}
	FirebaseApp = app
	if client, err := app.Messaging(context.Background()); err == nil {
		FirebaseMessaging = client
		log.Println("⚡ [Firebase] Reusable HTTP/2 Persistent Messaging Client warmed up and ready!")
	}
	log.Printf("✅ Firebase Admin SDK initialized successfully via %s", credSource)
}
