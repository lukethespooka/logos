#!/bin/bash

# =============================================================================
# LogOS Sprint 3 Local AI Setup Script
# =============================================================================
# This script installs and configures local AI infrastructure for Sprint 3
# 
# What it does:
# 1. Installs Ollama (local LLM runtime)
# 2. Downloads required models for email/calendar processing
# 3. Sets up AI router with Docker
# 4. Validates installation with health checks
# 5. Creates environment configuration templates
#
# Requirements: macOS or Linux, Docker, 8GB+ free disk space
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OLLAMA_VERSION="latest"
REQUIRED_DISK_SPACE_GB=8
MODELS_TO_DOWNLOAD=(
    "mistral:7b-instruct"   # Email triage - 4.1GB
    "llama3.1:8b"           # Calendar analysis - 4.7GB
    "phi3:mini"             # Quick responses - 2.3GB
    "codellama:7b"          # Code tasks - 3.8GB
)

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "============================================================================="
    echo "🤖 LogOS Sprint 3: Local AI Setup"
    echo "============================================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}📋 $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if running on supported OS
check_os() {
    print_step "Checking operating system compatibility..."
    
    case "$(uname -s)" in
        Darwin*)    OS="macOS" ;;
        Linux*)     OS="Linux" ;;
        *)          
            print_error "Unsupported operating system: $(uname -s)"
            print_error "This script supports macOS and Linux only"
            exit 1
            ;;
    esac
    
    print_success "Running on $OS"
}

# Check available disk space
check_disk_space() {
    print_step "Checking available disk space..."
    
    if [[ "$OS" == "macOS" ]]; then
        AVAILABLE_GB=$(df -g . | awk 'NR==2 {print $4}')
    else
        AVAILABLE_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    fi
    
    if [[ $AVAILABLE_GB -lt $REQUIRED_DISK_SPACE_GB ]]; then
        print_error "Insufficient disk space. Required: ${REQUIRED_DISK_SPACE_GB}GB, Available: ${AVAILABLE_GB}GB"
        exit 1
    fi
    
    print_success "Sufficient disk space available: ${AVAILABLE_GB}GB"
}

