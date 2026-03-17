import nodemailer from 'nodemailer';

let transporter;

export class EmailService {
  static async initializeTransporter() {

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (gmailUser && gmailPassword) {

      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword, 
        },
      });
    } else if (smtpHost && smtpPort) {

      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === '465', 
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      console.warn('⚠️ Email service not configured. Set GMAIL_USER/GMAIL_PASSWORD or SMTP_* variables.');

      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    return transporter;
  }

  static async sendVerificationEmail(email, code, type) {
    try {
      if (!transporter) {
        await this.initializeTransporter();
      }

      const subject = type === 'password' ? 'Password Reset Code' : 'Email Verification Code';
      const message = type === 'password' 
        ? `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.`
        : `Your email verification code is: ${code}\n\nThis code will expire in 10 minutes.`;

      const mailOptions = {
        from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@socialflow.com',
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">SocialFlow ${type === 'password' ? 'Password Reset' : 'Email Verification'}</h2>
            <p>Hi,</p>
            <p>Your ${type === 'password' ? 'password reset' : 'email verification'} code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="text-align: center; color: #7c3aed; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p style="color: #6b7280;">This code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">SocialFlow - Where Everyone Can Connect</p>
          </div>
        `,
        text: message,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);

      if (process.env.NODE_ENV !== 'production' && info.messageId && !process.env.GMAIL_USER) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, message: 'Verification code sent to email' };
    } catch (error) {
      console.error('🔴 Email send error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

