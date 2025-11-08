const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

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

const defaultUsers = [
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
    email: 'staff@college.edu',
    password: 'staff123',
    firstName: 'Jane',
    lastName: 'Staff',
    phone: '1234567892',
    role: 'staff',
    employeeId: 'EMP002',
    department: 'Faculty',
    status: 'active',
    emailVerified: true
  },
  {
    email: 'driver@college.edu',
    password: 'driver123',
    firstName: 'Mike',
    lastName: 'Driver',
    phone: '1234567893',
    role: 'driver',
    department: 'Transport',
    status: 'active',
    emailVerified: true
  }
];

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Create default users
    const createdUsers = [];
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Skipping...`);
        continue;
      }

      // Create user (password will be hashed automatically by the model)
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✓ Created user: ${userData.email} (${userData.role})`);
    }

    if (createdUsers.length === 0) {
      console.log('\n✅ All default users already exist!');
    } else {
      console.log(`\n✅ Successfully created ${createdUsers.length} default user(s)!`);
    }

    console.log('\n📋 Default Login Credentials:');
    console.log('================================');
    defaultUsers.forEach(user => {
      console.log(`\n${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    console.log('\n================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run seed function
seedUsers();
