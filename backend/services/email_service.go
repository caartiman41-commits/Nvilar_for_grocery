package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// EmailService handles sending transactional emails
type EmailService struct {
	SMTPHost     string
	SMTPPort     string
	SenderEmail  string
	SenderPass   string
	SenderName   string
}

// NewEmailService creates a new email service from env config
func NewEmailService() *EmailService {
	return &EmailService{
		SMTPHost:    getEnvOrDefault("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:    getEnvOrDefault("SMTP_PORT", "587"),
		SenderEmail: getEnvOrDefault("SMTP_EMAIL", ""),
		SenderPass:  getEnvOrDefault("SMTP_PASSWORD", ""),
		SenderName:  getEnvOrDefault("SMTP_SENDER_NAME", "Nvilar"),
	}
}

func getEnvOrDefault(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

// SendSellerApproved sends an approval email to the seller
func (es *EmailService) SendSellerApproved(toEmail, sellerName, businessName string) error {
	subject := "🎉 Your Nvilar Seller Application is Approved!"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
  <div style="background: #000; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: #fbbf24; font-size: 24px; margin: 0;">NVILAR</h1>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 4px; letter-spacing: 2px;">SELLER PLATFORM</p>
  </div>
  
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h2 style="color: #111; margin: 0 0 16px 0;">Congratulations, %s! 🎉</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      Your seller application for <strong>%s</strong> has been <span style="color: #059669; font-weight: 700;">approved</span>.
    </p>
    <p style="color: #4b5563; line-height: 1.6;">
      You can now start listing your products on Nvilar and reach thousands of fashion-conscious buyers.
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #166534; font-weight: 600; margin: 0;">✅ Your boutique is now live on Nvilar!</p>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
      If you have any questions, reach out to us at support@nvilar.com
    </p>
  </div>
</body>
</html>`, sellerName, businessName)

	return es.sendEmail(toEmail, subject, body)
}

// SendSellerRejected sends a rejection email with reason
func (es *EmailService) SendSellerRejected(toEmail, sellerName, businessName, reason string) error {
	subject := "Update on Your Nvilar Seller Application"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
  <div style="background: #000; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: #fbbf24; font-size: 24px; margin: 0;">NVILAR</h1>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 4px; letter-spacing: 2px;">SELLER PLATFORM</p>
  </div>
  
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h2 style="color: #111; margin: 0 0 16px 0;">Hello %s,</h2>
    <p style="color: #4b5563; line-height: 1.6;">
      Thank you for your interest in selling on Nvilar. After reviewing your application for <strong>%s</strong>, 
      we were unable to approve it at this time.
    </p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #991b1b; font-weight: 600; margin: 0 0 8px 0;">Reason:</p>
      <p style="color: #b91c1c; margin: 0;">%s</p>
    </div>
    <p style="color: #4b5563; line-height: 1.6;">
      You are welcome to reapply after addressing the above concerns. 
      If you believe this was in error, please contact our support team.
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
      Contact us at support@nvilar.com
    </p>
  </div>
</body>
</html>`, sellerName, businessName, reason)

	return es.sendEmail(toEmail, subject, body)
}

// sendEmail sends an HTML email via SMTP
func (es *EmailService) sendEmail(to, subject, htmlBody string) error {
	if es.SenderEmail == "" || es.SenderPass == "" {
		log.Printf("📧 [Email Service] SMTP not configured. Would send to: %s | Subject: %s", to, subject)
		return nil // Silently skip if not configured
	}

	from := es.SenderEmail
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	msg := fmt.Sprintf("From: %s <%s>\nTo: %s\nSubject: %s\n%s%s",
		es.SenderName, from, to, subject, mime, htmlBody)

	auth := smtp.PlainAuth("", from, es.SenderPass, es.SMTPHost)
	addr := fmt.Sprintf("%s:%s", es.SMTPHost, es.SMTPPort)

	err := smtp.SendMail(addr, auth, from, []string{to}, []byte(msg))
	if err != nil {
		log.Printf("❌ [Email Service] Failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("✅ [Email Service] Email sent to %s | Subject: %s", to, subject)
	return nil
}
