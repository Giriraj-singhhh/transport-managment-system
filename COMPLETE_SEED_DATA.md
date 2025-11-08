# Complete Seed Data Guide

## 🎯 Overview

This project now has a comprehensive seed script that populates **ALL** necessary data for the transport management system.

## 🚀 Quick Start

Run the complete seed script to populate everything:

```bash
cd server
npm run seed-all
```

This single command will create:
- ✅ Users (7 users: admin, students, staff, driver)
- ✅ Drivers (3 drivers with full details)
- ✅ Routes (4 routes with waypoints)
- ✅ Buses (4 buses assigned to drivers)
- ✅ Schedules (9 schedules for different times)
- ✅ Bookings (6 sample bookings)
- ✅ Notifications (7 notifications)

## 📋 What Gets Created

### 👥 Users (7 total)

1. **Admin**
   - Email: `admin@college.edu`
   - Password: `admin123`
   - Role: Admin

2. **Students (3)**
   - `student@college.edu` / `student123`
   - `student2@college.edu` / `student123`
   - `student3@college.edu` / `student123`

3. **Staff (2)**
   - `staff@college.edu` / `staff123`
   - `staff2@college.edu` / `staff123`

4. **Driver**
   - `driver@college.edu` / `driver123`

### 👨‍✈️ Drivers (3)

1. **Rajesh Kumar** - 8 years experience, Rating: 4.8/5
2. **Amit Sharma** - 5 years experience, Rating: 4.6/5
3. **Vikram Singh** - 12 years experience, Rating: 4.9/5

### 🛣️ Routes (4)

1. **College to Andheri Station** - 12.5 km, 35 min, ₹50
2. **College to Bandra Station** - 8.2 km, 25 min, ₹40
3. **College to Borivali** - 25 km, 60 min, ₹80
4. **College to Thane** - 30.5 km, 75 min, ₹100

### 🚌 Buses (4)

- **CT001** - Tata Starbus (40 seats) - Rajesh Kumar
- **CT002** - Ashok Leyland (35 seats) - Amit Sharma
- **CT003** - Volvo 9400 (45 seats) - Vikram Singh
- **CT004** - Scania Metrolink (50 seats) - Rajesh Kumar

### 📅 Schedules (9)

Multiple schedules covering:
- Morning routes (7:00 AM - 8:30 AM)
- Afternoon routes (2:00 PM - 4:00 PM)
- Evening routes (5:00 PM - 6:00 PM)

### 🎫 Bookings (6)

Sample bookings with:
- Different users (students and staff)
- Different payment methods (card, UPI, wallet, cash)
- Different statuses (confirmed, pending)
- Future travel dates

### 🔔 Notifications (7)

Various notification types:
- Booking confirmations
- Payment notifications
- Route updates
- System announcements

## 📝 Available Commands

### Seed Everything (Recommended)
```bash
cd server
npm run seed-all
```

### Seed Only Users
```bash
npm run seed
```

### Seed Only Transport Data
```bash
npm run seed-transport
```

## 🔄 Re-running Seed Scripts

The seed scripts are **safe to run multiple times**. They check for existing data and skip duplicates, so you can:

- Run `seed-all` anytime to add missing data
- Run individual seed scripts to add specific data
- No data will be duplicated

## 🎓 College Information

- **Name:** ABC College of Engineering
- **Location:** 123 College Road, Mumbai, Maharashtra 400001, India
- **Coordinates:** 19.0760°N, 72.8777°E

## ✅ After Seeding

Once you run `npm run seed-all`, you can:

1. **Login** with any user account
2. **View Routes** - See all 4 routes with details
3. **View Buses** - See buses with driver assignments
4. **View Schedules** - See all available schedules
5. **View Bookings** - See sample bookings
6. **View Notifications** - See notifications for users
7. **Make New Bookings** - Create bookings for any schedule

## 🐛 Troubleshooting

### If seed script fails:

1. **Check MongoDB is running:**
   ```bash
   net start MongoDB
   ```

2. **Check .env file exists** in project root with `MONGODB_URI`

3. **Clear existing data** (if needed):
   ```bash
   # Connect to MongoDB and drop collections
   # Or delete specific documents
   ```

4. **Run seed script again:**
   ```bash
   npm run seed-all
   ```

## 📊 Data Summary

After running `seed-all`, you'll have:

- **7 Users** (1 admin, 3 students, 2 staff, 1 driver)
- **3 Drivers** with full profiles
- **4 Routes** with waypoints and coordinates
- **4 Buses** assigned to routes and drivers
- **9 Schedules** covering different times
- **6 Bookings** with various statuses
- **7 Notifications** for different users

## 🎉 Ready to Use!

Your application is now fully populated and ready for testing and development!

