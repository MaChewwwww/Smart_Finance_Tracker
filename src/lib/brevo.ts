import axios from "axios";

interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

/**
 * Sends a transactional email using the Brevo API.
 */
export async function sendEmail({ toEmail, toName, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@yourdomain.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Smart Finance Tracker";

  if (!apiKey || apiKey === "replace-with-brevo-key") {
    console.warn("⚠️ BREVO_API_KEY is not configured or has the default value. Email will not be sent.");
    throw new Error("Brevo API key is missing. Please configure BREVO_API_KEY in .env.local.");
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail,
          },
        ],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to send email via Brevo:", error.response?.data || error.message);
    throw new Error(
      `Brevo email delivery failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Sends an OTP verification email to the user.
 */
export async function sendOTPEmail(email: string, otp: string, purpose: string) {
  let purposeText = "verify your email address";
  if (purpose === "login") {
    purposeText = "log in to your account";
  } else if (purpose === "password_reset") {
    purposeText = "reset your password";
  }

  const subject = `Smart Finance Tracker - OTP Verification Code`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">Smart Finance Tracker</h2>
      <p>Hello,</p>
      <p>We received a request to ${purposeText}. Your 6-digit verification code is:</p>
      <div style="background-color: #f1f5f9; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #0f172a; margin: 20px 0; border-radius: 6px;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated email, please do not reply.</p>
    </div>
  `;

  return sendEmail({
    toEmail: email,
    subject,
    htmlContent,
  });
}
