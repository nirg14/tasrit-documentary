/**
 * Chat UI - Renders and manages the chat interface
 * Handles message display, input, and user interactions
 */

class ChatUI {
    constructor(context, onSendMessage, onApplyPrompt) {
        this.context = context;
        this.onSendMessage = onSendMessage;
        this.onApplyPrompt = onApplyPrompt;

        this.chatPanel = null;
        this.messagesContainer = null;
        this.inputTextarea = null;
        this.sendButton = null;

        this.isOpen = false;
    }

    /**
     * Create and render chat panel
     */
    render() {
        // Create panel if it doesn't exist
        if (!this.chatPanel) {
            this.chatPanel = this.createChatPanel();
            document.body.appendChild(this.chatPanel);
        }

        // Get references to elements
        this.messagesContainer = this.chatPanel.querySelector('.chat-messages');
        this.inputTextarea = this.chatPanel.querySelector('.chat-input-area textarea');
        this.sendButton = this.chatPanel.querySelector('.chat-send');

        // Attach event listeners
        this.attachEventListeners();

        return this.chatPanel;
    }

    /**
     * Create chat panel HTML structure
     */
    createChatPanel() {
        const panel = document.createElement('div');
        panel.className = 'chat-panel';
        panel.innerHTML = `
            <div class="chat-header">
                <h3>💬 Prompt Workshop</h3>
                <button class="chat-close" aria-label="Close chat">&times;</button>
            </div>
            <div class="chat-context-summary">
                ${this.getContextSummary()}
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input-area">
                <textarea
                    placeholder="Describe how to refine this prompt..."
                    aria-label="Message input"
                    rows="2"></textarea>
                <button class="chat-send">Send</button>
            </div>
        `;
        return panel;
    }

    /**
     * Get context summary text
     */
    getContextSummary() {
        const loader = new ContextLoader();
        return loader.getContextSummary(this.context);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        const closeBtn = this.chatPanel.querySelector('.chat-close');
        closeBtn.addEventListener('click', () => this.close());

        // Send button
        this.sendButton.addEventListener('click', () => this.handleSend());

        // Enter key in textarea (Shift+Enter for new line)
        this.inputTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Auto-resize textarea
        this.inputTextarea.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }

    /**
     * Handle send button click
     */
    handleSend() {
        const message = this.inputTextarea.value.trim();

        if (!message) {
            return;
        }

        // Clear input
        this.inputTextarea.value = '';
        this.autoResizeTextarea();

        // Call callback
        if (this.onSendMessage) {
            this.onSendMessage(message);
        }
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea() {
        this.inputTextarea.style.height = 'auto';
        this.inputTextarea.style.height = Math.min(this.inputTextarea.scrollHeight, 120) + 'px';
    }

    /**
     * Show chat panel
     */
    show() {
        if (!this.chatPanel) {
            this.render();
        }

        setTimeout(() => {
            this.chatPanel.classList.add('open');
            this.isOpen = true;
            this.inputTextarea.focus();
        }, 10);
    }

    /**
     * Close chat panel
     */
    close() {
        if (this.chatPanel) {
            this.chatPanel.classList.remove('open');
            this.isOpen = false;
        }
    }

    /**
     * Toggle chat panel
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.show();
        }
    }

    /**
     * Add user message to chat
     */
    addUserMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message user';
        messageEl.innerHTML = `
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    /**
     * Add assistant message to chat
     */
    addAssistantMessage(text, refinedPrompt = null) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message assistant';

        let html = `<div class="message-content">${this.escapeHtml(text)}</div>`;

        if (refinedPrompt) {
            html += this.createRefinedPromptBox(refinedPrompt);
        }

        messageEl.innerHTML = html;
        this.messagesContainer.appendChild(messageEl);

        // Attach event listeners to action buttons if refined prompt exists
        if (refinedPrompt) {
            const applyBtn = messageEl.querySelector('.apply-prompt-btn');
            const copyBtn = messageEl.querySelector('.copy-prompt-btn');

            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    if (this.onApplyPrompt) {
                        this.onApplyPrompt(refinedPrompt);
                    }
                });
            }

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    this.copyToClipboard(refinedPrompt);
                });
            }
        }

        this.scrollToBottom();
    }

    /**
     * Create refined prompt box HTML
     */
    createRefinedPromptBox(refinedPrompt) {
        return `
            <div class="refined-prompt-box">
                <div class="refined-prompt-label">Refined Prompt</div>
                <div class="refined-prompt-text">${this.escapeHtml(refinedPrompt)}</div>
                <div class="refined-prompt-actions">
                    <button class="apply-prompt-btn">Apply to Page</button>
                    <button class="copy-prompt-btn">Copy</button>
                </div>
            </div>
        `;
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'chat-loading';
        loadingEl.textContent = 'Thinking...';
        this.messagesContainer.appendChild(loadingEl);
        this.scrollToBottom();

        // Disable send button
        this.sendButton.disabled = true;
        this.inputTextarea.disabled = true;
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingEl = this.messagesContainer.querySelector('.chat-loading');
        if (loadingEl) {
            loadingEl.remove();
        }

        // Re-enable send button
        this.sendButton.disabled = false;
        this.inputTextarea.disabled = false;
        this.inputTextarea.focus();
    }

    /**
     * Show error message
     */
    showError(errorMessage) {
        const errorEl = document.createElement('div');
        errorEl.className = 'chat-error';
        errorEl.textContent = `Error: ${errorMessage}`;
        this.messagesContainer.appendChild(errorEl);
        this.scrollToBottom();
    }

    /**
     * Show history notice
     */
    showHistoryNotice(onClear) {
        const noticeEl = document.createElement('div');
        noticeEl.className = 'chat-history-notice';
        noticeEl.innerHTML = `
            <span>Continuing previous conversation</span>
            <button class="clear-history-btn">Clear & Start Fresh</button>
        `;

        this.messagesContainer.insertBefore(noticeEl, this.messagesContainer.firstChild);

        const clearBtn = noticeEl.querySelector('.clear-history-btn');
        clearBtn.addEventListener('click', () => {
            noticeEl.remove();
            if (onClear) {
                onClear();
            }
        });
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);

            // Show success feedback
            this.showTemporaryMessage('Copied to clipboard!', 2000);
        } catch (error) {
            console.error('Failed to copy:', error);

            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showTemporaryMessage('Copied to clipboard!', 2000);
        } catch (error) {
            this.showTemporaryMessage('Failed to copy. Please copy manually.', 3000);
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show temporary message (toast-like notification)
     */
    showTemporaryMessage(message, duration) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: var(--gold);
            color: var(--sepia-dark);
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Destroy chat panel
     */
    destroy() {
        if (this.chatPanel) {
            this.chatPanel.remove();
            this.chatPanel = null;
        }
    }
}

// Export for use in other modules
window.ChatUI = ChatUI;
