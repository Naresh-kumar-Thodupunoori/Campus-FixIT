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


## API Documentation

### Base URL
```
http://localhost:5000/api
```
For production, replace with your deployed backend URL.

### Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Endpoints

#### Health Check

**`GET /api/health`**

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Campus FixIt API running"
}
```

---

#### Authentication Endpoints

**`POST /api/auth/register`**

Register a new student user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: Required, non-empty
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

**`POST /api/auth/login`**

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

#### Issue Endpoints

**`POST /api/issues`** (Student only)

Create a new issue with optional image upload.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `title` (string, required): Issue title
- `description` (string, required): Issue description
- `category` (string, required): One of `Electrical`, `Water`, `Internet`, `Infrastructure`
- `image` (file, optional): Image file

**Success Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Broken water fountain",
  "description": "The water fountain on the 2nd floor is not working",
  "category": "Water",
  "status": "Open",
  "imageUrl": "https://supabase.co/storage/v1/object/sign/...",
  "createdBy": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "adminRemarks": "",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

**`GET /api/issues`** (Admin only)

Get all issues with optional filters.

**Query Parameters:**
- `status` (optional): `Open`, `In Progress`, `Resolved`
- `category` (optional): `Electrical`, `Water`, `Internet`, `Infrastructure`

**Example:**
```
GET /api/issues?status=Open&category=Water
```

**Success Response (200):** Array of issue objects

---

**`GET /api/issues/my`** (Student)

Get all issues created by the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status
- `category` (optional): Filter by category

**Success Response (200):** Array of issue objects

---

**`GET /api/issues/:id`**

Get a specific issue by ID. Students can only view their own issues; admins can view any issue.

**Success Response (200):** Issue object

---

**`PUT /api/issues/:id/status`** (Admin only)

Update the status of an issue.

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Status Values:** `Open`, `In Progress`, `Resolved`

**Success Response (200):** Updated issue object

---

**`PUT /api/issues/:id/remarks`** (Admin only)

Add or update admin remarks for an issue.

**Request Body:**
```json
{
  "adminRemarks": "Technician has been assigned. Expected completion: 2 days."
}
```

**Success Response (200):** Updated issue object

---

### Error Responses

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Error Format:**
```json
{
  "message": "Error message",
  "errors": [
    {
      "msg": "Validation error",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

---

### Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 requests per IP per window

---

### Example cURL Requests

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Create Issue:**
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Broken water fountain" \
  -F "description=The water fountain is not working" \
  -F "category=Water" \
  -F "image=@/path/to/image.jpg"
```

**Get My Issues:**
```bash
curl -X GET http://localhost:5000/api/issues/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---


## Production Deployment

### 🚀 Backend Deployment on Render

#### Prerequisites
- GitHub account with your code pushed to a repository
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (or your MongoDB connection string)
- Supabase account (for image storage)

#### Step-by-Step Guide

1. **Prepare Your Repository**
   - Ensure your backend code is pushed to GitHub
   - Make sure `package.json` has a `start` script (already configured)

2. **Create a New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend code

3. **Configure the Service**
   - **Name:** `campus-fixit-api` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** Leave empty (or set to `backend` if your repo root is the project root)

4. **Set Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add all the following:

   ```env
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ADMIN_EMAIL=admin@campusfixit.com
   ADMIN_PASSWORD=your_secure_admin_password
   ADMIN_NAME=Campus Admin
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_STORAGE_BUCKET=campus-fixit-uploads
   CLIENT_URL=*
   ```

   **Important Notes:**
   - `PORT` should be `10000` (Render's default) or use `process.env.PORT` in your code (already configured)
   - Generate a strong `JWT_SECRET` (e.g., use `openssl rand -base64 32`)
   - `CLIENT_URL` can be `*` for development or your frontend URL for production
   - Get MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get Supabase credentials from your [Supabase Dashboard](https://app.supabase.com)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your service
   - Wait for the deployment to complete (usually 2-5 minutes)
   - Your API will be available at: `https://your-service-name.onrender.com`

6. **Verify Deployment**
   - Test the health endpoint: `https://your-service-name.onrender.com/api/health`
   - You should see: `{"status":"ok","message":"Campus FixIt API running"}`

7. **Important Render Settings**
   - **Auto-Deploy:** Enable to automatically deploy on git push
   - **Health Check Path:** `/api/health` (optional, helps Render monitor your service)
   - **Free Tier Note:** Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

#### Render Configuration File (Optional)

Create `render.yaml` in your repository root for infrastructure as code:

```yaml
services:
  - type: web
    name: campus-fixit-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: ADMIN_EMAIL
        value: admin@campusfixit.com
      - key: ADMIN_PASSWORD
        sync: false
      - key: ADMIN_NAME
        value: Campus Admin
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_STORAGE_BUCKET
        value: campus-fixit-uploads
      - key: CLIENT_URL
        value: "*"
```

---

### 📱 Frontend Deployment with Expo

#### Prerequisites
- Expo account (sign up at [expo.dev](https://expo.dev))
- EAS CLI installed globally
- Your backend API URL (from Render deployment above)

#### Step-by-Step Guide

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS Build**
   ```bash
   cd frontend
   eas build:configure
   ```
   This creates/updates `eas.json` in your frontend directory.

4. **Set Environment Variables**
   Set your backend API URL as an Expo secret:
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://your-service-name.onrender.com/api
   ```
   
   **Important:** 
   - Replace `your-service-name.onrender.com` with your actual Render service URL
   - Include `/api` at the end if your API routes are under `/api`
   - No trailing slash

5. **Update app.json (if needed)**
   Ensure your `app.json` has proper configuration:
   ```json
   {
     "expo": {
       "name": "Campus FixIt",
       "slug": "campus-fixit",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash-icon.png"
       },
       "android": {
         "package": "com.campusfixit.app",
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png"
         }
       }
     }
   }
   ```

6. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```
   
   **Build Profiles:**
   - `production`: Production build (APK/AAB)
   - `preview`: Preview build for testing
   - `development`: Development build with Expo Go

7. **Build for iOS** (if needed)
   ```bash
   eas build --platform ios --profile production
   ```
   **Note:** iOS builds require an Apple Developer account ($99/year)

8. **Monitor Build Progress**
   - EAS will provide a build URL
   - You can check progress at [expo.dev/builds](https://expo.dev/builds)
   - Builds typically take 10-20 minutes

9. **Download Your App**
   - Once build completes, download the APK (Android) or IPA (iOS)
   - For Android: Install APK directly on devices
   - For iOS: Install via TestFlight or App Store

#### EAS Build Configuration

Your `eas.json` should look like this:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Alternative: Build Locally

If you prefer to build locally (requires Android SDK/iOS tools):

```bash
# Android
eas build --platform android --profile production --local

# iOS (macOS only)
eas build --platform ios --profile production --local
```

#### Update Existing App

To update your app after making changes:

1. **Update version in app.json:**
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```

2. **Create a new build:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Or use OTA Updates (for minor changes):**
   ```bash
   eas update --branch production --message "Bug fixes"
   ```

---

### 🔗 Connecting Frontend to Backend

After deploying both:

1. **Update Frontend Environment:**
   - Your backend URL is already set via `eas secret:create`
   - For local development, create `.env` in `frontend/`:
     ```env
     EXPO_PUBLIC_API_BASE_URL=https://your-service-name.onrender.com/api
     ```

2. **Test the Connection:**
   - Open your app
   - Try logging in or registering
   - Check if API calls are working

3. **Update CORS on Backend:**
   - If you get CORS errors, update `CLIENT_URL` in Render:
     - For production: `https://your-app-domain.com`
     - For development: `*` (less secure, but works for testing)

---

### 📋 Deployment Checklist

**Backend (Render):**
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created and configured
- [ ] All environment variables set
- [ ] Service deployed successfully
- [ ] Health endpoint tested
- [ ] API endpoints tested

**Frontend (Expo):**
- [ ] Expo account created
- [ ] EAS CLI installed and logged in
- [ ] `eas.json` configured
- [ ] Backend URL set as secret
- [ ] `app.json` properly configured
- [ ] Android build completed
- [ ] APK downloaded and tested
- [ ] App installed on device

---

### 🆘 Troubleshooting

**Backend Issues:**
- **Service won't start:** Check build/start commands, verify Node version
- **Environment variables not working:** Ensure they're set in Render dashboard
- **Database connection fails:** Verify MongoDB URI and network access
- **CORS errors:** Update `CLIENT_URL` environment variable

**Frontend Issues:**
- **Build fails:** Check `eas.json` configuration, verify all dependencies
- **API calls fail:** Verify `EXPO_PUBLIC_API_BASE_URL` secret is set correctly
- **App crashes on startup:** Check console logs, verify environment variables are accessible
- **Images not uploading:** Verify Supabase credentials and storage bucket configuration

---

## Security

- JWT tokens with expiration
- Password hashing with bcryptjs
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation with express-validator
- CORS configuration

## License

MIT
