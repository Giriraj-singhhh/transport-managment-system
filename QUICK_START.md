# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB installed and running locally (or use MongoDB Atlas)

## Step 1: Create .env File

Create a `.env` file in the project root with this content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/college-transport

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=college-transport-secret-key-2024-change-in-production
JWT_EXPIRE=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 2: Install Dependencies

```bash
npm run install-all
```

## Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
```

## Step 4: Run the Application

```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Step 5: Access the Application

Open your browser and go to: **http://localhost:3000**

## First Time Setup

1. Click "Get Started" or go to `/register`
2. Create your first account (Student/Staff/Driver)
3. You'll be automatically logged in

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if port 27017 is available
- Verify MONGODB_URI in `.env`

### Port Already in Use
- Change PORT in `.env` (backend)
- React will automatically use another port if 3000 is taken

### Dependencies Error
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install-all
```

## Available Commands

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build for production
- `npm start` - Run production server

