/**
 * Email template utilities for authentication and notifications
 */

export interface EmailTemplateParams {
  appName: string;
  email: string;
  url: string;
}

/**
 * Generate HTML template for password reset email
 */
export function generatePasswordResetHtml({
  appName,
  email,
  url,
}: EmailTemplateParams): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a202c; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: #2d3748; margin-bottom: 16px;">Reset Your Password</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
        We received a request to reset the password for your ${appName} account associated with ${email}.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" 
           style="display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      
      <p style="color: #718096; font-size: 14px; line-height: 1.6;">
        This link will expire in 24 hours for security reasons.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      
      <p style="color: #a0aec0; font-size: 12px; text-align: center;">
        This is an automated email from ${appName}. Please do not reply to this email.
      </p>
    </div>
  `.trim();
}

/**
 * Generate plain text template for password reset email
 */
export function generatePasswordResetText({
  appName,
  email,
  url,
}: EmailTemplateParams): string {
  return `
Reset your ${appName} password

We received a request to reset the password for your ${appName} account associated with ${email}.

Click the link below to reset your password:
${url}

If you didn't request this password reset, you can safely ignore this email.

This link will expire in 24 hours for security reasons.
  `.trim();
}

/**
 * Generate complete email payload for password reset
 */
export function generatePasswordResetEmail(params: EmailTemplateParams) {
  return {
    subject: `Reset your ${params.appName} password`,
    html: generatePasswordResetHtml(params),
    text: generatePasswordResetText(params),
  };
}

/**
 * Email template configurations and constants
 */
export const EMAIL_CONFIG = {
  APP_NAME: "Room Dates",
  EXPIRY_HOURS: 24,
  BUTTON_COLOR: "#3182ce",
  PRIMARY_COLOR: "#1a202c",
  SECONDARY_COLOR: "#2d3748",
  TEXT_COLOR: "#4a5568",
  MUTED_COLOR: "#718096",
  FOOTER_COLOR: "#a0aec0",
} as const;

/**
 * Generate HTML template for email verification
 */
export function generateEmailVerificationHtml({
  appName,
  email,
  url,
}: EmailTemplateParams): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${EMAIL_CONFIG.PRIMARY_COLOR}; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: ${EMAIL_CONFIG.SECONDARY_COLOR}; margin-bottom: 16px;">Verify Your Email</h2>
      
      <p style="color: ${EMAIL_CONFIG.TEXT_COLOR}; line-height: 1.6; margin-bottom: 24px;">
        Welcome to ${appName}! Please verify your email address (${email}) to complete your account setup.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" 
           style="display: inline-block; padding: 12px 24px; background-color: ${EMAIL_CONFIG.BUTTON_COLOR}; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Verify Email
        </a>
      </div>
      
      <p style="color: ${EMAIL_CONFIG.MUTED_COLOR}; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
        If you didn't create an account with ${appName}, you can safely ignore this email.
      </p>
      
      <p style="color: ${EMAIL_CONFIG.MUTED_COLOR}; font-size: 14px; line-height: 1.6;">
        This link will expire in ${EMAIL_CONFIG.EXPIRY_HOURS} hours for security reasons.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      
      <p style="color: ${EMAIL_CONFIG.FOOTER_COLOR}; font-size: 12px; text-align: center;">
        This is an automated email from ${appName}. Please do not reply to this email.
      </p>
    </div>
  `.trim();
}

/**
 * Generate plain text template for email verification
 */
export function generateEmailVerificationText({
  appName,
  email,
  url,
}: EmailTemplateParams): string {
  return `
Verify your ${appName} email

Welcome to ${appName}! Please verify your email address (${email}) to complete your account setup.

Click the link below to verify your email:
${url}

If you didn't create an account with ${appName}, you can safely ignore this email.

This link will expire in ${EMAIL_CONFIG.EXPIRY_HOURS} hours for security reasons.
  `.trim();
}

/**
 * Generate complete email payload for email verification
 */
export function generateEmailVerificationEmail(params: EmailTemplateParams) {
  return {
    subject: `Verify your ${params.appName} email`,
    html: generateEmailVerificationHtml(params),
    text: generateEmailVerificationText(params),
  };
}
