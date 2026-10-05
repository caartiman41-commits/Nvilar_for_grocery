package main

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestRunServer(t *testing.T) {
	_ = os.Chdir("../..")
	_ = godotenv.Load(".env")
	main()
}
