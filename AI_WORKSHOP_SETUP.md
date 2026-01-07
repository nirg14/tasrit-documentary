# AI Prompt Workshop - Setup Guide

This guide explains how to set up and use the AI-powered prompt workshop feature for the Tasrit Documentary Project.

## Overview

The AI Prompt Workshop allows you to iteratively refine Midjourney prompts through a conversational AI interface. Each shot's prompts can be workshopped individually, with the AI understanding the full context of your documentary, scene, and specific shot.

## Features

- **Context-Aware AI**: Knows the full story, scene details, and shot specifics
- **Iterative Refinement**: Chat-based interface for multiple rounds of refinement
- **Per-Shot History**: Each shot maintains its own conversation history
- **Visual Integration**: Seamlessly integrated into existing shot detail pages
- **Prompt Comparison**: View original vs. refined prompts side-by-side
- **Export Options**: Copy refined prompts to clipboard or revert to original

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Anthropic Claude API Key** - Get one from [console.anthropic.com](https://console.anthropic.com/)
3. **Netlify Account** (free tier works fine) - Sign up at [netlify.com](https://www.netlify.com/)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs the Anthropic SDK needed for the serverless function.

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

**Important**: Never commit your `.env` file to git! It's already in `.gitignore`.

### 3. Test Locally (Optional)

Install Netlify CLI globally (if not already installed):

```bash
npm install -g netlify-cli
```

Run local development server:

```bash
netlify dev
```

This starts a local server at `http://localhost:8888` with working serverless functions.

Open any SHOTS.html page (e.g., `Serton_23/SHOTS.html`) and test the "⚡ Workshop with AI" buttons.

### 4. Deploy to Netlify

#### Option A: Netlify UI (Recommended for first-time deployment)

1. Push your code to GitHub (if not already done)
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (root)
   - **Functions directory**: `functions` (should auto-detect)
6. Click "Deploy site"
7. After deployment, go to "Site configuration" → "Environment variables"
8. Add `ANTHROPIC_API_KEY` with your API key value
9. Trigger a new deployment to apply the environment variable

#### Option B: Netlify CLI

```bash
# Login to Netlify
netlify login

# Initialize site (first time only)
netlify init

# Deploy
netlify deploy --prod
```

When prompted for environment variables, add `ANTHROPIC_API_KEY`.

## Usage

### Opening the Workshop

1. Navigate to any shot detail page (e.g., `Serton_23/SHOTS.html`)
2. Find the prompt you want to refine (Image or Video)
3. Click the "⚡ Workshop with AI" button next to the prompt
4. A chat panel will slide in from the bottom-right

### Refining Prompts

1. Type your refinement instructions in natural language:
   - "Make it darker and more claustrophobic"
   - "Add more emphasis on the fear and uncertainty"
   - "Change camera angle to bird's eye view"
   - "Increase the contrast and add more shadows"

2. Press Send or Enter

3. The AI will respond with:
   - Explanation of changes made
   - The refined prompt in a highlighted box

4. Review the refined prompt and either:
   - **Apply to Page**: Updates the displayed prompt (visual only, doesn't save to file)
   - **Copy**: Copies refined prompt to clipboard
   - **Continue**: Keep chatting to further refine

### Applying Refined Prompts

When you apply a refined prompt:
- The prompt box gets a gold border and "✨ Refined" badge
- A "Revert to Original" button appears
- The change is saved to localStorage (persists across page refreshes)
- The refined prompt is NOT saved to the HTML file

### Saving Refined Prompts

To permanently save refined prompts to your project:

1. Copy the refined prompt (click "Copy" button)
2. Manually paste into the HTML file using your code editor
3. Commit changes to git

**Future Enhancement**: Automated PR creation is planned but not yet implemented.

## Chat History

- Each shot maintains its own conversation history
- History is saved in browser localStorage
- Reopen the chat to continue a previous conversation
- Click "Clear & Start Fresh" to reset the conversation

## Rate Limits

To prevent excessive API costs:

**Client-side:**
- 10 messages per minute per shot

**Server-side:**
- 50 requests per hour per IP address

If you hit a rate limit, wait a moment before sending more messages.

## Cost Estimate

Based on Claude 3.5 Sonnet pricing (~$0.08 per session):

- **Light usage** (10 sessions/month): ~$0.80/month
- **Medium usage** (50 sessions/month): ~$4/month
- **Heavy usage** (200 sessions/month): ~$16/month

Netlify's free tier covers function invocations (125k/month).

## Troubleshooting

### "Failed to initialize AI Prompt Workshop"

**Cause**: Global context (style guide) couldn't be loaded.

**Fix**: Ensure `MIDJOURNEY_STYLE_GUIDE.md` exists in the project root.

### "Failed to open chat: Context not found"

**Cause**: Missing serton context JSON in page head.

**Fix**: Check that `<script type="application/json" id="serton-context">` exists in the HTML file's `<head>`.

### "Authentication error"

**Cause**: Invalid or missing API key.

**Fix**:
1. Verify API key in Netlify environment variables
2. Check that key starts with `sk-ant-`
3. Redeploy site after updating environment variables

### "Too many requests"

**Cause**: Hit rate limit.

**Fix**: Wait 1-2 minutes before sending more messages.

### Chat button does nothing

**Cause**: JavaScript not loading or errors in console.

**Fix**:
1. Open browser dev tools (F12)
2. Check Console for errors
3. Verify all script files are loading:
   - `js/context-loader.js`
   - `js/api-client.js`
   - `js/chat-ui.js`
   - `js/chat-manager.js`
   - `js/init-workshop.js`

### Refined prompts not saving

**Note**: This is expected behavior! Refined prompts update the display only.

**To save permanently**: Copy the prompt and manually update the HTML file.

## File Structure

```
Tasrit_Documentary_Project/
├── js/
│   ├── context-loader.js      # Loads global, serton, and shot context
│   ├── api-client.js           # Handles API calls with retry logic
│   ├── chat-ui.js              # Renders chat interface
│   ├── chat-manager.js         # Orchestrates conversation flow
│   └── init-workshop.js        # Initializes buttons on page load
├── css/
│   └── chat-workshop.css       # Chat panel styling
├── functions/
│   └── chat-proxy.js           # Serverless function (Claude API proxy)
├── netlify.toml                # Netlify configuration
├── package.json                # Node.js dependencies
├── .env.example                # Environment variable template
└── Serton_XX/SHOTS.html        # Shot detail pages (updated)
```

## Updating Other Sertons

Serton 23 is fully set up as a template. To add AI workshop to other sertons:

1. **Add chat CSS link** in `<head>`:
   ```html
   <link rel="stylesheet" href="../css/chat-workshop.css">
   ```

2. **Add serton context JSON** in `<head>`:
   ```html
   <script type="application/json" id="serton-context">
   {
     "sertonNumber": 24,
     "sertonTitle": "Your Title",
     "setting": "Setting description",
     "emotionalTone": "Emotional tone",
     "sceneOverview": "Scene overview",
     "emotionalArc": "Emotional arc description",
     "totalShots": 5
   }
   </script>
   ```

3. **Add data attributes** to each `<article class="shot">`:
   ```html
   <article class="shot"
            data-shot-number="1"
            data-shot-title="Shot Title"
            data-shot-description="Description"
            data-shot-setting="Setting"
            data-shot-action="Action"
            data-shot-emotion="Emotion">
   ```

4. **Add data attributes and buttons** to each `.prompt-box`:
   ```html
   <div class="prompt-box image-prompt"
        data-prompt-type="image"
        data-shot-id="shot-24-1-image">
     <p class="prompt-text">Your prompt here</p>
     <button class="ai-workshop-btn" data-target="shot-24-1-image">
       ⚡ Workshop with AI
     </button>
   </div>
   ```

5. **Add script includes** before `</body>`:
   ```html
   <script src="../js/context-loader.js"></script>
   <script src="../js/api-client.js"></script>
   <script src="../js/chat-ui.js"></script>
   <script src="../js/chat-manager.js"></script>
   <script src="../js/init-workshop.js"></script>
   ```

## Security Notes

- API key is stored securely in Netlify environment variables (server-side only)
- Never exposed to client-side code
- All API calls proxied through serverless function
- Rate limiting prevents abuse
- Input sanitization prevents injection attacks

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review browser console for errors
3. Check Netlify function logs for server-side errors
4. Refer to the implementation plan: `/Users/nirgottlieb/.claude/plans/snazzy-singing-candy.md`

## Future Enhancements

Planned features (not yet implemented):
- Batch refinement of multiple prompts
- Style presets for quick adjustments
- Prompt library (save and reuse favorite prompts)
- GitHub API integration (auto-create PRs with refined prompts)
- Image preview generation (when Midjourney API available)
- Team collaboration (shared chat sessions)

---

*Generated with Claude Code for the Tasrit Documentary Project*
