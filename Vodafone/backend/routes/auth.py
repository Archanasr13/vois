from flask import Blueprint, request, jsonify, current_app
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
import os

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _make_token(user_id):
    # Simple token serializer using app secret; change SECRET_KEY in production
    # Use a default when SECRET_KEY is missing or explicitly None
    secret = current_app.config.get('SECRET_KEY') or 'dev-secret'
    s = URLSafeTimedSerializer(secret)
    return s.dumps({'user_id': user_id})


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user.

    Request body: { name, email, password, department }
    Responses:
      201: { success: True, message: str, user_id: id, token: token }
      400: missing fields
      409: user already exists
    """
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    department = data.get('department')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'name, email, and password are required'}), 400

    # Check existing user
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'success': False, 'message': 'User already exists'}), 409

    # Hash password before storing. Do NOT store plaintext passwords.
    pw_hash = generate_password_hash(password)
    user = User(name=name, email=email, password=pw_hash, department=department)
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Could not create user', 'details': str(e)}), 500

    token = _make_token(user.id)
    # Safe logging: never log plaintext password; only record that a user was created.
    current_app.logger.info(f"Created user id={user.id} email={email}")
    return jsonify({'success': True, 'message': 'Registered. Please login.', 'user_id': user.id, 'token': token}), 201


@bp.route('/login', methods=['POST'])
def login():
    """Authenticate user.

    Request body: { email, password }
    Responses:
      200: { success: True, message: str, user_id, token }
      401: invalid credentials
      404: user not found
    """
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    if not check_password_hash(user.password, password):
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    token = _make_token(user.id)
    return jsonify({
        'success': True, 
        'message': 'Login successful', 
        'user_id': user.id, 
        'token': token, 
        'user': {
            'id': user.id, 
            'name': user.name, 
            'email': user.email, 
            'score': user.score,
            'role': getattr(user, 'role', 'user')
        }
    })
