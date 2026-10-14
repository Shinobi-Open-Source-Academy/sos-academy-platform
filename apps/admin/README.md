# Admin Panel

Admin dashboard for managing the SOS Academy platform.

## Quick Start

```bash
# 1. Setup environment
pnpm setup:admin-env

# 2. Start backend and admin panel
pnpm dev:admin

# 3. Seed admin user (in a new terminal)
pnpm seed:admin

# 4. Access at http://localhost:3001
# Login: admin@shinobi-open-source.academy / admin123
```

## Environment Setup

**Backend `.env` (root level):**
```bash
ADMIN_EMAIL=admin@shinobi-open-source.academy
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
NOTESBOT_API_URL=https://api.notesbot.io/v1
NOTESBOT_API_KEY=your-notesbot-api-key
```

**Admin `.env.local` (this folder):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4200/api
```

> ⚠️ Admin credentials go in **backend** `.env` only, NOT here!

**Environment Variables:**
- `NOTESBOT_API_URL` - NotesBot API base URL (default: https://api.notesbot.io/v1)
- `NOTESBOT_API_KEY` - NotesBot API authentication key (required for calendar integration)

## Features

- 📊 Dashboard with stats
- 👨‍💻 Mentor application reviews
- 👥 Member registration management
- 📅 Event creation & calendar links

## Admin User Seeding

The admin user is **automatically created** on server startup if it doesn't exist. You can also manually manage it:

```bash
# Seed admin user manually (creates if doesn't exist)
pnpm seed:admin

# Reset admin user (deletes and recreates)
pnpm seed:admin:reset
```

> ✅ **Auto-Seed:** When the server starts, it automatically checks and creates the admin user if missing.

**API Endpoints:**
- `POST /api/seeder/admin/seed` - Create admin user
- `POST /api/seeder/admin/reset` - Reset admin user
- `POST /api/seeder/admin/clear` - Delete admin user

The admin user is created with:
- **Role:** KAGE
- **Status:** ACTIVE
- **Password:** Hashed using bcrypt (salt rounds: 10)
- **Email & Password:** From `ADMIN_EMAIL` and `ADMIN_PASSWORD` in backend `.env`

## Production

Change credentials in backend `.env`:
```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
```

Then reset the admin user to apply the new credentials:
```bash
pnpm seed:admin:reset
```
