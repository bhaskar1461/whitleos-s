#!/bin/bash

# Fitness Journal Tracker - Setup Script
# This script will help you set up the project quickly

echo "🚀 Welcome to Fitness Journal Tracker Setup!"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "🔧 Setting up environment configuration..."
    
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Created .env file from template"
        echo "⚠️  IMPORTANT: Please edit .env file with your Firebase credentials"
        echo "   You can find these in your Firebase project console"
    else
        echo "⚠️  No env.example found. Please create .env file manually"
    fi
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/data
mkdir -p public/images

# Set up database
echo "🗄️  Setting up local database..."
if [ ! -f server/db.json ]; then
    echo '{"users": [], "meals": [], "workouts": [], "steps": [], "journal": []}' > server/db.json
    echo "✅ Created initial database structure"
else
    echo "✅ Database file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Firebase credentials"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""
echo "Happy tracking! 💪"
