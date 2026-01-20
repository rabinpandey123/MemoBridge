# app/routes/chatbot.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.chatbotservice import ChatBotService
import logging

bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

# Initialize chatbot service
chatbot_service = ChatBotService()


@bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400

        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        # Generate response
        response = chatbot_service.generate_response(user_id, user_message)

        return jsonify({
            'success': True,
            'response': response,
            'user_message': user_message
        }), 200

    except Exception as e:
        logging.error(f"Chatbot error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Sorry, I encountered an error. Please try again.'
        }), 500


@bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    """Get suggested questions for the user"""
    suggestions = [
        "What medications do I have today?",
        "When is my next medication?",
        "Tell me about my family members",
        "What's my schedule for today?",
        "What time is it?",
        "Who is my daughter/son?",
        "Have I taken my morning medication?"
    ]

    return jsonify({
        'success': True,
        'suggestions': suggestions
    }), 200


@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Chatbot service is healthy'}), 200