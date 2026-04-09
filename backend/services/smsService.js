// services/smsService.js
// Wraps Fast2SMS so the rest of the code doesn't need to know about HTTP details.
const axios = require("axios");

const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

/**
 * Send an SMS alert via Fast2SMS Quick route.
 * @param {string} message - Plain ASCII text message body (no emojis — keeps it in 160-char GSM encoding).
 * @param {string} [numbers] - Comma-separated 10-digit numbers (no +91 prefix).
 *                             Defaults to ALERT_RECIPIENTS env var.
 * @returns {Promise<object>} Fast2SMS API response data.
 */
async function sendSMS(message, numbers) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const recipients = numbers || process.env.ALERT_RECIPIENTS;

  if (!apiKey) {
    throw new Error("FAST2SMS_API_KEY is not configured");
  }
  if (!recipients) {
    throw new Error("No SMS recipients configured (ALERT_RECIPIENTS)");
  }

  const response = await axios.get(FAST2SMS_URL, {
    params: {
      authorization: apiKey,
      route: "q",
      message,
      language: "english",
      flash: 0,
      numbers: recipients,
    },
    timeout: 10000,
  });

  console.log("SMS sent successfully:", response.data);
  return response.data;
}

/**
 * Build and send a low-rating alert message.
 */
async function sendLowRatingAlert({ mealType, date, averageRating, totalRatings }) {
  const formattedDate = new Date(date).toISOString().split("T")[0];
  // Plain ASCII only — avoids Unicode SMS segments and carrier encoding issues.
  const message =
    `ALERT: Hostel Food Rating Low! ` +
    `Meal: ${mealType} (${formattedDate}). ` +
    `Average Rating: ${averageRating.toFixed(2)}/5. ` +
    `Students Rated: ${totalRatings}. ` +
    `Immediate attention required.`;

  return sendSMS(message);
}

module.exports = { sendSMS, sendLowRatingAlert };