# Check for Docker
check_docker() {
    print_step "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "  macOS: Download from https://docker.com/products/docker-desktop"
        echo "  Linux: Follow instructions at https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Install Ollama
install_ollama() {
    print_step "Installing Ollama..."
    
    if command -v ollama &> /dev/null; then
        print_warning "Ollama is already installed. Checking version..."
        ollama --version
        return 0
    fi
    
    print_step "Downloading and installing Ollama..."
    
    if [[ "$OS" == "macOS" ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            print_step "Installing via Homebrew..."
            brew install ollama
        else
            print_step "Installing via curl..."
            curl -fsSL https://ollama.ai/install.sh | sh
        fi
    else
        # Linux installation
        print_step "Installing via curl..."
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
    
    print_success "Ollama installed successfully"
}

# Start Ollama service
start_ollama() {
    print_step "Starting Ollama service..."
    
    if [[ "$OS" == "macOS" ]]; then
        # On macOS, Ollama runs as a service
        if pgrep -f "ollama" > /dev/null; then
            print_success "Ollama is already running"
        else
            print_step "Starting Ollama..."
            ollama serve &
            sleep 5
        fi
    else
        # On Linux, check if systemd service exists
        if systemctl is-active --quiet ollama; then
            print_success "Ollama service is already running"
        elif systemctl list-unit-files | grep -q ollama; then
            print_step "Starting Ollama systemd service..."
            sudo systemctl start ollama
            sudo systemctl enable ollama
        else
            print_step "Starting Ollama manually..."
            ollama serve &
            sleep 5
        fi
    fi
    
    # Verify Ollama is responding
    for i in {1..10}; do
        if curl -f http://localhost:11434/api/tags &> /dev/null; then
            print_success "Ollama is running and responding"
            return 0
        fi
        print_warning "Waiting for Ollama to start... (attempt $i/10)"
        sleep 2
    done
    
    print_error "Ollama failed to start properly"
    exit 1
}

# Download required models
download_models() {
    print_step "Downloading required AI models..."
    print_warning "This may take 15-30 minutes depending on your internet connection"
    
    for model in "${MODELS_TO_DOWNLOAD[@]}"; do
        print_step "Downloading $model..."
        
        if ollama list | grep -q "$model"; then
            print_success "$model is already downloaded"
            continue
        fi
        
        echo "📥 Downloading $model (this may take several minutes)..."
        if ollama pull "$model"; then
            print_success "$model downloaded successfully"
        else
            print_error "Failed to download $model"
            print_warning "You can manually download it later with: ollama pull $model"
        fi
    done
}

# Test models
test_models() {
    print_step "Testing downloaded models..."
    
    for model in "${MODELS_TO_DOWNLOAD[@]}"; do
        if ollama list | grep -q "$model"; then
            print_step "Testing $model..."
            
            # Simple test prompt
            response=$(echo "Hello" | ollama run "$model" --prompt "Respond with 'OK' only." 2>/dev/null | head -n 1)
            
            if [[ -n "$response" ]]; then
                print_success "$model is working"
            else
                print_warning "$model may not be working correctly"
            fi
        else
            print_warning "$model is not available for testing"
        fi
    done
}

# Create AI router configuration
setup_ai_router() {
    print_step "Setting up AI router configuration..."
    
    # Create AI router directory
    mkdir -p ai-router
    
    # Create Docker Compose file for AI router
    cat > ai-router/docker-compose.yml << 'EOF'
version: '3.8'
services:
  ai-router:
    image: node:18-alpine
    container_name: logos-ai-router
    working_dir: /app
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
      - ./tsconfig.json:/app/tsconfig.json
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      - PORT=3001
    command: ["npm", "run", "dev"]
    networks:
      - logos-ai
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    container_name: logos-ai-cache
    ports:
      - "6379:6379"
    networks:
      - logos-ai
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

networks:
  logos-ai:
    driver: bridge

volumes:
  redis-data:
EOF

    # Create basic AI router package.json
    cat > ai-router/package.json << 'EOF'
{
  "name": "logos-ai-router",
  "version": "1.0.0",
  "description": "AI routing service for LogOS Sprint 3",
  "main": "src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "redis": "^4.6.12",
    "axios": "^1.6.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
EOF

    # Create TypeScript config
    cat > ai-router/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

    print_success "AI router configuration created"
    print_warning "Run 'cd ai-router && npm install && docker-compose up -d' to start the AI router"
}

# Create health check script
create_health_check() {
    print_step "Creating health check script..."
    
    cat > check-ai-health.sh << 'EOF'
#!/bin/bash

# LogOS AI Infrastructure Health Check

echo "🔍 Checking AI infrastructure health..."

# Check Ollama
echo -n "Ollama service: "
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check available models
echo "📋 Available models:"
if command -v ollama &> /dev/null; then
    ollama list | tail -n +2 | awk '{print "  - " $1}'
else
    echo "  ❌ Ollama not available"
fi

# Check AI router (if running)
echo -n "AI router: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional)"
fi

# Check Redis (if running)
echo -n "Redis cache: "
if docker ps --format "table {{.Names}}" | grep -q logos-ai-cache; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional)"
fi

echo "✅ Health check complete"
EOF

    chmod +x check-ai-health.sh
    print_success "Health check script created: ./check-ai-health.sh"
}

# Create environment template
create_env_template() {
    print_step "Creating local AI environment template..."
    
    cat > .env.local.ai.template << 'EOF'
# Local AI Configuration (add to your .env.local)

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ENABLED=true

# Local Model Preferences
LOCAL_EMAIL_MODEL=mistral:7b-instruct
LOCAL_CALENDAR_MODEL=llama3.1:8b
LOCAL_QUICK_MODEL=phi3:mini
LOCAL_CODE_MODEL=codellama:7b

# AI Router Configuration
AI_ROUTER_URL=http://localhost:3001
AI_PREFER_LOCAL=true
AI_FALLBACK_ENABLED=true

# Feature Flags (enable local AI)
VITE_FEATURE_LOCAL_AI_ROUTING=true
VITE_FEATURE_COST_TRACKING=true
EOF

    print_success "Environment template created: .env.local.ai.template"
    print_warning "Add these variables to your .env.local file"
}

# Main execution
main() {
    print_header
    
    print_step "Starting LogOS Sprint 3 local AI setup..."
    
    # Pre-flight checks
    check_os
    check_disk_space
    check_docker
    
    # Installation
    install_ollama
    start_ollama
    download_models
    test_models
    
    # Configuration
    setup_ai_router
    create_health_check
    create_env_template
    
    print_header
    print_success "🎉 Local AI setup completed successfully!"
    echo
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Add variables from .env.local.ai.template to your .env.local"
    echo "2. Run ./check-ai-health.sh to verify everything is working"
    echo "3. Optional: Start AI router with 'cd ai-router && npm install && docker-compose up -d'"
    echo "4. Continue with Sprint 3 development"
    echo
    echo -e "${BLUE}Resource usage:${NC}"
    echo "- Disk space used: ~15GB for all models"
    echo "- Memory usage: ~4-8GB when models are loaded"
    echo "- Models are cached locally for fast access"
    echo
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "- Run './check-ai-health.sh' to check status"
    echo "- Check Ollama logs: 'ollama logs' or 'journalctl -u ollama'"
    echo "- Restart Ollama: 'ollama serve' or 'systemctl restart ollama'"
    echo "- Re-download models: 'ollama pull <model-name>'"
}

# Run main function
main "$@" 