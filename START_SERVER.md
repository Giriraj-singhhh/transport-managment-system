# How to Start the Server

## The Problem
You're seeing "Network error" because the **backend server is not running**.

## Solution: Start Both Servers

### Option 1: Start Both Together (Recommended)
Open a terminal in the project root and run:
```bash
npm run dev
```
This starts both frontend (port 3000) and backend (port 5000) together.

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Prerequisites

1. **MongoDB must be running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Check if running
   Get-Service MongoDB
   ```

2. **.env file must exist** in project root with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-transport
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=college-transport-secret-key-2024-change-in-production
   JWT_EXPIRE=7d
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Verify Backend is Running

1. Check if port 5000 is in use:
   ```bash
   netstat -ano | findstr :5000
   ```

2. Test backend health:
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"success","message":"Server is running"}`

3. Check browser console for errors

## Quick Fix Steps

1. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Wait for both servers to start** (you'll see messages in terminal)

4. **Refresh your browser** at http://localhost:3000

5. **Try logging in again** with:
   - Email: `admin@college.edu`
   - Password: `admin123`

## Common Issues

- **MongoDB not running:** Start it with `net start MongoDB`
- **Port 5000 already in use:** Change PORT in `.env` to another port
- **.env file missing:** Create it with the content above
- **Dependencies not installed:** Run `npm run install-all`

