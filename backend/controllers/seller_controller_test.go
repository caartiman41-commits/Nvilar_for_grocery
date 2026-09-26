package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"mitreno-backend/models"

	"github.com/gofiber/fiber/v2"
)

func TestSellerApplicationModelJSON(t *testing.T) {
	cin := "U12345MH2023PTC123456"
	coi := "https://cdn.example.com/coi.pdf"
	firmPan := "AABCF1234D"
	deed := "https://cdn.example.com/deed.pdf"

	docs := models.JSONB{
		"cin_number":           cin,
		"coi_photo_url":        coi,
		"firm_pan_number":      firmPan,
		"partnership_deed_url": deed,
		"board_resolution_url": "https://cdn.example.com/resolution.pdf",
		"directors": []interface{}{
			map[string]interface{}{"name": "Jane Doe", "din": "01234567"},
		},
	}

	app := models.SellerApplication{
		ID:                  "sa_test_123",
		UserID:              "user_456",
		BusinessName:        "Acme Corp",
		BusinessType:        "company",
		BusinessCategory:    "Fashion",
		BusinessDescription: "Designer Apparel",
		OwnerFullName:       "John Doe",
		OwnerPhone:          "9876543210",
		AadharNumber:        "123456789012",
		AadharPhotoURL:      "https://cdn.example.com/aadhar.jpg",
		PanNumber:           "ABCDE1234F",
		PanPhotoURL:         "https://cdn.example.com/pan.jpg",
		BusinessDocuments:   docs,
		CINNumber:           &cin,
		COIPhotoURL:         &coi,
		FirmPanNumber:       &firmPan,
		PartnershipDeedURL:  &deed,
		ShopAddress: models.JSONB{
			"city":  "Mumbai",
			"state": "Maharashtra",
		},
		PayoutUpiID: "acme@okhdfcbank",
		Status:      "pending_review",
	}

	marshaled, err := json.Marshal(app)
	if err != nil {
		t.Fatalf("Failed to marshal SellerApplication: %v", err)
	}

	var unmarshaled models.SellerApplication
	if err := json.Unmarshal(marshaled, &unmarshaled); err != nil {
		t.Fatalf("Failed to unmarshal SellerApplication: %v", err)
	}

	if unmarshaled.BusinessType != "company" {
		t.Errorf("Expected business_type 'company', got '%s'", unmarshaled.BusinessType)
	}
	if unmarshaled.CINNumber == nil || *unmarshaled.CINNumber != cin {
		t.Errorf("Expected cin_number '%s', got '%v'", cin, unmarshaled.CINNumber)
	}
	if unmarshaled.COIPhotoURL == nil || *unmarshaled.COIPhotoURL != coi {
		t.Errorf("Expected coi_photo_url '%s', got '%v'", coi, unmarshaled.COIPhotoURL)
	}
	if unmarshaled.FirmPanNumber == nil || *unmarshaled.FirmPanNumber != firmPan {
		t.Errorf("Expected firm_pan_number '%s', got '%v'", firmPan, unmarshaled.FirmPanNumber)
	}
	if unmarshaled.PartnershipDeedURL == nil || *unmarshaled.PartnershipDeedURL != deed {
		t.Errorf("Expected partnership_deed_url '%s', got '%v'", deed, unmarshaled.PartnershipDeedURL)
	}

	if unmarshaled.BusinessDocuments == nil {
		t.Fatalf("Expected BusinessDocuments to be non-nil")
	}
	if unmarshaled.BusinessDocuments["board_resolution_url"] != "https://cdn.example.com/resolution.pdf" {
		t.Errorf("Expected board_resolution_url in BusinessDocuments, got '%v'", unmarshaled.BusinessDocuments["board_resolution_url"])
	}
}

func TestValidationRules(t *testing.T) {
	// Aadhar regex test
	aadharRegex := regexp.MustCompile(`^\d{12}$`)
	if !aadharRegex.MatchString("123456789012") {
		t.Errorf("Aadhar regex failed for valid 12 digit number")
	}
	if aadharRegex.MatchString("12345678901") {
		t.Errorf("Aadhar regex passed for 11 digits")
	}
	if aadharRegex.MatchString("1234567890123") {
		t.Errorf("Aadhar regex passed for 13 digits")
	}

	// PAN regex test
	panRegex := regexp.MustCompile(`^[A-Z]{5}[0-9]{4}[A-Z]$`)
	if !panRegex.MatchString("ABCDE1234F") {
		t.Errorf("PAN regex failed for valid PAN")
	}
	if !panRegex.MatchString("AABCF1234D") {
		t.Errorf("PAN regex failed for valid Firm PAN")
	}
	if panRegex.MatchString("ABCDE1234") {
		t.Errorf("PAN regex passed for invalid PAN")
	}
}

