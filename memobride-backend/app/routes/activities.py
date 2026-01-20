# activities.py - FIXED JWT ISSUES
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.models import UserActivity, ActivityCompletion, User
from app import db
from datetime import datetime, date
import logging

# Add url_prefix here
bp = Blueprint('activities', __name__, url_prefix='/api/activities')

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@bp.route('/complete', methods=['POST'])
@jwt_required()
def mark_activity_completed():
    """Mark an activity as completed - FIXED JWT VERSION"""
    try:
        # Verify JWT token first
        verify_jwt_in_request()
        user_id = get_jwt_identity()

        logger.info(f"🎯 Marking activity completed for user {user_id}")

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        activity_name = data.get('activity_name')
        suppress_notifications = data.get('suppress_notifications', False)

        if not activity_name:
            return jsonify({'error': 'Activity name is required'}), 400

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Find or create activity
        user_activity = UserActivity.query.filter_by(
            user_id=user_id,
            activity_name=activity_name,
            is_active=True
        ).first()

        # If activity doesn't exist, create it
        if not user_activity:
            logger.info(f"📝 Creating new activity: {activity_name} for user {user_id}")

            # Map frontend times to backend format
            time_mapping = {
                "9:00 AM": "09:00",
                "11:00 AM": "11:00",
                "2:00 PM": "14:00",
                "4:00 PM": "16:00",
                "6:00 PM": "18:00",
                "8:00 PM": "20:00"
            }

            scheduled_time = time_mapping.get(data.get('time', ''), "09:00")

            user_activity = UserActivity(
                user_id=user_id,
                activity_name=activity_name,
                scheduled_time=scheduled_time,
                days_of_week='1,2,3,4,5,6,7',  # Every day
                is_active=True
            )
            db.session.add(user_activity)
            db.session.flush()  # Get the ID without committing
            logger.info(f"✅ Created activity: {user_activity.id}")

        # Check if already completed today
        today = date.today()
        existing_completion = ActivityCompletion.query.filter(
            ActivityCompletion.activity_id == user_activity.id,
            db.func.date(ActivityCompletion.completed_at) == today
        ).first()

        if existing_completion:
            logger.info(f"ℹ️ Activity already completed today: {activity_name}")
            return jsonify({'message': 'Activity already completed today'}), 200

        # Create completion record
        completion = ActivityCompletion(
            activity_id=user_activity.id,
            completed_by_user=True
        )
        db.session.add(completion)
        db.session.commit()

        logger.info(f"✅ Activity completed: {activity_name} (Completion ID: {completion.id})")

        return jsonify({
            'message': 'Activity marked as completed',
            'completion_id': completion.id,
            'activity_name': activity_name,
            'user_id': user_id
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error marking activity completed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/debug/user-activities', methods=['GET'])
@jwt_required()
def debug_user_activities():
    """Debug endpoint to check user's activities"""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()

        logger.info(f"🔍 Debug user activities for user {user_id}")

        user_activities = UserActivity.query.filter_by(user_id=user_id).all()
        today = date.today()

        activities_data = []
        for activity in user_activities:
            completion = ActivityCompletion.query.filter(
                ActivityCompletion.activity_id == activity.id,
                db.func.date(ActivityCompletion.completed_at) == today
            ).first()

            activities_data.append({
                'id': activity.id,
                'name': activity.activity_name,
                'scheduled_time': activity.scheduled_time,
                'is_active': activity.is_active,
                'completed_today': completion is not None,
                'completion_id': completion.id if completion else None
            })

        logger.info(f"📊 Found {len(activities_data)} activities for user {user_id}")

        return jsonify({
            'user_id': user_id,
            'activities_count': len(activities_data),
            'activities': activities_data
        }), 200

    except Exception as e:
        logger.error(f"❌ Debug error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Simple health check without JWT
@bp.route('/health', methods=['GET'])
def activities_health():
    return jsonify({'status': 'activities endpoint is working'}), 200