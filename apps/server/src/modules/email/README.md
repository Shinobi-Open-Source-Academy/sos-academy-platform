# Email Service

This module provides email functionality for the SOS Academy platform using the SendGrid SDK.

## Configuration

The email service uses the official SendGrid Node.js SDK. You need to set the following environment variables:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=no-reply@shinobi-open-source.academy
```

### Getting Your SendGrid API Key

1. Sign up for a [SendGrid account](https://sendgrid.com)
2. Enable Two-factor authentication
3. Create an API key with **Mail Send** > **Full Access** permissions
4. Set the API key in your environment variables

## Templates

Email templates are located in the `templates` directory and use Handlebars for templating. Each template is an `.hbs` file.

Available templates:

- `community-join.hbs` - Sent when a user joins the community
- `mentor-application.hbs` - Sent when a user applies to be a mentor

## Logo

The email templates include a local logo from `templates/assets/shinobiLogo.png`. The logo is automatically attached to emails and referenced as `cid:logo` in the templates.

## Usage

Inject the `EmailService` into your service and use one of the available methods:

```typescript
constructor(private readonly emailService: EmailService) {}

// Send community join confirmation
await this.emailService.sendCommunityJoinConfirmation('user@example.com', 'User Name');

// Send mentor application confirmation
await this.emailService.sendMentorApplicationConfirmation('mentor@example.com', 'Mentor Name');

// Send a simple email
await this.emailService.sendSimpleEmail('user@example.com', 'Subject', '<h1>Hello!</h1>');
```

## Features

- ✅ **SendGrid SDK Integration**: Uses the official `@sendgrid/mail` package
- ✅ **Template Support**: Handlebars templates with fallback support
- ✅ **Logo Attachments**: Automatic logo attachment for branding
- ✅ **Error Handling**: Comprehensive error logging and fallback templates
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Environment Configuration**: Secure API key management

## Deployment Note

Make sure the `templates` directory (including the `assets` subdirectory) is included in your build. If using NX, you may need to update your build configuration to include these files.

## Troubleshooting

- **API Key Issues**: Ensure your `SENDGRID_API_KEY` is set correctly
- **Template Not Found**: The service will automatically fall back to inline templates
- **Logo Not Showing**: Check that `templates/assets/shinobiLogo.png` exists
- **Email Not Delivered**: Check your SendGrid dashboard for delivery status