func TestRegisterSellerValidationEndpoint(t *testing.T) {
	app := fiber.New()
	ctrl := NewSellerController()

	// Simulate route with middleware injecting userID
	app.Post("/register", func(c *fiber.Ctx) error {
		c.Locals("userID", "usr_test123456789")
		return ctrl.RegisterSeller(c)
	})

	// Test 1: Missing required fields
	reqBody1 := []byte(`{"business_name": ""}`)
	req1 := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(reqBody1))
	req1.Header.Set("Content-Type", "application/json")
	resp1, err := app.Test(req1)
	if err != nil {
		t.Fatalf("Test request failed: %v", err)
	}
	if resp1.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected StatusBadRequest, got %d", resp1.StatusCode)
	}

	// Test 2: Invalid Aadhar
	reqBody2 := []byte(`{
		"business_name": "Test Store",
		"business_type": "company",
		"owner_full_name": "Jane Director",
		"owner_phone": "9998887776",
		"aadhar_number": "123",
		"aadhar_photo_url": "https://cdn.example.com/aadhar.jpg",
		"pan_number": "ABCDE1234F",
		"pan_photo_url": "https://cdn.example.com/pan.jpg",
		"shop_address": {"city": "Delhi"},
		"payout_upi_id": "test@upi"
	}`)
	req2 := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(reqBody2))
	req2.Header.Set("Content-Type", "application/json")
	resp2, err := app.Test(req2)
	if err != nil {
		t.Fatalf("Test request failed: %v", err)
	}
	if resp2.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected StatusBadRequest for invalid Aadhar, got %d", resp2.StatusCode)
	}

	// Test 3: Invalid Firm PAN in partnership
	reqBody3 := []byte(`{
		"business_name": "Test Partnership",
		"business_type": "partnership",
		"owner_full_name": "John Partner",
		"owner_phone": "9998887776",
		"aadhar_number": "123456789012",
		"aadhar_photo_url": "https://cdn.example.com/aadhar.jpg",
		"pan_number": "ABCDE1234F",
		"pan_photo_url": "https://cdn.example.com/pan.jpg",
		"firm_pan_number": "INVALID_PAN",
		"shop_address": {"city": "Delhi"},
		"payout_upi_id": "test@upi"
	}`)
	req3 := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(reqBody3))
	req3.Header.Set("Content-Type", "application/json")
	resp3, err := app.Test(req3)
	if err != nil {
		t.Fatalf("Test request failed: %v", err)
	}
	if resp3.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected StatusBadRequest for invalid Firm PAN, got %d", resp3.StatusCode)
	}
}

func TestGetUploadURLDocTypes(t *testing.T) {
	app := fiber.New()
	ctrl := NewSellerController()

	app.Post("/upload-doc", func(c *fiber.Ctx) error {
		c.Locals("userID", "usr_test123456789")
		return ctrl.GetUploadURL(c)
	})

	allowedDocs := []string{
		"aadhar",
		"pan",
		"voter_id",
		"dl",
		"coi",
		"cin",
		"firm_pan",
		"partnership_deed",
		"board_resolution",
		"business_doc",
	}

	for _, docType := range allowedDocs {
		payload, _ := json.Marshal(map[string]string{
			"doc_type": docType,
			"file_ext": "pdf",
		})
		req := httptest.NewRequest(http.MethodPost, "/upload-doc", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("Test request failed for doc_type %s: %v", docType, err)
		}
		if resp.StatusCode != fiber.StatusOK {
			t.Errorf("Expected 200 OK for doc_type %s, got %d", docType, resp.StatusCode)
		}
	}

	// Disallowed doc type
	payload, _ := json.Marshal(map[string]string{
		"doc_type": "passport",
		"file_ext": "pdf",
	})
	req := httptest.NewRequest(http.MethodPost, "/upload-doc", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Test request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for disallowed doc_type, got %d", resp.StatusCode)
	}
}

func TestShopCoordinatesExtractionAndProfile(t *testing.T) {
	lat := 26.1445
	lng := 91.7362

	// Verify SellerApplication with coordinates in ShopAddress
	app := models.SellerApplication{
		ID:           "sa_test_coords",
		UserID:       "usr_coords_123",
		BusinessName: "Guwahati Silk Boutique",
		ShopAddress: models.JSONB{
			"street":    "GS Road",
			"city":      "Guwahati",
			"state":     "Assam",
			"pincode":   "781005",
			"latitude":  lat,
			"longitude": lng,
		},
		PayoutUpiID: "guwahati@upi",
		Status:      "approved",
	}

	addressMap := app.ShopAddress
	var latPtr, lngPtr *float64
	if latVal, ok := addressMap["latitude"]; ok && latVal != nil {
		if f, ok := latVal.(float64); ok {
			latPtr = &f
		}
	}
	if lngVal, ok := addressMap["longitude"]; ok && lngVal != nil {
		if f, ok := lngVal.(float64); ok {
			lngPtr = &f
		}
	}

	if latPtr == nil || *latPtr != lat {
		t.Fatalf("Expected latitude %v, got %v", lat, latPtr)
	}
	if lngPtr == nil || *lngPtr != lng {
		t.Fatalf("Expected longitude %v, got %v", lng, lngPtr)
	}

	shop := models.Shop{
		ID:          "shop_test_coords",
		OwnerID:     app.UserID,
		Name:        app.BusinessName,
		Bio:         "Authentic Silk Sarees",
		IsVerified:  true,
		Latitude:    latPtr,
		Longitude:   lngPtr,
	}

	marshaled, err := json.Marshal(shop)
	if err != nil {
		t.Fatalf("Failed to marshal shop: %v", err)
	}

	var unmarshaled models.Shop
	if err := json.Unmarshal(marshaled, &unmarshaled); err != nil {
		t.Fatalf("Failed to unmarshal shop: %v", err)
	}

	if unmarshaled.Latitude == nil || *unmarshaled.Latitude != lat {
		t.Errorf("Expected unmarshaled latitude %v, got %v", lat, unmarshaled.Latitude)
	}
	if unmarshaled.Longitude == nil || *unmarshaled.Longitude != lng {
		t.Errorf("Expected unmarshaled longitude %v, got %v", lng, unmarshaled.Longitude)
	}
}
