import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly templatesPath: string;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    // Set templates directory path
    this.templatesPath = path.join(__dirname, '../templates/emails');

    // Initialize Nodemailer transporter
    // Supports SMTP, Gmail, SendGrid, etc.
    const emailConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false), // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    // Only create transporter if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.logger.log('Email service initialized with SMTP');
    } else {
      this.logger.warn(
        'Email service not configured. Set SMTP_USER and SMTP_PASS in .env to enable email sending.',
      );
    }

    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Helper for formatting currency
    Handlebars.registerHelper('formatCurrency', (value: number) => {
      return new Intl.NumberFormat('vi-VN').format(value);
    });

    // Helper for formatting date
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('vi-VN');
    });
  }

  /**
   * Load and compile template from file
   */
  private loadTemplate(templateName: string, extension: 'html' | 'txt' = 'html'): HandlebarsTemplateDelegate {
    const cacheKey = `${templateName}.${extension}`;

    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    // Load template file
    const templatePath = path.join(this.templatesPath, `${templateName}.${extension}`);
    
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);
      
      // Cache compiled template
      this.templateCache.set(cacheKey, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      this.logger.error(
        `Failed to load template ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Render template with context
   */
  private renderTemplate(templateName: string, context: Record<string, any>, extension: 'html' | 'txt' = 'html'): string {
    const template = this.loadTemplate(templateName, extension);
    return template(context);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email: string, orderData: any): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          `Email service not configured. Skipping order confirmation email to ${email}`,
        );
        return;
      }

      // Prepare context for template
      const context = {
        orderId: orderData.id || orderData.orderId || 'N/A',
        orderDate: orderData.orderDate || new Date().toLocaleDateString('vi-VN'),
        shippingAddress: orderData.shippingAddress || 'N/A',
        paymentMethod: orderData.paymentMethod || 'N/A',
        totalAmount: this.formatCurrency(orderData.totalAmount || orderData.total || 0),
        items: (orderData.items || []).map((item: any) => ({
          productName: item.product?.name || item.productName || 'Sản phẩm',
          quantity: item.quantity || item.qty || 1,
          price: this.formatCurrency(item.price || item.unit_price || 0),
          colorCode: item.colorCode,
          sizeCode: item.sizeCode,
        })),
        currentYear: new Date().getFullYear(),
      };

      // Render templates
      const htmlContent = this.renderTemplate('order-confirmation', context, 'html');
      const textContent = this.renderTemplate('order-confirmation', context, 'txt');

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER'),
        ),
        to: email,
        subject: `Xác nhận đơn hàng #${context.orderId} - Sustainique`,
        html: htmlContent,
        text: textContent,
      };

      this.logger.log(`[EmailService] Sending order confirmation to ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[EmailService] Order confirmation email sent successfully. MessageId: ${info.messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[EmailService] Failed to send order confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - email is not critical to order processing
    }
  }

  /**
   * Send shipping notification email
   */
  async sendShippingNotification(
    email: string,
    shipmentData: any,
  ): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          `Email service not configured. Skipping shipping notification to ${email}`,
        );
        return;
      }

      // Prepare context for template
      const context = {
        orderId: shipmentData.orderId || 'N/A',
        trackingNumber: shipmentData.trackingNumber || 'N/A',
        carrier: shipmentData.carrier || 'N/A',
      };

      // Render templates
      const htmlContent = this.renderTemplate('shipping-notification', context, 'html');
      const textContent = this.renderTemplate('shipping-notification', context, 'txt');

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER'),
        ),
        to: email,
        subject: `Đơn hàng #${context.orderId} đã được gửi đi - Sustainique`,
        html: htmlContent,
        text: textContent,
      };

      this.logger.log(
        `[EmailService] Sending shipping notification to ${email}`,
      );
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[EmailService] Shipping notification sent successfully. MessageId: ${info.messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[EmailService] Failed to send shipping notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          `Email service not configured. Skipping password reset email to ${email}`,
        );
        return;
      }

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';
      const resetLink = `${frontendUrl}/#forgot-password?token=${resetToken}`;

      // Prepare context for template
      const context = {
        resetLink,
      };

      // Render template
      const htmlContent = this.renderTemplate('password-reset', context, 'html');

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER'),
        ),
        to: email,
        subject: 'Đặt lại mật khẩu - Sustainique',
        html: htmlContent,
        text: `Vui lòng click vào link sau để đặt lại mật khẩu: ${resetLink}`,
      };

      this.logger.log(`[EmailService] Sending password reset to ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[EmailService] Password reset email sent successfully. MessageId: ${info.messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[EmailService] Failed to send password reset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          `Email service not configured. Skipping welcome email to ${email}`,
        );
        return;
      }

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      // Prepare context for template
      const context = {
        userName,
        frontendUrl,
      };

      // Render template
      const htmlContent = this.renderTemplate('welcome', context, 'html');

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER'),
        ),
        to: email,
        subject: 'Chào mừng đến với Sustainique!',
        html: htmlContent,
        text: `Xin chào ${userName}, cảm ơn bạn đã đăng ký tài khoản tại Sustainique!`,
      };

      this.logger.log(`[EmailService] Sending welcome email to ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[EmailService] Welcome email sent successfully. MessageId: ${info.messageId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[EmailService] Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Format currency (VND)
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
}
