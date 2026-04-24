"""
Database module for user management and TOTP secret storage.
Supports both SQLite and MySQL databases.
"""

import sqlite3
import os
from typing import Optional, Dict, Any
from datetime import datetime

class Database:
    """Database abstraction layer for user authentication."""
    
    def __init__(self, db_type: str = "sqlite", db_path: str = "auth.db"):
        """
        Initialize database connection.
        
        Args:
            db_type: "sqlite" or "mysql"
            db_path: Path to SQLite database file or connection string for MySQL
        """
        self.db_type = db_type
        self.db_path = db_path
        self.connection = None
        self.init_db()
    
    def init_db(self):
        """Initialize database connection and create tables if needed."""
        if self.db_type == "sqlite":
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
        else:
            import mysql.connector
            self.connection = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME", "auth_system")
            )
        
        self._create_tables()
    
    def _create_tables(self):
        """Create necessary tables if they don't exist."""
        cursor = self.connection.cursor()
        
        if self.db_type == "sqlite":
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    hashed_password TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('Admin', 'Manager', 'User')),
                    totp_secret TEXT,
                    totp_verified INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL,
                    role ENUM('Admin', 'Manager', 'User') NOT NULL,
                    totp_secret VARCHAR(255),
                    totp_verified TINYINT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
        
        self.connection.commit()
    
    def create_user(self, name: str, email: str, hashed_password: str, role: str) -> bool:
        """
        Create a new user in the database.
        
        Args:
            name: User's full name
            email: User's email address
            hashed_password: Bcrypt hashed password
            role: User role (Admin, Manager, or User)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            if self.db_type == "sqlite":
                cursor.execute(
                    "INSERT INTO users (name, email, hashed_password, role) VALUES (?, ?, ?, ?)",
                    (name, email, hashed_password, role)
                )
            else:
                cursor.execute(
                    "INSERT INTO users (name, email, hashed_password, role) VALUES (%s, %s, %s, %s)",
                    (name, email, hashed_password, role)
                )
            self.connection.commit()
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user by email address.
        
        Args:
            email: User's email address
        
        Returns:
            User dictionary or None if not found
        """
        cursor = self.connection.cursor()
        if self.db_type == "sqlite":
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            return dict(row) if row else None
        else:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            columns = [desc[0] for desc in cursor.description]
            row = cursor.fetchone()
            return dict(zip(columns, row)) if row else None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve user by ID.
        
        Args:
            user_id: User's ID
        
        Returns:
            User dictionary or None if not found
        """
        cursor = self.connection.cursor()
        if self.db_type == "sqlite":
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        else:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            columns = [desc[0] for desc in cursor.description]
            row = cursor.fetchone()
            return dict(zip(columns, row)) if row else None
    
    def update_totp_secret(self, user_id: int, totp_secret: str) -> bool:
        """
        Update user's TOTP secret.
        
        Args:
            user_id: User's ID
            totp_secret: TOTP secret key
        
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            if self.db_type == "sqlite":
                cursor.execute(
                    "UPDATE users SET totp_secret = ? WHERE id = ?",
                    (totp_secret, user_id)
                )
            else:
                cursor.execute(
                    "UPDATE users SET totp_secret = %s WHERE id = %s",
                    (totp_secret, user_id)
                )
            self.connection.commit()
            return True
        except Exception as e:
            print(f"Error updating TOTP secret: {e}")
            return False
    
    def verify_totp(self, user_id: int) -> bool:
        """
        Mark user's TOTP as verified.
        
        Args:
            user_id: User's ID
        
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            if self.db_type == "sqlite":
                cursor.execute(
                    "UPDATE users SET totp_verified = 1 WHERE id = ?",
                    (user_id,)
                )
            else:
                cursor.execute(
                    "UPDATE users SET totp_verified = 1 WHERE id = %s",
                    (user_id,)
                )
            self.connection.commit()
            return True
        except Exception as e:
            print(f"Error verifying TOTP: {e}")
            return False
    
    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
