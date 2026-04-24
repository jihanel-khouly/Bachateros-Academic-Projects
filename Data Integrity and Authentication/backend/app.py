"""
Flask application with authentication endpoints.
Main entry point for the secure authentication system.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from database import Database
from auth import AuthManager
from middleware import require_auth, require_role, extract_token_from_header

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize database and auth manager
db = Database(db_type=os.getenv("DB_TYPE", "sqlite"), db_path=os.getenv("DB_PATH", "auth.db"))
auth_manager = AuthManager()

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Register a new user.
    
    Request body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "SecurePassword123",
        "role": "User"  # Admin, Manager, or User
    }
    
    Response:
    {
        "success": true,
        "message": "User registered successfully",
        "user_id": 1
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate role
        if data['role'] not in ['Admin', 'Manager', 'User']:
            return jsonify({'error': 'Invalid role. Must be Admin, Manager, or User'}), 400
        
        # Check if email already exists
        if db.get_user_by_email(data['email']):
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        hashed_password = auth_manager.hash_password(data['password'])
        
        # Create user
        if db.create_user(data['name'], data['email'], hashed_password, data['role']):
            user = db.get_user_by_email(data['email'])
            return jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user_id': user['id']
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Login user and return session token for 2FA verification.
    
    Request body:
    {
        "email": "john@example.com",
        "password": "SecurePassword123"
    }
    
    Response:
    {
        "success": true,
        "message": "Login successful, proceed to 2FA verification",
        "session_token": "temporary_session_token",
        "user_id": 1
    }
    """
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Get user by email
        user = db.get_user_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not auth_manager.verify_password(data['password'], user['hashed_password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate temporary session token for 2FA verification
        session_token = auth_manager.generate_jwt_token(user['id'], user['email'], user['role'])
        
        return jsonify({
            'success': True,
            'message': 'Login successful, proceed to 2FA verification',
            'session_token': session_token,
            'user_id': user['id']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/2fa/setup', methods=['POST'])
@require_auth
def setup_2fa():
    """
    Setup 2FA for user. Generate TOTP secret and QR code.
    
    Request header:
    Authorization: Bearer <session_token>
    
    Response:
    {
        "success": true,
        "totp_secret": "JBSWY3DPEBLW64TMMQ======",
        "qr_code": "data:image/png;base64,..."
    }
    """
    try:
        user_id = request.user['user_id']
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate TOTP secret
        totp_secret = auth_manager.generate_totp_secret()
        
        # Generate QR code
        qr_code = auth_manager.generate_qr_code(totp_secret, user['email'])
        
        # Store TOTP secret (not verified yet)
        db.update_totp_secret(user_id, totp_secret)
        
        return jsonify({
            'success': True,
            'totp_secret': totp_secret,
            'qr_code': qr_code,
            'message': 'Scan the QR code with your authenticator app'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/2fa/verify', methods=['POST'])
@require_auth
def verify_2fa():
    """
    Verify 2FA code and return JWT token for accessing protected routes.
    
    Request body:
    {
        "code": "123456"  # 6-digit TOTP code
    }
    
    Request header:
    Authorization: Bearer <session_token>
    
    Response:
    {
        "success": true,
        "message": "2FA verification successful",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    """
    try:
        data = request.get_json()
        
        if not data.get('code'):
            return jsonify({'error': 'TOTP code required'}), 400
        
        user_id = request.user['user_id']
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user['totp_secret']:
            return jsonify({'error': '2FA not setup for this user'}), 400
        
        # Verify TOTP code
        if not auth_manager.verify_totp_code(user['totp_secret'], data['code']):
            return jsonify({'error': 'Invalid TOTP code'}), 401
        
        # Mark TOTP as verified
        db.verify_totp(user_id)
        
        # Generate JWT token for protected routes
        token = auth_manager.generate_jwt_token(user_id, user['email'], user['role'])
        
        return jsonify({
            'success': True,
            'message': '2FA verification successful',
            'token': token
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# PROTECTED ROUTES - USER
# ============================================================================

@app.route('/api/profile', methods=['GET'])
@require_auth
def get_profile():
    """
    Get user profile (accessible to all authenticated users).
    
    Request header:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "user_id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "User"
    }
    """
    try:
        user_id = request.user['user_id']
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user_id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# PROTECTED ROUTES - MANAGER
# ============================================================================

@app.route('/api/manager', methods=['GET'])
@require_role('Manager', 'Admin')
def manager_dashboard():
    """
    Manager dashboard (accessible to Manager and Admin roles).
    
    Request header:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "message": "Welcome to Manager Dashboard",
        "user_id": 1,
        "role": "Manager"
    }
    """
    try:
        return jsonify({
            'message': 'Welcome to Manager Dashboard',
            'user_id': request.user['user_id'],
            'role': request.user['role']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# PROTECTED ROUTES - ADMIN
# ============================================================================

@app.route('/api/admin', methods=['GET'])
@require_role('Admin')
def admin_dashboard():
    """
    Admin dashboard (accessible only to Admin role).
    
    Request header:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "message": "Welcome to Admin Dashboard",
        "user_id": 1,
        "role": "Admin"
    }
    """
    try:
        return jsonify({
            'message': 'Welcome to Admin Dashboard',
            'user_id': request.user['user_id'],
            'role': request.user['role']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@require_role('Admin')
def list_all_users():
    """
    List all users (Admin only).
    
    Request header:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "users": [
            {"id": 1, "name": "John", "email": "john@example.com", "role": "Admin"},
            {"id": 2, "name": "Jane", "email": "jane@example.com", "role": "User"}
        ]
    }
    """
    try:
        cursor = db.connection.cursor()
        if db.db_type == "sqlite":
            cursor.execute("SELECT id, name, email, role FROM users")
            rows = cursor.fetchall()
            users = [dict(row) for row in rows]
        else:
            cursor.execute("SELECT id, name, email, role FROM users")
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            users = [dict(zip(columns, row)) for row in rows]
        
        return jsonify({'users': users}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug)
