/**
 * Chat Manager - Core orchestration for AI chat workshop
 * Manages conversation flow, history, API calls, and prompt updates
 */

class ChatManager {
    constructor(shotId, context, promptBoxElement) {
        this.shotId = shotId;
        this.context = context;
        this.promptBoxElement = promptBoxElement;

        this.history = this.loadHistory();
        this.apiClient = new APIClient();
        this.ui = new ChatUI(
            context,
            (message) => this.sendMessage(message),
            (prompt) => this.applyPrompt(prompt)
        );

        this.originalPrompt = context.currentPrompt;
    }

    /**
     * Initialize and show chat
     */
    async initialize() {
        // Render UI
        this.ui.render();

        // Load existing messages from history
        if (this.history.messages.length > 0) {
            this.ui.showHistoryNotice(() => this.clearHistory());
            this.loadMessagesIntoUI();
        } else {
            // Send initial greeting
            this.addAssistantMessage(this.getGreetingMessage());
        }

        // Show chat panel
        this.ui.show();
    }

    /**
     * Get initial greeting message
     */
    getGreetingMessage() {
        const promptType = this.context.promptType === 'image' ? 'image' : 'video';
        return `How can I help refine this ${promptType} prompt? You can ask me to make it darker, more emotional, add specific details, change the camera angle, or any other adjustments you'd like.`;
    }

    /**
     * Send user message
     */
    async sendMessage(userMessage) {
        // Add user message to UI
        this.ui.addUserMessage(userMessage);

        // Add to history
        this.addToHistory('user', userMessage);

        // Show loading
        this.ui.showLoading();

        try {
            // Prepare messages for API
            const messages = this.prepareMessagesForAPI();

            // Format context for AI
            const contextLoader = new ContextLoader();
            const formattedContext = contextLoader.formatContextForAI(this.context);

            // Call API
            const response = await this.apiClient.chat(messages, formattedContext);

            // Parse response
            const { message, refinedPrompt } = this.parseAIResponse(response);

            // Hide loading
            this.ui.hideLoading();

            // Add assistant message to UI
            this.ui.addAssistantMessage(message, refinedPrompt);

            // Add to history
            this.addToHistory('assistant', message, refinedPrompt);

            // Save history
            this.saveHistory();

        } catch (error) {
            console.error('Error sending message:', error);

            // Hide loading
            this.ui.hideLoading();

            // Show error
            this.ui.showError(error.message);
        }
    }

