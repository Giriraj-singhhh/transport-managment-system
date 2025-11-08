# Database ER Diagram

## Entity Relationship Diagram for College Transport Management System

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │      Bus        │    │     Driver      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ busNumber       │    │ name            │
│ password        │    │ name            │    │ email           │
│ firstName       │    │ capacity        │    │ phone           │
│ lastName        │    │ status          │    │ licenseNumber   │
│ phone           │    │ driverId (FK)   │◄───┤ status          │
│ role            │    │ routeId (FK)    │    │ createdAt       │
│ department      │    │ createdAt       │    │ updatedAt       │
│ status          │    │ updatedAt       │    └─────────────────┘
│ createdAt       │    └─────────────────┘
│ updatedAt       │             │
└─────────────────┘             │
         │                      │
         │                      ▼
         │            ┌─────────────────┐
         │            │     Route       │
         │            ├─────────────────┤
         │            │ id (PK)         │
         │            │ name            │
         │            │ startLocation   │
         │            │ endLocation     │
         │            │ distance        │
         │            │ estimatedTime   │
         │            │ status          │
         │            │ createdAt       │
         │            │ updatedAt       │
         │            └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│    Booking      │    │   Schedule      │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ userId (FK)     │◄───┤ busId (FK)      │
│ busId (FK)      │    │ routeId (FK)    │
│ seatNumber      │    │ departureTime   │
│ bookingDate     │    │ arrivalTime     │
│ status          │    │ dayOfWeek       │
│ createdAt       │    │ status          │
│ updatedAt       │    │ createdAt       │
└─────────────────┘    │ updatedAt       │
                       └─────────────────┘
                                │
                                │
                                ▼
                       ┌─────────────────┐
                       │  Notification   │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ userId (FK)     │
                       │ type            │
                       │ title           │
                       │ message         │
                       │ isRead          │
                       │ createdAt       │
                       └─────────────────┘
```

## Relationships

1. **User** (1) ── (M) **Booking**: One user can have multiple bookings
2. **Bus** (1) ── (M) **Booking**: One bus can have multiple bookings
3. **Driver** (1) ── (M) **Bus**: One driver can drive multiple buses
4. **Route** (1) ── (M) **Bus**: One route can have multiple buses
5. **Route** (1) ── (M) **Schedule**: One route can have multiple schedules
6. **Bus** (1) ── (M) **Schedule**: One bus can have multiple schedules
7. **User** (1) ── (M) **Notification**: One user can have multiple notifications

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (enum: ['student', 'staff', 'admin', 'driver']),
  department: String,
  status: String (enum: ['active', 'inactive', 'suspended']),
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Bus Model
```javascript
{
  _id: ObjectId,
  busNumber: String (unique),
  name: String,
  capacity: Number,
  status: String (enum: ['active', 'maintenance', 'inactive']),
  driverId: ObjectId (ref: 'Driver'),
  routeId: ObjectId (ref: 'Route'),
  features: [String], // ['wifi', 'ac', 'charging']
  createdAt: Date,
  updatedAt: Date
}
```

### Driver Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  licenseNumber: String (unique),
  status: String (enum: ['active', 'inactive', 'suspended']),
  experience: Number, // years
  createdAt: Date,
  updatedAt: Date
}
```

### Route Model
```javascript
{
  _id: ObjectId,
  name: String,
  startLocation: String,
  endLocation: String,
  waypoints: [String],
  distance: Number, // in km
  estimatedTime: Number, // in minutes
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date
}
```

### Schedule Model
```javascript
{
  _id: ObjectId,
  busId: ObjectId (ref: 'Bus'),
  routeId: ObjectId (ref: 'Route'),
  departureTime: String, // HH:MM format
  arrivalTime: String, // HH:MM format
  dayOfWeek: [String], // ['monday', 'tuesday', ...]
  status: String (enum: ['active', 'cancelled', 'delayed']),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  busId: ObjectId (ref: 'Bus'),
  scheduleId: ObjectId (ref: 'Schedule'),
  seatNumber: Number,
  bookingDate: Date,
  travelDate: Date,
  status: String (enum: ['confirmed', 'cancelled', 'completed']),
  paymentStatus: String (enum: ['pending', 'paid', 'refunded']),
  amount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  type: String (enum: ['booking', 'cancellation', 'schedule_change', 'delay']),
  title: String,
  message: String,
  isRead: Boolean,
  data: Object, // additional data
  createdAt: Date
}
```
