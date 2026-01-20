from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app import User, FamilyMember, MissedActivity
from app import NotificationService
from datetime import datetime

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
users_bp = Blueprint('users', __name__, url_prefix='/api/users')
family_bp = Blueprint('family', __name__, url_prefix='/api/family')
notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


# Auth routes (existing)
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'User already exists'}), 400

        user = User(
            email=data.get('email'),
            name=data.get('name'),
            phone=data.get('phone')
        )
        user.set_password(data.get('password'))

        db.session.add(user)
        db.session.commit()

        from flask_jwt_extended import create_access_token
        access_token = create_access_token(identity=user.id)

        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()

        if user and user.check_password(data.get('password')):
            from flask_jwt_extended import create_access_token
            access_token = create_access_token(identity=user.id)

            from app import notification_service
            notification_service.check_missed_activities_on_login(user.id)

            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Family routes (existing)
@family_bp.route('', methods=['GET'])
@jwt_required()
def get_family_members():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        family_members = [member.to_dict() for member in user.family_members]
        return jsonify({'family_members': family_members}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@family_bp.route('', methods=['POST'])
@jwt_required()
def add_family_member():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Validation
        if not data.get('name') or not data.get('relation'):
            return jsonify({'error': 'Name and relation are required'}), 400

        if not data.get('phone') and not data.get('email'):
            return jsonify({'error': 'At least one contact method (phone or email) is required'}), 400

        family_member = FamilyMember(
            user_id=user_id,
            name=data.get('name'),
            relation=data.get('relation'),
            phone=data.get('phone'),
            email=data.get('email'),
            icon=data.get('icon', '👤'),
            receive_notifications=data.get('receive_notifications', True)
        )

        db.session.add(family_member)
        db.session.commit()

        return jsonify({
            'message': 'Family member added successfully',
            'family_member': family_member.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# NEW: Notification routes
@notifications_bp.route('/missed-activities', methods=['GET'])
@jwt_required()
def get_missed_activities():
    try:
        user_id = get_jwt_identity()
        missed_activities = MissedActivity.query.filter_by(user_id=user_id).order_by(
            MissedActivity.created_at.desc()).limit(10).all()
        return jsonify({
            'missed_activities': [activity.to_dict() for activity in missed_activities]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/test', methods=['POST'])
@jwt_required()
def test_notification():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        activity_name = data.get('activity_name', 'Test Activity')
        scheduled_time = data.get('scheduled_time', '10:00 AM')
        importance = data.get('importance', 'high')

        notifications_sent = NotificationService.notify_family_members(
            user_id, activity_name, scheduled_time, importance
        )

        return jsonify({
            'message': f'Test notification sent to {notifications_sent} family members',
            'notifications_sent': notifications_sent
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/manual-alert', methods=['POST'])
@jwt_required()
def manual_alert():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        activity_name = data.get('activity_name', 'Unknown Activity')
        importance = data.get('importance', 'high')

        notifications_sent = NotificationService.notify_family_members(
            user_id,
            activity_name,
            datetime.now().strftime('%H:%M'),
            importance
        )

        return jsonify({
            'message': f'Emergency alert sent to {notifications_sent} family members',
            'notifications_sent': notifications_sent
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/check-now', methods=['POST'])
@jwt_required()
def check_missed_activities_now():
    """Manually check for missed activities for the current user"""
    try:
        user_id = get_jwt_identity()

        from app import notification_service
        notifications_sent = notification_service.check_missed_activities_for_user(user_id, force_notify=True)

        return jsonify({
            'message': f'Checked missed activities. Sent {notifications_sent} notifications.',
            'notifications_sent': notifications_sent
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500