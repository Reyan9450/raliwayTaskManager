#!/bin/bash

# Quick Railway Deployment Setup Script
# Usage: bash railway-setup.sh

set -e

echo "🚀 Railway Deployment Setup Script"
echo "===================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI is installed"
echo ""

# Validate configuration
echo "🔍 Validating deployment configuration..."
if command -v node &> /dev/null; then
    node validate-railway.js
else
    echo "⚠️  Node.js not found. Skipping validation."
fi

echo ""
echo "📋 Next Steps:"
echo "1. Login to Railway:"
echo "   railway login"
echo ""
echo "2. Navigate to backend:"
echo "   cd backend"
echo ""
echo "3. Initialize Railway project:"
echo "   railway init"
echo ""
echo "4. Deploy backend:"
echo "   railway up"
echo ""
echo "5. Set environment variables in Railway Dashboard:"
echo "   - MONGO_URI (or use Railway's MongoDB plugin)"
echo "   - JWT_SECRET"
echo "   - CORS_ORIGIN"
echo ""
echo "6. Repeat for frontend:"
echo "   cd ../frontend"
echo "   railway init"
echo "   Set VITE_API_URL variable"
echo "   railway up"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions"
