# Email Service

This module provides email functionality for the SOS Academy platform.

## Configuration

The email service uses NestJS Mailer with SendGrid as the default SMTP provider. You can configure it by setting the following environment variables:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=YOUR_SENDGRID_API_KEY
EMAIL_FROM=no-reply@sos-academy.org
```

## Templates

Email templates are located in the `templates` directory and use Handlebars for templating. Each template is an `.hbs` file.

Available templates:

- `community-join.hbs` - Sent when a user joins the community
- `mentor-application.hbs` - Sent when a user applies to be a mentor

## Usage

Inject the `EmailService` into your service and use one of the available methods:

```typescript
constructor(private readonly emailService: EmailService) {}

// Send community join confirmation
await this.emailService.sendCommunityJoinConfirmation('user@example.com', 'User Name');

// Send mentor application confirmation
await this.emailService.sendMentorApplicationConfirmation('mentor@example.com', 'Mentor Name');
```

## Deployment Note

Make sure the `templates` directory is included in your build. If using NX, you may need to update your build configuration to include these files.
