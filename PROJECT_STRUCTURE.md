# 📁 Project Structure Documentation

This document provides a comprehensive overview of the Fitness Journal Tracker project structure, explaining the purpose and contents of each file and directory.

## 🏗️ Root Directory

```
fitness-journal-tracker/
├── 📁 public/                 # Static assets and HTML entry point
├── 📁 src/                    # React frontend source code
├── 📁 server/                 # Node.js backend server
├── 📄 package.json            # Project dependencies and scripts
├── 📄 package-lock.json       # Locked dependency versions
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 postcss.config.js       # PostCSS configuration
├── 📄 README.md               # Project documentation
├── 📄 DEPLOYMENT.md           # Deployment instructions
├── 📄 PROJECT_STRUCTURE.md    # This file
├── 📄 env.example             # Environment variables template
├── 📄 setup.sh                # Unix/Linux setup script
├── 📄 setup.bat               # Windows setup script
└── 📄 .gitignore              # Git ignore patterns
```

## 📁 Public Directory

Contains static assets and the main HTML entry point.

```
public/
├── 📄 index.html              # Main HTML file
└── 📁 images/                 # Static images (if any)
```

### `index.html`
- Main HTML entry point for the React application
- Contains meta tags, title, and root div for React mounting
- Links to external fonts and CSS if needed

## 📁 Source Directory (src/)

Contains all React frontend code organized by feature.

```
src/
├── 📄 index.js                # Application entry point
├── 📄 App.js                  # Main application component
├── 📄 firebase.js             # Firebase configuration
├── 📄 index.css               # Global CSS styles
└── 📁 pages/                  # Page components
    ├── 📄 Auth.js             # Authentication page
    ├── 📄 Landing.js          # Home/landing page
    ├── 📄 MealPlan.js         # Meal planning and tracking
    ├── 📄 Workout.js          # Workout logging
    ├── 📄 Steps.js            # Step counting and tracking
    ├── 📄 Journal.js          # Personal journal entries
    ├── 📄 Progress.js         # Progress analytics
    └── 📄 Contact.js          # Contact form
```

### Core Files

#### `index.js`
- React application entry point
- Renders the main App component
- Sets up React Router

#### `App.js`
- Main application component
- Handles routing between pages
- Manages global state and authentication

#### `firebase.js`
- Firebase SDK configuration
- Authentication and Firestore setup
- Environment variable integration

#### `index.css`
- Global CSS styles
- Tailwind CSS imports
- Custom CSS variables and utilities

### Page Components

#### `Auth.js`
- User authentication (login/signup)
- Firebase authentication integration
- Form validation and error handling

#### `Landing.js`
- Homepage with fitness imagery
- Navigation to different features
- Welcome message and call-to-action

#### `MealPlan.js`
- Meal logging and planning
- Weekly meal schedule
- Nutrition tracking

#### `Workout.js`
- Workout logging and tracking
- Exercise library
- Progress monitoring

#### `Steps.js`
- Daily step counting
- Streak tracking
- Running/walking statistics

#### `Journal.js`
- Personal journal entries
- Rich text editing
- Entry management

#### `Progress.js`
- Data visualization
- Progress charts and graphs
- Achievement tracking

#### `Contact.js`
- Contact form
- User feedback collection
- Support request handling

## 📁 Server Directory

Contains the Node.js backend server code and local database.

```
server/
├── 📄 index.js                # Express server setup
├── 📄 lowdb.js                # Local database configuration
└── 📄 db.json                 # Local data storage
```

### `index.js`
- Express server configuration
- API endpoint definitions
- Middleware setup (CORS, body parsing)
- Server startup and port configuration

### `lowdb.js`
- LowDB database setup
- Data models and schemas
- Database initialization

### `db.json`
- Local JSON database file
- Stores user data locally
- Backup for offline functionality

## 📄 Configuration Files

### `package.json`
- Project metadata and dependencies
- NPM scripts for development and build
- Project information and versioning

**Key Scripts:**
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm run server` - Start Node.js backend
- `npm run dev` - Start both frontend and backend

**Dependencies:**
- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Express, LowDB, Passport
- **Authentication**: Firebase
- **Development**: Concurrently, PostCSS

### `tailwind.config.js`
- Tailwind CSS configuration
- Custom color schemes
- Responsive breakpoints
- Component customization

### `postcss.config.js`
- PostCSS configuration
- Tailwind CSS processing
- Autoprefixer setup

## 🔧 Setup and Configuration Files

### `env.example`
- Template for environment variables
- Firebase configuration template
- Backend server settings
- Copy to `.env` and fill in your values

### `setup.sh` (Unix/Linux)
- Automated setup script
- Dependency installation
- Environment configuration
- Database initialization

### `setup.bat` (Windows)
- Windows batch file setup script
- Same functionality as setup.sh
- Windows-compatible commands

## 📚 Documentation Files

### `README.md`
- Project overview and features
- Quick start guide
- Technology stack
- Basic setup instructions

### `DEPLOYMENT.md`
- Comprehensive deployment guide
- Multiple hosting platform options
- Step-by-step instructions
- Troubleshooting guide

### `PROJECT_STRUCTURE.md` (This file)
- Detailed file and directory explanations
- Code organization overview
- Development workflow

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd fitness-journal-tracker

# Run setup script
./setup.sh          # Unix/Linux
setup.bat           # Windows

# Or manual setup
npm install
cp env.example .env
# Edit .env with your Firebase credentials
```

### 2. Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server      # Backend only
npm start           # Frontend only
```

### 3. Building for Production
```bash
npm run build
```

### 4. Deployment
- Follow instructions in `DEPLOYMENT.md`
- Choose your preferred hosting platform
- Configure environment variables
- Deploy and test

## 🔍 File Naming Conventions

- **Components**: PascalCase (e.g., `MealPlan.js`)
- **Utilities**: camelCase (e.g., `firebase.js`)
- **Configuration**: kebab-case (e.g., `tailwind.config.js`)
- **Directories**: lowercase (e.g., `pages/`, `server/`)

## 📝 Code Organization Principles

1. **Separation of Concerns**: Frontend and backend are clearly separated
2. **Feature-based Organization**: Pages are organized by feature
3. **Configuration Centralization**: All config files in root directory
4. **Documentation**: Comprehensive guides for setup and deployment
5. **Automation**: Setup scripts for easy project initialization

## 🛠️ Customization Points

### Styling
- Modify `tailwind.config.js` for custom themes
- Edit `src/index.css` for global styles
- Update component-specific styles in each page

### Features
- Add new pages in `src/pages/`
- Extend backend API in `server/index.js`
- Modify database schema in `server/lowdb.js`

### Configuration
- Update environment variables in `.env`
- Modify server settings in `server/index.js`
- Adjust build configuration in `package.json`

## 🔒 Security Considerations

- Environment variables are never committed to Git
- Firebase security rules should be configured
- CORS settings in backend for production
- Input validation on both frontend and backend

---

This structure provides a solid foundation for a full-stack fitness tracking application with clear separation of concerns, comprehensive documentation, and easy deployment options.
