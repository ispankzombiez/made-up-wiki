# Made-Up Wiki

A collaborative wiki-style website for sharing randomly made-up words and their definitions.

## Features

- **User Authentication**: Sign up with invite codes, login system
- **Contributor System**: Only designated contributors can create/edit entries
- **Search Functionality**: Search through words and definitions
- **Responsive Design**: Clean, modern interface
- **Role-based Access**: Different views for authenticated users vs contributors

## Project Structure

```
made-up-wiki/
├── backend/          # Node.js/Express server
├── frontend/         # React application
└── database/         # PostgreSQL setup scripts
```

## Tech Stack

- **Frontend**: React 18 + React Router + Axios
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (on local network)
- **Hosting**: 
  - Backend: Render.com (free tier)
  - Frontend: GitHub Pages
  - Database: Self-hosted on 192.168.1.51

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- PostgreSQL installed on your local network machine (192.168.1.51)

### Backend Setup

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to `frontend/` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

### Database Setup

1. See [database/README.md](database/README.md) for detailed PostgreSQL setup instructions

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Create new user with invite code
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Entry Endpoints

- `GET /api/entries` - Get all entries (with optional search)
- `GET /api/entries/:id` - Get single entry
- `POST /api/entries` - Create entry (contributors only)
- `PUT /api/entries/:id` - Update entry (contributors only)
- `DELETE /api/entries/:id` - Delete entry (contributors only)

### Invite Endpoints

- `POST /api/invite/create` - Generate new invite code
- `GET /api/invite/codes` - Get all invite codes

## Invite Code System

Instead of email verification, the application uses invite codes:

1. **Generate codes** via the Admin Panel
2. **Share codes** with family members
3. **Users enter code during signup** to create their account
4. **Designate contributors** by marking them as such in the database

## Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Connect your GitHub repo to Render.com
3. Create new Web Service on Render
4. Set environment variables
5. Deploy!

### Deploy Frontend to GitHub Pages

1. Update `homepage` in `frontend/package.json` with your GitHub username
2. Ensure `.env.example` has correct `REACT_APP_API_URL` (your Render backend URL)
3. From `frontend/` folder:
   ```bash
   npm run deploy
   ```

## Environment Variables

### Backend (.env)
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_HOST` - PostgreSQL host (192.168.1.51)
- `DB_PORT` - PostgreSQL port (5432)
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- Invite codes are single-use
- Only contributors can create/edit entries
- CORS is configured to allow only your frontend

## Future Enhancements

- Edit/delete entries UI in main app
- User profiles
- Entry edit history
- Comments/discussions
- Word ratings/voting
- Admin user management UI
- More sophisticated search filters

## Support

For issues or questions, please create an issue on GitHub.
