const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');

// College Information
const COLLEGE_NAME = 'ABC College of Engineering';
const COLLEGE_ADDRESS = {
  street: '123 College Road',
  city: 'Mumbai',
  state: 'Maharashtra',
  zipCode: '400001',
  country: 'India',
  coordinates: {
    lat: 19.0760,
    lng: 72.8777
  }
};

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed Drivers
const seedDrivers = async () => {
  const drivers = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.driver@college.edu',
      phone: '9876543210',
      licenseNumber: 'DL1234567890',
      licenseType: 'D',
      licenseExpiry: new Date('2026-12-31'),
      experience: 8,
      status: 'active',
      address: {
        street: '45 Driver Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
        country: 'India'
      },
      emergencyContact: {
        name: 'Priya Kumar',
        relationship: 'Wife',
        phone: '9876543211'
      },
      performance: {
        rating: 4.8,
        totalTrips: 1250,
        onTimeTrips: 1180,
        complaints: 2
      },
      schedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        shiftStart: '07:00',
        shiftEnd: '18:00',
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40
      },
      currentLocation: {
        lat: 19.0760,
        lng: 72.8777,
        isOnline: true
      }
    },
    {
      name: 'Amit Sharma',
      email: 'amit.driver@college.edu',
      phone: '9876543212',
      licenseNumber: 'DL1234567891',
      licenseType: 'D',
      licenseExpiry: new Date('2025-11-30'),
      experience: 5,
      status: 'active',
      address: {
        street: '78 Transport Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400003',
        country: 'India'
      },
      emergencyContact: {
        name: 'Sunita Sharma',
        relationship: 'Sister',
        phone: '9876543213'
      },
      performance: {
        rating: 4.6,
        totalTrips: 890,
        onTimeTrips: 820,
        complaints: 1
      },
      schedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        shiftStart: '06:00',
        shiftEnd: '16:00',
        maxHoursPerDay: 8,
        maxHoursPerWeek: 48
      },
      currentLocation: {
        lat: 19.0860,
        lng: 72.8877,
        isOnline: true
      }
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.driver@college.edu',
      phone: '9876543214',
      licenseNumber: 'DL1234567892',
      licenseType: 'D',
      licenseExpiry: new Date('2027-06-15'),
      experience: 12,
      status: 'active',
      address: {
        street: '12 Bus Driver Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400004',
        country: 'India'
      },
      emergencyContact: {
        name: 'Ramesh Singh',
        relationship: 'Brother',
        phone: '9876543215'
      },
      performance: {
        rating: 4.9,
        totalTrips: 2100,
        onTimeTrips: 2050,
        complaints: 0
      },
      schedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        shiftStart: '08:00',
        shiftEnd: '19:00',
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40
      },
      currentLocation: {
        lat: 19.0660,
        lng: 72.8677,
        isOnline: true
      }
    }
  ];

  const createdDrivers = [];
  for (const driverData of drivers) {
    const existingDriver = await Driver.findOne({ email: driverData.email });
    if (existingDriver) {
      console.log(`Driver ${driverData.email} already exists. Skipping...`);
      createdDrivers.push(existingDriver);
      continue;
    }
    const driver = await Driver.create(driverData);
    createdDrivers.push(driver);
    console.log(`✓ Created driver: ${driverData.name}`);
  }
  return createdDrivers;
};

