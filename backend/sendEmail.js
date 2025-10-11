import Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config(); // loads your .env variables

// Initialize Brevo client
const brevo = new Brevo.TransactionalEmailsApi();
brevo.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

/**
 * Send an email using Brevo
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - subject line
 * @param {string} options.html - HTML content of email
 * @param {string} [options.text] - optional plain text version
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const emailData = {
    sender: {
      name: process.env.SENDER_NAME,
      email: process.env.ADMIN_EMAIL,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    // textContent: text || "",
  };

  try {
    const response = await brevo.sendTransacEmail(emailData);
    console.log("✅ Email sent successfully:", response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.response?.body || error);
    throw new Error("Email not sent");
  }
};
