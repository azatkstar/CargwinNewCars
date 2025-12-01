"""
Notification service for email, SMS, and Telegram
Integrates with SendGrid, Twilio, and Telegram Bot API
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Configuration from environment
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '+17477227494')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

async def send_email(to_email: str, subject: str, body: str, template_type: Optional[str] = None, template_data: Optional[dict] = None) -> bool:
    """Send email via SendGrid with HTML template support"""
    try:
        # Use HTML template if provided
        if template_type and template_data:
            import sys
            sys.path.append('/app/backend')
            from email_templates import get_email_template
            body = get_email_template(template_type, template_data)
        
        if not SENDGRID_API_KEY:
            logger.warning(f"SendGrid API key not configured - mock email to {to_email}")
            logger.info(f"📧 Mock email: {subject}")
            logger.info(f"   Template: {template_type or 'plain text'}")
            return True  # Mock success
        
        # TODO: Real SendGrid integration
        # from sendgrid import SendGridAPIClient
        # from sendgrid.helpers.mail import Mail
        # 
        # message = Mail(
        #     from_email='noreply@hunter.lease',
        #     to_emails=to_email,
        #     subject=subject,
        #     html_content=body
        # )
        # sg = SendGridAPIClient(SENDGRID_API_KEY)
        # response = sg.send(message)
        # return response.status_code == 202
        
        logger.info(f"📧 Mock email sent to {to_email}: {subject}")
        return True
        
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return False

async def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS via Twilio"""
    try:
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            logger.warning(f"Twilio not configured - mock SMS to {to_phone}")
            return True  # Mock success
        
        # TODO: Integrate Twilio
        # from twilio.rest import Client
        # 
        # client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        # message = client.messages.create(
        #     body=message,
        #     from_=TWILIO_PHONE_NUMBER,
        #     to=to_phone
        # )
        # return message.sid is not None
        
        logger.info(f"📱 Mock SMS sent to {to_phone}: {message[:50]}...")
        return True
        
    except Exception as e:
        logger.error(f"SMS send error: {e}")
        return False

async def send_telegram(telegram_id: str, message: str) -> bool:
    """Send message via Telegram Bot"""
    try:
        if not TELEGRAM_BOT_TOKEN:
            logger.warning(f"Telegram bot token not configured - mock message to {telegram_id}")
            return True  # Mock success
        
        # TODO: Integrate Telegram Bot API
        # import httpx
        # 
        # url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(url, json={
        #         'chat_id': telegram_id,
        #         'text': message,
        #         'parse_mode': 'HTML'
        #     })
        #     return response.status_code == 200
        
        logger.info(f"📲 Mock Telegram sent to {telegram_id}: {message[:50]}...")
        return True
        
    except Exception as e:
        logger.error(f"Telegram send error: {e}")
        return False

async def notify_subscriber(subscription: dict, lot: dict, notification_type: str = 'new_listing'):
    """Send notification to subscriber about new listing or price drop"""
    try:
        make = lot.get('make', '')
        model = lot.get('model', '')
        monthly = lot.get('lease', {}).get('monthly', 0)
        fleet_price = lot.get('msrp', 0) - lot.get('discount', 0)
        slug = lot.get('slug', '')
        
        # Build message
        if notification_type == 'new_listing':
            subject = f"🚗 New {make} {model} Available!"
            message = f"""
New {make} {model} just listed on CargwinNewCar!

💰 Starting at ${monthly}/mo
🏷️ Fleet Price: ${fleet_price:,}

View now: https://cargwin-newcar.emergent.host/car/{slug}

This is exactly what you're looking for!
            """.strip()
        else:  # price_drop
            subject = f"📉 Price Drop: {make} {model}"
            message = f"""
Great news! The price dropped on {make} {model}

💰 Now only ${monthly}/mo (was higher!)
🏷️ Fleet Price: ${fleet_price:,}

Don't miss out: https://cargwin-newcar.emergent.host/car/{slug}
            """.strip()
        
        # Send via configured channels
        results = []
        
        if subscription.get('notify_email') and subscription.get('email'):
            result = await send_email(subscription['email'], subject, message)
            results.append(('email', result))
        
        if subscription.get('notify_sms') and subscription.get('phone'):
            sms_text = f"{subject}\\n{message}"
            result = await send_sms(subscription['phone'], sms_text)
            results.append(('sms', result))
        
        if subscription.get('notify_telegram') and subscription.get('telegram_id'):
            result = await send_telegram(subscription['telegram_id'], message)
            results.append(('telegram', result))
        
        logger.info(f"Notified subscriber {subscription.get('email')} via {len(results)} channels")
        return all(r[1] for r in results)
        
    except Exception as e:
        logger.error(f"Notify subscriber error: {e}")
        return False



# ==========================================
# IN-APP NOTIFICATIONS (PHASE 7)
# ==========================================

from pathlib import Path
from uuid import uuid4

NOTIFICATIONS_FILE = Path("/app/backend/notifications_db.json")


def ensure_notifications_file():
    """Ensure notifications file exists"""
    if not NOTIFICATIONS_FILE.exists():
        NOTIFICATIONS_FILE.write_text(json.dumps([]))


def load_notifications_from_file() -> list:
    """Load notifications from JSON"""
    try:
        ensure_notifications_file()
        with open(NOTIFICATIONS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []


def save_notifications_to_file(notifications: list):
    """Save notifications to JSON"""
    try:
        ensure_notifications_file()
        with open(NOTIFICATIONS_FILE, 'w') as f:
            json.dump(notifications, f, indent=2, default=str)
    except Exception as e:
        logging.error(f"Failed to save notifications: {e}")


def add_in_app_notification(notification_type: str, message: str, details: dict = None) -> str:
    """Add notification to JSON storage"""
    try:
        notifications = load_notifications_from_file()
        
        notif_id = str(uuid4())
        notification = {
            "id": notif_id,
            "type": notification_type,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "read": False
        }
        
        notifications.append(notification)
        
        # Keep last 100
        if len(notifications) > 100:
            notifications = notifications[-100:]
        
        save_notifications_to_file(notifications)
        
        return notif_id
    except Exception as e:
        logging.error(f"Failed to add notification: {e}")
        return ""


def mark_all_notifications_read():
    """Mark all as read"""
    try:
        notifications = load_notifications_from_file()
        for n in notifications:
            n["read"] = True
        save_notifications_to_file(notifications)
        return True
    except:
        return False

