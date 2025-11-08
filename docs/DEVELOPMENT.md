# Development Guide

This guide covers setting up the development environment for the College Transport Management System.

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd college-transport-management
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
```

### 4. Start Development Servers
```bash
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000) servers.

## Project Structure

```
college-transport-management/
├── client/                 # React Frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Auth/      # Authentication components
│   │   │   ├── Layout/    # Layout components
│   │   │   ├── UI/        # UI components
│   │   │   └── ...
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Style files
│   └── package.json
├── server/                # Node.js Backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── index.js          # Server entry point
│   └── package.json
├── docs/                 # Documentation
└── package.json          # Root package.json
```

## Development Workflow

### 1. Backend Development

#### Database Models
Models are defined in `server/models/` using Mongoose:
- `User.js` - User management
- `Bus.js` - Bus information
- `Driver.js` - Driver details
- `Route.js` - Route information
- `Schedule.js` - Bus schedules
- `Booking.js` - Seat bookings
- `Notification.js` - Notifications

#### API Routes
Routes are organized in `server/routes/`:
- `auth.js` - Authentication endpoints
- `users.js` - User management
- `buses.js` - Bus management
- `drivers.js` - Driver management
- `routes.js` - Route management
- `schedules.js` - Schedule management
- `bookings.js` - Booking management
- `notifications.js` - Notification system
- `admin.js` - Admin functions

#### Middleware
Custom middleware in `server/middleware/`:
- `auth.js` - Authentication & authorization
- `validation.js` - Input validation
- `errorHandler.js` - Error handling

### 2. Frontend Development

#### Components Structure
```
src/components/
├── Auth/              # Authentication components
├── Layout/            # Layout components
├── UI/                # Reusable UI components
├── Forms/             # Form components
├── Tables/            # Table components
├── Charts/            # Chart components
└── Maps/              # Map components
```

#### Pages Structure
```
src/pages/
├── Public/            # Public pages
├── Auth/              # Authentication pages
├── Dashboard/         # Dashboard pages
├── Admin/             # Admin pages
├── Driver/            # Driver pages
└── Error/             # Error pages
```

#### State Management
- React Context for global state
- React Query for server state
- Local state with useState/useReducer

### 3. API Integration

#### API Service
The `src/services/api.js` file contains:
- Axios configuration
- Request/response interceptors
- API method definitions
- Error handling

#### React Query
Used for data fetching and caching:
```javascript
import { useQuery, useMutation } from 'react-query';
import { busesAPI } from '../services/api';

// Fetch data
const { data, isLoading, error } = useQuery('buses', busesAPI.getBuses);

// Mutate data
const mutation = useMutation(busesAPI.createBus, {
  onSuccess: () => {
    queryClient.invalidateQueries('buses');
  }
});
```

## Development Tools

### 1. Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

### 2. Testing
- Jest for unit testing
- React Testing Library for component testing
- Supertest for API testing

### 3. Development Server
- React Scripts for frontend
- Nodemon for backend
- Concurrently for running both

## Database Development

### 1. Local MongoDB Setup
```bash
# Install MongoDB
brew install mongodb-community  # macOS
sudo apt install mongodb        # Ubuntu

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Ubuntu

# Connect to MongoDB
mongo
```

### 2. MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Update `.env` file

### 3. Database Seeding
```bash
# Run seed script
cd server
npm run seed
```

## API Development

### 1. Testing API Endpoints
Use tools like Postman or curl:

```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 2. API Documentation
- Swagger/OpenAPI documentation
- Postman collection
- API testing with Jest

### 3. WebSocket Testing
```javascript
// Test Socket.IO connection
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

## Frontend Development

### 1. Component Development
```javascript
// Example component structure
import React from 'react';
import { useQuery } from 'react-query';
import { busesAPI } from '../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';

const BusList = () => {
  const { data: buses, isLoading, error } = useQuery('buses', busesAPI.getBuses);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading buses</div>;

  return (
    <div>
      {buses?.map(bus => (
        <div key={bus._id}>{bus.name}</div>
      ))}
    </div>
  );
};

export default BusList;
```

### 2. Form Handling
```javascript
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

const BusForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const mutation = useMutation(busesAPI.createBus);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>Name is required</span>}
      <button type="submit">Create Bus</button>
    </form>
  );
};
```

### 3. State Management
```javascript
// Context for global state
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, { loading: false });
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
```

## Styling

### 1. Tailwind CSS
- Utility-first CSS framework
- Custom configuration in `tailwind.config.js`
- Component classes in `src/index.css`

### 2. Component Styling
```javascript
// Using Tailwind classes
const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Testing

### 1. Unit Tests
```javascript
// Example test
import { render, screen } from '@testing-library/react';
import BusList from '../BusList';

test('renders bus list', () => {
  render(<BusList />);
  expect(screen.getByText('Bus List')).toBeInTheDocument();
});
```

### 2. API Tests
```javascript
// Example API test
import request from 'supertest';
import app from '../index';

test('GET /api/buses', async () => {
  const response = await request(app)
    .get('/api/buses')
    .expect(200);
  
  expect(response.body.status).toBe('success');
});
```

### 3. Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Debugging

### 1. Backend Debugging
```bash
# Debug with Node.js inspector
node --inspect index.js

# Debug with PM2
pm2 start index.js --name "debug" --node-args="--inspect"
```

### 2. Frontend Debugging
- React Developer Tools
- Redux DevTools
- Network tab in browser
- Console logging

### 3. Database Debugging
```bash
# MongoDB shell
mongo
use college-transport
db.users.find()

# MongoDB Compass (GUI)
```

## Performance Optimization

### 1. Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

### 2. Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

### 3. Monitoring
- Performance metrics
- Error tracking
- User analytics
- Server monitoring

## Git Workflow

### 1. Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### 2. Commit Convention
```
feat: add new booking feature
fix: resolve login issue
docs: update API documentation
style: format code
refactor: restructure components
test: add unit tests
chore: update dependencies
```

### 3. Pull Request Process
1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Create pull request
6. Code review
7. Merge to develop

## Common Issues

### 1. Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### 2. Database Connection Issues
- Check MongoDB is running
- Verify connection string
- Check network access

### 3. Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. Environment Variables
- Check `.env` file exists
- Verify variable names
- Restart development server

## Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com)
- [Postman](https://www.postman.com)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

### Learning Resources
- [React Tutorial](https://reactjs.org/tutorial/tutorial.html)
- [Node.js Tutorial](https://nodejs.org/en/docs/guides/getting-started-guide)
- [MongoDB Tutorial](https://docs.mongodb.com/manual/tutorial)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)
