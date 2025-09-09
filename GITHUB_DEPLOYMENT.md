# GitHub Pages Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `habit-toolbox-website`
5. Description: `Modern Habit Toolbox Website with AI-powered recommendations and interactive toolboxes`
6. Set to **Public**
7. **Do NOT** initialize with README, .gitignore, or license (we already have files)
8. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

Run these commands in the website directory:

```bash
cd /Users/marcbaumholz/Desktop/habit/website
git remote add origin https://github.com/YOUR_USERNAME/habit-toolbox-website.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

## Step 4: Configure GitHub Actions (Optional but Recommended)

The repository already includes a GitHub Actions workflow file (`.github/workflows/deploy.yml`) that will automatically deploy your site when you push changes.

## Step 5: Access Your Website

After deployment (usually takes 1-2 minutes), your website will be available at:
`https://YOUR_USERNAME.github.io/habit-toolbox-website`

## Features Included

✅ **Modern Dark Design** - Professional UI with dark theme
✅ **AI Problem Analysis** - Enhanced keyword-based analysis with confidence scoring
✅ **Interactive Toolboxes** - Detailed modals with tools, instructions, and resources
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **GitHub Pages Ready** - Automated deployment workflow
✅ **Notion Template Integration** - Download links and community features

## Manual Deployment Commands

If you prefer to deploy manually:

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Update website with new features"

# Push to GitHub
git push origin main
```

## Troubleshooting

- If the site doesn't appear immediately, wait 2-3 minutes and refresh
- Check the "Actions" tab in your GitHub repository for deployment status
- Ensure all files are committed and pushed to the main branch
- Verify the repository is set to public for free GitHub Pages hosting
