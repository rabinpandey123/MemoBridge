import os
import uuid
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app import db
from app.models import MemoryPhoto, User

bp = Blueprint('memories', __name__, url_prefix='/api/memories')


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'Memories route is working!'}), 200


@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_photo():
    try:
        print("🎯 UPLOAD ENDPOINT HIT!")

        if 'photo' not in request.files:
            print("❌ No photo in request.files")
            return jsonify({'success': False, 'error': 'No photo provided'}), 400

        user_id = get_jwt_identity()
        print(f"👤 User ID: {user_id}")

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        file = request.files['photo']
        description = request.form.get('description', 'Memory Photo')
        category = request.form.get('category', 'family')

        print(f"📁 File: {file.filename}")
        print(f"📝 Description: {description}")

        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        if not file or not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400

        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"

        # Use app config for upload folder
        memories_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'memories')
        os.makedirs(memories_folder, exist_ok=True)

        file_path = os.path.join(memories_folder, unique_filename)

        print(f"💾 Saving to: {file_path}")

        # Save the file
        file.save(file_path)

        # Verify file was saved
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Failed to save file'}), 500

        # Create memory photo record
        memory_photo = MemoryPhoto(
            user_id=int(user_id),
            category=category,
            filename=unique_filename,
            original_filename=secure_filename(file.filename),
            description=description
        )

        db.session.add(memory_photo)
        db.session.commit()

        print("✅ Photo uploaded successfully")

        return jsonify({
            'success': True,
            'message': 'Photo uploaded successfully',
            'photo': memory_photo.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"💥 Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Upload failed: {str(e)}'}), 500


@bp.route('/photos', methods=['GET'])
@jwt_required()
def get_all_photos():
    """Get all memory photos for the user"""
    try:
        user_id = get_jwt_identity()
        print(f"📸 Getting photos for user: {user_id}")

        photos = MemoryPhoto.query.filter_by(
            user_id=int(user_id)
        ).order_by(MemoryPhoto.uploaded_at.desc()).all()

        photos_data = [photo.to_dict() for photo in photos]

        print(f"✅ Found {len(photos_data)} photos")

        return jsonify({
            'success': True,
            'photos': photos_data
        }), 200

    except Exception as e:
        print(f"💥 Get photos error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to fetch photos'}), 500


# FIXED: Remove JWT requirement for image serving so images can be displayed in img tags
@bp.route('/photos/<filename>', methods=['GET'])
def serve_photo(filename):
    """Serve uploaded photos - NO JWT REQUIRED so images work in browser"""
    try:
        memories_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'memories')
        file_path = os.path.join(memories_folder, filename)

        print(f"🖼️ Serving photo: {file_path}")
        print(f"📁 File exists: {os.path.exists(file_path)}")

        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return jsonify({'error': 'Photo not found'}), 404

        # Determine MIME type based on file extension
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        mimetype = None
        if ext in ['jpg', 'jpeg']:
            mimetype = 'image/jpeg'
        elif ext == 'png':
            mimetype = 'image/png'
        elif ext == 'gif':
            mimetype = 'image/gif'
        elif ext == 'webp':
            mimetype = 'image/webp'

        return send_file(file_path, mimetype=mimetype)

    except Exception as e:
        print(f"💥 Serve photo error: {str(e)}")
        return jsonify({'error': f'Failed to serve photo: {str(e)}'}), 500