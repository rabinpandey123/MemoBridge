# notifications.py - ADD TEST ROUTES
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import MissedActivity, User, UserActivity
from app import db

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@bp.route('/missed-activities', methods=['GET'])
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


@bp.route('/check-now', methods=['POST'])
@jwt_required()
def check_missed_activities_now():
    """Manually check for missed activities for the current user"""
    try:
        user_id = get_jwt_identity()
        notification_service = current_app.notification_service
        notifications_sent = notification_service.check_missed_activities_for_user(user_id, force_notify=True)

        return jsonify({
            'message': f'Checked missed activities. Sent {notifications_sent} notifications.',
            'notifications_sent': notifications_sent
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/test-email', methods=['POST'])
@jwt_required()
def test_user_email():
    """Test sending email to the current user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        notification_service = current_app.notification_service

        # Send test email to user
        success = notification_service.send_missed_activity_alert_to_user(
            user,
            "Test Activity",
            "10:00",
            "high"
        )

        if success:
            return jsonify({
                'message': f'Test email sent successfully to {user.email}',
                'user_email': user.email
            }), 200
        else:
            return jsonify({
                'error': f'Failed to send test email to {user.email}'
            }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/user-activities', methods=['GET'])
@jwt_required()
def get_user_activities():
    """Get all activities for the current user"""
    try:
        user_id = get_jwt_identity()
        activities = UserActivity.query.filter_by(user_id=user_id).all()

        return jsonify({
            'activities': [activity.to_dict() for activity in activities]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500