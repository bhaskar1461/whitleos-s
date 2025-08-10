# Fitness & Journal Tracker

A modern, full-stack web application for tracking fitness activities, meal plans, workouts, steps, and personal journaling. Built with React, Node.js, and Firebase for secure cloud synchronization.

![Fitness Tracker](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)

## ✨ Features

- **🔐 Secure Authentication** - Firebase-powered user management
- **🍽️ Meal Planning** - Log meals, create weekly plans, track nutrition
- **💪 Workout Tracking** - Log workouts, track exercises and progress
- **👟 Steps & Running** - Daily step counting with streak tracking
- **📝 Personal Journal** - Creative writing with rich text support
- **📊 Progress Analytics** - Visualize your fitness journey
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **☁️ Cloud Sync** - Your data is always backed up and accessible

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd fitness-journal-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Copy your Firebase config

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server    # Backend only
npm start         # Frontend only
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🏗️ Project Structure

```
fitness-journal-tracker/
├── public/                 # Static assets
├── src/                    # React frontend
│   ├── pages/             # Page components
│   │   ├── Auth.js        # Authentication
│   │   ├── Landing.js     # Home page
│   │   ├── MealPlan.js    # Meal tracking
│   │   ├── Workout.js     # Workout logging
│   │   ├── Steps.js       # Step counting
│   │   ├── Journal.js     # Personal journal
│   │   ├── Progress.js    # Analytics dashboard
│   │   └── Contact.js     # Contact form
│   ├── App.js             # Main app component
│   ├── firebase.js        # Firebase configuration
│   └── index.js           # App entry point
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── lowdb.js           # Local database
│   └── db.json            # Data storage
├── package.json            # Dependencies and scripts
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🛠️ Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm run server` - Start Node.js backend
- `npm run dev` - Start both frontend and backend
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Option 2: Netlify
1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `build`

### Option 3: Heroku
1. Install Heroku CLI
2. Create a new Heroku app
3. Set environment variables
4. Deploy with `git push heroku main`

## 🔧 Configuration

### Firebase Rules
Set up Firestore security rules for your database:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Customization
- **Styling**: Modify `tailwind.config.js` for custom colors and themes
- **Features**: Add new tracking categories in the pages directory
- **Database**: Extend the data models in `server/lowdb.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/yourusername/fitness-journal-tracker/issues) page
2. Create a new issue with detailed description
3. Include your environment details and error messages

## 🙏 Acknowledgments

- Built with React and Node.js
- Styled with Tailwind CSS
- Powered by Firebase
- Icons from Heroicons
- Images from Unsplash/Pexels

---

**Made with ❤️ for fitness enthusiasts everywhere!**

Ready to start your fitness journey? Clone this repo and get tracking! 