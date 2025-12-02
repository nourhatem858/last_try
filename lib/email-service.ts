/**
 * Email Service
 * Handles sending emails (OTP, password reset, etc.)
 * 
 * NOTE: This is a DEVELOPMENT-ONLY implementation
 * For production, integrate with SendGrid, AWS SES, or similar
 */

/**
 * Send OTP email
 * @param email - Recipient email
 * @param otp - 6-digit OTP code
 * @returns Promise<boolean> - Success status
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // DEVELOPMENT MODE: Log OTP to console
    console.log('\n📧 ========== EMAIL SERVICE (DEV MODE) ==========');
    console.log('📬 To:', email);
    console.log('🔐 OTP Code:', otp);
    console.log('⏰ Valid for: 5 minutes');
    console.log('================================================\n');
    
    // In development, always return success
    // The OTP will be visible in the server console
    return true;
    
    /* 
     * PRODUCTION IMPLEMENTATION EXAMPLE (SendGrid):
     * 
     * const sgMail = require('@sendgrid/mail');
     * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
     * 
     * const msg = {
     *   to: email,
     *   from: 'noreply@yourapp.com',
     *   subject: 'Password Reset Code',
     *   text: `Your password reset code is: ${otp}`,
     *   html: `<strong>Your password reset code is: ${otp}</strong>`,
     * };
     * 
     * await sgMail.send(msg);
     * return true;
     */
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

/**
 * Send password reset confirmation email
 * @param email - Recipient email
 * @returns Promise<boolean> - Success status
 */
export async function sendPasswordResetConfirmation(email: string): Promise<boolean> {
  try {
    console.log('\n📧 ========== EMAIL SERVICE (DEV MODE) ==========');
    console.log('📬 To:', email);
    console.log('✅ Subject: Password Reset Successful');
    console.log('================================================\n');
    
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

/**
 * Send welcome email
 * @param email - Recipient email
 * @param name - User name
 * @returns Promise<boolean> - Success status
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    console.log('\n📧 ========== EMAIL SERVICE (DEV MODE) ==========');
    console.log('📬 To:', email);
    console.log('👋 Subject: Welcome to AI Knowledge Workspace');
    console.log(`🎉 Welcome, ${name}!`);
    console.log('================================================\n');
    
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}
