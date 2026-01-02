# Email Service

This module provides email functionality for the SOS Academy platform using the Resend SDK.

## Configuration

The email service uses the official Resend Node.js SDK. You need to set the following environment variables:

```env
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=no-reply@shinobi-open-source.academy
```

### Getting Your Resend API Key

1. Sign up for a [Resend account](https://resend.com)
2. Navigate to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Set the API key in your environment variables
5. Verify your domain in the Resend dashboard (required for sending emails)

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

- ✅ **Resend SDK Integration**: Uses the official `resend` package
- ✅ **Template Support**: Handlebars templates with fallback support
- ✅ **Logo Attachments**: Automatic logo attachment for branding
- ✅ **Error Handling**: Comprehensive error logging and fallback templates
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Environment Configuration**: Secure API key management

## Deployment Note

Make sure the `templates` directory (including the `assets` subdirectory) is included in your build. The webpack configuration should copy these files to the dist directory.

## Troubleshooting

- **API Key Issues**: Ensure your `RESEND_API_KEY` is set correctly and starts with `re_`
- **Template Not Found**: The service will automatically fall back to inline templates
- **Logo Not Showing**: Check that `templates/assets/logo.png` exists
- **Email Not Delivered**: Check your Resend dashboard for delivery status and ensure your domain is verified
- **From Address Issues**: Make sure `EMAIL_FROM` matches a verified domain/email in your Resend account
