# Railway Deployment Guide

This project is configured for deployment on Railway as a **two-service monorepo** setup:
- **Backend**: Node.js/Express API
- **Frontend**: React/Vite SPA

## Prerequisites

1. [Railway.app account](https://railway.app/)
2. Railway CLI installed: `npm install -g @railway/cli`
3. MongoDB instance (can use Railway's MongoDB plugin or external service)

## Deployment Steps

### Option 1: Automated Railway Deployment (Recommended)

1. **Login to Railway CLI**:
   ```bash
   railway login
   ```

2. **Create a new project** on Railway dashboard at https://railway.app/dashboard

3. **Deploy Backend Service**:
   ```bash
   cd backend
   railway init
   # Follow prompts to connect to your Railway project
   # Add MongoDB plugin from Railway dashboard
   railway up
   ```

4. **Deploy Frontend Service**:
   ```bash
   cd frontend
   railway init
   # Connect to the same Railway project
   railway up
   ```

### Option 2: Manual Deployment via Dashboard

1. **Create Backend Service**:
   - Go to Railway Dashboard → New → Create from GitHub Repo
   - Select your repository and `/backend` directory
   - Add environment variables (see below)
   - Add MongoDB plugin or connect to MongoDB URI
   - Deploy

2. **Create Frontend Service**:
   - Create another service pointing to `/frontend` directory
   - Set `VITE_API_URL` environment variable to your backend URL
   - Deploy

## Environment Variables

### Backend (railway.json + Procfile handled automatically)

Add these in Railway Dashboard → Service Settings → Variables:

```
MONGO_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

### Frontend

Add these in Railway Dashboard → Service Settings → Variables:

```
VITE_API_URL=https://your-backend-domain.railway.app
```

## Database Setup

### Using Railway MongoDB Plugin (Easiest)

1. In Railway Dashboard, select your Backend service
2. Click **+ Add** → Select **MongoDB**
3. Railway automatically sets `MONGODB_URL` environment variable
4. In Backend service settings, add variable:
   ```
   MONGO_URI=${{Mongo.MONGO_URL}}
   ```

### Using External MongoDB (e.g., MongoDB Atlas)

1. Create a cluster on MongoDB Atlas
2. Get your connection string
3. Set `MONGO_URI` environment variable in Railway

## Verification

After deployment:

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-domain.railway.app/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend Access**:
   Visit `https://your-frontend-domain.railway.app`

3. **Check Logs**:
   - Railway Dashboard → Service → Logs tab

## Key Configuration Files

- `backend/railway.json` - Backend build & deploy config
- `backend/Procfile` - Process definitions (optional, railway.json takes precedence)
- `frontend/railway.json` - Frontend build & deploy config
- `backend/.env.example` - Backend environment variables template
- `frontend/.env.example` - Frontend environment variables template

## Troubleshooting

### Backend won't start: "MONGO_URI environment variable is not set"
- Ensure `MONGO_URI` or `MONGODB_URL` is set in Railway Dashboard
- Check the connection string format is correct

### Frontend can't reach backend
- Ensure `VITE_API_URL` is set correctly in frontend service
- Check backend service URL is correct (visible in Railway Dashboard)
- Verify CORS_ORIGIN in backend includes frontend domain

### Build fails
- Check Railway build logs for specific error
- Ensure `npm install` completes successfully
- Verify Node version compatibility (use Node 18+)

### Slow deployments
- Railway uses Nixpacks for automatic build detection
- Add `nixpacks.toml` (already exists in frontend) for optimization

## Scaling & Performance

- Monitor resource usage in Railway Dashboard
- Adjust compute resources under Service Settings → Compute
- Use Railway's domain aliases for custom domains
- Enable caching if needed

## CI/CD Integration (Optional)

Railway automatically deploys on git push to your main branch. To customize:
1. Railway Dashboard → Settings → Webhooks
2. Configure deployment triggers

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Node.js Deployment Guide](https://docs.railway.app/guides/nodejs)
- [Environment Variables Reference](https://docs.railway.app/reference/variables)
