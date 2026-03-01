# Backend Setup Guide

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```
   DB_USER=ispank
   DB_PASSWORD=your_actual_password
   DB_HOST=192.168.1.51
   DB_PORT=5432
   DB_NAME=made_up_wiki
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will be available at `http://localhost:5000`

## Database Connection

Before running the backend, ensure:
1. PostgreSQL is running on 192.168.1.51
2. The `made_up_wiki` database is created
3. The database schema is initialized (see database/init.sql)
4. Network connectivity from your machine to the database server

## API Routes

The following routes are available:

- `/api/health` - Health check endpoint
- `/api/auth/*` - Authentication routes
- `/api/entries/*` - Wiki entry CRUD routes
- `/api/invite/*` - Invite code management routes

## Troubleshooting

### Database Connection Error
- Check that PostgreSQL is running and accessible
- Verify credentials in `.env` file
- Ensure network can reach 192.168.1.51:5432

### CORS Errors
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that requests include proper Authorization headers

### JWT Errors
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration (set to 7 days)
