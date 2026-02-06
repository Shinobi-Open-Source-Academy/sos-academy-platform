// Define fallback templates for when files aren't found
export const FALLBACK_TEMPLATES = {
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
        .github-box { background-color: #24292e; color: #fff; padding: 20px; margin: 20px 0; }
        .github-box h3 { margin-top: 0; color: #58a6ff; }
        .github-box p { margin-bottom: 0; }
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
          <div class="github-box">
            <h3>🐙 GitHub Organization Invitation Sent!</h3>
            <p>We've also sent you an invitation to join our GitHub organization. Check your email or GitHub notifications to accept the invitation and start contributing to our open-source projects!</p>
          </div>
          <p>If you have any questions, please reach out to us at contact@shinobi-open-source.academy.</p>
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
        .github-box { background-color: #24292e; color: #fff; padding: 20px; margin: 20px 0; }
        .github-box h3 { margin-top: 0; color: #58a6ff; }
        .github-box p { margin-bottom: 0; }
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
          <div class="github-box">
            <h3>🐙 GitHub Organization Invitation Sent!</h3>
            <p>We've sent you an invitation to join our GitHub organization. As a potential mentor, you'll have access to review projects and collaborate with the community. Check your email or GitHub notifications to accept!</p>
          </div>
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
  'mentor-approved': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mentor Application Approved - SOS Academy</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        .social-links a { color: #304ffe; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Dear {{name}},</p>
        <p>Your mentor application has been approved. Welcome to Shinobi Open-Source Academy!</p>
        {{#if customMessage}}<p>{{customMessage}}</p>{{/if}}
        {{#if communityNames}}<p>Communities: {{communityNames}}</p>{{/if}}
        <p>Stay connected: <a href="https://github.com/Shinobi-Open-Source-Academy">GitHub</a> | <a href="https://discord.gg/9Wgx7bCh">Discord</a>. Check your email for events.</p>
        <div class="footer">© {{currentYear}} Shinobi Open-Source Academy.</div>
      </div>
    </body>
    </html>
  `,
  'mentor-rejected': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mentor Application Update - SOS Academy</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        .social-links a { color: #304ffe; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Dear {{name}},</p>
        <p>Thank you for applying. We have decided not to move forward at this time.</p>
        <p><strong>Feedback:</strong> {{reason}}</p>
        <p>Stay connected: <a href="https://github.com/Shinobi-Open-Source-Academy">GitHub</a> | <a href="https://discord.gg/9Wgx7bCh">Discord</a>. Check your email for events.</p>
        <div class="footer">© {{currentYear}} Shinobi Open-Source Academy.</div>
      </div>
    </body>
    </html>
  `,
  'broadcast': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>{{subject}} - SOS Academy</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .event-box { background-color: #f7f9fc; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .calendar-button { display: inline-block; padding: 10px 20px; background-color: #304ffe; color: #fff; text-decoration: none; border-radius: 6px; margin: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hello {{recipientName}},</p>
        <h2>{{subject}}</h2>
        <div>{{{message}}}</div>
        {{#if eventTitle}}
        <div class="event-box">
          <h3>📅 {{eventTitle}}</h3>
          {{#if eventStartTime}}<p><strong>When:</strong> {{eventStartTime}}{{#if eventEndTime}} - {{eventEndTime}}{{/if}}</p>{{/if}}
          {{#if eventDescription}}<p>{{eventDescription}}</p>{{/if}}
          {{#if googleCalendarLink}}<a href="{{googleCalendarLink}}" class="calendar-button">Add to Google Calendar</a>{{/if}}
          {{#if outlookCalendarLink}}<a href="{{outlookCalendarLink}}" class="calendar-button">Add to Outlook</a>{{/if}}
          {{#if eventMeetingLink}}<p><a href="{{eventMeetingLink}}">Join Event →</a></p>{{/if}}
        </div>
        {{/if}}
        <p>Stay connected: <a href="https://github.com/Shinobi-Open-Source-Academy">GitHub</a> | <a href="https://discord.gg/9Wgx7bCh">Discord</a>. Check your email for events.</p>
        <div class="footer">© {{currentYear}} Shinobi Open-Source Academy.</div>
      </div>
    </body>
    </html>
  `,
};
