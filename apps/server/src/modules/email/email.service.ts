import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as handlebars from 'handlebars';
import { Resend } from 'resend';
import { FALLBACK_TEMPLATES } from './templates/constants/email-template-fallback.constant';

// Get the directory where the compiled code lives (works with webpack bundling)
const TEMPLATES_DIR = join(__dirname, 'modules/email/templates');

export interface EmailTemplateParams {
  [key: string]: string | number | boolean | Date | string[] | undefined;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') || 'no-reply@shinobi-open-source.academy';

    this.logger.log('Resend initialized successfully');
  }

  /**
   * Load and compile email template
   * @param template Template name (without extension)
   * @param params Template parameters
   * @param subject Email subject (for fallback)
   * @returns Compiled HTML string
   */
  private loadTemplate(template: string, params: EmailTemplateParams, subject: string): string {
    // Try multiple paths: production (relative to __dirname) and development (src folder)
    const possiblePaths = [
      join(TEMPLATES_DIR, `${template}.hbs`), // Production: dist/apps/server/modules/email/templates/
      resolve(process.cwd(), 'src/modules/email/templates', `${template}.hbs`), // Dev fallback
      resolve(process.cwd(), 'apps/server/src/modules/email/templates', `${template}.hbs`), // Monorepo dev
    ];

    let templatePath: string | null = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        templatePath = path;
        break;
      }
    }

    if (!templatePath) {
      this.logger.warn(
        `Template file not found in any of: ${possiblePaths.join(', ')}, using fallback template`
      );
      return this.getFallbackTemplate(template, params, subject);
    }

    try {
      this.logger.log(`Loading template from: ${templatePath}`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(params);
    } catch (error) {
      this.logger.warn(
        `Failed to compile template ${template}, using fallback. Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return this.getFallbackTemplate(template, params, subject);
    }
  }

  private getFallbackTemplate(
    template: string,
    params: EmailTemplateParams,
    subject: string
  ): string {
    const fallbackTemplate =
      FALLBACK_TEMPLATES[template] || `<h1>${subject}</h1><p>Hello ${params.name || 'there'}!</p>`;
    const compiledTemplate = handlebars.compile(fallbackTemplate);
    return compiledTemplate(params);
  }

  /**
   * Prepare logo attachment for inline display
   * @returns Array of attachments with logo, or empty array if logo not found
   */
  private prepareLogoAttachment(): Array<{
    filename: string;
    content: string;
    contentId?: string;
  }> {
    // Try multiple paths for logo
    const possiblePaths = [
      join(TEMPLATES_DIR, 'assets/logo.png'), // Production
      resolve(process.cwd(), 'src/modules/email/templates/assets/logo.png'), // Dev fallback
      resolve(process.cwd(), 'apps/server/src/modules/email/templates/assets/logo.png'), // Monorepo dev
    ];

    let logoPath: string | null = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        logoPath = path;
        break;
      }
    }

    if (!logoPath) {
      this.logger.warn(`Logo file not found in any of: ${possiblePaths.join(', ')}`);
      return [];
    }

    try {
      this.logger.log(`Loading logo from: ${logoPath}`);
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');

      return [
        {
          filename: 'logo.png',
          content: logoBase64,
          contentId: 'logo',
        },
      ];
    } catch (error) {
      this.logger.error(
        `Failed to load logo: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Send a templated email using Resend SDK
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

      const html = this.loadTemplate(template, params, subject);
      const attachments = this.prepareLogoAttachment();

      // Prepare Resend email payload with attachments
      const emailPayload = {
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      // Send email using Resend SDK
      const { data, error } = await this.resend.emails.send(emailPayload);

      if (error) {
        this.logger.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      this.logger.log(`Email sent successfully to: ${to}`);
      this.logger.log(`Resend email ID: ${data?.id || 'N/A'}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
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
      applicationReviewPeriod: '1-5 business days',
    };

    await this.sendTemplatedEmail(
      to,
      'Your Shinobi Open-Source Academy Mentor Application Has Been Received',
      'mentor-application',
      params
    );
  }

  /**
   * Send mentor approval email (same template style as other emails, with follow-up actions)
   * @param to Mentor's email address
   * @param name Mentor's name
   * @param customMessage Optional custom message from admin
   * @param communityNames Comma-separated community names the mentor will lead
   */
  async sendMentorApprovedEmail(
    to: string,
    name: string,
    customMessage?: string,
    communityNames?: string
  ): Promise<void> {
    const params: EmailTemplateParams = {
      name,
      date: new Date().toLocaleDateString(),
      currentYear: new Date().getFullYear(),
      customMessage: customMessage ?? '',
      communityNames: communityNames ?? 'our communities',
    };

    await this.sendTemplatedEmail(
      to,
      'Welcome as a Mentor at Shinobi Open-Source Academy',
      'mentor-approved',
      params
    );
  }

  /**
   * Send mentor rejection email (same template style, with follow-up actions)
   * @param to Applicant's email address
   * @param name Applicant's name
   * @param reason Reason for rejection (required)
   */
  async sendMentorRejectedEmail(to: string, name: string, reason: string): Promise<void> {
    const params: EmailTemplateParams = {
      name,
      date: new Date().toLocaleDateString(),
      currentYear: new Date().getFullYear(),
      reason,
    };

    await this.sendTemplatedEmail(
      to,
      'Update on Your Mentor Application – Shinobi Open-Source Academy',
      'mentor-rejected',
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
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        this.logger.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      this.logger.log(`Simple email sent successfully to: ${to}`);
      this.logger.log(`Resend email ID: ${data?.id || 'N/A'}`);
    } catch (error) {
      this.logger.error(`Failed to send simple email to ${to}:`, error);
      throw error;
    }
  }
}
