/**
 * Email Service
 * Handles sending emails (password reset, verification, etc.)
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email (mock implementation)
 * In production, integrate with SendGrid, AWS SES, or similar service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email:', {
      to: options.to,
      subject: options.subject,
    });

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(options);

    // For now, just log the email content
    console.log('Email content:', options.text);
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetCode: string
): Promise<boolean> {
  const subject = 'Password Reset Request';
  const text = `
Your password reset code is: ${resetCode}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1F77FF;">Password Reset Request</h2>
      <p>Your password reset code is:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${resetCode}
      </div>
      <p>This code will expire in <strong>15 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This is an automated email from AI Knowledge Workspace.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
}
