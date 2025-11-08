# College Transport Management System

A comprehensive college transport management system with user management, bus management, seat booking, route scheduling, and more.

## Features

- 🔐 Secure user registration/login system
- 👥 Role-based access control (Student/Staff/Admin/Driver)
- 🚌 Bus management and route assignment
- 🎫 Seat booking and cancellation system
- 📍 Real-time bus tracking
- 📊 Admin dashboard with reports
- 📱 Fully responsive design
- 🔍 SEO optimization
- 🗺️ Map integration
- 📧 Notification system
- 📈 Analytics and reporting

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router
- Axios
- React Helmet (SEO)
- Leaflet.js (Maps)
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB/PostgreSQL
- JWT Authentication
- bcrypt password hashing
- Socket.io (real-time notifications)

## Project Structure

```
college-transport-management/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/         # Page Components
│   │   ├── hooks/         # Custom Hooks
│   │   ├── services/      # API Services
│   │   ├── utils/         # Utility Functions
│   │   └── styles/        # Style Files
│   └── package.json
├── server/                # Node.js Backend
│   ├── controllers/       # Controllers
│   ├── models/           # Data Models
│   ├── routes/           # Routes
│   ├── middleware/       # Middleware
│   ├── utils/            # Utility Functions
│   └── package.json
├── docs/                 # Documentation
├── .env.example         # Environment Variables Example
└── README.md
```

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd college-transport-management
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Environment setup
```bash
# Copy environment variables file
cp .env.example .env

# Edit .env file with your configuration
```

### 4. Start development server
```bash
npm run dev
```

Visit http://localhost:3000 to view the application

## Environment Variables

Create a `.env` file and configure the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/college-transport
# OR PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/college_transport

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Map API
MAPBOX_ACCESS_TOKEN=your-mapbox-token
# OR Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## Deployment

### Heroku Deployment
1. Create Heroku app
2. Configure environment variables
3. Connect MongoDB Atlas or PostgreSQL
4. Deploy code

### Vercel Deployment
1. Connect GitHub repository
2. Configure environment variables
3. Deploy

## API Documentation

Detailed API documentation can be found in [API Documentation](./docs/API.md)

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License
