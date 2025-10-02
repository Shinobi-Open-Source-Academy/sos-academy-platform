import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';

export interface EmailTemplateParams {
  [key: string]: any;
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
          <h1>Welcome to SOS Academy!</h1>
        </div>
        <div class="content">
          <p>Hello {{name}},</p>
          <p>Thank you for expressing interest in joining the {{communityName}} community! We're thrilled to have you with us.</p>
          <p>Your registration has been successfully received on {{date}}. Our team is currently reviewing your application, and we'll be in touch shortly with next steps.</p>
          <p>If you have any questions, please reach out to us at support@sos-academy.org.</p>
          <p>Best regards,<br>The SOS Academy Team</p>
        </div>
        <div class="footer">
          <p>© 2023 SOS Academy. All rights reserved.</p>
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
          <p>Thank you for applying to become a mentor at SOS Academy. We've received your application on {{date}} and are excited about your interest in contributing to our community.</p>
          <div class="timeline">
            <h3>What Happens Next</h3>
            <p>Our team will carefully review your application within the next {{applicationReviewPeriod}}.</p>
          </div>
          <p>Best regards,<br>The SOS Academy Team</p>
        </div>
        <div class="footer">
          <p>© 2023 SOS Academy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send a templated email
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
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: params,
      });
    } catch (error) {
      // If there's an error with the template file, fall back to inline template
      if (error.message && error.message.includes('ENOENT')) {
        this.logger.warn(
          `Template file not found for ${template}, using fallback template.`
        );
        await this.sendInlineTemplateEmail(
          to,
          subject,
          FALLBACK_TEMPLATES[template] ||
            `<h1>${subject}</h1><p>Hello ${params.name || 'there'}!</p>`,
          params
        );
      } else {
        throw error;
      }
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
      communityName: 'SOS Academy',
      communities: communities ? communities.join(', ') : 'your selected communities',
    };

    await this.sendTemplatedEmail(
      to,
      'Welcome to SOS Academy Community!',
      'community-join',
      params
    );
  }

  /**
   * Send a mentor application confirmation email
   * @param to User's email address
   * @param name User's name
   */
  async sendMentorApplicationConfirmation(
    to: string,
    name: string
  ): Promise<void> {
    const params: EmailTemplateParams = {
      name,
      date: new Date().toLocaleDateString(),
      applicationReviewPeriod: '5-7 business days',
    };

    await this.sendTemplatedEmail(
      to,
      'Your SOS Academy Mentor Application Has Been Received',
      'mentor-application',
      params
    );
  }

  /**
   * Utility method to use inline templates for testing or simple emails
   * @param to Recipient email address
   * @param subject Email subject
   * @param templateContent The raw template content
   * @param params Parameters for the template
   */
  async sendInlineTemplateEmail(
    to: string,
    subject: string,
    templateContent: string,
    params: EmailTemplateParams
  ): Promise<void> {
    const template = handlebars.compile(templateContent);
    const html = template(params);

    await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }
}
