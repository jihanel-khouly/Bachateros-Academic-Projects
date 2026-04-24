"""
Authentication module handling password hashing, JWT tokens, and TOTP verification.
"""

import bcrypt
import jwt
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os

class AuthManager:
    """Manages authentication operations including password hashing, JWT, and TOTP."""
    
    def __init__(self, secret_key: str = None):
        """
        Initialize authentication manager.
        
        Args:
            secret_key: JWT secret key for token signing
        """
        self.secret_key = secret_key or os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
        self.algorithm = "HS256"
        self.token_expiration_hours = 24
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
        
        Returns:
            Bcrypt hashed password
        """
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """
        Verify a password against its bcrypt hash.
        
        Args:
            password: Plain text password to verify
            hashed_password: Bcrypt hashed password
        
        Returns:
            True if password matches, False otherwise
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def generate_jwt_token(self, user_id: int, email: str, role: str) -> str:
        """
        Generate a JWT token for authenticated user.
        
        Args:
            user_id: User's ID
            email: User's email
            role: User's role
        
        Returns:
            JWT token string
        """
        payload = {
            'user_id': user_id,
            'email': email,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiration_hours),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token string
        
        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError:
            print("Invalid token")
            return None
    
    @staticmethod
    def generate_totp_secret() -> str:
        """
        Generate a new TOTP secret key.
        
        Returns:
            TOTP secret key (base32 encoded)
        """
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(totp_secret: str, email: str, issuer: str = "SecureAuth") -> str:
        """
        Generate a QR code for TOTP setup.
        
        Args:
            totp_secret: TOTP secret key
            email: User's email address
            issuer: Application name (shown in authenticator app)
        
        Returns:
            Base64 encoded QR code image
        """
        totp = pyotp.TOTP(totp_secret)
        provisioning_uri = totp.provisioning_uri(
            name=email,
            issuer_name=issuer
        )
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    
    @staticmethod
    def verify_totp_code(totp_secret: str, code: str) -> bool:
        """
        Verify a TOTP code against the secret.
        
        Args:
            totp_secret: TOTP secret key
            code: 6-digit code from authenticator app
        
        Returns:
            True if code is valid, False otherwise
        """
        try:
            totp = pyotp.TOTP(totp_secret)
            # Allow for time drift (±30 seconds)
            return totp.verify(code, valid_window=1)
        except Exception as e:
            print(f"Error verifying TOTP code: {e}")
            return False
