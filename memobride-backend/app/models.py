from app import db
from datetime import datetime
from app import bcrypt


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with family members
    family_members = db.relationship('FamilyMember', backref='user', lazy=True, cascade='all, delete-orphan')
    # Add relationship to memory photos
    memory_photos = db.relationship('MemoryPhoto', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """Set password hash"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check password against hash"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FamilyMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    relation = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    icon = db.Column(db.String(10), default='👤')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    receive_notifications = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'relation': self.relation,
            'phone': self.phone,
            'email': self.email,
            'icon': self.icon,
            'receive_notifications': self.receive_notifications,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ADD THESE MISSING MODELS
class UserActivity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_name = db.Column(db.String(100), nullable=False)
    scheduled_time = db.Column(db.String(20), nullable=False)  # "09:00"
    days_of_week = db.Column(db.String(50), default='1,2,3,4,5,6,7')  # 1=Monday, 7=Sunday
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_name': self.activity_name,
            'scheduled_time': self.scheduled_time,
            'days_of_week': self.days_of_week,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ActivityCompletion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('user_activity.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_by_user = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'completed_by_user': self.completed_by_user
        }


class MissedActivity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_name = db.Column(db.String(100), nullable=False)
    scheduled_time = db.Column(db.String(20), nullable=False)
    importance = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notified = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref='missed_activities')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_name': self.activity_name,
            'scheduled_time': self.scheduled_time,
            'importance': self.importance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'notified': self.notified
        }


class MemoryPhoto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='family')
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(200), nullable=False, default='Memory Photo')
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'description': self.description,
            # Use absolute URL for images
            'url': f'http://localhost:5000/api/memories/photos/{self.filename}',
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


# Add this to your existing models.py
class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_type = db.Column(db.String(50), nullable=False)  # 'tic_tac_toe', 'memory'
    score = db.Column(db.Integer, default=0)
    moves = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('game_sessions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_type': self.game_type,
            'score': self.score,
            'moves': self.moves,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }