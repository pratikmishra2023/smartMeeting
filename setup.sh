#!/bin/bash

echo "🚀 Smart Meeting Assistant - Setup Script"
echo "=========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if command_exists node; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo "✅ npm is installed: $(npm --version)"
else
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    echo "✅ MongoDB is installed"
else
    echo "⚠️  MongoDB not found locally. You can:"
    echo "   - Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
    echo "   - Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
fi

echo ""
echo "📋 Setup Steps:"
echo "==============="

# Step 1: Environment file
echo "1. Setting up environment variables..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "   ✅ Created backend/.env file"
    echo "   📝 Please edit backend/.env and add your OpenAI API key"
else
    echo "   ✅ Environment file already exists"
fi

# Step 2: Backend dependencies
echo ""
echo "2. Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo "   ✅ Backend dependencies installed"
else
    echo "   ✅ Backend dependencies already installed"
fi
cd ..

# Step 3: Frontend dependencies
echo ""
echo "3. Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ✅ Frontend dependencies already installed"
fi
cd ..

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Get your OpenAI API key from: https://platform.openai.com/api-keys"
echo "2. Edit backend/.env and add: OPENAI_API_KEY=your_key_here"
echo "3. Start MongoDB (if local): mongod"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm start"
echo ""
echo "🌐 Your application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Health Check: http://localhost:8000/health"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🎉 Setup complete! Happy coding!"
