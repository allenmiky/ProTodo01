// backend/testEmail.js
import "dotenv/config"; // ensure env vars load
import transporter from "./config/email.js";

(async () => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "allenmiky88@gmail.com", // apna personal gmail daal
      subject: "Test Email",
      text: "If you received this, your SendGrid works!",
    });
    console.log("✅ Email sent!");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
})();
