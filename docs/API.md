# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "status": "success|error",
  "message": "Response message",
  "data": { ... }
}
```

## Error Response Format
```json
{
  "status": "error",
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "student|staff|driver",
  "department": "Computer Science",
  "studentId": "CS2023001",
  "employeeId": "EMP001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/logout
Logout user (requires authentication).

### GET /auth/me
Get current user information (requires authentication).

### POST /auth/change-password
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword",
  "confirmPassword": "newpassword"
}
```

### POST /auth/forgot-password
Send password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword"
}
```

---

## User Endpoints

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `status` (string): Filter by status
- `department` (string): Filter by department
- `search` (string): Search term

### GET /users/:id
Get user by ID.

### PUT /users/:id
Update user profile.

### DELETE /users/:id
Delete user (Admin only).

### GET /users/:id/bookings
Get user's bookings.

### GET /users/:id/notifications
Get user's notifications.

### PUT /users/:id/notifications/read-all
Mark all user notifications as read.

### GET /users/stats/overview
Get user statistics (Admin only).

---

## Bus Endpoints

### GET /buses
Get all buses.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `routeId`: Filter by route
- `driverId`: Filter by driver
- `search`: Search term

### GET /buses/:id
Get bus by ID.

### POST /buses
Create new bus (Admin only).

**Request Body:**
```json
{
  "busNumber": "BUS001",
  "name": "Campus Shuttle 1",
  "capacity": 50,
  "driverId": "driver_id",
  "routeId": "route_id",
  "status": "active",
  "features": ["wifi", "ac", "charging"]
}
```

### PUT /buses/:id
Update bus (Admin only).

### DELETE /buses/:id
Delete bus (Admin only).

### PUT /buses/:id/location
Update bus location (Driver only).

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

### GET /buses/:id/available-seats
Get available seats for a bus on a specific date.

**Query Parameters:**
- `travelDate`: Date in ISO format

### GET /buses/near-location
Find buses near a location.

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `maxDistance`: Maximum distance in meters

---

## Driver Endpoints

### GET /drivers
Get all drivers.

### GET /drivers/:id
Get driver by ID.

### POST /drivers
Create new driver (Admin only).

**Request Body:**
```json
{
  "name": "John Driver",
  "email": "driver@example.com",
  "phone": "+1234567890",
  "licenseNumber": "DL123456",
  "licenseType": "D",
  "licenseExpiry": "2025-12-31",
  "experience": 5,
  "status": "active"
}
```

### PUT /drivers/:id
Update driver (Admin only).

### DELETE /drivers/:id
Delete driver (Admin only).

### PUT /drivers/:id/location
Update driver location (Driver only).

### GET /drivers/available
Get available drivers.

---

## Route Endpoints

### GET /routes
Get all routes.

### GET /routes/:id
Get route by ID.

### POST /routes
Create new route (Admin only).

**Request Body:**
```json
{
  "name": "Campus to Downtown",
  "startLocation": "University Campus",
  "endLocation": "Downtown Station",
  "distance": 15.5,
  "estimatedTime": 45,
  "fare": {
    "base": 10,
    "perKm": 2,
    "studentDiscount": 0.1,
    "staffDiscount": 0.05
  },
  "capacity": 50
}
```

### PUT /routes/:id
Update route (Admin only).

### DELETE /routes/:id
Delete route (Admin only).

### GET /routes/:id/fare
Calculate fare for a route.

**Query Parameters:**
- `userRole`: User role for discount calculation

### GET /routes/near-location
Find routes near a location.

---

## Schedule Endpoints

### GET /schedules
Get all schedules.

**Query Parameters:**
- `status`: Filter by status
- `busId`: Filter by bus
- `routeId`: Filter by route
- `dayOfWeek`: Filter by day

### GET /schedules/:id
Get schedule by ID.

### POST /schedules
Create new schedule (Admin only).

**Request Body:**
```json
{
  "busId": "bus_id",
  "routeId": "route_id",
  "departureTime": "08:00",
  "arrivalTime": "08:45",
  "dayOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "capacity": 50,
  "fare": 15
}
```

### PUT /schedules/:id
Update schedule (Admin only).

### DELETE /schedules/:id
Delete schedule (Admin only).

### PUT /schedules/:id/delay
Update schedule delay (Admin/Driver).

**Request Body:**
```json
{
  "minutes": 15,
  "reason": "Traffic congestion"
}
```

### GET /schedules/today
Get today's schedules.

### GET /schedules/upcoming
Get upcoming schedules.

**Query Parameters:**
- `hours`: Hours ahead to look (default: 24)

---

## Booking Endpoints

### GET /bookings
Get all bookings (Admin only).

**Query Parameters:**
- `status`: Filter by status
- `paymentStatus`: Filter by payment status
- `busId`: Filter by bus
- `userId`: Filter by user
- `travelDate`: Filter by travel date

### GET /bookings/:id
Get booking by ID.

### POST /bookings
Create new booking.

**Request Body:**
```json
{
  "busId": "bus_id",
  "scheduleId": "schedule_id",
  "seatNumber": 15,
  "travelDate": "2024-01-15",
  "passengerDetails": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "age": 25,
    "gender": "male"
  },
  "paymentMethod": "card"
}
```

### PUT /bookings/:id/cancel
Cancel booking.

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

### PUT /bookings/:id/complete
Mark booking as completed (Admin/Driver).

### GET /bookings/bus/:busId/date/:date
Get bookings for a specific bus and date.

### GET /bookings/stats
Get booking statistics (Admin only).

---

## Notification Endpoints

### GET /notifications
Get user's notifications.

**Query Parameters:**
- `isRead`: Filter by read status
- `type`: Filter by type
- `includeExpired`: Include expired notifications

### GET /notifications/:id
Get notification by ID.

### PUT /notifications/:id/read
Mark notification as read.

### PUT /notifications/:id/unread
Mark notification as unread.

### PUT /notifications/read-all
Mark all notifications as read.

### GET /notifications/unread-count
Get unread notification count.

### POST /notifications
Create notification (Admin only).

### POST /notifications/bulk
Create bulk notifications (Admin only).

### POST /notifications/by-role
Send notifications to users by role (Admin only).

### DELETE /notifications/:id
Delete notification.

### GET /notifications/stats
Get notification statistics (Admin only).

---

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard data.

### GET /admin/reports/bookings
Generate booking report.

**Query Parameters:**
- `startDate`: Start date
- `endDate`: End date
- `format`: json or csv

### GET /admin/reports/revenue
Generate revenue report.

**Query Parameters:**
- `startDate`: Start date
- `endDate`: End date
- `groupBy`: day, week, or month

### GET /admin/reports/buses
Generate bus utilization report.

### POST /admin/announcements
Create system announcement.

**Request Body:**
```json
{
  "title": "System Maintenance",
  "message": "System will be under maintenance from 2-4 AM",
  "targetRoles": ["student", "staff"],
  "priority": "high"
}
```

### GET /admin/system-health
Get system health status.

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

---

## WebSocket Events

The system uses Socket.IO for real-time features:

### Client Events
- `join-room`: Join user-specific room
- `disconnect`: Handle disconnection

### Server Events
- `notification`: New notification
- `booking-update`: Booking status update
- `schedule-change`: Schedule change notification
- `bus-location`: Real-time bus location update

---

## File Upload

### POST /upload
Upload files (images, documents).

**Request:** Multipart form data with file field.

**Response:**
```json
{
  "status": "success",
  "data": {
    "url": "https://example.com/uploads/file.jpg",
    "filename": "file.jpg",
    "size": 1024
  }
}
```
