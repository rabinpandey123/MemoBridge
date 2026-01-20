# notificationservices.py - FIXED IMPORT CONFLICT
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, time as dt_time  # FIXED: Rename time import
import threading
import time as time_module  # FIXED: Rename time module import
from flask import current_app


class NotificationService:
    def __init__(self, app):
        self.app = app
        self.running = False

        # SMTP Configuration
        self.smtp_config = {
            'server': os.environ.get('SMTP_SERVER', 'smtp.gmail.com'),
            'port': int(os.environ.get('SMTP_PORT', 587)),
            'username': os.environ.get('SMTP_USERNAME', ''),
            'password': os.environ.get('SMTP_PASSWORD', ''),
            'from_email': os.environ.get('FROM_EMAIL', ''),
            'from_name': os.environ.get('FROM_NAME', 'Memobridge Care Team')
        }

        # Track notified activities to avoid duplicates
        self.notified_activities = set()

    def send_email(self, to_email, subject, message, html_message=None):
        """Send email notification using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.smtp_config['from_name']} <{self.smtp_config['from_email']}>"
            msg['To'] = to_email

            # Create the plain-text and HTML version
            text_part = MIMEText(message, 'plain')
            msg.attach(text_part)

            if html_message:
                html_part = MIMEText(html_message, 'html')
                msg.attach(html_part)

            # Send the email
            with smtplib.SMTP(self.smtp_config['server'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)

            print(f"✅ Email sent to: {to_email}")
            return True

        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            return False

    def send_welcome_email(self, family_member, user):
        """Send welcome email when a family member is added"""
        if not family_member.email:
            return False

        subject = "👨‍👩‍👧‍👦 Welcome to Memobridge!"

        html_message = f"""
        <h2>Hello {family_member.name},</h2>
        <p>You've been added as a family member to <strong>{user.name}'s</strong> Memobridge care account.</p>
        <p>You will receive notifications about important activities and well-being updates.</p>
        <p>Thank you for being part of {user.name}'s care team!</p>
        """

        plain_message = f"""
        Hello {family_member.name},
        You've been added as a family member to {user.name}'s Memobridge care account.
        You will receive notifications about important activities.
        Thank you!
        """

        return self.send_email(family_member.email, subject, plain_message, html_message)

    def send_missed_activity_alert_to_family(self, user, family_member, activity_name, scheduled_time, importance):
        """Send missed activity alert to family member"""
        if not family_member.email:
            return False

        subject = f"🚨 Memobridge Alert: {user.name} missed {activity_name}"

        html_message = f"""
        <h2>Hello {family_member.name},</h2>
        <p><strong>{user.name}</strong> has missed an important activity:</p>
        <ul>
            <li>Activity: {activity_name}</li>
            <li>Scheduled Time: {scheduled_time}</li>
            <li>Importance: {importance.upper()}</li>
        </ul>
        <p>Please check on them to ensure their well-being.</p>
        """

        plain_message = f"""
        Alert: {user.name} missed {activity_name} at {scheduled_time}
        Importance: {importance}
        Please check on them.
        """

        return self.send_email(family_member.email, subject, plain_message, html_message)

    def send_missed_activity_alert_to_user(self, user, activity_name, scheduled_time, importance):
        """Send missed activity alert to the user themselves"""
        if not user.email:
            print(f"⚠️ User {user.name} has no email address, cannot send notification")
            return False

        subject = f"🔔 Memobridge Reminder: You missed {activity_name}"

        html_message = f"""
        <h2>Hello {user.name},</h2>
        <p>We noticed you missed an important activity:</p>
        <ul>
            <li>Activity: {activity_name}</li>
            <li>Scheduled Time: {scheduled_time}</li>
            <li>Importance: {importance.upper()}</li>
        </ul>
        <p>Please try to complete this activity as soon as possible.</p>
        <p>If you have already completed it, you can mark it as completed in the app.</p>
        <p><strong>Memobridge Care Team</strong></p>
        """

        plain_message = f"""
        Hello {user.name},
        We noticed you missed an important activity:
        Activity: {activity_name}
        Scheduled Time: {scheduled_time}
        Importance: {importance}

        Please try to complete this activity as soon as possible.
        If you have already completed it, you can mark it as completed in the app.

        Memobridge Care Team
        """

        print(f"📧 Attempting to send user notification to: {user.email}")
        return self.send_email(user.email, subject, plain_message, html_message)

    def notify_family_members(self, user_id, activity_name, scheduled_time, importance):
        """Notify all family members about missed activity"""
        try:
            with self.app.app_context():
                from app.models import User, FamilyMember

                user = User.query.get(user_id)
                if not user:
                    print(f"❌ User {user_id} not found for family notification")
                    return 0

                family_members = FamilyMember.query.filter_by(
                    user_id=user_id,
                    receive_notifications=True
                ).all()

                print(f"🔍 Found {len(family_members)} family members to notify for user {user_id}")

                notifications_sent = 0
                for member in family_members:
                    if member.email:
                        print(f"📧 Sending notification to family member: {member.name} ({member.email})")
                        if self.send_missed_activity_alert_to_family(user, member, activity_name, scheduled_time,
                                                                     importance):
                            notifications_sent += 1
                            print(f"✅ Family notification sent to {member.email}")
                        else:
                            print(f"❌ Failed to send family notification to {member.email}")
                    else:
                        print(f"⚠️ Family member {member.name} has no email, skipping")

                print(f"📊 Total family notifications sent: {notifications_sent}")
                return notifications_sent

        except Exception as e:
            print(f"❌ Error in notify_family_members: {e}")
            return 0

    def check_missed_activities_for_user(self, user_id, force_notify=False):
        """Check for missed activities for a specific user - USES ACTUAL USER ACTIVITIES"""
        try:
            with self.app.app_context():
                from app.models import User, UserActivity, ActivityCompletion, MissedActivity
                from app import db

                user = User.query.get(user_id)
                if not user:
                    print(f"❌ User {user_id} not found")
                    return 0

                current_time = datetime.now()
                today = current_time.date()
                current_weekday = current_time.isoweekday()  # Monday=1, Sunday=7
                notifications_sent = 0

                print(f"🔔 Checking missed activities for user: {user.name} (ID: {user_id})")

                # Get user's actual activities instead of hardcoded ones
                user_activities = UserActivity.query.filter_by(
                    user_id=user_id,
                    is_active=True
                ).all()

                if not user_activities:
                    print(f"⚠️ No activities found for user {user.name}")
                    return 0

                print(f"📋 Found {len(user_activities)} activities for user {user.name}")

                for activity in user_activities:
                    # Check if activity is scheduled for today
                    days_list = [int(day.strip()) for day in activity.days_of_week.split(',')]
                    if current_weekday not in days_list:
                        print(f"⏭️ Activity {activity.activity_name} not scheduled for today (day {current_weekday})")
                        continue

                    # Parse scheduled time
                    try:
                        scheduled_hour, scheduled_minute = map(int, activity.scheduled_time.split(':'))
                        scheduled_time_obj = dt_time(scheduled_hour, scheduled_minute)  # FIXED: Use dt_time
                    except ValueError:
                        print(f"❌ Invalid time format for activity {activity.activity_name}: {activity.scheduled_time}")
                        continue

                    # Create scheduled datetime for today
                    scheduled_datetime = datetime.combine(today, scheduled_time_obj)

                    # Check if activity was completed today
                    activity_completed = ActivityCompletion.query.filter(
                        ActivityCompletion.activity_id == activity.id,
                        db.func.date(ActivityCompletion.completed_at) == today
                    ).first()

                    if not activity_completed:
                        print(f"❌ Activity not completed: {activity.activity_name} at {activity.scheduled_time}")

                        # Calculate time differences
                        time_since_scheduled = current_time - scheduled_datetime

                        # Create unique identifier for this notification
                        notification_id = f"{user_id}_{activity.activity_name}_{today}"

                        # USER NOTIFICATION: Within 20 minutes OR on login (force_notify)
                        should_notify_user = (
                                force_notify or
                                (timedelta(minutes=1) <= time_since_scheduled <= timedelta(minutes=20))
                        )

                        if should_notify_user and notification_id not in self.notified_activities:
                            print(f"📧 Sending user notification for {activity.activity_name}")
                            if self.send_missed_activity_alert_to_user(
                                    user,
                                    activity.activity_name,
                                    activity.scheduled_time,
                                    'high'  # Default importance
                            ):
                                notifications_sent += 1
                                self.notified_activities.add(notification_id)
                                print(f"✅ User notification sent for {activity.activity_name}")

                                # Record missed activity
                                missed_activity = MissedActivity(
                                    user_id=user.id,
                                    activity_name=activity.activity_name,
                                    scheduled_time=activity.scheduled_time,
                                    importance='high',
                                    notified=True
                                )
                                db.session.add(missed_activity)
                            else:
                                print(f"❌ Failed to send user notification for {activity.activity_name}")

                        # FAMILY NOTIFICATION: After 30 minutes (only if not forced)
                        elif (not force_notify and
                              timedelta(minutes=30) <= time_since_scheduled <= timedelta(minutes=40) and
                              f"{notification_id}_family" not in self.notified_activities):

                            print(f"📧 Sending family notifications for {activity.activity_name}")
                            family_notifications = self.notify_family_members(
                                user.id,
                                activity.activity_name,
                                activity.scheduled_time,
                                'high'
                            )
                            notifications_sent += family_notifications
                            if family_notifications > 0:
                                self.notified_activities.add(f"{notification_id}_family")
                                print(f"✅ Family notifications sent for {activity.activity_name}")
                            else:
                                print(f"❌ No family notifications sent for {activity.activity_name}")
                        else:
                            time_diff_minutes = time_since_scheduled.total_seconds() / 60
                            print(
                                f"⏰ Activity {activity.activity_name} outside notification windows (diff: {time_diff_minutes:.1f} min)")
                    else:
                        print(f"✅ Activity completed: {activity.activity_name}")

                db.session.commit()
                print(f"📊 Total notifications sent for user {user_id}: {notifications_sent}")
                return notifications_sent

        except Exception as e:
            print(f"❌ Error in check_missed_activities_for_user: {e}")
            import traceback
            traceback.print_exc()
            return 0

    def check_and_notify_missed_activities(self, user_id=None):
        """Check for missed activities for all users or specific user"""
        try:
            with self.app.app_context():
                from app.models import User

                if user_id:
                    users = User.query.filter_by(id=user_id).all()
                else:
                    users = User.query.all()

                total_notifications = 0
                for user in users:
                    print(f"🔍 Checking missed activities for user: {user.name}")
                    notifications = self.check_missed_activities_for_user(user.id)
                    total_notifications += notifications

                print(f"📊 Total notifications sent: {total_notifications}")
                return total_notifications

        except Exception as e:
            print(f"❌ Error in check_and_notify_missed_activities: {e}")
            return 0

    def check_missed_activities(self):
        """Background thread to check for missed activities"""
        while self.running:
            try:
                print("🕒 Background check for missed activities...")
                # Check for all users in background
                self.check_and_notify_missed_activities()
            except Exception as e:
                print(f"❌ Error in missed activities check: {e}")

            # Check every 5 minutes
            time_module.sleep(300)  # FIXED: Use time_module

    def check_missed_activities_on_login(self, user_id):
        """Check for missed activities when user logs in - FORCE NOTIFICATION"""
        try:
            print(f"🔔 Checking missed activities for user {user_id} on login")
            notifications_sent = self.check_missed_activities_for_user(user_id, force_notify=True)
            print(f"✅ Sent {notifications_sent} notifications on login")
            return notifications_sent
        except Exception as e:
            print(f"❌ Error checking missed activities on login: {e}")
            return 0

    def start_monitoring(self):
        """Start the notification monitoring service"""
        self.running = True
        monitor_thread = threading.Thread(target=self.check_missed_activities, daemon=True)
        monitor_thread.start()
        print("🔔 Notification monitoring started")

    def stop_monitoring(self):
        """Stop the notification monitoring service"""
        self.running = False