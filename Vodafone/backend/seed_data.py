"""Seed helpers for the backend.

This module provides a `seed_users()` helper that creates demo users
with hashed passwords. It is intentionally minimal and safe to run
multiple times.

Note: Passwords are hashed using Werkzeug. Change the demo passwords
or remove this seeding in production.
"""
from models import db, User
from werkzeug.security import generate_password_hash

def seed_users():
    """Create three demo users with hashed passwords if no users exist."""
    if User.query.first():
        return

    demo_password = 'password123'
    users = [
        {'name': 'John Smith', 'email': 'john.smith@company.com', 'department': 'IT', 'score': 50, 'role': 'user'},
        {'name': 'Sarah Johnson', 'email': 'sarah.johnson@company.com', 'department': 'HR', 'score': 35, 'role': 'user'},
        {'name': 'Mike Chen', 'email': 'mike.chen@company.com', 'department': 'Finance', 'score': 60, 'role': 'user'},
        {'name': 'Admin User', 'email': 'admin@company.com', 'department': 'IT', 'score': 0, 'role': 'admin'},
    ]

    for u in users:
        # Check if user exists
        existing = User.query.filter_by(email=u['email']).first()
        if not existing:
            pw_hash = generate_password_hash(demo_password)
            user = User(
                name=u['name'], 
                email=u['email'], 
                password=pw_hash, 
                department=u.get('department'), 
                score=u.get('score', 0),
                role=u.get('role', 'user')
            )
            db.session.add(user)

    db.session.commit()
