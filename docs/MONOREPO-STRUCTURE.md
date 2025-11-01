# SOS Academy Monorepo Structure

**Last Updated:** November 1, 2025

This document describes the simplified, minimal monorepo structure for the SOS Academy platform.

---

## 🎯 Philosophy

This monorepo is designed to be **minimal** and **standalone**:
- Only 2 applications: `admin` and `server`
- No shared libraries (each app is self-contained)
- No Docker dependencies (simple local development)
- Each app can be deployed independently
- Using Nx for workspace management and task running

---

## 📁 Project Structure

```
sos-academy-platform/
├── apps/
│   ├── admin/              # Next.js Admin Panel (Port 3001)
│   │   ├── app/           # Next.js app directory
│   │   ├── lib/           # Admin-specific utilities
│   │   ├── public/        # Static assets
│   │   ├── project.json   # Nx project configuration
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── server/            # NestJS Backend API (Port 4200)
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   ├── common/    # Shared utilities (within server)
│   │   │   └── main.ts
│   │   ├── project.json   # Nx project configuration
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── webpack.config.js
│   │
│   └── server-e2e/        # E2E tests for server
│       ├── src/
│       ├── project.json
│       └── tsconfig.json
│
├── docs/                   # Documentation
│   ├── old-frontend-content-backup.md
│   ├── old-frontend-technical-structure.md
│   ├── old-frontend-quick-reference.md
│   └── README.md
│
├── node_modules/          # Shared dependencies
├── .nx/                   # Nx cache
├── dist/                  # Build outputs
│
├── package.json           # Root package.json with workspace scripts
├── pnpm-workspace.yaml    # PNPM workspace configuration
├── nx.json                # Nx workspace configuration
├── tsconfig.base.json     # Base TypeScript configuration
├── biome.jsonc           # Code formatting and linting
│
├── README.md              # Main documentation
├── CONTRIBUTING.md        # Contribution guidelines
├── CODE_OF_CONDUCT.md     # Community guidelines
├── LICENSE                # MIT License
└── SECURITY.md            # Security policy
```

---

## 🚀 Applications

### 1. Admin Panel (`apps/admin`)

**Technology:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4

**Purpose:**
- Platform administration
- User management (approve mentors, members)
- Event creation and management
- Dashboard with statistics

**Port:** 3001

**Independence:**
- Self-contained Next.js app
- Only dependency: Backend API via `NEXT_PUBLIC_API_URL`
- Can be deployed separately to any Next.js hosting (Vercel, etc.)

---

### 2. Backend Server (`apps/server`)

**Technology:**
- NestJS
- MongoDB + Mongoose
- SendGrid (emails)
- Handlebars (email templates)

**Purpose:**
- RESTful API
- User registration and authentication
- Community management
- Email notifications
- Database seeding

**Port:** 4200

**Independence:**
- Standalone NestJS application
- Only external dependency: MongoDB
- Can be deployed separately to any Node.js hosting

---

## 🔧 Nx Configuration

### Workspace Configuration (`nx.json`)

Plugins enabled:
- `@nx/next` - Next.js support
- `@nx/jest` - Testing support
- `@nx/webpack` - NestJS bundling

### Project Configurations

Each app has its own `project.json` with:
- **dev** - Start development server
- **build** - Build for production
- **start** - Start production server
- **test** - Run tests
- **lint** - Lint code

---

## 📦 Package Management

**Package Manager:** pnpm v10.18.1

**Workspace Structure:**
- Root `package.json` contains:
  - All devDependencies (shared build tools)
  - All dependencies (shared runtime dependencies)
  - Workspace scripts
- No individual `package.json` in apps (dependencies managed at root)

**Benefits:**
- Single lockfile (`pnpm-lock.yaml`)
- Shared dependency cache
- Consistent versions across all apps

---

## 🛠️ Available Scripts

### Development

