import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Get these from your Twilio Console
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_SENDER = os.getenv("TWILIO_WHATSAPP_SENDER") # e.g., 'whatsapp:+14155238886'

def send_whatsapp_alert(to_number: str, roi_name: str, scene_name: str):
    """
    Sends a WhatsApp notification to the user when new data is processed.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print("⚠️ Twilio credentials missing. Skipping WhatsApp notification.")
        return False

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    # Ensure the number has the 'whatsapp:' prefix required by Twilio
    if not to_number.startswith("whatsapp:"):
        formatted_number = f"whatsapp:{to_number}"
    else:
        formatted_number = to_number

    message_body = (
        f"🚨 *SpillSense-Ai Alert*\n\n"
        f"New Sentinel-1 data has been acquired and processed for your region: *{roi_name}*.\n\n"
        f"🛰️ Scene: `{scene_name}`\n"
        f"⚙️ Status: Preprocessing Complete. AI-Ready.\n\n"
        f"Log in to your dashboard to view the telemetry."
    )

    try:
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_SENDER,
            body=message_body,
            to=formatted_number
        )
        print(f"✅ WhatsApp alert sent successfully to {formatted_number}. SID: {message.sid}")
        return True
    except Exception as e:
        print(f"❌ Failed to send WhatsApp alert: {e}")
        return False