// Seed Routes
const seedRoutes = async () => {
  const routes = [
    {
      name: 'College to Andheri Station',
      startLocation: `${COLLEGE_NAME}, ${COLLEGE_ADDRESS.street}, ${COLLEGE_ADDRESS.city}`,
      endLocation: 'Andheri Railway Station, Andheri West, Mumbai',
      distance: 12.5,
      estimatedTime: 35,
      status: 'active',
      coordinates: {
        start: { lat: COLLEGE_ADDRESS.coordinates.lat, lng: COLLEGE_ADDRESS.coordinates.lng },
        end: { lat: 19.1197, lng: 72.8467 }
      },
      waypoints: [
        { name: 'Bandra Kurla Complex', lat: 19.0600, lng: 72.8700, order: 1 },
        { name: 'Juhu Circle', lat: 19.1000, lng: 72.8300, order: 2 }
      ],
      fare: {
        base: 50,
        perKm: 2,
        studentDiscount: 0.2, // 20% discount
        staffDiscount: 0.1    // 10% discount
      },
      features: ['wifi', 'ac', 'charging'],
      operatingHours: {
        start: '06:00',
        end: '22:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      capacity: 40,
      description: 'Direct route from college to Andheri Station via BKC and Juhu'
    },
    {
      name: 'College to Bandra Station',
      startLocation: `${COLLEGE_NAME}, ${COLLEGE_ADDRESS.street}, ${COLLEGE_ADDRESS.city}`,
      endLocation: 'Bandra Railway Station, Bandra West, Mumbai',
      distance: 8.2,
      estimatedTime: 25,
      status: 'active',
      coordinates: {
        start: { lat: COLLEGE_ADDRESS.coordinates.lat, lng: COLLEGE_ADDRESS.coordinates.lng },
        end: { lat: 19.0596, lng: 72.8291 }
      },
      waypoints: [
        { name: 'Worli Sea Face', lat: 19.0200, lng: 72.8200, order: 1 }
      ],
      fare: {
        base: 40,
        perKm: 2,
        studentDiscount: 0.2,
        staffDiscount: 0.1
      },
      features: ['wifi', 'ac'],
      operatingHours: {
        start: '06:30',
        end: '21:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      capacity: 35,
      description: 'Route from college to Bandra Station via Worli'
    },
    {
      name: 'College to Borivali',
      startLocation: `${COLLEGE_NAME}, ${COLLEGE_ADDRESS.street}, ${COLLEGE_ADDRESS.city}`,
      endLocation: 'Borivali Railway Station, Borivali West, Mumbai',
      distance: 25.0,
      estimatedTime: 60,
      status: 'active',
      coordinates: {
        start: { lat: COLLEGE_ADDRESS.coordinates.lat, lng: COLLEGE_ADDRESS.coordinates.lng },
        end: { lat: 19.2307, lng: 72.8567 }
      },
      waypoints: [
        { name: 'Goregaon Station', lat: 19.1550, lng: 72.8500, order: 1 },
        { name: 'Kandivali Station', lat: 19.2000, lng: 72.8400, order: 2 }
      ],
      fare: {
        base: 80,
        perKm: 2.5,
        studentDiscount: 0.2,
        staffDiscount: 0.1
      },
      features: ['wifi', 'ac', 'charging', 'wheelchair_accessible'],
      operatingHours: {
        start: '07:00',
        end: '20:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      capacity: 45,
      description: 'Long distance route from college to Borivali'
    },
    {
      name: 'College to Thane',
      startLocation: `${COLLEGE_NAME}, ${COLLEGE_ADDRESS.street}, ${COLLEGE_ADDRESS.city}`,
      endLocation: 'Thane Railway Station, Thane, Maharashtra',
      distance: 30.5,
      estimatedTime: 75,
      status: 'active',
      coordinates: {
        start: { lat: COLLEGE_ADDRESS.coordinates.lat, lng: COLLEGE_ADDRESS.coordinates.lng },
        end: { lat: 19.1943, lng: 72.9708 }
      },
      waypoints: [
        { name: 'Mulund', lat: 19.1700, lng: 72.9500, order: 1 },
        { name: 'Bhandup', lat: 19.1500, lng: 72.9400, order: 2 }
      ],
      fare: {
        base: 100,
        perKm: 3,
        studentDiscount: 0.25, // 25% discount
        staffDiscount: 0.15    // 15% discount
      },
      features: ['wifi', 'ac', 'charging'],
      operatingHours: {
        start: '06:00',
        end: '19:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      capacity: 50,
      description: 'Express route from college to Thane'
    }
  ];

  const createdRoutes = [];
  for (const routeData of routes) {
    const existingRoute = await Route.findOne({ name: routeData.name });
    if (existingRoute) {
      console.log(`Route ${routeData.name} already exists. Skipping...`);
      createdRoutes.push(existingRoute);
      continue;
    }
    const route = await Route.create(routeData);
    createdRoutes.push(route);
    console.log(`✓ Created route: ${routeData.name}`);
  }
  return createdRoutes;
};

// Seed Buses
const seedBuses = async (drivers, routes) => {
  const buses = [
    {
      busNumber: 'CT001',
      name: 'College Transport Bus 1',
      capacity: 40,
      status: 'active',
      driverId: drivers[0]._id,
      routeId: routes[0]._id,
      features: ['wifi', 'ac', 'charging'],
      specifications: {
        make: 'Tata',
        model: 'Starbus',
        year: 2022,
        fuelType: 'diesel',
        color: 'Blue'
      },
      location: {
        currentLat: COLLEGE_ADDRESS.coordinates.lat,
        currentLng: COLLEGE_ADDRESS.coordinates.lng,
        lastUpdated: new Date(),
        isOnline: true
      }
    },
    {
      busNumber: 'CT002',
      name: 'College Transport Bus 2',
      capacity: 35,
      status: 'active',
      driverId: drivers[1]._id,
      routeId: routes[1]._id,
      features: ['wifi', 'ac'],
      specifications: {
        make: 'Ashok Leyland',
        model: 'JanBus',
        year: 2021,
        fuelType: 'diesel',
        color: 'Red'
      },
      location: {
        currentLat: COLLEGE_ADDRESS.coordinates.lat,
        currentLng: COLLEGE_ADDRESS.coordinates.lng,
        lastUpdated: new Date(),
        isOnline: true
      }
    },
    {
      busNumber: 'CT003',
      name: 'College Transport Bus 3',
      capacity: 45,
      status: 'active',
      driverId: drivers[2]._id,
      routeId: routes[2]._id,
      features: ['wifi', 'ac', 'charging', 'wheelchair_accessible'],
      specifications: {
        make: 'Volvo',
        model: '9400',
        year: 2023,
        fuelType: 'diesel',
        color: 'White'
      },
      location: {
        currentLat: COLLEGE_ADDRESS.coordinates.lat,
        currentLng: COLLEGE_ADDRESS.coordinates.lng,
        lastUpdated: new Date(),
        isOnline: true
      }
    },
    {
      busNumber: 'CT004',
      name: 'College Transport Bus 4',
      capacity: 50,
      status: 'active',
      driverId: drivers[0]._id, // Same driver can drive multiple buses
      routeId: routes[3]._id,
      features: ['wifi', 'ac', 'charging'],
      specifications: {
        make: 'Scania',
        model: 'Metrolink',
        year: 2023,
        fuelType: 'diesel',
        color: 'Green'
      },
      location: {
        currentLat: COLLEGE_ADDRESS.coordinates.lat,
        currentLng: COLLEGE_ADDRESS.coordinates.lng,
        lastUpdated: new Date(),
        isOnline: true
      }
    }
  ];

  const createdBuses = [];
  for (const busData of buses) {
    const existingBus = await Bus.findOne({ busNumber: busData.busNumber });
    if (existingBus) {
      console.log(`Bus ${busData.busNumber} already exists. Skipping...`);
      createdBuses.push(existingBus);
      continue;
    }
    const bus = await Bus.create(busData);
    createdBuses.push(bus);
    console.log(`✓ Created bus: ${busData.busNumber} - ${busData.name}`);
  }
  return createdBuses;
};

// Seed Schedules
const seedSchedules = async (buses, routes) => {
  const schedules = [
    // Route 1: College to Andheri - Morning Schedule
    {
      busId: buses[0]._id,
      routeId: routes[0]._id,
      departureTime: '08:00',
      arrivalTime: '08:35',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 40,
      fare: 50,
      isRecurring: true
    },
    {
      busId: buses[0]._id,
      routeId: routes[0]._id,
      departureTime: '14:00',
      arrivalTime: '14:35',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 40,
      fare: 50,
      isRecurring: true
    },
    {
      busId: buses[0]._id,
      routeId: routes[0]._id,
      departureTime: '18:00',
      arrivalTime: '18:35',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 40,
      fare: 50,
      isRecurring: true
    },
    // Route 2: College to Bandra
    {
      busId: buses[1]._id,
      routeId: routes[1]._id,
      departureTime: '08:30',
      arrivalTime: '08:55',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      status: 'active',
      capacity: 35,
      fare: 40,
      isRecurring: true
    },
    {
      busId: buses[1]._id,
      routeId: routes[1]._id,
      departureTime: '16:00',
      arrivalTime: '16:25',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      status: 'active',
      capacity: 35,
      fare: 40,
      isRecurring: true
    },
    // Route 3: College to Borivali
    {
      busId: buses[2]._id,
      routeId: routes[2]._id,
      departureTime: '07:30',
      arrivalTime: '08:30',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 45,
      fare: 80,
      isRecurring: true
    },
    {
      busId: buses[2]._id,
      routeId: routes[2]._id,
      departureTime: '17:00',
      arrivalTime: '18:00',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 45,
      fare: 80,
      isRecurring: true
    },
    // Route 4: College to Thane
    {
      busId: buses[3]._id,
      routeId: routes[3]._id,
      departureTime: '07:00',
      arrivalTime: '08:15',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 50,
      fare: 100,
      isRecurring: true
    },
    {
      busId: buses[3]._id,
      routeId: routes[3]._id,
      departureTime: '16:30',
      arrivalTime: '17:45',
      dayOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      status: 'active',
      capacity: 50,
      fare: 100,
      isRecurring: true
    }
  ];

  const createdSchedules = [];
  for (const scheduleData of schedules) {
    const existingSchedule = await Schedule.findOne({
      busId: scheduleData.busId,
      routeId: scheduleData.routeId,
      departureTime: scheduleData.departureTime,
      dayOfWeek: { $all: scheduleData.dayOfWeek }
    });
    if (existingSchedule) {
      console.log(`Schedule already exists. Skipping...`);
      createdSchedules.push(existingSchedule);
      continue;
    }
    const schedule = await Schedule.create(scheduleData);
    createdSchedules.push(schedule);
    console.log(`✓ Created schedule: ${scheduleData.departureTime} - ${scheduleData.arrivalTime}`);
  }
  return createdSchedules;
};

// Update Users with College Information
const updateUsersWithCollegeInfo = async () => {
  const users = await User.find();
  let updated = 0;
  
  for (const user of users) {
    if (!user.department || user.department === '') {
      // Set default department based on role
      let defaultDept = 'General';
      if (user.role === 'student') {
        defaultDept = 'Computer Science';
      } else if (user.role === 'staff') {
        defaultDept = 'Faculty';
      } else if (user.role === 'driver') {
        defaultDept = 'Transport';
      }
      
      user.department = defaultDept;
      await user.save();
      updated++;
    }
  }
  
  if (updated > 0) {
    console.log(`✓ Updated ${updated} users with department information`);
  }
};

// Main seed function
const seedTransportData = async () => {
  try {
    await connectDB();
    console.log('\n🚌 Seeding Transport Data for', COLLEGE_NAME);
    console.log('==========================================\n');

    // Seed Drivers
    console.log('📋 Creating Drivers...');
    const drivers = await seedDrivers();
    console.log(`✅ Created ${drivers.length} drivers\n`);

    // Seed Routes
    console.log('🛣️  Creating Routes...');
    const routes = await seedRoutes();
    console.log(`✅ Created ${routes.length} routes\n`);

    // Seed Buses
    console.log('🚌 Creating Buses...');
    const buses = await seedBuses(drivers, routes);
    console.log(`✅ Created ${buses.length} buses\n`);

    // Seed Schedules
    console.log('📅 Creating Schedules...');
    const schedules = await seedSchedules(buses, routes);
    console.log(`✅ Created ${schedules.length} schedules\n`);

    // Update Users
    console.log('👥 Updating Users...');
    await updateUsersWithCollegeInfo();

    console.log('\n✅ Transport data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - College: ${COLLEGE_NAME}`);
    console.log(`   - Location: ${COLLEGE_ADDRESS.city}, ${COLLEGE_ADDRESS.state}`);
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Buses: ${buses.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log('\n🎉 You can now use the application with full transport data!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding transport data:', error);
    process.exit(1);
  }
};

// Run seed function
seedTransportData();