```bash
pnpm dev                # Start backend server
pnpm dev:backend        # Start backend only
pnpm dev:admin          # Start admin panel
pnpm dev:admin:full     # Start backend + admin together
```

### Build

```bash
pnpm build              # Build backend
pnpm build:backend      # Build backend only
pnpm build:admin        # Build admin panel
pnpm build:all          # Build backend + admin
```

### Production

```bash
pnpm start              # Start backend server
pnpm start:backend      # Start backend only
pnpm start:admin        # Start admin panel
pnpm start:all          # Start backend + admin together
```

### Code Quality

```bash
pnpm format             # Format all code with Biome
pnpm format:check       # Check formatting
pnpm lint               # Lint code
pnpm lint:fix           # Fix linting issues
pnpm check              # Check format + lint
pnpm check:fix          # Fix format + lint
```

### Database

```bash
pnpm seed               # Seed database
pnpm seed:clear         # Clear database
pnpm seed:reset         # Reset database
pnpm seed:status        # Check seed status
```

---

## 🔄 Deployment Strategy

### Each App is Independently Deployable

#### Admin Panel
```bash
cd apps/admin
pnpm install
pnpm build
pnpm start
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**Deployment Options:**
- Vercel
- Netlify
- Any Node.js hosting

---

#### Backend Server
```bash
cd apps/server
pnpm install
pnpm build
pnpm start
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=4200
MONGODB_URI=mongodb+srv://...
SENDGRID_API_KEY=...
JWT_SECRET=...
```

**Deployment Options:**
- Railway
- Render
- DigitalOcean
- AWS/Azure/GCP
- Any Node.js hosting

---

## 🎯 Key Design Decisions

### Why No Shared Libraries?

**Current State:**
- `libs/shared` exists but is NOT used by any app
- Path mappings removed from `tsconfig.base.json`

**Reasoning:**
1. **Simplicity** - Easier to understand and maintain
2. **Independence** - Each app is truly standalone
3. **Deployment** - No build dependencies between apps
4. **Future-Ready** - Can add shared libs when actually needed

### Why No Docker?

**Current State:**
- All Docker files removed
- No `docker-compose.yml`

**Reasoning:**
1. **Local Development** - Simpler setup, faster iteration
2. **Cloud Native** - Modern PaaS handles containerization
3. **Optional** - Can add back later if needed
4. **Minimal Complexity** - Reduces onboarding friction

### Why Nx?

**Benefits:**
1. **Task Running** - Efficient build and dev commands
2. **Caching** - Speeds up repeated builds
3. **Workspace Management** - Easy to add new apps
4. **Plugin Ecosystem** - Ready for future needs

---

## 📊 Current Status

### ✅ Fully Functional
- [x] Admin Panel (Next.js)
- [x] Backend Server (NestJS)
- [x] E2E Tests (server-e2e)
- [x] Database Seeding
- [x] Email Integration
- [x] Code Quality Tools (Biome)

### ⏳ Coming Soon
- [ ] Frontend Public Website (to be created)

### ❌ Removed
- [x] Old Frontend (documented and removed)
- [x] Docker Setup (removed for simplicity)
- [x] Shared Library (unused, kept for reference)

---

## 🔐 Independent Deployment Checklist

### For Admin Panel:
- [ ] Build app: `pnpm build:admin`
- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Deploy to Next.js hosting
- [ ] No other dependencies needed

### For Backend Server:
- [ ] Build app: `pnpm build:backend`
- [ ] Set all environment variables (MongoDB, SendGrid, JWT)
- [ ] Deploy to Node.js hosting
- [ ] Ensure MongoDB is accessible
- [ ] No other dependencies needed

---

## 📚 Additional Resources

- [README.md](./README.md) - Main documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [docs/](./docs/) - Old frontend content backup
- [Nx Documentation](https://nx.dev)

---

**Summary:** This is a clean, minimal monorepo with 2 standalone applications that can be deployed independently. No Docker, no shared libraries, just simple and maintainable code.
