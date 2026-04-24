# API Documentation - Secure Authentication System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

**Response (200):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 2. User Registration
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "User"
}
```

**Parameters:**
- `name` (string, required): User's full name
- `email` (string, required): User's email address (must be unique)
- `password` (string, required): User's password (minimum 8 characters recommended)
- `role` (string, required): User's role - must be one of: "Admin", "Manager", "User"

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 1
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Invalid role
- `409` - Email already registered
- `500` - Server error

---

### 3. User Login
**POST** `/auth/login`

Login with email and password. Returns a session token for 2FA setup.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful, proceed to 2FA verification",
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1
}
```

**Error Responses:**
- `400` - Email and password required
- `401` - Invalid email or password
- `500` - Server error

---

### 4. Setup Two-Factor Authentication
**POST** `/auth/2fa/setup`

Generate TOTP secret and QR code for 2FA setup.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Request Body:** (empty)

**Response (200):**
```json
{
  "success": true,
  "totp_secret": "JBSWY3DPEBLW64TMMQ======",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAASR...",
  "message": "Scan the QR code with your authenticator app"
}
```

**Error Responses:**
- `401` - Missing or invalid authorization token
- `404` - User not found
- `500` - Server error

**Notes:**
- The QR code is a base64-encoded PNG image
- The TOTP secret can be manually entered into authenticator apps if QR scanning fails
- Recommended authenticator apps: Google Authenticator, Microsoft Authenticator, Authy

---

### 5. Verify Two-Factor Authentication
**POST** `/auth/2fa/verify`

Verify the 6-digit TOTP code and receive JWT token for protected route access.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Parameters:**
- `code` (string, required): 6-digit TOTP code from authenticator app

**Response (200):**
```json
{
  "success": true,
  "message": "2FA verification successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - TOTP code required
- `400` - 2FA not setup for this user
- `401` - Missing or invalid authorization token
- `401` - Invalid TOTP code
- `404` - User not found
- `500` - Server error

**Notes:**
- The returned token is valid for 24 hours
- Use this token in the Authorization header for all protected routes

---

### 6. Get User Profile
**GET** `/profile`

Get the current authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "user_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User"
}
```

**Error Responses:**
- `401` - Missing or invalid authorization token
- `404` - User not found
- `500` - Server error

---

### 7. Manager Dashboard
**GET** `/manager`

Access the manager dashboard. Restricted to Manager and Admin roles.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Welcome to Manager Dashboard",
  "user_id": 1,
  "role": "Manager"
}
```

**Error Responses:**
- `401` - Missing or invalid authorization token
- `403` - Access denied (insufficient role)
- `500` - Server error

**Allowed Roles:**
- Manager
- Admin

---

### 8. Admin Dashboard
**GET** `/admin`

Access the admin dashboard. Restricted to Admin role only.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Welcome to Admin Dashboard",
  "user_id": 1,
  "role": "Admin"
}
```

**Error Responses:**
- `401` - Missing or invalid authorization token
- `403` - Access denied (Admin role required)
- `500` - Server error

**Allowed Roles:**
- Admin

---

### 9. List All Users
**GET** `/admin/users`

Retrieve a list of all users in the system. Admin only.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "User"
    }
  ]
}
```

**Error Responses:**
- `401` - Missing or invalid authorization token
- `403` - Access denied (Admin role required)
- `500` - Server error

**Allowed Roles:**
- Admin

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions for resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists (e.g., email) |
| 500 | Internal Server Error - Server error |

---

## Authentication Flow Example

### Step 1: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "User"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```
Response includes `session_token`.

### Step 3: Setup 2FA
```bash
curl -X POST http://localhost:5000/api/auth/2fa/setup \
  -H "Authorization: Bearer <session_token>"
```
Response includes `qr_code` and `totp_secret`.

### Step 4: Verify 2FA
```bash
curl -X POST http://localhost:5000/api/auth/2fa/verify \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```
Response includes JWT `token`.

### Step 5: Access Protected Route
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <jwt_token>"
```

---

## CORS Configuration

The API supports CORS requests from configured origins. Default allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`

Configure additional origins in the `.env` file:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

---

## Rate Limiting

Currently, the API does not implement rate limiting. For production deployment, consider implementing rate limiting on:
- `/auth/login` - Prevent brute force attacks
- `/auth/2fa/verify` - Prevent TOTP code guessing
- `/auth/register` - Prevent spam registrations

---

## Security Notes

1. **Password Requirements**: Minimum 8 characters recommended
2. **Token Expiration**: JWT tokens expire after 24 hours
3. **TOTP Window**: Allows ±30 seconds time drift
4. **Password Hashing**: Bcrypt with 12 salt rounds
5. **Bearer Token**: Always use HTTPS in production
6. **CORS**: Configure to your specific domain in production

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Testing with cURL

### Register a User
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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Get Profile (requires JWT token)
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Changelog

### Version 1.0.0
- Initial release
- User registration and login
- TOTP-based 2FA
- JWT token authentication
- Role-based access control
- SQLite and MySQL support
