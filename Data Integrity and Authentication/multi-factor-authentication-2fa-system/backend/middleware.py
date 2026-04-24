"""
Middleware for JWT token validation and role-based access control.
"""

from functools import wraps
from flask import request, jsonify
from typing import Callable, Optional
from auth import AuthManager

auth_manager = AuthManager()

def extract_token_from_header() -> Optional[str]:
    """
    Extract JWT token from Authorization header.
    
    Expected format: Authorization: Bearer <token>
    
    Returns:
        Token string or None if not found
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]

def require_auth(f: Callable) -> Callable:
    """
    Decorator to require valid JWT token for route access.
    
    Returns:
        401 if token is missing or invalid
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = extract_token_from_header()
        
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        payload = auth_manager.verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function

def require_role(*allowed_roles: str) -> Callable:
    """
    Decorator to require specific role(s) for route access.
    
    Args:
        allowed_roles: One or more role names (Admin, Manager, User)
    
    Returns:
        403 if user's role is not in allowed_roles
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = extract_token_from_header()
            
            if not token:
                return jsonify({'error': 'Missing authorization token'}), 401
            
            payload = auth_manager.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_role = payload.get('role')
            if user_role not in allowed_roles:
                return jsonify({'error': f'Access denied. Required role(s): {", ".join(allowed_roles)}'}), 403
            
            # Add user info to request context
            request.user = payload
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator
