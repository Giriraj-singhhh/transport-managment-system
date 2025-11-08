const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

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

// Seed Users
const seedUsers = async () => {
  const users = [
    {
      email: 'admin@college.edu',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '1234567890',
      role: 'admin',
      employeeId: 'EMP001',
      department: 'Administration',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'student@college.edu',
      password: 'student123',
      firstName: 'John',
      lastName: 'Student',
      phone: '1234567891',
      role: 'student',
      studentId: 'STU001',
      department: 'Computer Science',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'student2@college.edu',
      password: 'student123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '1234567892',
      role: 'student',
      studentId: 'STU002',
      department: 'Electrical Engineering',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'student3@college.edu',
      password: 'student123',
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '1234567893',
      role: 'student',
      studentId: 'STU003',
      department: 'Mechanical Engineering',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'staff@college.edu',
      password: 'staff123',
      firstName: 'Jane',
      lastName: 'Staff',
      phone: '1234567894',
      role: 'staff',
      employeeId: 'EMP002',
      department: 'Faculty',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'staff2@college.edu',
      password: 'staff123',
      firstName: 'Robert',
      lastName: 'Williams',
      phone: '1234567895',
      role: 'staff',
      employeeId: 'EMP003',
      department: 'Administration',
      status: 'active',
      emailVerified: true
    },
    {
      email: 'driver@college.edu',
      password: 'driver123',
      firstName: 'Mike',
      lastName: 'Driver',
      phone: '1234567896',
      role: 'driver',
      department: 'Transport',
      status: 'active',
      emailVerified: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User ${userData.email} already exists. Skipping...`);
      createdUsers.push(existingUser);
      continue;
    }
    const user = await User.create(userData);
    createdUsers.push(user);
    console.log(`✓ Created user: ${userData.email} (${userData.role})`);
  }
  return createdUsers;
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
        studentDiscount: 0.2,
        staffDiscount: 0.1
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
        studentDiscount: 0.25,
        staffDiscount: 0.15
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
      features: ['wifi', 'ac', 'charging', 'gps_tracking'],
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
      features: ['wifi', 'ac', 'charging', 'wheelchair_accessible', 'gps_tracking'],
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
      driverId: drivers[0]._id,
      routeId: routes[3]._id,
      features: ['wifi', 'ac', 'charging', 'gps_tracking'],
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

// Seed Bookings
const seedBookings = async (users, schedules) => {
  // Populate schedules to get busId
  const populatedSchedules = await Schedule.find().populate('busId');
  const scheduleMap = {};
  populatedSchedules.forEach(s => {
    scheduleMap[s._id.toString()] = s;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const bookings = [
    {
      userId: users[1]._id, // student@college.edu
      busId: scheduleMap[schedules[0]._id.toString()]?.busId?._id || schedules[0].busId,
      scheduleId: schedules[0]._id,
      travelDate: tomorrow,
      seatNumber: 5,
      status: 'confirmed',
      amount: 40, // Student discount applied
      paymentStatus: 'paid',
      paymentMethod: 'card',
      boardingPoint: 'College Main Gate',
      notes: 'Regular commuter'
    },
    {
      userId: users[2]._id, // student2@college.edu
      busId: scheduleMap[schedules[0]._id.toString()]?.busId?._id || schedules[0].busId,
      scheduleId: schedules[0]._id,
      travelDate: tomorrow,
      seatNumber: 12,
      status: 'confirmed',
      amount: 40,
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      boardingPoint: 'College Main Gate',
      notes: ''
    },
    {
      userId: users[4]._id, // staff@college.edu
      busId: scheduleMap[schedules[0]._id.toString()]?.busId?._id || schedules[0].busId,
      scheduleId: schedules[0]._id,
      travelDate: tomorrow,
      seatNumber: 20,
      status: 'confirmed',
      amount: 45, // Staff discount
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      boardingPoint: 'College Main Gate',
      notes: ''
    },
    {
      userId: users[1]._id, // student@college.edu
      busId: scheduleMap[schedules[3]._id.toString()]?.busId?._id || schedules[3].busId,
      scheduleId: schedules[3]._id, // Bandra route
      travelDate: nextWeek,
      seatNumber: 8,
      status: 'confirmed',
      amount: 32, // Student discount
      paymentStatus: 'paid',
      paymentMethod: 'card',
      boardingPoint: 'College Main Gate',
      notes: ''
    },
    {
      userId: users[3]._id, // student3@college.edu
      busId: scheduleMap[schedules[5]._id.toString()]?.busId?._id || schedules[5].busId,
      scheduleId: schedules[5]._id, // Borivali route
      travelDate: tomorrow,
      seatNumber: 15,
      status: 'confirmed',
      amount: 64, // Student discount
      paymentStatus: 'paid',
      paymentMethod: 'wallet',
      boardingPoint: 'College Main Gate',
      notes: ''
    },
    // Skip completed booking with past date - validation doesn't allow it
    // {
    //   userId: users[2]._id, // student2@college.edu
    //   busId: scheduleMap[schedules[1]._id.toString()]?.busId?._id || schedules[1].busId,
    //   scheduleId: schedules[1]._id, // Afternoon Andheri
    //   travelDate: yesterday,
    //   seatNumber: 3,
    //   status: 'completed',
    //   amount: 40,
    //   paymentStatus: 'paid',
    //   paymentMethod: 'card',
    //   boardingPoint: 'College Main Gate',
    //   notes: 'Completed trip'
    // },
    {
      userId: users[5]._id, // staff2@college.edu
      busId: scheduleMap[schedules[7]._id.toString()]?.busId?._id || schedules[7].busId,
      scheduleId: schedules[7]._id, // Thane route
      travelDate: nextWeek,
      seatNumber: 25,
      status: 'confirmed',
      amount: 85, // Staff discount
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      boardingPoint: 'College Main Gate',
      notes: 'Payment on boarding'
    }
  ];

  const createdBookings = [];
  for (const bookingData of bookings) {
    const existingBooking = await Booking.findOne({
      userId: bookingData.userId,
      scheduleId: bookingData.scheduleId,
      travelDate: bookingData.travelDate,
      seatNumber: bookingData.seatNumber
    });
    if (existingBooking) {
      console.log(`Booking already exists. Skipping...`);
      createdBookings.push(existingBooking);
      continue;
    }
    const booking = await Booking.create(bookingData);
    createdBookings.push(booking);
    console.log(`✓ Created booking for user ${bookingData.userId} on schedule ${bookingData.scheduleId}`);
  }
  return createdBookings;
};

// Seed Notifications
const seedNotifications = async (users) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const notifications = [
    {
      userId: users[1]._id, // student@college.edu
      title: 'Booking Confirmed',
      message: 'Your booking for tomorrow\'s trip to Andheri has been confirmed. Seat: 5',
      type: 'booking',
      isRead: false,
      priority: 'medium'
    },
    {
      userId: users[1]._id,
      title: 'Payment Successful',
      message: 'Payment of ₹40 for your booking has been processed successfully.',
      type: 'payment',
      isRead: true,
      priority: 'medium',
      readAt: yesterday
    },
    {
      userId: users[0]._id, // admin@college.edu
      title: 'New Booking',
      message: 'A new booking has been created by John Student',
      type: 'system',
      isRead: false,
      priority: 'low'
    },
    {
      userId: users[4]._id, // staff@college.edu
      title: 'Route Update',
      message: 'Route to Bandra Station has been updated. New departure time: 8:30 AM',
      type: 'schedule_change',
      isRead: false,
      priority: 'high'
    },
    {
      userId: users[2]._id, // student2@college.edu
      title: 'Trip Completed',
      message: 'Your trip to Andheri has been completed. Thank you for using our service!',
      type: 'booking',
      isRead: true,
      priority: 'medium',
      readAt: yesterday
    },
    {
      userId: users[1]._id, // System notification for all users
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday, 2 AM - 4 AM. Services will be temporarily unavailable.',
      type: 'system',
      isRead: false,
      priority: 'high'
    },
    {
      userId: users[2]._id,
      title: 'New Route Added',
      message: 'New route to Thane has been added. Book your seats now!',
      type: 'promotion',
      isRead: false,
      priority: 'medium',
      createdAt: lastWeek
    }
  ];

  const createdNotifications = [];
  for (const notificationData of notifications) {
    const notification = await Notification.create(notificationData);
    createdNotifications.push(notification);
    console.log(`✓ Created notification: ${notificationData.title}`);
  }
  return createdNotifications;
};

// Main seed function
const seedAllData = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding All Data for', COLLEGE_NAME);
    console.log('==========================================\n');

    // Seed Users
    console.log('👥 Creating Users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users\n`);

    // Seed Drivers
    console.log('👨‍✈️ Creating Drivers...');
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

    // Seed Bookings
    console.log('🎫 Creating Bookings...');
    const bookings = await seedBookings(users, schedules);
    console.log(`✅ Created ${bookings.length} bookings\n`);

    // Seed Notifications
    console.log('🔔 Creating Notifications...');
    const notifications = await seedNotifications(users);
    console.log(`✅ Created ${notifications.length} notifications\n`);

    console.log('\n✅ All data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - College: ${COLLEGE_NAME}`);
    console.log(`   - Location: ${COLLEGE_ADDRESS.city}, ${COLLEGE_ADDRESS.state}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Buses: ${buses.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log('\n🎉 Your application is now fully populated with data!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed function
seedAllData();

