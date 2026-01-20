# auth.py - COMPLETELY FIXED VERSION
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from app import db, bcrypt
from app.models import User
from datetime import timedelta
import traceback

# Add url_prefix here
bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Configure token expiration times
ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
REFRESH_TOKEN_EXPIRES = timedelta(days=7)

@bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight'}), 200

    try:
        print("🔵 REGISTER ENDPOINT HIT")
        data = request.get_json()

        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No data provided'}), 400

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        print(f"📝 Registration attempt: {name}, {email}")

        # Validate input
        if not name or not email or not password:
            return jsonify({'error': 'Name, email and password are required'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"❌ User already exists: {email}")
            return jsonify({'error': 'User already exists'}), 409

        # Create new user with hashed password
        user = User(
            name=name,
            email=email,
            phone=data.get('phone', '')
        )
        user.set_password(password)  # Use the method

        db.session.add(user)
        db.session.commit()

        # Create tokens
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=ACCESS_TOKEN_EXPIRES
        )
        refresh_token = create_refresh_token(
            identity=str(user.id),
            expires_delta=REFRESH_TOKEN_EXPIRES
        )

        print(f"✅ User registered successfully: {user.id}")

        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"💥 Registration error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight'}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"❌ User not found: {email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # Verify password using bcrypt - FIXED: Use user method
        if not user.check_password(password):
            print(f"❌ Invalid password for user: {email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # Create tokens
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=ACCESS_TOKEN_EXPIRES
        )
        refresh_token = create_refresh_token(
            identity=str(user.id),
            expires_delta=REFRESH_TOKEN_EXPIRES
        )

        # Check for missed activities on login
        try:
            from flask import current_app
            current_app.notification_service.check_missed_activities_on_login(user.id)
        except Exception as notification_error:
            print(f"⚠️ Notification error on login: {notification_error}")
            # Don't fail login if notifications fail

        print(f"✅ Login successful for user: {user.email}")

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Login failed'}), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        new_access_token = create_access_token(
            identity=current_user,
            expires_delta=ACCESS_TOKEN_EXPIRES
        )
        return jsonify({
            'access_token': new_access_token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test_auth():
    return jsonify({'message': 'Auth routes are working!'}), 200

# ADD DEVELOPMENT ROUTES FOR DEBUGGING
@bp.route('/debug/users', methods=['GET'])
def get_all_users():
    """Get all users - FOR DEVELOPMENT ONLY"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [{'id': u.id, 'email': u.email, 'name': u.name} for u in users]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/debug/reset-db', methods=['POST'])
def reset_database():
    """Reset database - FOR DEVELOPMENT ONLY"""
    try:
        db.drop_all()
        db.create_all()
        return jsonify({'message': 'Database reset successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500