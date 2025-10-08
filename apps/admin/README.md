# Admin Panel

Admin dashboard for managing the SOS Academy platform.

## Quick Start

```bash
# Setup environment
pnpm setup:admin-env

# Start admin panel (includes backend)
pnpm dev:admin

# Access at http://localhost:4200
# Login: admin@shinobi-open-source.academy / admin123
```

## Environment Setup

**Backend `.env` (root level):**
```bash
ADMIN_EMAIL=admin@shinobi-open-source.academy
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**Admin `.env.local` (this folder):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4200/api
```

> ⚠️ Admin credentials go in **backend** `.env` only, NOT here!

## Features

- 📊 Dashboard with stats
- 👨‍💻 Mentor application reviews
- 👥 Member registration management
- 📅 Event creation & calendar links

## Production

Change credentials in backend `.env`:
```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
```
