# run.py - UPDATED
from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = create_app()

if __name__ == '__main__':
    # Print all registered routes for debugging
    print("🚀 Memobridge Backend Started!")
    print("📋 Registered Routes:")
    with app.app_context():
        for rule in app.url_map.iter_rules():
            methods = ','.join(rule.methods)
            print(f"  {rule.endpoint:50} {methods:20} {rule.rule}")
    print("\n🌐 Server running on https://127.0.0.1:5000")
    print("🔧 Debug mode: ON")
    print("📧 SMTP Configuration:")
    print(f"   Server: {os.getenv('SMTP_SERVER', 'Not set')}")
    print(f"   Port: {os.getenv('SMTP_PORT', 'Not set')}")
    print(f"   Username: {os.getenv('SMTP_USERNAME', 'Not set')}")

    app.run(host='127.0.0.1', port=5000, debug=True)