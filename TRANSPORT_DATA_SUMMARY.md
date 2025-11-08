# Transport Data Summary

## ✅ Successfully Seeded!

All transport data has been added to your database.

## 📍 College Information

- **Name:** ABC College of Engineering
- **Address:** 123 College Road, Mumbai, Maharashtra 400001, India
- **Coordinates:** 19.0760°N, 72.8777°E

## 👨‍✈️ Drivers (3)

### 1. Rajesh Kumar
- **Email:** rajesh.driver@college.edu
- **Phone:** 9876543210
- **License:** DL1234567890 (Type D)
- **Experience:** 8 years
- **Rating:** 4.8/5 ⭐
- **Working Hours:** Mon-Fri, 7:00 AM - 6:00 PM
- **Total Trips:** 1,250 (1,180 on-time)

### 2. Amit Sharma
- **Email:** amit.driver@college.edu
- **Phone:** 9876543212
- **License:** DL1234567891 (Type D)
- **Experience:** 5 years
- **Rating:** 4.6/5 ⭐
- **Working Hours:** Mon-Sat, 6:00 AM - 4:00 PM
- **Total Trips:** 890 (820 on-time)

### 3. Vikram Singh
- **Email:** vikram.driver@college.edu
- **Phone:** 9876543214
- **License:** DL1234567892 (Type D)
- **Experience:** 12 years
- **Rating:** 4.9/5 ⭐
- **Working Hours:** Mon-Fri, 8:00 AM - 7:00 PM
- **Total Trips:** 2,100 (2,050 on-time)

## 🛣️ Routes (4)

### Route 1: College to Andheri Station
- **Distance:** 12.5 km
- **Time:** 35 minutes
- **Base Fare:** ₹50
- **Student Discount:** 20%
- **Staff Discount:** 10%
- **Stops:** BKC, Juhu Circle
- **Features:** WiFi, AC, Charging
- **Operating:** Mon-Sat, 6:00 AM - 10:00 PM

### Route 2: College to Bandra Station
- **Distance:** 8.2 km
- **Time:** 25 minutes
- **Base Fare:** ₹40
- **Student Discount:** 20%
- **Staff Discount:** 10%
- **Stops:** Worli Sea Face
- **Features:** WiFi, AC
- **Operating:** Mon-Sat, 6:30 AM - 9:30 PM

### Route 3: College to Borivali
- **Distance:** 25 km
- **Time:** 60 minutes
- **Base Fare:** ₹80
- **Student Discount:** 20%
- **Staff Discount:** 10%
- **Stops:** Goregaon, Kandivali
- **Features:** WiFi, AC, Charging, Wheelchair Accessible
- **Operating:** Mon-Fri, 7:00 AM - 8:00 PM

### Route 4: College to Thane
- **Distance:** 30.5 km
- **Time:** 75 minutes
- **Base Fare:** ₹100
- **Student Discount:** 25%
- **Staff Discount:** 15%
- **Stops:** Mulund, Bhandup
- **Features:** WiFi, AC, Charging
- **Operating:** Mon-Fri, 6:00 AM - 7:00 PM

## 🚌 Buses (4)

### CT001 - College Transport Bus 1
- **Driver:** Rajesh Kumar
- **Route:** College to Andheri Station
- **Capacity:** 40 seats
- **Make/Model:** Tata Starbus (2022)
- **Color:** Blue
- **Features:** WiFi, AC, Charging, GPS Tracking

### CT002 - College Transport Bus 2
- **Driver:** Amit Sharma
- **Route:** College to Bandra Station
- **Capacity:** 35 seats
- **Make/Model:** Ashok Leyland JanBus (2021)
- **Color:** Red
- **Features:** WiFi, AC

### CT003 - College Transport Bus 3
- **Driver:** Vikram Singh
- **Route:** College to Borivali
- **Capacity:** 45 seats
- **Make/Model:** Volvo 9400 (2023)
- **Color:** White
- **Features:** WiFi, AC, Charging, Wheelchair Accessible, GPS Tracking

### CT004 - College Transport Bus 4
- **Driver:** Rajesh Kumar
- **Route:** College to Thane
- **Capacity:** 50 seats
- **Make/Model:** Scania Metrolink (2023)
- **Color:** Green
- **Features:** WiFi, AC, Charging, GPS Tracking

## 📅 Schedules (9)

### Route 1: College to Andheri (3 schedules)
- **Morning:** 8:00 AM - 8:35 AM (Mon-Fri)
- **Afternoon:** 2:00 PM - 2:35 PM (Mon-Fri)
- **Evening:** 6:00 PM - 6:35 PM (Mon-Fri)

### Route 2: College to Bandra (2 schedules)
- **Morning:** 8:30 AM - 8:55 AM (Mon-Sat)
- **Afternoon:** 4:00 PM - 4:25 PM (Mon-Sat)

### Route 3: College to Borivali (2 schedules)
- **Morning:** 7:30 AM - 8:30 AM (Mon-Fri)
- **Evening:** 5:00 PM - 6:00 PM (Mon-Fri)

### Route 4: College to Thane (2 schedules)
- **Morning:** 7:00 AM - 8:15 AM (Mon-Fri)
- **Afternoon:** 4:30 PM - 5:45 PM (Mon-Fri)

## 🎯 How to Use

1. **Login** with any default user:
   - Admin: admin@college.edu / admin123
   - Student: student@college.edu / student123
   - Staff: staff@college.edu / staff123
   - Driver: driver@college.edu / driver123

2. **View Routes:**
   - Go to "Routes" in the navigation
   - See all 4 routes with details

3. **View Buses:**
   - Go to "Buses" in the navigation
   - See all buses with driver names and routes

4. **View Schedules:**
   - Go to "Schedules" in the navigation
   - See all available schedules

5. **Make a Booking:**
   - Go to "Bookings" → "New Booking"
   - Select a schedule
   - Choose a seat
   - Complete booking

## 📝 Notes

- All drivers have valid licenses and contact information
- All routes include waypoints and coordinates
- All buses are assigned to drivers and routes
- Schedules cover morning, afternoon, and evening times
- Student discounts are automatically applied
- All data includes realistic locations in Mumbai

## 🔄 Re-seed Data

If you need to reset the transport data:

```bash
cd server
npm run seed-transport
```

The script will skip existing data, so it's safe to run multiple times.

