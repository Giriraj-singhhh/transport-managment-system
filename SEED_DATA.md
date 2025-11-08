# Seed Data Guide

## Available Seed Scripts

### 1. Seed Default Users
Creates default login accounts (admin, student, staff, driver):
```bash
cd server
npm run seed
```

**Default Users:**
- **Admin:** admin@college.edu / admin123
- **Student:** student@college.edu / student123
- **Staff:** staff@college.edu / staff123
- **Driver:** driver@college.edu / driver123

### 2. Seed Transport Data
Creates complete transport system data:
```bash
cd server
npm run seed-transport
```

**What it creates:**
- ✅ **3 Drivers** with full details (Rajesh Kumar, Amit Sharma, Vikram Singh)
- ✅ **4 Routes** with stops and locations:
  - College to Andheri Station (12.5 km)
  - College to Bandra Station (8.2 km)
  - College to Borivali (25 km)
  - College to Thane (30.5 km)
- ✅ **4 Buses** assigned to drivers and routes
- ✅ **9 Schedules** for different times and days
- ✅ **College Information:** ABC College of Engineering, Mumbai

### 3. Seed Everything (Recommended)
Runs both seed scripts:
```bash
cd server
npm run seed-all
```

## College Information

- **Name:** ABC College of Engineering
- **Address:** 123 College Road, Mumbai, Maharashtra 400001, India
- **Coordinates:** 19.0760°N, 72.8777°E

## Transport Data Details

### Drivers
1. **Rajesh Kumar**
   - License: DL1234567890
   - Experience: 8 years
   - Rating: 4.8/5
   - Working Days: Mon-Fri (7 AM - 6 PM)

2. **Amit Sharma**
   - License: DL1234567891
   - Experience: 5 years
   - Rating: 4.6/5
   - Working Days: Mon-Sat (6 AM - 4 PM)

3. **Vikram Singh**
   - License: DL1234567892
   - Experience: 12 years
   - Rating: 4.9/5
   - Working Days: Mon-Fri (8 AM - 7 PM)

### Routes
1. **College to Andheri Station**
   - Distance: 12.5 km
   - Time: 35 minutes
   - Fare: ₹50 (base)
   - Stops: BKC, Juhu Circle

2. **College to Bandra Station**
   - Distance: 8.2 km
   - Time: 25 minutes
   - Fare: ₹40 (base)
   - Stops: Worli Sea Face

3. **College to Borivali**
   - Distance: 25 km
   - Time: 60 minutes
   - Fare: ₹80 (base)
   - Stops: Goregaon, Kandivali

4. **College to Thane**
   - Distance: 30.5 km
   - Time: 75 minutes
   - Fare: ₹100 (base)
   - Stops: Mulund, Bhandup

### Buses
- **CT001:** Tata Starbus (40 seats) - Route: Andheri
- **CT002:** Ashok Leyland JanBus (35 seats) - Route: Bandra
- **CT003:** Volvo 9400 (45 seats) - Route: Borivali
- **CT004:** Scania Metrolink (50 seats) - Route: Thane

## Quick Start

1. **Seed users first:**
   ```bash
   cd server
   npm run seed
   ```

2. **Then seed transport data:**
   ```bash
   npm run seed-transport
   ```

3. **Or do both at once:**
   ```bash
   npm run seed-all
   ```

## Notes

- Seed scripts check for existing data and skip duplicates
- All data includes realistic locations, coordinates, and details
- Drivers have performance ratings and schedules
- Routes include waypoints and fare information
- Buses are assigned to specific drivers and routes
- Schedules cover multiple times throughout the day

