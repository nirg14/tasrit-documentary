/**
 * Initialize AI Workshop - Sets up chat buttons and handlers
 * Main entry point for the AI prompt workshop feature
 */

(function() {
    'use strict';

    // Global state
    const activeChats = new Map(); // shotId -> ChatManager instance
    let contextLoader = null;
    let globalContext = null;
    let sertonContext = null;

    /**
     * Initialize when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('Initializing AI Prompt Workshop...');

        try {
            // Create context loader
            contextLoader = new ContextLoader();

            // Load global context (async)
            console.log('Loading global context...');
            globalContext = await contextLoader.loadGlobalContext();

            // Load serton context from page
            console.log('Loading serton context...');
            sertonContext = contextLoader.loadSertonContext();

            // Initialize all AI workshop buttons
            initializeWorkshopButtons();

            console.log('AI Prompt Workshop initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Prompt Workshop:', error);
            showInitializationError(error);
        }
    });

    /**
     * Initialize all AI workshop buttons on the page
     */
    function initializeWorkshopButtons() {
        const workshopButtons = document.querySelectorAll('.ai-workshop-btn');

        console.log(`Found ${workshopButtons.length} AI workshop buttons`);

        workshopButtons.forEach(button => {
            button.addEventListener('click', handleWorkshopButtonClick);
        });
    }

    /**
     * Handle workshop button click
     */
    async function handleWorkshopButtonClick(event) {
        const button = event.currentTarget;
        const shotId = button.dataset.target;

        if (!shotId) {
            console.error('No shot ID found on button');
            return;
        }

        try {
            // Check if chat already exists for this shot
            if (activeChats.has(shotId)) {
                const existingChat = activeChats.get(shotId);
                existingChat.ui.toggle();
                return;
            }

            // Show loading state on button
            button.classList.add('active');
            button.textContent = 'Loading...';

            // Get prompt box element
            const promptBox = document.querySelector(`[data-shot-id="${shotId}"]`);
            if (!promptBox) {
                throw new Error('Prompt box not found');
            }

            // Get shot element
            const shotElement = button.closest('.shot');
            if (!shotElement) {
                throw new Error('Shot element not found');
            }

            // Build complete context
            const context = await contextLoader.buildCompleteContext(shotElement, promptBox);

            // Create chat manager
            const chatManager = new ChatManager(shotId, context, promptBox);

            // Store in active chats
            activeChats.set(shotId, chatManager);

            // Initialize and show chat
            await chatManager.initialize();

            // Restore button state
            button.classList.remove('active');
            button.textContent = '⚡ Workshop with AI';

        } catch (error) {
            console.error('Error opening chat:', error);

            // Show error to user
            showError(`Failed to open chat: ${error.message}`);

            // Restore button state
            button.classList.remove('active');
            button.textContent = '⚡ Workshop with AI';
        }
    }

    /**
     * Show initialization error
     */
    function showInitializationError(error) {
        const errorBanner = document.createElement('div');
        errorBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #d9534f;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-weight: 600;
        `;
        errorBanner.innerHTML = `
            <p>Failed to initialize AI Prompt Workshop: ${error.message}</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Some features may not be available.</p>
        `;
        document.body.prepend(errorBanner);

        // Remove after 10 seconds
        setTimeout(() => {
            errorBanner.style.opacity = '0';
            errorBanner.style.transition = 'opacity 0.5s';
            setTimeout(() => errorBanner.remove(), 500);
        }, 10000);
    }

    /**
     * Show temporary error message
     */
    function showError(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #d9534f;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            max-width: 400px;
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
        }, 5000);
    }

    /**
     * Cleanup function (called on page unload)
     */
    window.addEventListener('beforeunload', function() {
        // Destroy all active chats
        activeChats.forEach(chat => chat.destroy());
        activeChats.clear();
    });

    // Export for debugging
    window.WorkshopDebug = {
        activeChats: activeChats,
        contextLoader: () => contextLoader,
        globalContext: () => globalContext,
        sertonContext: () => sertonContext
    };

})();
