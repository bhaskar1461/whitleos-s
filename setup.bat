@echo off
chcp 65001 >nul
echo 🚀 Welcome to Fitness Journal Tracker Setup!
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first:
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node --version
    echo    Please update Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies. Please check your internet connection and try again.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Check if .env file exists
if not exist .env (
    echo 🔧 Setting up environment configuration...
    
    if exist env.example (
        copy env.example .env >nul
        echo ✅ Created .env file from template
        echo ⚠️  IMPORTANT: Please edit .env file with your Firebase credentials
        echo    You can find these in your Firebase project console
    ) else (
        echo ⚠️  No env.example found. Please create .env file manually
    )
) else (
    echo ✅ .env file already exists
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist server\data mkdir server\data
if not exist public\images mkdir public\images

REM Set up database
echo 🗄️  Setting up local database...
if not exist server\db.json (
    echo {"users": [], "meals": [], "workouts": [], "steps": [], "journal": []} > server\db.json
    echo ✅ Created initial database structure
) else (
    echo ✅ Database file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your Firebase credentials
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 For detailed instructions, see README.md
echo.
echo Happy tracking! 💪
pause
