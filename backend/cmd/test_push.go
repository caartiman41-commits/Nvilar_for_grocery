package main

import (
	"log"
	"mitreno-backend/config"
	"mitreno-backend/services"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	config.InitFirebase()
	fcm := services.NewFCMService("mitreno")

	token := "cwgKJy2QSBq44d25nOMWE7:APA91bFLob1RJmtIMTU364sfPNDrrFZdUBoPR_rs3QwDQiw9p10dOyzOysriKWk3vOE3s4SyH5N5Rn4hNAbExsEYbavTJegp7eHei43empYS0KmQn2lltiM"
	title := "🔥 Weekend Flash Drop: Flat 60% OFF!"
	body := "Handcrafted Chikankari Kurta & Royal Silk Drops. Grab before sold out!"
	imgURL := "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
	productID := "prod_chikankari_101"

	err := fcm.SendProductPromoNotification([]string{token}, title, body, imgURL, productID, map[string]string{
		"action_label":     "🛍️ Shop Now",
		"action_secondary": "✨ Visit Now",
	})

	if err != nil {
		log.Fatalf("Error sending push: %v", err)
	}
	log.Println("🎉 Rich push dispatched successfully with live Firebase credentials!")
}
