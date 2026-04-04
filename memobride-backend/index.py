from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app instance for Vercel
app = create_app()

# Update CORS for production
if os.getenv('ENVIRONMENT') == 'production':
    from flask_cors import CORS
    CORS(app,
         origins=[os.getenv('FRONTEND_URL', 'https://yourdomain.com')],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

if __name__ == '__main__':
    app.run()
