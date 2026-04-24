# Secure Password Manager - Full Stack Application

A professional, secure credential vault web application built with a bold **Brutalist cybersecurity aesthetic**. Features JWT-based authentication, AES-256 encryption, and a dark, industrial design.

**Developer:** Jihan  
**Status:** Production-Ready

---

## Features

✅ **User Authentication** - JWT-based registration and login  
✅ **Master Password Protection** - Per-user master password setup and verification  
✅ **AES-256 Encryption** - All passwords encrypted on the backend before storage  
✅ **Credential Management** - Add, view, search, and delete credentials  
✅ **Password Generator** - Generate strong random passwords  
✅ **Brutalist Design** - Black background, white text, red accents, industrial aesthetic  
✅ **Responsive UI** - Works seamlessly on desktop and mobile  
✅ **Secure** - No plaintext passwords, encrypted storage, JWT tokens  

---

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **crypto** for AES-256 encryption

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons

---

## Project Structure

```
valut-os/
├── backend/
│   ├── routes/
│   │   ├── auth.js              # Registration & login
│   │   ├── masterPassword.js    # Master password setup & verify
│   │   └── credentials.js       # Credential CRUD operations
│   ├── encryption.js            # AES-256 encryption utilities
│   ├── middleware.js            # JWT authentication & error handling
│   ├── db.js                    # Database connection pool
│   ├── database.sql             # Database schema
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   └── Dashboard.jsx    # Main vault dashboard
│   │   ├── components/
│   │   │   ├── MasterPasswordSetup.jsx
│   │   │   └── CredentialsVault.jsx
│   │   ├── api.js               # API client
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL (v5.7+)
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Environment Variables:**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=password_manager
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

### 2. Database Setup

```bash
# Create database and tables
mysql -u root -p < database.sql

# Or manually:
# 1. Create database: CREATE DATABASE password_manager;
# 2. Run the SQL schema from database.sql
```

### 3. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server will run on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

### 5. Start Frontend Development Server

```bash
npm run dev

# Frontend will run on http://localhost:3000
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Master Password
- `POST /api/master-password/setup` - Set master password
- `POST /api/master-password/verify` - Verify master password

### Credentials
- `GET /api/credentials/list` - Get all credentials (metadata only)
- `GET /api/credentials/:id` - Get single credential with decryption
- `POST /api/credentials/add` - Add new credential
- `DELETE /api/credentials/:id` - Delete credential
- `GET /api/credentials/generate/password` - Generate random password

### Health
- `GET /api/health` - API health check

---

## Usage Guide

### 1. Register Account
1. Go to http://localhost:3000
2. Click "Register"
3. Enter email, username, and password
4. Click "REGISTER"

### 2. Set Master Password
1. After login, you'll be prompted to set a master password
2. Choose a strong password (minimum 8 characters)
3. Confirm the password
4. Click "SET MASTER PASSWORD"

### 3. Unlock Vault
1. Enter your master password
2. Click "UNLOCK"
3. Your credentials vault is now accessible

### 4. Add Credentials
1. Click "ADD CREDENTIAL"
2. Enter service name, username, and password
3. Or click "GEN" to generate a strong password
4. Click "SAVE CREDENTIAL"

### 5. View Credentials
- Credentials are displayed in a list
- Click the eye icon to toggle password visibility
- Click the copy icon to copy password to clipboard

### 6. Delete Credentials
- Click the trash icon next to a credential
- Confirm deletion

### 7. Search Credentials
- Use the search box to filter credentials by service name

---

## Security Features

### Encryption
- **Master Password Hashing:** SHA-256 hashing for master password storage
- **Credential Encryption:** AES-256-CBC encryption for all stored passwords
- **Key Derivation:** PBKDF2 with 100,000 iterations for key derivation
- **Random Salt & IV:** Each password encrypted with unique salt and IV

### Authentication
- **JWT Tokens:** Secure token-based authentication
- **Password Hashing:** bcryptjs with salt rounds for user passwords
- **Token Expiry:** Tokens expire after 7 days (configurable)

### Database
- **Foreign Keys:** Referential integrity with cascade delete
- **Indexes:** Optimized queries for user lookups
- **Prepared Statements:** Protection against SQL injection

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Manual Testing
1. Register a new account
2. Set a master password
3. Add several credentials
4. Search and filter credentials
5. Delete a credential
6. Logout and login again
7. Verify credentials are still encrypted

---

## Deployment

### Backend (Node.js)
```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

### Frontend (Static Build)
```bash
npm run build

# Serve from dist/ directory
# Deploy to Netlify, Vercel, or any static host
```

### Environment Variables (Production)
- Change `JWT_SECRET` to a strong random value
- Update `CORS_ORIGIN` to your frontend domain
- Use a production MySQL database
- Set `NODE_ENV=production`

---

## Architecture

### Data Flow
1. User registers → Password hashed with bcryptjs
2. User sets master password → Hashed with SHA-256
3. User adds credential → Password encrypted with AES-256 using master password
4. User retrieves credential → Master password verified → Credential decrypted
5. User deletes credential → Removed from database

### Encryption Process
```
Plain Password + Master Password
    ↓
PBKDF2 Key Derivation (100,000 iterations)
    ↓
Generate Random Salt & IV
    ↓
AES-256-CBC Encryption
    ↓
Concatenate: Salt + IV + Ciphertext
    ↓
Base64 Encode
    ↓
Store in Database
```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Ensure MySQL is running and credentials in .env are correct

### JWT Token Expired
```
Error: Invalid or expired token
```
**Solution:** Login again to get a new token

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update `CORS_ORIGIN` in backend .env to match frontend URL

### Master Password Verification Failed
```
Error: Invalid master password
```
**Solution:** Ensure you're entering the correct master password

---

## Future Enhancements

- Two-factor authentication (2FA)
- Password strength indicator
- Credential sharing between users
- Audit logs for credential access
- Browser extension for auto-fill
- Cloud synchronization
- Mobile app (React Native)
- Biometric authentication

---

## License

MIT License - Feel free to use and modify

---

## Support

For issues or questions, please refer to the code comments and documentation.

**Built with ❤️ by Jihan**
