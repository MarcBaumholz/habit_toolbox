#!/bin/bash

# Habit Toolbox Website - GitHub Pages Deployment Script
# This script helps you deploy the website to GitHub Pages

echo "🚀 Habit Toolbox Website - GitHub Pages Deployment"
echo "=================================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this script from the website directory."
    exit 1
fi

echo "📋 Step 1: Create GitHub Repository"
echo "-----------------------------------"
echo "1. Go to https://github.com/new"
echo "2. Repository name: habit-toolbox-website"
echo "3. Description: Modern Habit Toolbox Website with AI-powered recommendations"
echo "4. Choose 'Public'"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""

read -p "Press Enter when you've created the repository..."

echo ""
echo "📤 Step 2: Push to GitHub"
echo "-------------------------"

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

# Add remote origin
echo "Adding remote origin..."
git remote add origin https://github.com/$GITHUB_USERNAME/habit-toolbox-website.git

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Step 3: Enable GitHub Pages"
    echo "------------------------------"
    echo "1. Go to https://github.com/$GITHUB_USERNAME/habit-toolbox-website/settings/pages"
    echo "2. Under 'Source', select 'Deploy from a branch'"
    echo "3. Branch: main"
    echo "4. Folder: / (root)"
    echo "5. Click 'Save'"
    echo ""
    echo "🎉 Your website will be available at:"
    echo "https://$GITHUB_USERNAME.github.io/habit-toolbox-website"
    echo ""
    echo "⏱️  It may take a few minutes for the site to be live."
else
    echo "❌ Error: Failed to push to GitHub. Please check your credentials and try again."
    exit 1
fi
