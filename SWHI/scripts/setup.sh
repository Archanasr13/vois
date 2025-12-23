#!/bin/bash

# Suspicious Domain Hosting Identifier - Setup Script
# This script sets up the development environment

set -e

echo "🔍 Setting up Suspicious Domain Hosting Identifier..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    print_warning "Windows detected. Some commands may need to be run in Git Bash or WSL."
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION found"
else
    print_error "Python 3.8+ is required but not installed."
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js $NODE_VERSION found"
else
    print_error "Node.js 16+ is required but not installed."
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    print_success "PostgreSQL found"
else
    print_warning "PostgreSQL not found. Please install PostgreSQL 12+"
    print_status "You can install it from: https://www.postgresql.org/download/"
fi

# Create virtual environment for backend
print_status "Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "Python dependencies installed"

# Setup database
print_status "Setting up database..."
if command -v createdb &> /dev/null; then
    createdb suspicious_domains 2>/dev/null || print_warning "Database may already exist"
    print_success "Database created"
else
    print_warning "Please create the database manually: createdb suspicious_domains"
fi

# Create .env file for backend
print_status "Creating backend environment file..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
DATABASE_URL=postgresql://suspicious_app:secure_password_123@localhost:5432/suspicious_domains
SECRET_KEY=dev-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True
EOF
    print_success "Backend .env file created"
else
    print_status "Backend .env file already exists"
fi

cd ..

# Setup frontend
print_status "Setting up frontend..."
cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install
print_success "Node.js dependencies installed"

# Create .env file for frontend
print_status "Creating frontend environment file..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
EOF
    print_success "Frontend .env file created"
else
    print_status "Frontend .env file already exists"
fi

cd ..

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Create backup directory
print_status "Creating backup directory..."
mkdir -p backups
print_success "Backup directory created"

# Set up database schema
print_status "Setting up database schema..."
if command -v psql &> /dev/null; then
    psql -d suspicious_domains -f database/setup.sql
    print_success "Database schema created"
else
    print_warning "Please run the database setup manually: psql -d suspicious_domains -f database/setup.sql"
fi

# Create startup scripts
print_status "Creating startup scripts..."

# Backend startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
EOF

# Frontend startup script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd frontend
npm start
EOF

# Make scripts executable
chmod +x start_backend.sh start_frontend.sh
print_success "Startup scripts created"

# Create development script
cat > start_dev.sh << 'EOF'
#!/bin/bash
# Start both backend and frontend in development mode

echo "Starting Suspicious Domain Hosting Identifier..."

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT

echo "Development servers started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait
EOF

chmod +x start_dev.sh
print_success "Development startup script created"

# Final instructions
print_success "Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   ./start_dev.sh"
echo ""
echo "🔧 To start components individually:"
echo "   Backend:  ./start_backend.sh"
echo "   Frontend: ./start_frontend.sh"
echo ""
echo "📊 Database:"
echo "   Host: localhost:5432"
echo "   Database: suspicious_domains"
echo "   User: suspicious_app"
echo "   Password: secure_password_123"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env files with your configuration"
echo "   2. Run ./start_dev.sh to start development servers"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
print_success "Happy analyzing! 🔍"



