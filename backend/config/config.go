package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Env                string
	DatabaseURL        string
	AdminKey           string
	R2AccountID        string
	R2AccessKey        string
	R2SecretKey        string
	R2Bucket           string
	R2PublicURL        string
	FirebasePID        string
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string
	JWTSecret          string
}

func LoadConfig() *Config {
	// Attempt to load .env file if available
	_ = godotenv.Load(".env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://mitreno_db_user:secret@database.internal:5432/mitreno?sslmode=require"
	}

	adminKey := os.Getenv("ADMIN_SECRET_KEY")
	if adminKey == "" {
		adminKey = "mitreno_super_secret_admin_key_2026"
	}

	return &Config{
		Port:               port,
		Env:                env,
		DatabaseURL:        dbURL,
		AdminKey:           adminKey,
		R2AccountID:        os.Getenv("CLOUDFLARE_R2_ACCOUNT_ID"),
		R2AccessKey:        os.Getenv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
		R2SecretKey:        os.Getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
		R2Bucket:           os.Getenv("CLOUDFLARE_R2_BUCKET_NAME"),
		R2PublicURL:        os.Getenv("CLOUDFLARE_R2_PUBLIC_URL"),
		FirebasePID:        os.Getenv("FIREBASE_PROJECT_ID"),
		SupabaseURL:        os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey:    os.Getenv("SUPABASE_ANON_KEY"),
		SupabaseServiceKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
	}
}
