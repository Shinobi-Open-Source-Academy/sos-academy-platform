import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as handlebars from 'handlebars';

export interface EmailTemplateParams {
  [key: string]: any;
}

@Injectable()
export class EmailService {
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
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context: params,
    });
  }

  /**
   * Send a community join confirmation email
   * @param to User's email address
   * @param name User's name (optional)
   */
  async sendCommunityJoinConfirmation(
    to: string,
    name?: string
  ): Promise<void> {
    const params: EmailTemplateParams = {
      name: name || 'there',
      date: new Date().toLocaleDateString(),
      communityName: 'SOS Academy',
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
