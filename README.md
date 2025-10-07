# SOS Academy Platform

<div align="center">

🚀 **Shinobi Open-Source Academy** - Empowering the Next Generation of Open-Source Warriors

[![CI](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of-Conduct-blue.svg)](CODE_OF_CONDUCT.md)
[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?color=7389D8&label=Discord&logo=discord&logoColor=ffffff)](https://discord.gg/9Wgx7bCh)

[Features](#-mvp-features) • [Quick Start](#-quick-start) • [Contributing](CONTRIBUTING.md) • [Documentation](#-api-endpoints) • [Community](#-community)

</div>

---

A modern platform built with Next.js, NestJS, and MongoDB that connects aspiring developers with experienced mentors and real-world open-source projects.

## 🎯 MVP Features

- **User Subscription**: Join communities with email and community selection
- **Mentor Applications**: Apply to become a mentor with streamlined process
- **Community Management**: 5 specialized communities (JavaScript, Python, Go, Java, Ruby)
- **Email Notifications**: Professional email templates with SendGrid integration
- **GitHub Integration**: Automatic profile enrichment from GitHub handles
- **Database Seeders**: Smart seeding system to populate communities
- **Beautiful UI**: Modern, responsive design with modal-based forms
- **API Documentation**: Full Swagger/OpenAPI documentation

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: NestJS + MongoDB + Mongoose
- **Email**: SendGrid integration with Handlebars templates
- **Monorepo**: Nx workspace for efficient development

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- SendGrid account (for emails)

### Environment Setup

#### Quick Setup

```sh
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values (MongoDB URI, SendGrid API key, etc.)
nano .env
```

#### Backend Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# =============================================================================
# REQUIRED ENVIRONMENT VARIABLES
# =============================================================================

# MongoDB Connection String (Required)
MONGODB_URI=mongodb://localhost:27017/sos-academy

# JWT Secret (Required - change this in production!)
JWT_SECRET=your_secure_jwt_secret_key_here

# SendGrid API Key (Required for email functionality)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# =============================================================================
# OPTIONAL ENVIRONMENT VARIABLES (with defaults)
# =============================================================================

# Server Configuration
NODE_ENV=development
PORT=4200
HOST=0.0.0.0
LOG_LEVEL=info

# Public Application URL (optional - auto-detected if not set)
# Production: https://api.yourdomain.com
# Local: leave empty (auto-detects as http://localhost:4200)
APP_URL=

# JWT Configuration
JWT_EXPIRATION=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_FROM=no-reply@shinobi-open-source.academy

# GitHub API (Optional - for GitHub profile fetching)
GITHUB_TOKEN=your_github_token_here

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================

# Frontend Port
FRONTEND_PORT=3000

# Backend API URL (used by frontend to make API calls)
NEXT_PUBLIC_API_URL=http://localhost:4200/api

# Base Server URL (internal backend URL)
BASE_SERVER_URL=http://localhost:4200
```

#### Frontend Configuration

Create `apps/frontend/.env.local`:

```env
# API URL for backend communication
NEXT_PUBLIC_API_URL=http://localhost:4200/api
```

### Development

#### Quick Start (Recommended)

```sh
# Install dependencies
pnpm install

# Start MongoDB (if running locally)
mongod

# Start both backend and frontend at once
pnpm start
```

This will start both services in parallel:
- Backend: http://localhost:4200
- Frontend: http://localhost:3000

#### Individual Services

```sh
# Start backend only
pnpm start:backend

# Start frontend only
pnpm start:frontend
```

**Note**: The backend automatically checks and seeds the database on startup if it's empty. You can also manually seed using:
```sh
npx nx run server:seed
```

#### Option 2: Docker (Recommended for Production)

**Prerequisites for Docker:**
- Docker and Docker Compose installed
- `.env` file with required variables (especially `SENDGRID_API_KEY`, `JWT_SECRET`, `MONGODB_URI`)

```sh
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Update MONGODB_URI to use Docker service name
# MONGODB_URI=mongodb://mongodb:27017/sos-academy
nano .env

# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f
```

**Important Docker Configuration:**
- The `MONGODB_URI` should use the Docker service name: `mongodb://mongodb:27017/sos-academy`
- Frontend will be accessible at: http://localhost:3000
- Backend API at: http://localhost:4200
- API Documentation at: http://localhost:4200/api/docs
- MongoDB will persist data in a Docker volume
- **Database auto-seeds on first startup** - no manual seeding required!

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4200
- API Documentation: http://localhost:4200/api/docs

### Available Scripts

```sh
# Development
pnpm start              # Start both backend and frontend
pnpm start:backend      # Start backend only
pnpm start:frontend     # Start frontend only

# Build
pnpm build              # Build both projects
pnpm build:backend      # Build backend only
pnpm build:frontend     # Build frontend only

# Code Quality
pnpm format             # Format all code
pnpm format:check       # Check formatting
pnpm lint               # Lint code
pnpm lint:fix           # Lint and fix issues
pnpm check              # Check format + lint
pnpm check:fix          # Fix format + lint

# Database Seeding
pnpm seed               # Seed database
pnpm seed:clear         # Clear database
pnpm seed:reset         # Reset database
pnpm seed:status        # Check seed status
```

### Deployment Configuration

When deploying to production or remote environments, configure the following environment variables:

**Backend:**
```env
NODE_ENV=production
HOST=0.0.0.0
APP_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sos-academy
SENDGRID_API_KEY=your_production_sendgrid_key
JWT_SECRET=your_secure_production_secret
CORS_ORIGIN=https://yourdomain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**Important Notes:**
- `HOST=0.0.0.0` allows the server to accept connections from any IP (required in containerized/cloud environments)
- `APP_URL` should be your public-facing URL (used in logs and responses)
- If `APP_URL` is not set, the system will auto-detect using `HOST` and `PORT`
- Always use HTTPS URLs in production for security

### Docker Commands

```sh
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up --build

# Seed database (after services are running)
docker-compose exec backend node seed-docker.js seed

# Clear database
docker-compose exec backend node seed-docker.js clear

# Reset database (clear + seed)
docker-compose exec backend node seed-docker.js reset

# Check seeding status
docker-compose exec backend node seed-docker.js status

# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh sos-academy
```

### Code Formatting

```sh
# Format all code
pnpm run format

# Check formatting without fixing
pnpm run format:check

# Lint and fix issues
pnpm run lint:fix

# Check everything (format + lint)
pnpm run check

# Fix everything (format + lint)
pnpm run check:fix
```

**Pre-commit Hook**: Code is automatically formatted before each commit using Husky and lint-staged. Linting is available via npm scripts but not enforced on commit to avoid blocking development.

### Code Quality Tools

This project uses **Biome** for code formatting and linting instead of ESLint/Prettier for better performance and consistency. All ESLint configurations have been removed to avoid conflicts.

**Key Features:**
- **Fast**: Biome is 10-100x faster than ESLint/Prettier
- **All-in-one**: Combines formatting and linting in a single tool
- **Zero config**: Works out of the box with sensible defaults
- **Pre-commit hooks**: Automatically formats code before commits

**Configuration:**
- **Formatter**: 2-space indentation, single quotes, semicolons
- **Linter**: Enforces code quality rules and best practices
- **Import organization**: Automatically sorts and organizes imports
- **File exclusions**: Ignores build artifacts, dependencies, and generated files

**IDE Integration:**
- Install the Biome extension for your editor (VS Code, WebStorm, etc.)
- The extension will show formatting issues and auto-fix on save
- Pre-commit hooks ensure consistent formatting across the team

**VS Code Setup:**
- The project includes `.vscode/settings.json` with optimal Biome configuration
- Auto-formatting and import organization on save is enabled
- Recommended extensions are listed in `.vscode/extensions.json`
- Debug configurations for both frontend and backend are available
- Common development tasks can be run via VS Code's task runner

## 📋 API Endpoints

Full API documentation is available at: http://localhost:4200/api/docs (Swagger UI)

### User Management

- `POST /api/users/subscribe` - Subscribe to newsletter
- `POST /api/users/join/community` - Join communities
- `POST /api/users/mentor-application` - Apply as mentor
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Communities

- `GET /api/communities` - Get all communities
- `GET /api/communities/:id` - Get community by ID

### Database Seeding (Development)

- `POST /api/seeder/seed` - Seed communities
- `POST /api/seeder/clear` - Clear all communities
- `POST /api/seeder/reset` - Reset database (clear + seed)
- `GET /api/seeder/status` - Check seeding status

### Subscription Flow

1. User fills subscription form with email, name, communities, and optional GitHub handle
2. Backend creates/updates user record with `status: 'pending'`
3. GitHub profile is enriched if handle provided
4. Confirmation email sent with community details and Monday meeting cadence

### Mentor Application Flow

1. User fills mentor application form
2. Backend creates user record with `source: 'mentor-application'` and `status: 'pending'`
3. GitHub profile is enriched if handle provided
4. Confirmation email sent with manual review timeline (3-5 business days)

## Database Seeders

The platform includes a **smart auto-seeding system** that automatically populates the database with communities.

### Automatic Seeding

**Both Local & Docker**: The database automatically checks and seeds itself when the application starts up if it's empty. No manual intervention needed!

**How it works:**
1. Application starts and listens on the configured port
2. Auto-seed system checks database status
3. If database is empty (0 communities), it seeds automatically
4. If database has communities, it skips seeding
5. Application continues running normally

**Startup logs you'll see:**
```
Application is running on: http://localhost:4200
Checking database seeding status...
Database is empty. Seeding communities...
Database seeded successfully
```

Or if already seeded:
```
Application is running on: http://localhost:4200
Checking database seeding status...
Database already seeded (5 communities found)
```

### Manual Seeder Commands

```sh
# Seed communities (idempotent - won't create duplicates)
npx nx run server:seed

# Clear all communities
npx nx run server:seed:clear

# Reset (clear + seed)
npx nx run server:seed:reset

# Check seeding status
npx nx run server:seed:status
```

### Docker Manual Seeding (if needed)

```sh
# Seed communities
docker-compose exec backend node seed-docker.js seed

# Check status
docker-compose exec backend node seed-docker.js status
```

### Seeder Endpoints (via API)

- `POST /api/seeder/seed` - Seed communities
- `POST /api/seeder/clear` - Clear all communities
- `POST /api/seeder/reset` - Reset database (clear + seed)
- `GET /api/seeder/status` - Check seeding status

**Note**: The seeder is idempotent and will skip existing communities to prevent duplicates.

### Technical Implementation

The auto-seeding system is implemented directly in the `main.ts` application bootstrap:
- Runs **after** the application successfully starts (post `app.listen()`)
- Uses the `SeederService` to check database status
- Non-blocking and fail-safe - app continues even if seeding fails
- Logs are clearly visible in the console for debugging
- Works identically in local development, Docker, and production environments

The same seeding logic is also accessible via CLI commands for manual control when needed.

## Troubleshooting

### Database Seeding Issues

**Problem**: Auto-seeding doesn't run
```
Application starts but no seeding logs appear
```
**Solution**: Check if the database already has communities:
```sh
# Check via API
curl http://localhost:4200/api/seeder/status

# Or check MongoDB directly
docker-compose exec mongodb mongosh sos-academy --eval "db.communities.countDocuments()"
```

**Problem**: Seeding fails with MongoDB connection error
```
Auto-seeding failed: MongooseServerSelectionError
```
**Solution**: Ensure MongoDB is running and the connection string is correct:
- Local: `MONGODB_URI=mongodb://localhost:27017/sos-academy`
- Docker: `MONGODB_URI=mongodb://mongodb:27017/sos-academy`

**Problem**: Want to re-seed the database
```
Database is already seeded, but I want fresh data
```
**Solution**: Clear and re-seed:
```sh
# Local
npx nx run server:seed:reset

# Docker
docker-compose exec backend node seed-docker.js reset
```

### Docker Issues

**Problem**: Backend can't connect to MongoDB
```
MongooseError: The `uri` parameter to `openUri()` must be a string
```
**Solution**: Make sure your `.env` file has the correct `MONGODB_URI`:
- For Docker: `MONGODB_URI=mongodb://mongodb:27017/sos-academy`
- For local: `MONGODB_URI=mongodb://localhost:27017/sos-academy`

**Problem**: Email sending fails in Docker
```
Error: SENDGRID_API_KEY environment variable is required
```
**Solution**: Add `SENDGRID_API_KEY` to your `.env` file with a valid SendGrid API key.

**Problem**: Frontend shows "Connection refused" errors
```
Error: connect ECONNREFUSED ::1:4200
```
**Solution**: Make sure the `NEXT_PUBLIC_API_URL` in `.env` points to the correct backend URL:
- For Docker: `http://localhost:4200/api` (NOT `http://backend:4200/api`)
- The frontend runs in the browser, so it needs the external URL

**Problem**: pnpm-lock.yaml is out of date
```
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
```
**Solution**: Update the lockfile:
```sh
pnpm install
```

### Local Development Issues

**Problem**: Port already in use
```
Error: listen EADDRINUSE: address already in use :::4200
```
**Solution**: Kill the process using the port:
```sh
# Find the process
lsof -i :4200

# Kill it
kill -9 <PID>
```

**Problem**: MongoDB connection timeout
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```sh
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/data/db
```

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:

```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines and standards
- [Security Policy](SECURITY.md) - How to report security vulnerabilities
- [Changelog](CHANGELOG.md) - Project version history
- [Contributors](CONTRIBUTORS.md) - Our amazing contributors

## 👥 Community

Join our community and connect with other developers!

- **Discord**: [Join our Discord server](https://discord.gg/9Wgx7bCh)
- **Twitter**: [@SOSAcademy_](https://x.com/SOSAcademy_)
- **GitHub Discussions**: [Start a discussion](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/discussions)
- **Email**: contact@shinobi-open-source.academy

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

**Quick Start:**
1. Read our [Contributing Guide](CONTRIBUTING.md)
2. Check out [good first issues](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
3. Join our [Discord](https://discord.gg/9Wgx7bCh) for help and discussions

**Ways to Contribute:**
- 💻 Code contributions (features, bug fixes, refactoring)
- 📚 Documentation improvements
- 🐛 Bug reports and testing
- 💡 Feature suggestions and feedback
- 🎨 Design and UX improvements
- 🌍 Translations and internationalization

See our [Contributors](CONTRIBUTORS.md) to meet the amazing people who have helped build this project!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all our [contributors](CONTRIBUTORS.md)
- Built with [Next.js](https://nextjs.org/), [NestJS](https://nestjs.com/), and [MongoDB](https://www.mongodb.com/)
- Powered by [Nx](https://nx.dev/) for efficient monorepo management

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/npm-workspaces-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

---

<div align="center">
  <sub>Built with ❤️ by the SOS Academy Community</sub>
  <br>
  <sub>⭐ Star us on GitHub — it helps!</sub>
</div>
