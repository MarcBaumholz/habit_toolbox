#!/bin/bash

# Habit Toolbox Website Deployment Script

echo "🚀 Deploying Habit Toolbox Website to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the website directory"
    exit 1
fi

# Add all changes
echo "📝 Adding changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy website updates - $(date)"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🌍 Your website will be available at: https://YOUR_USERNAME.github.io/habit-toolbox-website"
echo "⏱️  Please wait 1-2 minutes for GitHub Pages to update"

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "🔗 Opening repository in browser..."
    gh repo view --web
else
    echo "💡 Tip: Install GitHub CLI (gh) for easier repository management"
fi
