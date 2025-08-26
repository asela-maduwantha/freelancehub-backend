import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const emailConfig = this.configService.get('email');
    
    if (emailConfig?.host) {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
    } else {
      // Development mode - log emails to console
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }

  async sendEmailVerificationOtp(email: string, otp: string, firstName?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.from', 'noreply@freelancehub.com'),
      to: email,
      subject: 'Verify Your Email - FreelanceHub',
      html: this.getEmailVerificationTemplate(otp, firstName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email verification OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification OTP to ${email}:`, error);
      // In development, log the OTP
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Development Mode - Email verification OTP for ${email}: ${otp}`);
      }
      throw error;
    }
  }

  async sendPasswordResetOtp(email: string, otp: string, firstName?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.from', 'noreply@freelancehub.com'),
      to: email,
      subject: 'Password Reset - FreelanceHub',
      html: this.getPasswordResetTemplate(otp, firstName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset OTP to ${email}:`, error);
      // In development, log the OTP
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Development Mode - Password reset OTP for ${email}: ${otp}`);
      }
      throw error;
    }
  }

  private getEmailVerificationTemplate(otp: string, firstName?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-left: 4px solid #007bff; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; letter-spacing: 3px; }
            .footer { background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
            .warning { color: #dc3545; font-size: 14px; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>FreelanceHub</h1>
                <h2>Email Verification</h2>
            </div>
            <div class="content">
                <h3>Hello ${firstName || 'there'}!</h3>
                <p>Thank you for registering with FreelanceHub. To complete your registration, please verify your email address using the OTP below:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p>This OTP is valid for <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.</p>
                
                <div class="warning">
                    <strong>Security Notice:</strong> Never share this OTP with anyone. FreelanceHub will never ask for your OTP via phone or email.
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2025 FreelanceHub. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getPasswordResetTemplate(otp: string, firstName?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-left: 4px solid #dc3545; }
            .otp-code { font-size: 32px; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; letter-spacing: 3px; }
            .footer { background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
            .warning { color: #dc3545; font-size: 14px; margin-top: 15px; }
            .security-tips { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>FreelanceHub</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <h3>Hello ${firstName || 'there'}!</h3>
                <p>We received a request to reset your password. Use the OTP below to proceed with resetting your password:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p>This OTP is valid for <strong>10 minutes</strong>. If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                
                <div class="security-tips">
                    <h4>Security Tips:</h4>
                    <ul>
                        <li>Never share your OTP with anyone</li>
                        <li>FreelanceHub will never ask for your OTP via phone</li>
                        <li>Always access your account directly through our official website</li>
                        <li>Use a strong, unique password for your account</li>
                    </ul>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> If you suspect unauthorized access to your account, please contact our support team immediately.
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2025 FreelanceHub. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
