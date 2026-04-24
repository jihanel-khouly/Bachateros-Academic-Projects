# Secure Authentication System

A complete, production-ready authentication system with Python Flask backend and React frontend featuring user registration, password hashing with bcrypt, two-factor authentication (TOTP), JWT tokens, and role-based access control.

## Features

✓ **User Registration** - Create accounts with name, email, password, and role selection
✓ **Secure Password Hashing** - Bcrypt with 12 salt rounds
✓ **Login System** - Email/password verification with session tokens
✓ **Two-Factor Authentication (2FA)** - TOTP-based with QR code generation
✓ **JWT Token Authentication** - Bearer token pattern for protected routes
✓ **Role-Based Access Control** - Admin, Manager, and User roles
✓ **Protected Routes** - /admin, /manager, /profile with role enforcement
✓ **Database Support** - SQLite (default) or MySQL
✓ **Editorial UI Design** - Sophisticated, minimalist aesthetic with high-contrast typography
✓ **RESTful API** - Complete API documentation included

## Project Structure

```
secure_auth_python/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── auth.py                # Authentication logic (hashing, JWT, TOTP)
│   ├── database.py            # Database abstraction layer
│   ├── middleware.py          # JWT validation and role checking
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment configuration template
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Editorial design styles
│   │   └── pages/
│   │       ├── Register.jsx   # Registration page
│   │       ├── Login.jsx      # Login page
│   │       ├── TwoFactorSetup.jsx    # 2FA setup page
│   │       ├── TwoFactorVerify.jsx   # 2FA verification page
│   │       └── Dashboard.jsx  # User dashboard
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   └── index.html             # HTML entry point
└── docs/
    ├── API_DOCUMENTATION.md   # Complete API reference
    └── SETUP_GUIDE.md         # Installation and setup instructions
```

## Quick Start

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the Flask server:**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/2fa/setup` - Setup two-factor authentication
- `POST /api/auth/2fa/verify` - Verify 2FA code

### Protected Routes

- `GET /api/profile` - Get user profile (all authenticated users)
- `GET /api/manager` - Manager dashboard (Manager, Admin)
- `GET /api/admin` - Admin dashboard (Admin only)
- `GET /api/admin/users` - List all users (Admin only)

## Authentication Flow

1. **User Registration**
   - Provide name, email, password, and role
   - Password is hashed with bcrypt
   - User is stored in database

2. **Login**
   - Enter email and password
   - Credentials are verified
   - Session token is returned for 2FA setup

3. **2FA Setup**
   - TOTP secret is generated
   - QR code is displayed
   - User scans with authenticator app (Google Authenticator, Microsoft Authenticator, Authy)

4. **2FA Verification**
   - User enters 6-digit code from authenticator app
   - Code is verified against TOTP secret
   - JWT token is issued for accessing protected routes

5. **Protected Route Access**
   - JWT token is sent in Authorization header: `Bearer <token>`
   - Token is validated on each request
   - Role-based access control is enforced

## Roles and Permissions

| Role    | Access                              |
|---------|-------------------------------------|
| User    | /api/profile                        |
| Manager | /api/profile, /api/manager          |
| Admin   | /api/profile, /api/manager, /api/admin, /api/admin/users |

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Admin', 'Manager', 'User')),
    totp_secret TEXT,
    totp_verified INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables (Backend)

```
FLASK_ENV=development
DEBUG=True
PORT=5000
DB_TYPE=sqlite
DB_PATH=auth.db
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

For MySQL:
```
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=auth_system
```

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: HS256 algorithm with 24-hour expiration
- **TOTP 2FA**: Time-based one-time passwords with 30-second window
- **CORS Protection**: Configurable allowed origins
- **Role-Based Access Control**: Enforced on all protected routes
- **Bearer Token Pattern**: Standard JWT authentication

## Dependencies

### Backend
- Flask 3.0.0
- bcrypt 4.1.1
- PyJWT 2.8.1
- pyotp 2.9.0
- qrcode 7.4.2
- Pillow 10.1.0
- python-dotenv 1.0.0

### Frontend
- React 18.2.0
- Axios 1.6.0
- Vite 5.0.0

## Testing

### Test User Credentials

After running the application, you can test with these roles:

1. **Admin User**
   - Email: admin@example.com
   - Password: AdminPassword123
   - Role: Admin

2. **Manager User**
   - Email: manager@example.com
   - Password: ManagerPassword123
   - Role: Manager

3. **Regular User**
   - Email: user@example.com
   - Password: UserPassword123
   - Role: User

## Design

The frontend features a sophisticated editorial aesthetic with:
- Minimalist cream background (#faf8f3)
- High-contrast black typography
- Didone serif headlines for visual impact
- Elegant Georgia serif body text
- Fine geometric lines and spaced-out details
- Generous negative space and asymmetrical balance
- Responsive design for mobile and desktop

## Error Handling

All API endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (email already registered)
- `500` - Internal Server Error

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random value
2. Set `DEBUG=False` in Flask configuration
3. Use a production database (MySQL recommended)
4. Configure CORS with your actual domain
5. Use HTTPS for all connections
6. Set secure cookie flags
7. Implement rate limiting on login endpoints
8. Add logging and monitoring

## Support

For issues or questions, refer to the API documentation in `docs/API_DOCUMENTATION.md` or the setup guide in `docs/SETUP_GUIDE.md`.

## License

MIT License - Feel free to use this project for educational and commercial purposes.

---

**Created for Jihan Elkhouly**
Secure Authentication System - Assignment #2
Data Integrity and Authentication Course
