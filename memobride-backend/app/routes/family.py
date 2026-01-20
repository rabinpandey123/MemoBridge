# family.py - FIXED WITH URL PREFIX
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, FamilyMember
from app import db

# Add url_prefix here
bp = Blueprint('family', __name__, url_prefix='/api/family')

@bp.route('', methods=['GET'])
@jwt_required()
def get_family_members():
    try:
        user_id = get_jwt_identity()

        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            print(f"❌ Invalid user_id format: {user_id}")
            return jsonify({'error': 'Invalid user identity'}), 400

        print(f"🔍 Fetching family members for user_id: {user_id_int}")

        user = User.query.get(user_id_int)

        if not user:
            print(f"❌ User {user_id_int} not found")
            return jsonify({'error': 'User not found'}), 404

        family_members = [member.to_dict() for member in user.family_members]
        print(f"✅ Found {len(family_members)} family members for user {user_id_int}")

        return jsonify({'family_members': family_members}), 200

    except Exception as e:
        print(f"💥 Error in get_family_members: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def add_family_member():
    try:
        user_id = get_jwt_identity()

        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            print(f"❌ Invalid user_id format: {user_id}")
            return jsonify({'error': 'Invalid user identity'}), 400

        data = request.get_json()

        print(f"🔍 Adding family member for user_id: {user_id_int}")
        print(f"📦 Received data: {data}")

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        name = data.get('name', '').strip()
        relation = data.get('relation', '').strip()
        phone = data.get('phone', '').strip() if data.get('phone') else None
        email = data.get('email', '').strip() if data.get('email') else None

        if not name:
            error_msg = 'Name is required'
            print(f"❌ Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400

        if not relation:
            error_msg = 'Relation is required'
            print(f"❌ Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400

        if not phone and not email:
            error_msg = 'At least one contact method (phone or email) is required'
            print(f"❌ Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400

        # Create family member
        family_member = FamilyMember(
            user_id=user_id_int,
            name=name,
            relation=relation,
            phone=phone,
            email=email,
            icon=data.get('icon', '👤'),
            receive_notifications=True
        )

        print(f"📝 Creating family member: {family_member.name}")

        db.session.add(family_member)
        db.session.commit()

        print(f"✅ Family member added successfully: {family_member.id}")

        # SEND WELCOME EMAIL TO FAMILY MEMBER
        if email:
            try:
                user = User.query.get(user_id_int)
                notification_service = current_app.notification_service

                if notification_service.send_welcome_email(family_member, user):
                    print(f"✅ Welcome email sent to {email}")
                else:
                    print(f"⚠️ Failed to send welcome email to {email}")

            except Exception as email_error:
                print(f"❌ Error sending welcome email: {email_error}")
                # Don't fail the entire request if email fails

        return jsonify({
            'message': 'Family member added successfully',
            'family_member': family_member.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"💥 Error in add_family_member: {str(e)}")
        return jsonify({'error': str(e)}), 500