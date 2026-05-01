# Railway Pre-Deployment Checklist

Complete this checklist before deploying to Railway.

## 📋 Project Structure

- [ ] Backend code is in `/backend` directory
- [ ] Frontend code is in `/frontend` directory
- [ ] Main entry point for backend is `backend/src/server.ts`
- [ ] Build output for frontend is `frontend/dist`

## 🔧 Configuration Files

### Root Level
- [ ] `railway.json` exists (root-level configuration)
- [ ] `Procfile` exists (fallback process definition)
- [ ] `.env.example` exists (environment variables template)
- [ ] `RAILWAY_DEPLOYMENT.md` exists (deployment guide)

### Backend
- [ ] `backend/railway.json` exists with proper build/deploy config
- [ ] `backend/Procfile` exists (optional but good to have)
- [ ] `backend/.env.example` exists
- [ ] `backend/tsconfig.json` exists
- [ ] `backend/package.json` has correct scripts:
  - [ ] `build`: Compiles TypeScript to JavaScript
  - [ ] `start`: Runs the compiled JavaScript
  - [ ] `dev`: Development mode with hot reload

### Frontend
- [ ] `frontend/railway.json` exists with proper build/deploy config
- [ ] `frontend/.env.example` exists
- [ ] `frontend/vite.config.ts` configured correctly
- [ ] `frontend/package.json` has correct scripts:
  - [ ] `build`: Builds for production
  - [ ] `start`: Serves the built application

## 🗂️ Build & Dependencies

- [ ] Run `npm ci` in backend to verify all dependencies install
- [ ] Run `npm ci` in frontend to verify all dependencies install
- [ ] Verify `npm run build` works in backend (creates `dist/` folder)
- [ ] Verify `npm run build` works in frontend (creates `dist/` folder)
- [ ] Check that TypeScript compiles without errors: `npm run build`
- [ ] Verify all peer dependencies are met

## 🔌 Application Setup

### Backend
- [ ] Express app is created and exported from `src/app.ts`
- [ ] Server starts on `process.env.PORT` (defaults to 5000)
- [ ] Health check endpoint exists at `/health`
- [ ] CORS is configured to read from `CORS_ORIGIN` environment variable
- [ ] MongoDB connection uses `MONGO_URI` environment variable
- [ ] All required environment variables are documented in `.env.example`

### Frontend
- [ ] React app builds successfully with `npm run build`
- [ ] API client points to `process.env.VITE_API_URL`
- [ ] `serve` package is in dependencies (for production serving)
- [ ] Built `dist/` folder is production-ready

## 🔐 Environment Variables

### Backend Required
- [ ] `MONGO_URI` - MongoDB connection string configured
- [ ] `JWT_SECRET` - JWT secret key (min 32 characters in production)
- [ ] `PORT` - Set to 3000 (or Railway default)
- [ ] `CORS_ORIGIN` - Set to frontend domain

### Frontend Required
- [ ] `VITE_API_URL` - Backend API URL (e.g., https://your-backend.railway.app)

### Optional but Recommended
- [ ] `NODE_ENV=production` for backend
- [ ] `DEBUG=false` or similar performance settings

## 🗄️ Database

- [ ] MongoDB connection string is ready (Atlas or Railway MongoDB plugin)
- [ ] Database name is specified in connection string
- [ ] Database credentials are secure and not in version control
- [ ] Test connection string works locally: `npm run seed` (if applicable)

## 🚀 Local Testing

- [ ] Backend starts successfully: `npm run start` (or `npm run dev`)
- [ ] Frontend builds successfully: `npm run build`
- [ ] Frontend can be served: `npm start` (or preview the dist/)
- [ ] API endpoints respond correctly
- [ ] Frontend can communicate with backend
- [ ] No console errors or warnings (critical ones)
- [ ] Application functions as expected

## 📦 Git & Version Control

- [ ] `.gitignore` excludes `node_modules/`, `dist/`, `.env`, etc.
- [ ] All necessary files are committed (package.json, railway.json, etc.)
- [ ] No sensitive data in git history
- [ ] Repository is pushed to GitHub/GitLab
- [ ] Deployment branch (usually `main` or `master`) is up-to-date

## 🎯 Deployment Readiness

- [ ] All docker/container files are in place (if needed)
- [ ] `nixpacks.toml` or `railway.json` specifies build process correctly
- [ ] Health check endpoint is configured
- [ ] Restart policy is configured
- [ ] Port configuration is correct
- [ ] No hardcoded localhost URLs (use env variables instead)

## ✅ Final Checks

- [ ] Run `node validate-railway.js` - all checks pass
- [ ] Have you tested the build process locally?
- [ ] Is your Railway account and CLI set up?
- [ ] Do you have a MongoDB instance ready?
- [ ] All team members are aware of deployment?

## 🚀 Deployment Steps

1. [ ] Create Railway project
2. [ ] Add backend service (connect GitHub repo, select `/backend` root)
3. [ ] Configure backend environment variables
4. [ ] Add MongoDB plugin (if using Railway's MongoDB)
5. [ ] Deploy backend
6. [ ] Verify backend health: `curl https://your-backend.railway.app/health`
7. [ ] Add frontend service (connect GitHub repo, select `/frontend` root)
8. [ ] Configure frontend environment variables (VITE_API_URL)
9. [ ] Deploy frontend
10. [ ] Verify frontend loads and can reach backend API
11. [ ] Test all main features in production

## 📚 Documentation

- [ ] RAILWAY_DEPLOYMENT.md covers all deployment steps
- [ ] README.md has quick start instructions
- [ ] API documentation is available (if needed)
- [ ] Environment variables are documented
- [ ] Common issues and solutions are documented

---

**Once everything is checked**, you're ready to deploy! 🎉

For troubleshooting, refer to `RAILWAY_DEPLOYMENT.md` and Railway's documentation at https://docs.railway.app/
