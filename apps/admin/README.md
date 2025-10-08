# SOS Academy Admin Panel

Simple admin panel for managing the Shinobi Open-Source Academy platform.

## Features

- 🔐 **Simple Authentication** - Hardcoded credentials for MVP
- 📊 **Dashboard** - View key platform statistics
- 👨‍💻 **Mentor Applications** - Review and approve/reject mentor applications
- 👥 **Member Registrations** - Manage pending member registrations
- 📅 **Event Management** - Create and manage academy events with calendar links

## Getting Started

### Development

1. Start the backend server:
```bash
pnpm start:backend
```

2. Start the admin panel:
```bash
npx nx serve admin
```

3. Access the admin panel at `http://localhost:4200` (or configured port)

### Default Credentials

```
Email: admin@shinobi-open-source.academy
Password: admin123
```

> ⚠️ **Important**: Change these credentials in production by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

### Environment Variables

```bash
# Admin credentials
ADMIN_EMAIL=admin@shinobi-open-source.academy
ADMIN_PASSWORD=admin123

# API URL
NEXT_PUBLIC_API_URL=http://localhost:4200/api
```

## Features Guide

### Dashboard
- View total users, pending applications, and active members
- Quick actions to review applications and create events

### Mentor Applications
- Review pending mentor applications
- View applicant details, GitHub profile, expertise, and motivation
- Approve or reject applications

### Member Registrations
- Review pending member sign-ups
- View requested communities
- Approve registrations

### Event Management
- Create academy-wide or community-specific events
- Generate Google Calendar invite links
- Set meeting links, dates, and event types
- Delete events

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS
- **API**: Shared backend API
- **Authentication**: Simple localStorage-based auth (MVP)

## Docker Deployment

The admin panel is included in the docker-compose setup:

```bash
docker-compose up -d admin
```

Access at `http://localhost:3001`

## Future Enhancements

- [ ] Proper OAuth authentication
- [ ] Role-based access control (multiple admins)
- [ ] Activity logs and audit trail
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Email notifications
