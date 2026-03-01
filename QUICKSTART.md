# Made-Up Wiki - Quick Start Guide

## 📋 Prerequisites

Before you start, make sure you have:
- Node.js 16+ installed
- npm installed
- PostgreSQL running on `192.168.1.51`
- A GitHub account (for deploying)

## 🚀 Step-by-Step Setup

### Step 1: Set Up PostgreSQL

1. Connect to your PostgreSQL server on 192.168.1.51
2. Run the initialization script from `database/init.sql`:
   ```bash
   psql -h 192.168.1.51 -U ispank -d made_up_wiki -f database/init.sql
   ```

See `database/README.md` for detailed instructions.

### Step 2: Set Up Backend

1. Open `backend/.env.example` and copy it to `backend/.env`
2. Update `backend/.env` with your PostgreSQL credentials:
   ```
   DB_USER=ispank
   DB_PASSWORD=your_password
   DB_HOST=192.168.1.51
   DB_PORT=5432
   DB_NAME=made_up_wiki
   JWT_SECRET=use_a_strong_random_string_here
   ```

3. Install and start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

The backend should now be running on `http://localhost:5000`

### Step 3: Set Up Frontend

1. Open `frontend/.env.example` and copy it to `frontend/.env`
2. In development, keep `REACT_APP_API_URL=http://localhost:5000/api`

3. Install and start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

The frontend should open at `http://localhost:3000`

### Step 4: Create Your First Invite Code

1. Go to `http://localhost:3000`
2. Create a test account using any invite code just to log in
3. Then you need to manually set yourself as a contributor in the database:
   ```sql
   UPDATE users SET is_contributor = true WHERE email = 'your_email@example.com';
   ```

4. Refresh the page and go to `/admin` - you should see the Admin Panel

5. Generate an invite code and share it with family members

### Step 5: Deploy (Optional)

#### Deploy Backend to Render

1. Push your code to GitHub
2. Go to https://render.com
3. Create a new Web Service
4. Connect your GitHub repository
5. Set environment variables (same as your `.env`)
6. Deploy!

#### Deploy Frontend to GitHub Pages

1. Update `frontend/package.json`:
   ```json
   "homepage": "https://your-github-username.github.io/made-up-wiki"
   ```

2. Update `frontend/.env` with your Render backend URL:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

3. Deploy:
   ```bash
   cd frontend
   npm run deploy
   ```

## 📖 How to Use

### For Regular Users
1. Visit the wiki homepage
2. Browse entries or use the search bar
3. Sign up with an invite code to create an account
4. Browse again while logged in

### For Contributors
1. Log in with a contributor account
2. Go to Admin Panel
3. **Create Entries**: Add new words and definitions
4. **Manage Invites**: Generate shareable invite codes for new users

### For You (Owner)
1. Generate invite codes via the Admin Panel
2. Share codes with family members
3. After they sign up, set `is_contributor = true` in the database if they should be able to edit
4. Manage all invite codes and track usage

## 🔐 Security Tips

- Change `JWT_SECRET` to a strong random string
- Never commit `.env` files to GitHub
- Ensure PostgreSQL only accepts connections from trusted IPs
- Keep Node packages updated: `npm update`

## 🐛 Troubleshooting

**"Cannot connect to database"**
- Check PostgreSQL is running on 192.168.1.51
- Verify credentials in `.env`
- Check network connectivity

**"Login not working"**
- Ensure invite code was valid during signup
- Check backend logs for JWT errors
- Verify JWT_SECRET is the same in backend

**"Admin panel not showing"**
- Make sure your user has `is_contributor = true` in database
- Try logging out and back in
- Check browser console for errors

**"CORS errors"**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- In development, it should be `http://localhost:3000`

## 📚 Important Files

- `README.md` - Full project documentation
- `backend/README.md` - Backend setup guide
- `frontend/README.md` - Frontend setup guide
- `database/README.md` - Database setup guide

## 🎯 Next Steps

1. Test the application locally
2. Create some test entries
3. Verify search functionality works
4. Set up GitHub repository and deploy
5. Share with family members!

Happy wiki-ing! 🎉
