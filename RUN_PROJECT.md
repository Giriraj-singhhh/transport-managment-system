# How to Run the Project with Seed Data

## ✅ Seed Data Status

All seed data has been successfully created:
- ✅ 7 Users (admin, students, staff, driver)
- ✅ 3 Drivers with full profiles
- ✅ 4 Routes with waypoints
- ✅ 4 Buses assigned to drivers
- ✅ 9 Schedules for different times
- ✅ 6 Bookings with various statuses
- ✅ 7 Notifications

## 🚀 Running the Project

### Option 1: Run Both Servers Together (Recommended)

From the project root directory:

```bash
npm run dev
```

This will start:
- **Backend Server:** http://localhost:5000
- **Frontend App:** http://localhost:3000

### Option 2: Run Servers Separately

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

## 🔑 Login Credentials

After starting the servers, you can login with:

### Admin Account
- **Email:** `admin@college.edu`
- **Password:** `admin123`
- **Access:** Full admin dashboard and all features

### Student Account
- **Email:** `student@college.edu`
- **Password:** `student123`
- **Access:** View routes, make bookings, track buses

### Staff Account
- **Email:** `staff@college.edu`
- **Password:** `staff123`
- **Access:** View routes, make bookings

### Driver Account
- **Email:** `driver@college.edu`
- **Password:** `driver123`
- **Access:** Driver dashboard, update location

## 📋 What You Can Do

Once logged in, you can:

1. **View Routes** - See all 4 routes (Andheri, Bandra, Borivali, Thane)
2. **View Buses** - See buses with driver names and assignments
3. **View Schedules** - See all 9 schedules for different times
4. **View Bookings** - See sample bookings (6 bookings created)
5. **View Notifications** - See notifications (7 notifications created)
6. **Make New Bookings** - Create new bookings for any schedule
7. **Track Buses** - Live tracking feature (if implemented)

## 🔄 Re-seed Data

If you need to reset or re-seed the data:

```bash
cd server
npm run seed-all
```

The script is safe to run multiple times - it skips existing data.

## ⚠️ Prerequisites

1. **MongoDB must be running:**
   ```bash
   net start MongoDB
   ```

2. **.env file** must exist in project root with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-transport
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## 🌐 Access the Application

Once both servers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## 🎉 You're All Set!

The project is now running with all seed data. You can start testing and using all features!

