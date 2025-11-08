# Default User Credentials

## How to Create Default Users

Run the seed script to create default users:

```bash
cd server
npm run seed
```

Or from the root directory:

```bash
cd server && npm run seed
```

## Default Login Credentials

### 👨‍💼 ADMIN
- **Email:** `admin@college.edu`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access

### 👨‍🎓 STUDENT
- **Email:** `student@college.edu`
- **Password:** `student123`
- **Role:** Student
- **Access:** Book buses, view schedules, track buses

### 👩‍🏫 STAFF
- **Email:** `staff@college.edu`
- **Password:** `staff123`
- **Role:** Staff
- **Access:** Book buses, view schedules

### 🚌 DRIVER
- **Email:** `driver@college.edu`
- **Password:** `driver123`
- **Role:** Driver
- **Access:** View schedule, update location

## Notes

- The seed script will **NOT** delete existing users
- If a user already exists, it will skip creating that user
- Passwords are automatically hashed by the User model
- All users are set to `active` status and `emailVerified: true`

## Quick Start

1. Make sure MongoDB is running
2. Make sure `.env` file is configured with `MONGODB_URI`
3. Run: `cd server && npm run seed`
4. Login with any of the credentials above

