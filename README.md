# Campus FixIt

A production-ready full-stack mobile application for reporting and managing campus issues. Students can report issues with images, and administrators can track, update status, and add remarks to resolve them.

## Features

### Student Features
- User registration and authentication (JWT-based)
- Create issues with title, description, category, and optional image upload
- View and track own issues
- Filter issues by category and status
- View detailed issue information

### Admin Features
- View all issues from all students
- Filter issues by category and status
- Update issue status (Open → In Progress → Resolved)
- Add admin remarks/notes to issues
- Dashboard with issue statistics

## Tech Stack

### Backend
- Node.js, Express.js
- MongoDB (MongoDB Atlas)
- JWT Authentication
- Supabase Storage (for image uploads)
- Helmet, Rate Limiting

### Frontend
- React Native with Expo
- React Navigation
- Context API for state management
- TypeScript support

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@campusfixit.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Campus Admin
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=campus-fixit-uploads
CLIENT_URL=your_frontend_url
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_BASE_URL=your_backend_api_url
```

## Installation

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Production Deployment

### 📱 Android App Deployment

**👉 See [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md) for complete Android app deployment guide.**

Quick Android build:
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure project
cd frontend
eas build:configure

# 4. Set backend URL
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://your-backend-url.com

# 5. Build Android APK
eas build --platform android --profile production
```

### 📖 General Deployment

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.**

### Quick Overview

**Backend Deployment Options:**
- Railway (Recommended - Easy setup, free tier)
- Render (Free tier available)
- Heroku
- Vercel (Serverless)

**Frontend Deployment:**
- **Android App:** Use Expo EAS Build (see ANDROID_DEPLOYMENT.md)
- iOS App: Use Expo EAS Build
- Web: Deploy to Vercel/Netlify

### Quick Start

1. **Backend:**
   - Deploy to Railway/Render/Heroku
   - Set environment variables (see DEPLOYMENT.md)
   - Get your backend URL

2. **Android App:**
   - Follow [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md)
   - Build APK: `eas build --platform android --profile production`
   - Install APK on Android device

## Security

- JWT tokens with expiration
- Password hashing with bcryptjs
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation with express-validator
- CORS configuration

## License

MIT
