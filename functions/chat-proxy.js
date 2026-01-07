/**
 * Netlify Serverless Function - Chat Proxy
 * Securely proxies requests to Claude API
 * Handles rate limiting, validation, and error handling
 */

const Anthropic = require('@anthropic-ai/sdk');

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

// Configuration
const CONFIG = {
    maxRequestsPerHour: 50,
    maxRequestsPerMinute: 10,
    maxMessageLength: 2000,
    maxMessagesPerRequest: 50,
    claudeModel: 'claude-3-5-sonnet-20241022',
    maxTokens: 2000
};

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Get client IP
        const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

        // Check rate limit
        const rateLimitResult = checkRateLimit(clientIP);
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                body: JSON.stringify({
                    error: 'Too Many Requests',
                    message: rateLimitResult.message
                })
            };
        }

        // Validate request origin (optional but recommended)
        const origin = event.headers['origin'] || event.headers['referer'];
        if (!isAllowedOrigin(origin)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Forbidden - Invalid origin' })
            };
        }

        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        // Validate request data
        const validation = validateRequest(requestData);
        if (!validation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: validation.error })
            };
        }

        // Check API key
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('ANTHROPIC_API_KEY not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Initialize Claude client
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        // Build system prompt with context
        const systemPrompt = buildSystemPrompt(requestData.context);

        // Call Claude API
        const response = await anthropic.messages.create({
            model: CONFIG.claudeModel,
            max_tokens: CONFIG.maxTokens,
            system: systemPrompt,
            messages: requestData.messages
        });

        // Record successful request
        recordRequest(clientIP);

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Adjust for production
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Error processing request:', error);

        // Handle specific errors
        if (error.status === 401) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Invalid API key configuration' })
            };
        }

        if (error.status === 429) {
            return {
                statusCode: 429,
                body: JSON.stringify({ error: 'API rate limit exceeded. Please try again later.' })
            };
        }

        // Generic error
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context) {
    return `You are an expert Midjourney prompt writer specializing in Holocaust documentary animation. You help refine prompts for 2D animated historical illustrations.

GLOBAL STYLE GUIDE:
${context.styleGuide || 'Style guide not available'}

PROJECT OVERVIEW:
${context.projectOverview || 'Holocaust survivor testimony documentary, 1940-1947'}

DOCUMENTARY CONTEXT:
This is a 48-segment animated documentary about a Holocaust survivor's journey from Romania through post-war Europe (1940-1947). The visual style is 2D animated historical illustration with heavily desaturated sepia tones, chiaroscuro lighting, and a moving painting aesthetic.

CURRENT SERTON (SEGMENT) CONTEXT:
- Serton ${context.serton.number}: ${context.serton.title}
- Setting: ${context.serton.setting}
- Emotional Tone: ${context.serton.emotionalTone}
- Scene Overview: ${context.serton.sceneOverview}
- Emotional Arc: ${context.serton.emotionalArc}
- Total Shots in Serton: ${context.serton.totalShots}

CURRENT SHOT CONTEXT:
- Shot ${context.shot.number}: ${context.shot.title}
- Description: ${context.shot.description}
- Setting: ${context.shot.setting}
- Action: ${context.shot.action}
- Emotion: ${context.shot.emotion}

CURRENT PROMPT:
Type: ${context.prompt.type === 'image' ? 'Image (static)' : 'Video (animation)'}
Current Prompt: "${context.prompt.current}"

YOUR TASK:
Help the user refine this ${context.prompt.type} prompt based on their instructions. Always:
1. Maintain the required style elements (sepia tones, chiaroscuro, moving painting aesthetic)
2. Keep the emotional tone appropriate to the scene
3. Ensure historical accuracy and sensitivity
4. Make prompts concise but cinematic
5. When providing a refined prompt, wrap it in triple backticks (markdown code block)

RESPONSE FORMAT:
When you provide a refined prompt, structure your response like this:
1. Brief explanation of changes made (1-2 sentences)
2. The refined prompt in a code block (triple backticks)

Example:
"I've made the scene darker and more claustrophobic by adjusting the lighting and adding constrained framing.

\`\`\`
[Your refined Midjourney prompt here]
\`\`\`"

Remember: Be concise, maintain historical sensitivity, and preserve the documentary's visual style.`;
}

/**
 * Validate request data
 */
function validateRequest(data) {
    if (!data.messages || !Array.isArray(data.messages)) {
        return { valid: false, error: 'Messages must be an array' };
    }

    if (data.messages.length === 0) {
        return { valid: false, error: 'Messages array cannot be empty' };
    }

    if (data.messages.length > CONFIG.maxMessagesPerRequest) {
        return { valid: false, error: `Too many messages (max ${CONFIG.maxMessagesPerRequest})` };
    }

    // Validate each message
    for (const msg of data.messages) {
        if (!msg.role || !msg.content) {
            return { valid: false, error: 'Each message must have role and content' };
        }

        if (msg.role !== 'user' && msg.role !== 'assistant') {
            return { valid: false, error: 'Message role must be user or assistant' };
        }

        if (typeof msg.content !== 'string') {
            return { valid: false, error: 'Message content must be a string' };
        }

        if (msg.content.length > CONFIG.maxMessageLength) {
            return { valid: false, error: `Message too long (max ${CONFIG.maxMessageLength} characters)` };
        }
    }

    if (!data.context) {
        return { valid: false, error: 'Context is required' };
    }

    return { valid: true };
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip) {
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, {
            requests: [],
            firstRequest: now
        });
    }

    const ipData = rateLimitStore.get(ip);

    // Clean up old requests (older than 1 hour)
    ipData.requests = ipData.requests.filter(timestamp => now - timestamp < 3600000);

    // Check hourly limit
    if (ipData.requests.length >= CONFIG.maxRequestsPerHour) {
        return {
            allowed: false,
            message: 'Hourly rate limit exceeded. Please try again later.'
        };
    }

    // Check per-minute limit
    const recentRequests = ipData.requests.filter(timestamp => now - timestamp < 60000);
    if (recentRequests.length >= CONFIG.maxRequestsPerMinute) {
        return {
            allowed: false,
            message: 'You are sending requests too quickly. Please wait a moment.'
        };
    }

    return { allowed: true };
}

/**
 * Record successful request
 */
function recordRequest(ip) {
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, {
            requests: [],
            firstRequest: now
        });
    }

    const ipData = rateLimitStore.get(ip);
    ipData.requests.push(now);
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin) {
    // In development, allow all origins
    if (!origin) {
        return true; // Allow requests without origin (e.g., curl, local testing)
    }

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }

    // Allow Netlify domains
    if (origin.includes('.netlify.app')) {
        return true;
    }

    // Add your production domain here
    // if (origin.includes('yourdomain.com')) {
    //     return true;
    // }

    // For now, allow all origins (adjust for production)
    return true;
}
