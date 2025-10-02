# SOS Academy Platform

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

🚀 **Shinobi Open-Source Academy** - Empowering the Next Generation of Open-Source Warriors

A modern platform built with Next.js, NestJS, and MongoDB that connects aspiring developers with experienced mentors and real-world open-source projects.

## 🎯 MVP Features

- **User Subscription**: Join communities with email and community selection
- **Mentor Applications**: Apply to become a mentor with streamlined process
- **Community Management**: 5 specialized communities (JavaScript, Python, Go, Java, Ruby)
- **Email Notifications**: Automated confirmation emails with Monday meeting cadence
- **GitHub Integration**: Automatic profile enrichment from GitHub handles
- **Beautiful UI**: Modern, responsive design with modal-based forms

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: NestJS + MongoDB + Mongoose
- **Email**: SendGrid integration with Handlebars templates
- **Monorepo**: Nx workspace for efficient development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- SendGrid account (for emails)

### Environment Setup
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4200
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sos-academy

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRATION=1d

# Cors Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key_here
EMAIL_FROM=no-reply@sos-academy.org

# GitHub API (Optional - for higher rate limits)
GITHUB_TOKEN=your_github_token_here_optional
```

### Development

```sh
# Install dependencies
npm install

# Start MongoDB (if running locally)
mongod

# Start the backend server
npx nx serve server

# Start the frontend (in another terminal)
npx nx serve frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4200

### Build for Production

```sh
# Build both frontend and backend
npx nx build frontend
npx nx build server
```

## 📋 API Endpoints

### User Management
- `POST /api/users/subscribe` - Subscribe to communities
- `POST /api/users/mentor-application` - Apply as mentor
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

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

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/npm-workspaces-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
