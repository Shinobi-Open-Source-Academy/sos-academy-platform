# Server API

Simple NestJS backend with MongoDB connection for the SOS Academy Platform.

## Setup

1. Make sure MongoDB is installed and running on your system
2. Set the MongoDB URI in your environment or use the default: `mongodb://localhost:27017/sos-academy`

## Running the server

```bash
# Development
nx serve server

# Production build
nx build server
```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a user by ID
- `DELETE /api/users/:id` - Delete a user

## Database Models

### User

- name: string (required)
- email: string (required, unique)
- password: string
- createdAt: Date (default: now)

## Environment Variables

This application uses environment variables for configuration. For local development, you have two options:

### Option 1: Create a .env file

Create a `.env` file in the root of the project with the following variables:

```
# Server Configuration
PORT=4200
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sos-academy

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=1d

# Cors Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Option 2: Use the default development configuration

The application includes a default development configuration in `src/common/config/development.env.ts`. If no environment variables are set, the application will use these default values.

## Important Environment Variables

- `PORT`: The port on which the server will run (default: 4200)
- `NODE_ENV`: The environment mode (development, production, test)
- `MONGODB_URI`: The MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRATION`: JWT token expiration time
- `CORS_ORIGIN`: Allowed origins for CORS (default: http://localhost:3000)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
