import os
from datetime import timedelta
from pathlib import Path

basedir = Path(__file__).parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'memobridge-secret-key-2024'
    
    # Alternative: Use project root directory
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{basedir}/memobridge.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)