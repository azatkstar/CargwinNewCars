#!/bin/bash
# Production deployment script for CargwinNewCar

set -e

echo "🚀 Starting CargwinNewCar deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="cargwin"
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if running as root or with sudo privileges
    if [[ $EUID -ne 0 ]] && ! groups $USER | grep -q '\bdocker\b'; then
        log_error "This script needs to be run as root or user must be in docker group."
        exit 1
    fi
    
    log_info "✅ System requirements check passed"
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning ".env file not found. Creating from template..."
        cp backend/.env.production "$ENV_FILE"
        
        # Generate secure keys
        SECRET_KEY=$(openssl rand -base64 32)
        JWT_SECRET_KEY=$(openssl rand -base64 32)
        
        # Replace placeholders in .env file
        sed -i "s/CHANGE-THIS-TO-SECURE-RANDOM-STRING-AT-LEAST-32-CHARS/$SECRET_KEY/g" "$ENV_FILE"
        sed -i "s/CHANGE-THIS-TO-ANOTHER-SECURE-RANDOM-STRING/$JWT_SECRET_KEY/g" "$ENV_FILE"
        
        log_warning "⚠️  Please edit $ENV_FILE and configure your production settings!"
        log_warning "⚠️  Pay special attention to MONGO_URL, CORS_ORIGINS, and email settings."
        
        read -p "Press Enter to continue after editing $ENV_FILE..."
    fi
    
    log_info "✅ Environment setup completed"
}

create_directories() {
    log_info "Creating required directories..."
    
    # Create directories with proper permissions
    mkdir -p uploads/{images/{original,processed},temp}
    mkdir -p logs
    mkdir -p data/{mongodb,redis}
    mkdir -p docker/ssl
    
    # Set permissions
    chmod 755 uploads logs
    chmod 755 uploads/images uploads/images/original uploads/images/processed uploads/temp
    
    log_info "✅ Directories created"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build backend
    docker build -f Dockerfile.backend -t $PROJECT_NAME-backend:latest --target production .
    
    # Build frontend
    docker build -f Dockerfile.frontend -t $PROJECT_NAME-frontend:latest --target production .
    
    log_info "✅ Docker images built successfully"
}

deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing services
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log_info "✅ Application deployed"
}

wait_for_services() {
    log_info "Waiting for services to start..."
    
    # Wait for MongoDB
    log_info "Waiting for MongoDB..."
    timeout 60s bash -c 'until docker-compose exec -T mongodb mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; do sleep 2; done'
    
    # Wait for backend
    log_info "Waiting for backend..."
    timeout 60s bash -c 'until curl -f http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done'
    
    # Wait for frontend
    log_info "Waiting for frontend..."
    timeout 60s bash -c 'until curl -f http://localhost/health > /dev/null 2>&1; do sleep 2; done'
    
    log_info "✅ All services are running"
}

show_status() {
    log_info "Deployment status:"
    
    echo ""
    docker-compose ps
    echo ""
    
    log_info "🎉 CargwinNewCar deployed successfully!"
    log_info "🌐 Frontend: http://localhost"
    log_info "🔧 Backend API: http://localhost:8000"
    log_info "📊 Health check: http://localhost/health"
    
    echo ""
    log_info "Next steps:"
    echo "1. Configure your domain and SSL certificates"
    echo "2. Set up your DNS records"
    echo "3. Configure email settings for magic links"
    echo "4. Add admin users through the database"
    echo "5. Test the application thoroughly"
}

cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
}

# Main deployment flow
main() {
    trap cleanup_on_error ERR
    
    check_requirements
    setup_environment
    create_directories
    build_images
    deploy_application
    wait_for_services
    show_status
}

# Run main function
main "$@"