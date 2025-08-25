// utils/sendOTP.js
const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Pandora Mistress ✨" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Pandora Mistress Registration – Verify Your Account",
      text: `Welcome to Pandora Mistress! 💫\n\nYour One-Time Password (OTP) is: ${otp}\n\n⚠️ This code will expire in 10 minutes.\n\nIf you didn’t request this, please ignore this message.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h2 style="color:#8e44ad;">Welcome to Pandora Mistress 💜</h2>
          <p>Thank you for registering with <b>Pandora Mistress</b>. To complete your registration, please verify your email with the code below:</p>
          <div style="margin:20px 0; padding:15px; background:#f4f4f4; border-radius:8px; text-align:center; font-size:20px; font-weight:bold; color:#8e44ad;">
            ${otp}
          </div>
          <p>⚠️ This code will expire in <b>10 minutes</b>.</p>
          <p>If you did not request this registration, you can safely ignore this email.</p>
          <br/>
          <p>With love, <br/>💜 The Pandora Mistress Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