    /**
     * Prepare messages for API call
     */
    prepareMessagesForAPI() {
        return this.history.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Parse AI response to extract message and refined prompt
     */
    parseAIResponse(response) {
        // Claude API response structure
        const content = response.content[0].text;

        // Try to extract refined prompt from code block
        const codeBlockMatch = content.match(/```(?:midjourney)?\s*\n([\s\S]*?)\n```/);

        if (codeBlockMatch) {
            // Found code block - treat as refined prompt
            const refinedPrompt = codeBlockMatch[1].trim();
            const message = content.replace(/```(?:midjourney)?\s*\n[\s\S]*?\n```/, '').trim();

            return {
                message: message || 'Here\'s the refined prompt:',
                refinedPrompt: refinedPrompt
            };
        }

        // No code block - check if entire response looks like a prompt
        // (long single paragraph without much explanation)
        const lines = content.trim().split('\n');
        if (lines.length === 1 && content.length > 100) {
            return {
                message: 'Here\'s the refined prompt:',
                refinedPrompt: content.trim()
            };
        }

        // Just explanation, no refined prompt
        return {
            message: content,
            refinedPrompt: null
        };
    }

    /**
     * Apply refined prompt to page
     */
    applyPrompt(refinedPrompt) {
        const promptTextElement = this.promptBoxElement.querySelector('.prompt-text');

        if (!promptTextElement) {
            console.error('Prompt text element not found');
            return;
        }

        // Update text
        promptTextElement.textContent = refinedPrompt;

        // Add refined styling
        this.promptBoxElement.classList.add('prompt-refined');

        // Add revert button if it doesn't exist
        this.addRevertButton();

        // Update history with applied prompt
        this.history.currentPrompt = refinedPrompt;
        this.saveHistory();

        // Show success message
        this.ui.showTemporaryMessage('Prompt applied to page!', 2000);
    }

    /**
     * Add revert button to prompt box
     */
    addRevertButton() {
        // Check if revert button already exists
        if (this.promptBoxElement.querySelector('.revert-btn')) {
            return;
        }

        const revertBtn = document.createElement('button');
        revertBtn.className = 'revert-btn';
        revertBtn.textContent = 'Revert to Original';
        revertBtn.addEventListener('click', () => this.revertPrompt());

        this.promptBoxElement.appendChild(revertBtn);
    }

    /**
     * Revert prompt to original
     */
    revertPrompt() {
        const promptTextElement = this.promptBoxElement.querySelector('.prompt-text');

        if (!promptTextElement) {
            return;
        }

        // Restore original text
        promptTextElement.textContent = this.originalPrompt;

        // Remove refined styling
        this.promptBoxElement.classList.remove('prompt-refined');

        // Remove revert button
        const revertBtn = this.promptBoxElement.querySelector('.revert-btn');
        if (revertBtn) {
            revertBtn.remove();
        }

        // Update history
        this.history.currentPrompt = this.originalPrompt;
        this.saveHistory();

        // Show message
        this.ui.showTemporaryMessage('Reverted to original prompt', 2000);
    }

    /**
     * Add message to history
     */
    addToHistory(role, content, refinedPrompt = null) {
        const message = {
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        };

        if (refinedPrompt) {
            message.refinedPrompt = refinedPrompt;
        }

        this.history.messages.push(message);

        // Limit history to 50 messages (25 exchanges)
        if (this.history.messages.length > 50) {
            this.history.messages = this.history.messages.slice(-50);
        }

        this.history.updatedAt = new Date().toISOString();
    }

    /**
     * Add assistant message without API call
     */
    addAssistantMessage(text, refinedPrompt = null) {
        this.addToHistory('assistant', text, refinedPrompt);
        this.saveHistory();
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        const key = this.getStorageKey();

        try {
            const stored = localStorage.getItem(key);

            if (stored) {
                const history = JSON.parse(stored);

                // Validate history structure
                if (history.shotId === this.shotId && Array.isArray(history.messages)) {
                    return history;
                }
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }

        // Return new history if loading failed
        return this.createNewHistory();
    }

    /**
     * Create new history object
     */
    createNewHistory() {
        return {
            shotId: this.shotId,
            sertonNumber: this.context.serton.sertonNumber,
            shotNumber: this.context.shot.shotNumber,
            promptType: this.context.promptType,
            originalPrompt: this.originalPrompt,
            currentPrompt: this.context.currentPrompt,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        const key = this.getStorageKey();

        try {
            localStorage.setItem(key, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldHistory();

                // Try again
                try {
                    localStorage.setItem(key, JSON.stringify(this.history));
                } catch (retryError) {
                    console.error('Failed to save history after cleanup:', retryError);
                }
            }
        }
    }

    /**
     * Get localStorage key for this chat
     */
    getStorageKey() {
        return `chat_history_${this.shotId}`;
    }

    /**
     * Clear current chat history
     */
    clearHistory() {
        this.history = this.createNewHistory();
        this.saveHistory();

        // Clear UI
        this.ui.clearMessages();

        // Send new greeting
        this.addAssistantMessage(this.getGreetingMessage());
        this.ui.addAssistantMessage(this.getGreetingMessage());
    }

    /**
     * Cleanup old history entries to free space
     */
    cleanupOldHistory() {
        const allKeys = Object.keys(localStorage);
        const historyKeys = allKeys.filter(key => key.startsWith('chat_history_'));

        // Sort by age (extract timestamp from stored data)
        const keysByAge = historyKeys.map(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return {
                    key: key,
                    timestamp: new Date(data.updatedAt || data.createdAt).getTime()
                };
            } catch {
                return { key: key, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 10 entries
        const toRemove = keysByAge.slice(0, 10);
        toRemove.forEach(item => {
            localStorage.removeItem(item.key);
        });
    }

    /**
     * Load existing messages into UI
     */
    loadMessagesIntoUI() {
        this.history.messages.forEach(msg => {
            if (msg.role === 'user') {
                this.ui.addUserMessage(msg.content);
            } else if (msg.role === 'assistant') {
                this.ui.addAssistantMessage(msg.content, msg.refinedPrompt || null);
            }
        });
    }

    /**
     * Destroy chat manager and cleanup
     */
    destroy() {
        if (this.ui) {
            this.ui.destroy();
        }
    }
}

// Export for use in other modules
window.ChatManager = ChatManager;
