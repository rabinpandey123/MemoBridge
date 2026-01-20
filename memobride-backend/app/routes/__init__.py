# __init__.py - FIXED BLUEPRINT REGISTRATION
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    # CORS Configuration
    CORS(app,
         origins=["https://localhost:3000", "https://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
    app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key-change-this-in-production'

    # File upload configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # Database configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "app.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'memories'), exist_ok=True)

    # Import models here to avoid circular imports
    with app.app_context():
        from app.models import User, FamilyMember, UserActivity, ActivityCompletion, MissedActivity, MemoryPhoto, \
            GameSession
        db.create_all()

        # Create default activities for existing users if they don't have any
        users = User.query.all()
        for user in users:
            if not UserActivity.query.filter_by(user_id=user.id).first():
                create_default_activities(user.id)

    # Register blueprints WITH PROPER URL PREFIXES
    from app.routes.auth import bp as auth_bp
    from app.routes.family import bp as family_bp
    from app.routes.activities import bp as activities_bp
    from app.routes.chatbot import bp as chatbot_bp

    # Register with explicit URL prefixes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(family_bp, url_prefix='/api/family')
    app.register_blueprint(activities_bp, url_prefix='/api/activities')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

    # Conditionally register other blueprints if they exist
    try:
        from app.routes.memories import bp as memories_bp
        app.register_blueprint(memories_bp, url_prefix='/api/memories')
    except ImportError:
        print("⚠️ Memories routes not found, skipping...")

    try:
        from app.routes.games import bp as games_bp
        app.register_blueprint(games_bp, url_prefix='/api/games')
    except ImportError:
        print("⚠️ Games routes not found, skipping...")

    try:
        from app.routes.notifications import bp as notifications_bp
        app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    except ImportError:
        print("⚠️ Notifications routes not found, skipping...")

    # Initialize Notification Service
    from app.notificationservices import NotificationService
    notification_service = NotificationService(app)
    notification_service.start_monitoring()

    # Make it available to the app context
    app.notification_service = notification_service

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Memobridge API is running',
            'cors_enabled': True
        })

    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'Memobridge API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'family': '/api/family',
                'activities': '/api/activities',
                'health': '/api/health'
            }
        })

    print("✅ Memobridge Flask app initialized successfully")
    print("🔔 Notification service started")

    return app


def create_default_activities(user_id):
    """Create default activities for a user"""
    from app.models import UserActivity, db

    default_activities = [
        {'activity_name': 'Morning Medication', 'scheduled_time': '09:00', 'days_of_week': '1,2,3,4,5,6,7'},
        {'activity_name': 'Lunch with Family', 'scheduled_time': '11:00', 'days_of_week': '1,2,3,4,5,6,7'},
        {'activity_name': 'Afternoon Rest', 'scheduled_time': '14:00', 'days_of_week': '1,2,3,4,5,6,7'},
        {'activity_name': 'Read Newspaper', 'scheduled_time': '16:00', 'days_of_week': '1,2,3,4,5,6,7'},
        {'activity_name': 'Evening Medication', 'scheduled_time': '18:00', 'days_of_week': '1,2,3,4,5,6,7'},
        {'activity_name': 'Dinner with Family', 'scheduled_time': '20:00', 'days_of_week': '1,2,3,4,5,6,7'},
    ]

    for activity_data in default_activities:
        activity = UserActivity(
            user_id=user_id,
            activity_name=activity_data['activity_name'],
            scheduled_time=activity_data['scheduled_time'],
            days_of_week=activity_data['days_of_week'],
            is_active=True
        )
        db.session.add(activity)

    db.session.commit()