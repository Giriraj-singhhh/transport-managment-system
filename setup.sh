#!/bin/bash

# College Transport Management System Setup Script
# This script sets up the development environment

set -e

echo "🚌 College Transport Management System Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if MongoDB is available
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_status "MongoDB is installed locally"
    else
        print_warning "MongoDB is not installed locally. You can use MongoDB Atlas instead."
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install root dependencies
    print_info "Installing root dependencies..."
    npm install
    
    # Install server dependencies
    print_info "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    print_info "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_status "All dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p server/uploads
    mkdir -p server/logs
    mkdir -p client/public/uploads
    
    print_status "Directories created successfully"
}

# Setup database (if MongoDB is available)
setup_database() {
    if command -v mongod &> /dev/null; then
        print_info "Setting up local MongoDB database..."
        
        # Start MongoDB if not running
        if ! pgrep -x "mongod" > /dev/null; then
            print_info "Starting MongoDB..."
            if command -v brew &> /dev/null; then
                brew services start mongodb-community
            elif command -v systemctl &> /dev/null; then
                sudo systemctl start mongod
            fi
        fi
        
        # Wait for MongoDB to start
        sleep 3
        
        # Create database and seed data
        print_info "Creating database and seeding data..."
        cd server
        npm run seed 2>/dev/null || print_warning "Seeding failed. You may need to run it manually later."
        cd ..
        
        print_status "Database setup completed"
    else
        print_warning "MongoDB not available locally. Please configure MongoDB Atlas in .env file"
    fi
}

# Build frontend
build_frontend() {
    print_info "Building frontend..."
    cd client
    npm run build
    cd ..
    print_status "Frontend built successfully"
}

# Main setup function
main() {
    echo
    print_info "Starting setup process..."
    echo
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_nodejs
    check_npm
    check_mongodb
    echo
    
    # Install dependencies
    install_dependencies
    echo
    
    # Setup environment
    setup_environment
    echo
    
    # Create directories
    create_directories
    echo
    
    # Setup database
    setup_database
    echo
    
    # Build frontend
    build_frontend
    echo
    
    print_status "Setup completed successfully!"
    echo
    print_info "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Start development servers with: npm run dev"
    echo "3. Open http://localhost:3000 in your browser"
    echo
    print_info "Available scripts:"
    echo "- npm run dev          # Start development servers"
    echo "- npm run server       # Start backend server only"
    echo "- npm run client       # Start frontend server only"
    echo "- npm run build        # Build for production"
    echo "- npm run test         # Run tests"
    echo
    print_info "Documentation:"
    echo "- README.md            # Project overview"
    echo "- docs/DEVELOPMENT.md  # Development guide"
    echo "- docs/API.md          # API documentation"
    echo "- docs/DEPLOYMENT.md   # Deployment guide"
    echo
}

# Run main function
main "$@"
