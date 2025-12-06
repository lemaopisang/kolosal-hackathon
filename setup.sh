#!/bin/bash
# Setup script for Inclusive Marketing Hub

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Inclusive Marketing Hub - Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}[1/6]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "   ${RED}✗${NC} Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "   ${GREEN}✓${NC} Node.js ${NODE_VERSION} found"
echo ""

# Install root dependencies
echo -e "${YELLOW}[2/6]${NC} Installing frontend dependencies..."
npm install
echo -e "   ${GREEN}✓${NC} Frontend dependencies installed"
echo ""

# Install server dependencies
echo -e "${YELLOW}[3/6]${NC} Installing backend dependencies..."
cd server
npm install
cd ..
echo -e "   ${GREEN}✓${NC} Backend dependencies installed"
echo ""

# Setup environment files
echo -e "${YELLOW}[4/6]${NC} Setting up environment configuration..."
if [ ! -f "server/.env" ]; then
    cp .env.example server/.env 2>/dev/null || cat > server/.env << 'EOF'
# Kolosal API Configuration
KOLOSAL_API_KEY=your_kolosal_api_key_here
KOLOSAL_API_URL=https://api.kolosal.ai/v1
PORT=3001
NODE_ENV=development
EOF
    echo -e "   ${GREEN}✓${NC} Created server/.env from template"
    echo -e "   ${YELLOW}⚠${NC}  Please add your KOLOSAL_API_KEY to server/.env"
else
    echo -e "   ${GREEN}✓${NC} server/.env already exists"
fi
echo ""

# Build frontend
echo -e "${YELLOW}[5/6]${NC} Running production build test..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✓${NC} Production build successful"
else
    echo -e "   ${RED}✗${NC} Build failed - check for errors"
    exit 1
fi
echo ""

# Run linter
echo -e "${YELLOW}[6/6]${NC} Running code quality checks..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✓${NC} All linting checks passed"
else
    echo -e "   ${YELLOW}⚠${NC}  Some linting warnings (non-critical)"
fi
echo ""

echo -e "${GREEN}═════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}═════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Add your Kolosal API key to server/.env:"
echo "   ${YELLOW}KOLOSAL_API_KEY=your_actual_key${NC}"
echo ""
echo "2. Start the backend server:"
echo "   ${BLUE}cd server && npm run dev${NC}"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "4. Open your browser to:"
echo "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo "5. Run tests (optional):"
echo "   ${BLUE}cd server && npm test${NC}"
echo ""
