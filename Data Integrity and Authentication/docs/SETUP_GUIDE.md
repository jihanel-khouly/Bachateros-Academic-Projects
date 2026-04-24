# Setup Guide - Secure Authentication System

Complete step-by-step guide to set up and run the Secure Authentication System.

## Prerequisites

- **Python 3.8+** - Download from [python.org](https://www.python.org)
- **Node.js 14+** - Download from [nodejs.org](https://www.nodejs.org)
- **Git** (optional) - For version control
- **Authenticator App** - Google Authenticator, Microsoft Authenticator, or Authy

## Installation

### 1. Backend Setup

#### Step 1.1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 1.2: Create Virtual Environment (Recommended)
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Step 1.3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Step 1.4: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings (optional for development)
# Default settings work for local development
```

#### Step 1.5: Run the Backend Server
```bash
python app.py
```

You should see:
```
 * Running on http://localhost:5000
 * Debug mode: on
```

**Backend is now running at:** `http://localhost:5000`

---

### 2. Frontend Setup

#### Step 2.1: Open New Terminal and Navigate to Frontend Directory
```bash
cd frontend
```

#### Step 2.2: Install Node Dependencies
```bash
npm install
```

#### Step 2.3: Start Development Server
```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:3000
```

**Frontend is now running at:** `http://localhost:3000`

---

## Accessing the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the SecureAuth login page with the editorial design.

---

## Testing the System

### Test 1: User Registration

1. Click "Create Account" button
2. Fill in the registration form:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Password:** SecurePassword123
   - **Confirm Password:** SecurePassword123
   - **Role:** User
3. Click "Create Account"
4. You should be redirected to the login page

### Test 2: User Login

1. On the login page, enter:
   - **Email:** john@example.com
   - **Password:** SecurePassword123
2. Click "Sign In"
3. You should proceed to the 2FA setup page

### Test 3: Two-Factor Authentication Setup

1. You'll see a QR code displayed
2. Open your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)
3. Scan the QR code
4. The app will show a 6-digit code that changes every 30 seconds
5. Click "Continue to Verification"

### Test 4: Two-Factor Verification

1. Enter the 6-digit code from your authenticator app
2. Click "Verify Code"
3. You should be logged in and see the dashboard

### Test 5: Dashboard Navigation

1. You should see your profile information
2. Click on different tabs based on your role:
   - **User Role:** Only "Profile" tab
   - **Manager Role:** "Profile" and "Manager Panel" tabs
   - **Admin Role:** All tabs including "Admin Panel" and "All Users"

### Test 6: Admin Features

1. Register another user with Admin role
2. Login as Admin
3. Click "All Users" tab to see all registered users
4. Try accessing different endpoints as different roles

---

## Database Configuration

### SQLite (Default)

SQLite is configured by default and requires no setup. The database file `auth.db` will be created automatically in the backend directory.

### MySQL

To use MySQL instead of SQLite:

#### Step 1: Install MySQL
- Download from [mysql.com](https://www.mysql.com)
- Create a database: `CREATE DATABASE auth_system;`

#### Step 2: Update .env File
```
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=auth_system
```

#### Step 3: Restart Backend
The tables will be created automatically on first run.

---

## Environment Configuration

### Backend (.env)

```
# Flask Configuration
FLASK_ENV=development
DEBUG=True
PORT=5000

# Database Configuration
DB_TYPE=sqlite
DB_PATH=auth.db

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend

The frontend automatically connects to `http://localhost:5000/api` in development.

To change the API URL, edit `frontend/src/App.jsx`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## Troubleshooting

### Issue: "Connection refused" when accessing frontend

**Solution:**
1. Ensure backend is running: `python app.py`
2. Check if port 5000 is available
3. If port is in use, change PORT in .env file

### Issue: "CORS error" in browser console

**Solution:**
1. Ensure CORS_ORIGINS in backend .env includes frontend URL
2. Default: `http://localhost:3000`
3. Restart backend after changing .env

### Issue: "Invalid TOTP code" error

**Solution:**
1. Ensure your system time is synchronized
2. Check that authenticator app is showing current code
3. Try code from 30 seconds ago or future
4. Regenerate TOTP secret by logging out and logging back in

### Issue: "Email already registered" error

**Solution:**
1. Use a different email address
2. Or delete the auth.db file to reset (SQLite only)
3. For MySQL, run: `TRUNCATE TABLE users;`

### Issue: Frontend not loading

**Solution:**
1. Check if Node.js is installed: `node --version`
2. Ensure npm dependencies are installed: `npm install`
3. Check if port 3000 is available
4. Clear browser cache and reload

### Issue: Backend not starting

**Solution:**
1. Check if Python 3.8+ is installed: `python --version`
2. Ensure virtual environment is activated
3. Check if all dependencies are installed: `pip install -r requirements.txt`
4. Check if port 5000 is available

---

## Production Deployment

### Before Deploying:

1. **Change JWT Secret**
   ```
   JWT_SECRET=<generate-a-strong-random-string>
   ```

2. **Disable Debug Mode**
   ```
   FLASK_ENV=production
   DEBUG=False
   ```

3. **Use Production Database**
   - Switch to MySQL or PostgreSQL
   - Set up proper backups

4. **Configure CORS**
   ```
   CORS_ORIGINS=https://yourdomain.com
   ```

5. **Use HTTPS**
   - Obtain SSL certificate
   - Configure reverse proxy (Nginx, Apache)

6. **Set Up Logging**
   - Configure application logging
   - Set up error tracking (Sentry, etc.)

7. **Enable Rate Limiting**
   - Implement rate limiting on login endpoints
   - Prevent brute force attacks

### Deployment Options:

- **Heroku** - Easy deployment with git push
- **AWS** - EC2 for backend, S3 for static files
- **DigitalOcean** - Simple VPS deployment
- **Docker** - Containerized deployment

---

## API Testing

### Using cURL

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <jwt_token>"
```

### Using Postman

1. Import the API collection (if provided)
2. Set up environment variables
3. Test each endpoint
4. Verify responses

---

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit Python files in `backend/`
   - Server auto-reloads in debug mode
   - Refresh browser to see changes

2. **Frontend Changes**
   - Edit React components in `frontend/src/`
   - Vite hot module replacement (HMR) auto-reloads
   - Changes appear instantly in browser

### Adding New Features

1. **Backend**
   - Add database schema changes to `database.py`
   - Add new routes to `app.py`
   - Add helper functions to `auth.py` or new modules

2. **Frontend**
   - Add new pages in `frontend/src/pages/`
   - Add components in `frontend/src/components/`
   - Update `App.jsx` with new routes

---

## File Structure Reference

```
secure_auth_python/
├── backend/
│   ├── app.py                 # Main Flask app
│   ├── auth.py                # Auth logic
│   ├── database.py            # DB layer
│   ├── middleware.py          # JWT middleware
│   ├── requirements.txt        # Dependencies
│   └── .env.example           # Config template
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Styles
│   │   └── pages/             # Page components
│   ├── package.json           # Dependencies
│   ├── vite.config.js         # Vite config
│   └── index.html             # HTML entry
├── docs/
│   ├── API_DOCUMENTATION.md   # API reference
│   └── SETUP_GUIDE.md         # This file
└── README.md                  # Project overview
```

---

## Next Steps

1. **Explore the Code** - Review the implementation
2. **Test All Features** - Try different user roles
3. **Read API Documentation** - Understand all endpoints
4. **Customize** - Modify for your needs
5. **Deploy** - Set up production environment

---

## Support & Resources

- **API Documentation:** See `docs/API_DOCUMENTATION.md`
- **Python Flask:** [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **React:** [react.dev](https://react.dev)
- **JWT:** [jwt.io](https://jwt.io)
- **TOTP:** [en.wikipedia.org/wiki/Time-based_one-time_password](https://en.wikipedia.org/wiki/Time-based_one-time_password)

---

## License

MIT License - Feel free to use this project for learning and development.

---

**Created for Jihan Elkhouly**
Secure Authentication System - Assignment #2
