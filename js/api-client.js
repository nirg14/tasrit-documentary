/**
 * API Client - Communicates with serverless function for AI chat
 * Handles rate limiting, error handling, and response parsing
 */

class APIClient {
    constructor() {
        this.baseURL = '/.netlify/functions'; // Netlify functions endpoint
        this.rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Send chat message to AI
     */
    async chat(messages, context) {
        // Check rate limit
        if (!this.rateLimiter.allow()) {
            throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
        }

        // Validate input
        if (!messages || !Array.isArray(messages)) {
            throw new Error('Messages must be an array');
        }

        if (!context) {
            throw new Error('Context is required');
        }

        // Prepare request
        const requestData = {
            messages: messages,
            context: context
        };

        // Send request with retry logic
        return await this.sendWithRetry(requestData);
    }

    /**
     * Send request with retry logic
     */
    async sendWithRetry(data, attempt = 1) {
        try {
            const response = await fetch(`${this.baseURL}/chat-proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            // Retry on network errors
            if (attempt < this.retryAttempts && this.isRetryableError(error)) {
                console.warn(`Request failed (attempt ${attempt}/${this.retryAttempts}), retrying...`, error);
                await this.sleep(this.retryDelay * attempt);
                return await this.sendWithRetry(data, attempt + 1);
            }

            // Give up after retries
            throw this.formatError(error);
        }
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        const retryableErrors = [
            'NetworkError',
            'Failed to fetch',
            'Network request failed',
            'timeout'
        ];

        const message = error.message.toLowerCase();
        return retryableErrors.some(err => message.includes(err.toLowerCase()));
    }

    /**
     * Format error for display
     */
    formatError(error) {
        if (error.message.includes('Rate limit')) {
            return new Error('You\'re sending messages too quickly. Please wait a moment.');
        }

        if (error.message.includes('401') || error.message.includes('403')) {
            return new Error('Authentication error. Please check your API configuration.');
        }

        if (error.message.includes('429')) {
            return new Error('Too many requests. Please try again later.');
        }

        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            return new Error('Server error. Please try again in a moment.');
        }

        return error;
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Rate Limiter - Prevents too many API calls
 */
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    /**
     * Check if request is allowed
     */
    allow() {
        const now = Date.now();

        // Remove old requests outside window
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        // Check if under limit
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }

        return false;
    }

    /**
     * Get time until next request allowed (in ms)
     */
    getTimeUntilNextRequest() {
        if (this.requests.length === 0) {
            return 0;
        }

        const now = Date.now();
        const oldestRequest = Math.min(...this.requests);
        const timeUntilReset = this.windowMs - (now - oldestRequest);

        return Math.max(0, timeUntilReset);
    }

    /**
     * Get remaining requests in current window
     */
    getRemainingRequests() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return this.maxRequests - this.requests.length;
    }
}

// Export for use in other modules
window.APIClient = APIClient;
window.RateLimiter = RateLimiter;
