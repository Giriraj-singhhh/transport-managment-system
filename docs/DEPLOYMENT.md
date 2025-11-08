# Deployment Guide

This guide covers deploying the College Transport Management System to various platforms.

## Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account or PostgreSQL database
- Map API key (Google Maps or Mapbox)
- Email service (optional)
- Cloud storage (optional)

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-transport
# OR PostgreSQL
# DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com

# Map API Keys
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
# OR Google Maps
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

## Heroku Deployment

### 1. Prepare for Heroku

Create a `Procfile` in the root directory:
```
web: cd server && npm start
```

Update `server/package.json` scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "heroku-postbuild": "cd ../client && npm install && npm run build"
  }
}
```

### 2. Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

### 3. Configure Database

For MongoDB Atlas:
1. Create a cluster
2. Add your IP to whitelist
3. Create a database user
4. Get connection string

For PostgreSQL:
1. Use Heroku Postgres addon
2. Get DATABASE_URL from Heroku config

## Vercel Deployment

### 1. Frontend Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel

# Set environment variables
vercel env add REACT_APP_API_URL
```

### 2. Backend Deployment

Create `vercel.json` in server directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

Deploy backend:
```bash
cd server
vercel
```

## AWS Deployment

### 1. EC2 Instance Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone your-repo-url
cd college-transport-management

# Install dependencies
npm run install-all

# Build frontend
cd client && npm run build

# Start with PM2
cd ../server
pm2 start index.js --name "college-transport"
pm2 startup
pm2 save
```

### 3. Configure Nginx

Create `/etc/nginx/sites-available/college-transport`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/college-transport /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Docker Deployment

### 1. Create Dockerfile

Create `Dockerfile` in root directory:
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

# Install production dependencies
WORKDIR /app/server
RUN npm install --only=production

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/college-transport
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mongo_data:
```

### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Database Setup

### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Add IP address to whitelist
5. Get connection string

### PostgreSQL

1. Create database
2. Run migrations (if any)
3. Set up connection string

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular backups

### 3. API Security
- Rate limiting enabled
- CORS properly configured
- Input validation
- SQL injection protection

### 4. HTTPS
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use HSTS headers

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure PM2 monitoring
pm2 install pm2-server-monit
```

### 2. Log Management
```bash
# View logs
pm2 logs college-transport

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. Health Checks
- Monitor API endpoints
- Database connectivity
- Memory usage
- CPU usage

## Backup Strategy

### 1. Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" --out=backup/

# PostgreSQL backup
pg_dump -h host -U username database > backup.sql
```

### 2. File Backup
```bash
# Backup uploads
tar -czf uploads-backup.tar.gz uploads/
```

### 3. Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backup-$DATE"
tar -czf "backup-$DATE.tar.gz" "backup-$DATE"
rm -rf "backup-$DATE"

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### 1. Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Code splitting

### 2. Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

### 3. Server Optimization
- Enable gzip compression
- Use reverse proxy
- Load balancing
- SSL termination

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check connection string
   - Verify network access
   - Check credentials

2. **Build Failures**
   - Check Node.js version
   - Clear npm cache
   - Check dependencies

3. **API Errors**
   - Check environment variables
   - Verify CORS settings
   - Check rate limits

4. **WebSocket Issues**
   - Check proxy configuration
   - Verify Socket.IO setup
   - Check firewall settings

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# PM2 debug mode
pm2 start index.js --name "college-transport" --node-args="--inspect"
```

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor logs
- Check disk space
- Review security
- Backup data
- Performance monitoring

### Updates
```bash
# Update dependencies
npm update

# Rebuild and restart
npm run build
pm2 restart college-transport
```
