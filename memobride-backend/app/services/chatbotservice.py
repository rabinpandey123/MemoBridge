# app/services/chatbotservice.py
import os
import json
from datetime import datetime, date
from flask import current_app
from app.models import User, FamilyMember, UserActivity, ActivityCompletion
from app import db


class ChatBotService:
    def __init__(self):
        self.system_prompt = """You are MemoBot, a helpful and compassionate assistant for elderly users with memory challenges. 
        Your role is to help users remember important information about their daily schedule, family members, and medications.

        Be:
        - Patient and understanding
        - Clear and simple in your responses
        - Supportive and encouraging
        - Focused on providing helpful information

        Always respond in a warm, friendly tone. Keep responses concise but helpful."""

    def get_user_context(self, user_id):
        """Get all relevant user data for context"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None

            # Get today's activities and completions
            today = date.today()
            user_activities = UserActivity.query.filter_by(user_id=user_id).all()

            activities_info = []
            for activity in user_activities:
                completion = ActivityCompletion.query.filter(
                    ActivityCompletion.activity_id == activity.id,
                    db.func.date(ActivityCompletion.completed_at) == today
                ).first()

                activities_info.append({
                    'name': activity.activity_name,
                    'scheduled_time': activity.scheduled_time,
                    'completed': completion is not None,
                    'is_medication': 'medication' in activity.activity_name.lower()
                })

            # Get family members
            family_members = FamilyMember.query.filter_by(user_id=user_id).all()
            family_info = [{
                'name': member.name,
                'relation': member.relation,
                'phone': member.phone,
                'email': member.email
            } for member in family_members]

            # Get current time
            current_time = datetime.now().strftime("%H:%M")
            current_date = datetime.now().strftime("%A, %B %d, %Y")

            return {
                'user_name': user.name,
                'current_time': current_time,
                'current_date': current_date,
                'activities': activities_info,
                'family_members': family_info
            }

        except Exception as e:
            print(f"Error getting user context: {e}")
            return None

    def generate_response(self, user_id, user_message):
        """Generate response using rule-based system (can be enhanced with real LLM)"""
        context = self.get_user_context(user_id)
        if not context:
            return "I'm having trouble accessing your information right now. Please try again later."

        message_lower = user_message.lower()

        # Medication queries
        if any(word in message_lower for word in ['medicine', 'medication', 'pill', 'drug', 'meds']):
            return self._handle_medication_query(context)

        # Family member queries
        elif any(word in message_lower for word in
                 ['family', 'son', 'daughter', 'wife', 'husband', 'child', 'relative']):
            return self._handle_family_query(context, message_lower)

        # Schedule queries
        elif any(word in message_lower for word in ['schedule', 'activity', 'what to do', 'next', 'today']):
            return self._handle_schedule_query(context)

        # Time queries
        elif any(word in message_lower for word in ['time', 'current time', 'what time']):
            return self._handle_time_query(context)

        # Greetings
        elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return self._handle_greeting(context)

        # Default response
        else:
            return self._handle_general_query(context, user_message)

    def _handle_medication_query(self, context):
        medication_activities = [act for act in context['activities'] if act['is_medication']]

        if not medication_activities:
            return f"Hello {context['user_name']}! I don't see any medication scheduled for today. Please check with your family if you need to take any medications."

        response = f"Hello {context['user_name']}! Here are your medications for today:\n\n"

        for med in medication_activities:
            status = "✅ Completed" if med['completed'] else "⏳ Pending"
            response += f"• {med['name']} at {med['scheduled_time']} - {status}\n"

        # Check if any medications are upcoming
        current_time = datetime.now().strftime("%H:%M")
        upcoming_meds = [med for med in medication_activities if
                         not med['completed'] and med['scheduled_time'] > current_time]

        if upcoming_meds:
            next_med = min(upcoming_meds, key=lambda x: x['scheduled_time'])
            response += f"\nYour next medication is {next_med['name']} at {next_med['scheduled_time']}."

        return response

    def _handle_family_query(self, context, message):
        if not context['family_members']:
            return "I don't have any family members saved in your contacts yet. You can add family members in the Family section."

        # Try to find specific family member
        for member in context['family_members']:
            if member['name'].lower() in message.lower() or member['relation'].lower() in message.lower():
                response = f"Here's information about {member['name']}:\n"
                response += f"• Relation: {member['relation']}\n"
                if member['phone']:
                    response += f"• Phone: {member['phone']}\n"
                if member['email']:
                    response += f"• Email: {member['email']}\n"
                return response

        # General family information
        response = f"Hello {context['user_name']}! Here are your family members:\n\n"
        for member in context['family_members']:
            response += f"• {member['name']} ({member['relation']})"
            if member['phone']:
                response += f" - 📞 {member['phone']}"
            response += "\n"

        response += "\nYou can call any family member by tapping on their card in the Family section."
        return response

    def _handle_schedule_query(self, context):
        if not context['activities']:
            return "I don't see any activities scheduled for today. You can set up your daily schedule in the Activities section."

        response = f"Hello {context['user_name']}! Here's your schedule for today:\n\n"

        # Sort activities by time
        sorted_activities = sorted(context['activities'], key=lambda x: x['scheduled_time'])

        for activity in sorted_activities:
            status = "✅ Completed" if activity['completed'] else "⏳ Upcoming"
            icon = "💊" if activity['is_medication'] else "📅"
            response += f"{icon} {activity['scheduled_time']} - {activity['name']} ({status})\n"

        # Find next activity
        current_time = datetime.now().strftime("%H:%M")
        upcoming_activities = [act for act in sorted_activities if
                               not act['completed'] and act['scheduled_time'] > current_time]

        if upcoming_activities:
            next_activity = upcoming_activities[0]
            response += f"\nYour next activity is {next_activity['name']} at {next_activity['scheduled_time']}."

        return response

    def _handle_time_query(self, context):
        return f"Hello {context['user_name']}! The current time is {context['current_time']} on {context['current_date']}."

    def _handle_greeting(self, context):
        greetings = [
            f"Hello {context['user_name']}! How can I help you today?",
            f"Hi {context['user_name']}! I'm here to help you remember important things.",
            f"Good to see you, {context['user_name']}! What would you like to know?",
            f"Welcome back, {context['user_name']}! How can I assist you today?"
        ]
        import random
        return random.choice(greetings)

    def _handle_general_query(self, context, message):
        general_responses = [
            f"I understand you're asking about '{message}'. I'm designed to help you with your schedule, medications, and family information. Would you like to know about any of these?",
            f"That's an interesting question! I specialize in helping you remember your daily activities, medication times, and family contacts. How can I assist with those?",
            f"I'm here to help you stay organized and connected. You can ask me about your medication schedule, family members, or daily activities.",
            f"While I'm focused on helping with your schedule and memories, I'd be happy to help with questions about your medications, family, or daily routine."
        ]
        import random
        return random.choice(general_responses)