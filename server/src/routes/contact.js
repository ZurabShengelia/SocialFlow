import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const MAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER;
const MAIL_PASS = process.env.GMAIL_PASSWORD || process.env.EMAIL_PASS;
const DEST_EMAIL = process.env.CONTACT_EMAIL || MAIL_USER;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const mailOptions = {
      from: MAIL_USER,
      to: DEST_EMAIL,
      replyTo: email,
      subject: `SocialFlow Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #7c3aed; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
              ${message}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              This email was sent from the SocialFlow contact form at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission

        From: ${name}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}

        ---
        This email was sent from the SocialFlow contact form at ${new Date().toLocaleString()}
      `,
    };

    const confirmationMailOptions = {
      from: MAIL_USER,
      to: email,
      subject: 'We received your message - SocialFlow',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h2 style="margin: 0;">Thank you for contacting SocialFlow</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>We have received your message and appreciate you reaching out. Our team will review your inquiry and get back to you as soon as possible.</p>
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              <strong>Your message:</strong> "${subject}"
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 14px;">
              Best regards,<br>
              <strong>The SocialFlow Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(confirmationMailOptions),
    ]);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
