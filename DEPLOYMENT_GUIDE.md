# GitHub Pages Deployment Guide

## Overview

This guide will help you deploy the Tasrit Documentary Project website to GitHub Pages, making it accessible via a public URL.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Basic familiarity with terminal/command line

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `tasrit-documentary`)
4. Choose "Public" visibility (required for free GitHub Pages)
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Initialize Git Repository Locally

Open Terminal and navigate to your project directory:

```bash
cd "/Users/nirgottlieb/cc test project/Tasrit_Documentary_Project"
```

Initialize git if not already done:

```bash
git init
```

## Step 3: Add Your Files

Add all files to git:

```bash
git add .
```

Create your first commit:

```bash
git commit -m "Initial commit: Tasrit Documentary Project website"
```

## Step 4: Connect to GitHub

Link your local repository to GitHub (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR-USERNAME/tasrit-documentary.git
git branch -M main
git push -u origin main
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (in the repository menu)
3. Scroll down and click "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select "main" and "/ (root)"
6. Click "Save"

## Step 6: Wait for Deployment

GitHub Pages will automatically build and deploy your site. This usually takes 1-3 minutes.

You can check the deployment status:
1. Go to the "Actions" tab in your repository
2. You should see a workflow running or completed

## Step 7: Access Your Website

Your website will be available at:

```
https://YOUR-USERNAME.github.io/tasrit-documentary/
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Project Structure

The website includes:

- **index.html** - Main landing page with project overview
- **styles.css** - Main stylesheet for homepage
- **shot-detail.css** - Stylesheet for individual Serton pages
- **Serton_18-22/SHOTS.html** - Detailed shot breakdown pages
- **_config.yml** - GitHub Pages configuration
- **.nojekyll** - Ensures proper file serving

## Updating the Website

When you make changes to your website:

```bash
# Make your changes, then:
git add .
git commit -m "Description of your changes"
git push origin main
```

GitHub Pages will automatically redeploy your site with the new changes.

## Customization Options

### Update Site Title and Description

Edit `_config.yml` to change:
- `title`: Your site's title
- `description`: Your site's description
- `author`: Your name

### Customize Colors

Edit `styles.css` or `shot-detail.css` to change the color scheme. The current palette uses sepia tones that match the documentary's visual style.

### Add More Sertons

To add more detailed Sertons (23-48):

1. Create a `SHOTS.html` file in the appropriate Serton folder
2. Use `Serton_18/SHOTS.html` as a template
3. Update the content with the specific shot details
4. Update `index.html` to link to the new pages

## Troubleshooting

### Site Not Loading

- Check that GitHub Pages is enabled in Settings > Pages
- Verify the branch is set to "main" and folder to "/ (root)"
- Wait a few minutes for deployment to complete

### Styles Not Applying

- Ensure all CSS files are in the root directory
- Check that file paths in HTML are correct (relative paths)
- Clear your browser cache

### Links Not Working

- All links should use relative paths (e.g., `../index.html`)
- Ensure file names match exactly (case-sensitive)

## Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain name from a registrar
2. In your repository Settings > Pages, enter your custom domain
3. Configure DNS settings at your domain registrar:
   - Add a CNAME record pointing to `YOUR-USERNAME.github.io`
4. Wait for DNS propagation (can take up to 48 hours)

## Support

For issues with:
- **GitHub Pages**: See [GitHub Pages documentation](https://docs.github.com/en/pages)
- **Git**: See [Git documentation](https://git-scm.com/doc)
- **Project Content**: Contact the project maintainer

## Next Steps

After deployment, you can:

1. Share the URL with collaborators and stakeholders
2. Continue detailing Sertons 23-48
3. Add additional features like:
   - Search functionality
   - Gallery of generated images
   - Video player integration
   - Download buttons for prompts

---

**Last Updated**: 2026-01-07
