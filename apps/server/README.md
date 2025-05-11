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