# Frontend Setup Guide

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API URL:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Running the App

### Development Mode
```bash
npm start
```

The app will open at `http://localhost:3000` and auto-reload on changes.

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Deploying to GitHub Pages

### Prerequisites
- Frontend code pushed to GitHub
- `homepage` in `package.json` set to your GitHub Pages URL

### Deployment Steps

1. Install `gh-pages` package (already included):
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `package.json` homepage:
   ```json
   "homepage": "https://your-github-username.github.io/made-up-wiki"
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

This automatically builds and pushes to the `gh-pages` branch.

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
  - For development: `http://localhost:5000/api`
  - For production: Your Render backend URL (e.g., `https://your-app.onrender.com/api`)

## Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run deploy` - Deploy to GitHub Pages

## Features

- ✅ Public wiki view (no login required to read)
- ✅ User authentication with JWT tokens
- ✅ Invite code-based signup
- ✅ Search entries by keyword or definition
- ✅ Admin panel for contributors
- ✅ Create and manage wiki entries
- ✅ Generate and manage invite codes
- ✅ Responsive design

## Troubleshooting

### API Connection Error
- Check that backend is running on `http://localhost:5000`
- Verify `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

### Login Not Working
- Ensure backend `.env` has correct `JWT_SECRET`
- Check that user exists in database
- Verify password is correct

### "Not a Contributor" Error
- Log in as a contributor user
- Contributor status must be set to `true` in database
- Check admin panel to manage contributors

### Build Errors
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`
