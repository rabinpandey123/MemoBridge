# Vercel Deployment Guide for MemoBridge Backend

## What Was Added

The following files have been created to enable Vercel deployment:

1. **`memobride-backend/index.py`** - Flask app entry point for Vercel
2. **`vercel.json`** - Vercel configuration file
3. **`memobride-backend/.env.example`** - Environment variables template
4. **Updated `requirements.txt`** - Added `gunicorn` and `Werkzeug` for production

## Vercel Deployment Steps

### 1. Connect Your Repository
- Push your changes to GitHub
- Go to [vercel.com](https://vercel.com) and sign in
- Click "Add New" → "Project"
- Import your GitHub repository

### 2. Configure Environment Variables
In your Vercel Project Settings → Environment Variables, add:

```
ENVIRONMENT=production
SECRET_KEY=<generate-a-secure-random-string>
JWT_SECRET_KEY=<generate-a-secure-random-string>
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your-email@gmail.com>
SMTP_PASSWORD=<your-app-password>
FROM_EMAIL=<your-email@gmail.com>
FROM_NAME=Memobridge Care Team
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

**Important:** Generate secure random strings for `SECRET_KEY` and `JWT_SECRET_KEY`. You can use:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Configure Root Directory (if needed)
- In Vercel Project Settings → General
- Set "Root Directory" to `memobride-backend` if the build fails

### 4. Deploy
- Vercel will automatically deploy on each push to your default branch
- View logs in Vercel Dashboard

## Database Considerations

⚠️ **Important:** SQLite (`app.db`) won't persist on Vercel due to serverless architecture.

For production, you should:

1. **Use PostgreSQL** (recommended):
   - Update `app/__init__.py`:
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
   ```
   - Add PostgreSQL URL to Vercel Environment Variables as `DATABASE_URL`

2. **Or use MongoDB/Firebase** for a fully managed solution

## File Upload Considerations

⚠️ **Important:** Vercel's `/tmp` directory has limited storage and is ephemeral.

For production file uploads:
- Use S3, Google Cloud Storage, or similar cloud storage
- Update `app/__init__.py` to use cloud storage instead of local filesystem

## Testing Deployment

After deployment, test with:
```bash
curl https://your-vercel-domain.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "Memobridge API is running",
  "cors_enabled": true
}
```

## Troubleshooting

### "Module not found" errors
- Check that `index.py` is in the root of `memobride-backend`
- Verify all imports in `app/__init__.py` are correct

### CORS errors
- Update `CORS_ORIGINS` environment variable with your frontend domain
- Ensure frontend makes requests to `https://your-vercel-domain.vercel.app`

### 502 Bad Gateway
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure Python dependencies are installed (`requirements.txt`)

## Next Steps

1. Update the database to use PostgreSQL for production
2. Migrate file uploads to cloud storage
3. Update your frontend to point to the Vercel backend URL
4. Review security settings (HTTPS, CORS, etc.)
