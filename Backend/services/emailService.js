/**
 * Email Service
 * Handles all email sending functionality using Nodemailer
 */

const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('../utils/logger');

// ============================================
// EMAIL SERVICE CLASS
// ============================================

class EmailService {
  constructor() {
    // Initialize transporter based on environment
    if (config.email.service === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.appPassword, // Use app-specific password for Gmail
        },
      });
    } else {
      // Generic SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure || false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }

    this.fromEmail = config.email.from || 'noreply@college-admin.com';
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>}
   */
  async verifyConfig() {
    try {
      await this.transporter.verify();
      logger.info('Email service configured successfully');
      return true;
    } catch (err) {
      logger.error('Email service verification failed', { error: err.message });
      return false;
    }
  }

  /**
   * Send password reset email
   * @param {string} recipientEmail - Recipient email
   * @param {string} recipientName - Recipient name
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail(recipientEmail, recipientName, resetToken) {
    try {
      // Construct reset link
      const resetLink = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: this.fromEmail,
        to: recipientEmail,
        subject: 'Password Reset Request - College Administration System',
        html: this.getPasswordResetEmailTemplate(recipientName, resetLink),
        text: this.getPasswordResetPlainText(recipientName, resetLink),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Password reset email sent', {
        to: recipientEmail,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error('Failed to send password reset email', {
        to: recipientEmail,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Send welcome email after registration
   * @param {string} recipientEmail - Recipient email
   * @param {string} recipientName - Recipient name
   * @param {string} role - User role
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(recipientEmail, recipientName, role) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: recipientEmail,
        subject: 'Welcome to College Administration System',
        html: this.getWelcomeEmailTemplate(recipientName, role),
        text: this.getWelcomePlainText(recipientName, role),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Welcome email sent', {
        to: recipientEmail,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error('Failed to send welcome email', {
        to: recipientEmail,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Send email verification email
   * @param {string} recipientEmail - Recipient email
   * @param {string} recipientName - Recipient name
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<Object>}
   */
  async sendEmailVerificationEmail(recipientEmail, recipientName, verificationToken) {
    try {
      const verificationLink = `${config.app.frontendUrl}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: this.fromEmail,
        to: recipientEmail,
        subject: 'Verify Your Email - College Administration System',
        html: this.getEmailVerificationTemplate(recipientName, verificationLink),
        text: this.getEmailVerificationPlainText(recipientName, verificationLink),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email verification sent', {
        to: recipientEmail,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error('Failed to send email verification', {
        to: recipientEmail,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Send notification email
   * @param {string} recipientEmail - Recipient email
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   * @param {string} textContent - Plain text content
   * @returns {Promise<Object>}
   */
  async sendNotificationEmail(recipientEmail, subject, htmlContent, textContent) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Notification email sent', {
        to: recipientEmail,
        subject,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error('Failed to send notification email', {
        to: recipientEmail,
        subject,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Send bulk emails
   * @param {Array<{email: string, name: string, data: Object}>} recipients - Recipients data
   * @param {string} subject - Email subject
   * @param {Function} htmlTemplateGenerator - Function to generate HTML template
   * @param {Function} textTemplateGenerator - Function to generate plain text
   * @returns {Promise<Array>}
   */
  async sendBulkEmails(recipients, subject, htmlTemplateGenerator, textTemplateGenerator) {
    try {
      const results = [];

      for (const recipient of recipients) {
        try {
          const mailOptions = {
            from: this.fromEmail,
            to: recipient.email,
            subject,
            html: htmlTemplateGenerator(recipient),
            text: textTemplateGenerator(recipient),
          };

          const info = await this.transporter.sendMail(mailOptions);
          results.push({
            success: true,
            email: recipient.email,
            messageId: info.messageId,
          });
        } catch (err) {
          logger.error('Failed to send email in bulk operation', {
            email: recipient.email,
            error: err.message,
          });
          results.push({
            success: false,
            email: recipient.email,
            error: err.message,
          });
        }
      }

      logger.info('Bulk email operation completed', {
        total: recipients.length,
        successful: results.filter((r) => r.success).length,
      });

      return results;
    } catch (err) {
      logger.error('Bulk email operation failed', { error: err.message });
      throw err;
    }
  }

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  /**
   * Password reset email HTML template
   */
  getPasswordResetEmailTemplate(name, resetLink) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #333; margin: 0; }
            .content { color: #666; line-height: 1.6; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; color: #999; font-size: 12px; }
            .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>We received a request to reset your password for your College Administration System account. If you did not make this request, please ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <p><small>${resetLink}</small></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons.
              </div>
              
              <p>If you have any issues, please contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} College Administration System. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Password reset email plain text
   */
  getPasswordResetPlainText(name, resetLink) {
    return `
      Password Reset Request
      
      Hello ${name},
      
      We received a request to reset your password for your College Administration System account. 
      If you did not make this request, please ignore this email.
      
      To reset your password, visit this link:
      ${resetLink}
      
      SECURITY NOTICE: This link will expire in 1 hour for security reasons.
      
      If you have any issues, please contact our support team.
      
      © ${new Date().getFullYear()} College Administration System. All rights reserved.
    `;
  }

  /**
   * Welcome email HTML template
   */
  getWelcomeEmailTemplate(name, role) {
    const roleMessages = {
      admin: 'As an administrator, you have full access to manage the system.',
      teacher: 'As a teacher, you can manage classes, attendance, and upload video content.',
      student: 'As a student, you can view your classes, attendance, and access course materials.',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #333; margin: 0; }
            .content { color: #666; line-height: 1.6; }
            .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome!</h1>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>Welcome to the College Administration System! Your account has been successfully created.</p>
              
              <p>${roleMessages[role] || ''}</p>
              
              <p>You can now log in with your email and password to access the system.</p>
              
              <button href="${config.app.frontendUrl}/login" class="button">Go to Login</button>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} College Administration System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Welcome email plain text
   */
  getWelcomePlainText(name, role) {
    const roleMessages = {
      admin: 'As an administrator, you have full access to manage the system.',
      teacher: 'As a teacher, you can manage classes, attendance, and upload video content.',
      student: 'As a student, you can view your classes, attendance, and access course materials.',
    };

    return `
      Welcome!
      
      Hello ${name},
      
      Welcome to the College Administration System! Your account has been successfully created.
      
      ${roleMessages[role] || ''}
      
      You can now log in with your email and password to access the system.
      
      If you have any questions or need assistance, please contact our support team.
      
      © ${new Date().getFullYear()} College Administration System. All rights reserved.
    `;
  }

  /**
   * Email verification HTML template
   */
  getEmailVerificationTemplate(name, verificationLink) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { border-bottom: 2px solid #17a2b8; padding-bottom: 10px; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; }
            .button { display: inline-block; padding: 10px 20px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" class="button">Verify Email</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Email verification plain text
   */
  getEmailVerificationPlainText(name, verificationLink) {
    return `
      Verify Your Email
      
      Hello ${name},
      
      Please verify your email address by visiting this link:
      ${verificationLink}
    `;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

const emailService = new EmailService();

// ============================================
// EXPORTS
// ============================================

module.exports = emailService;
