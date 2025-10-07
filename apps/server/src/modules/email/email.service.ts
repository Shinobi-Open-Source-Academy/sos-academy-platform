import * as fs from 'node:fs';
import { join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import * as handlebars from 'handlebars';

export interface EmailTemplateParams {
  [key: string]: string | number | boolean | Date | string[] | undefined;
}

// Define fallback templates for when files aren't found
const FALLBACK_TEMPLATES = {
  'community-join': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Welcome to SOS Academy!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to <strong>Shinobi Open-Source Academy</strong>!</h1>
        </div>
        <div class="content">
          <p>Hello {{name}},</p>
          <p>Thank you for expressing interest in joining the {{communityName}} community! We're thrilled to have you with us.</p>
          <p>Your registration has been successfully received on {{date}}. Our team is currently reviewing your application, and we'll be in touch shortly with next steps.</p>
          <p>If you have any questions, please reach out to us at support@shinobi-open-source.academy.</p>
          <p>Best regards,<br>The <strong>Shinobi Open-Source Academy</strong> Team</p>
        </div>
        <div class="footer">
          <p>© {{currentYear}} <strong>Shinobi Open-Source Academy</strong>. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  'mentor-application': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mentor Application Received - SOS Academy</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        .timeline { background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mentor Application Received</h1>
        </div>
        <div class="content">
          <p>Dear {{name}},</p>
          <p>Thank you for applying to become a mentor at <strong>Shinobi Open-Source Academy</strong>. We've received your application on {{date}} and are excited about your interest in contributing to our community.</p>
          <div class="timeline">
            <h3>What Happens Next</h3>
            <p>Our team will carefully review your application within the next {{applicationReviewPeriod}}.</p>
          </div>
          <p>Best regards,<br>The <strong>Shinobi Open-Source Academy</strong> Team</p>
        </div>
        <div class="footer">
          <p>© {{currentYear}} <strong>Shinobi Open-Source Academy</strong>. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

interface SendGridMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  trackingSettings?: {
    clickTracking: {
      enable: boolean;
      enableText: boolean;
    };
  };
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
    contentId: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor() {
    // Initialize SendGrid with API key from environment
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }

    sgMail.setApiKey(apiKey);
    this.fromEmail = process.env.EMAIL_FROM || 'no-reply@shinobi-open-source.academy';

    this.logger.log('SendGrid initialized successfully');
  }

  /**
   * Send a templated email using SendGrid SDK
   * @param to Recipient email address
   * @param subject Email subject
   * @param template Template name (without extension)
   * @param params Template parameters
   */
  async sendTemplatedEmail(
    to: string,
    subject: string,
    template: string,
    params: EmailTemplateParams
  ): Promise<void> {
    try {
      this.logger.log(`📧 Sending email to: ${to}`);
      this.logger.log(`📧 Subject: ${subject}`);
      this.logger.log(`📧 Template: ${template}`);

      // Try to load template from file first
      let html: string;
      try {
        const templatePath = join(__dirname, 'templates', `${template}.hbs`);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const compiledTemplate = handlebars.compile(templateContent);
        html = compiledTemplate(params);
      } catch (_error) {
        this.logger.warn(`Template file not found for ${template}, using fallback template.`);
        const fallbackTemplate =
          FALLBACK_TEMPLATES[template] ||
          `<h1>${subject}</h1><p>Hello ${params.name || 'there'}!</p>`;
        const compiledTemplate = handlebars.compile(fallbackTemplate);
        html = compiledTemplate(params);
      }

      // Prepare SendGrid message
      const msg = {
        to,
        from: this.fromEmail,
        subject,
        html,
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
        },
        attachments: [],
      };

      // Add logo attachment
      const logoPath = join(
        process.cwd(),
        'apps',
        'server',
        'src',
        'modules',
        'email',
        'templates',
        'assets',
        'logo.png'
      );
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');

        msg.attachments = [
          {
            content: logoBase64,
            filename: 'logo.png',
            type: 'image/png',
            disposition: 'inline',
            contentId: 'logo',
          },
        ];

        this.logger.log(`📎 Logo attachment added: ${logoPath}`);
      } else {
        this.logger.warn(`⚠️ Logo file not found: ${logoPath}`);
      }

      // Send email using SendGrid SDK
      const response = await sgMail.send(msg);

      this.logger.log(`Email sent successfully to: ${to}`);
      this.logger.log(`SendGrid response status: ${response[0].statusCode}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a community join confirmation email
   * @param to User's email address
   * @param name User's name (optional)
   * @param communities Selected communities (optional)
   */
  async sendCommunityJoinConfirmation(
    to: string,
    name?: string,
    communities?: string[]
  ): Promise<void> {
    const params: EmailTemplateParams = {
      name: name || 'there',
      date: new Date().toLocaleDateString(),
      currentYear: new Date().getFullYear(),
      communityName: 'Shinobi Open-Source Academy',
      communities: communities
        ? communities.map((c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()).join(', ')
        : 'your selected communities',
    };

    await this.sendTemplatedEmail(
      to,
      'Welcome to Shinobi Open-Source Academy Community!',
      'community-join',
      params
    );
  }

  /**
   * Send a mentor application confirmation email
   * @param to User's email address
   * @param name User's name
   */
  async sendMentorApplicationConfirmation(to: string, name: string): Promise<void> {
    const params: EmailTemplateParams = {
      name,
      date: new Date().toLocaleDateString(),
      currentYear: new Date().getFullYear(),
      applicationReviewPeriod: '5-7 business days',
    };

    await this.sendTemplatedEmail(
      to,
      'Your Shinobi Open-Source Academy Mentor Application Has Been Received',
      'mentor-application',
      params
    );
  }

  /**
   * Utility method to send a simple email (for testing)
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content
   */
  async sendSimpleEmail(to: string, subject: string, html: string): Promise<void> {
    const msg = {
      to,
      from: this.fromEmail,
      subject,
      html,
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false,
        },
      },
    };

    try {
      const response = await sgMail.send(msg);
      this.logger.log(`✅ Simple email sent successfully to: ${to}`);
      this.logger.log(`📊 SendGrid response status: ${response[0].statusCode}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send simple email to ${to}:`, error);
      throw error;
    }
  }
}
