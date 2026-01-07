/**
 * Context Loader - Extracts and loads context for AI chat
 * Manages 3 layers: Global (style guide), Serton (page), Shot (element)
 */

class ContextLoader {
    constructor() {
        this.globalContext = null;
        this.sertonContext = null;
        this.loadingGlobal = null; // Promise for loading global context
    }

    /**
     * Load global context (style guide, project overview)
     * Cached after first load
     */
    async loadGlobalContext() {
        if (this.globalContext) {
            return this.globalContext;
        }

        if (this.loadingGlobal) {
            return this.loadingGlobal;
        }

        this.loadingGlobal = (async () => {
            try {
                // Load style guide
                const styleGuide = await this.fetchTextFile('../MIDJOURNEY_STYLE_GUIDE.md');

                // Create global context object
                this.globalContext = {
                    styleGuide: styleGuide,
                    projectOverview: this.getProjectOverview()
                };

                return this.globalContext;
            } catch (error) {
                console.error('Error loading global context:', error);
                // Return minimal context if loading fails
                this.globalContext = {
                    styleGuide: 'Style guide not available',
                    projectOverview: 'Holocaust survivor testimony documentary, 1940-1947'
                };
                return this.globalContext;
            }
        })();

        return this.loadingGlobal;
    }

    /**
     * Fetch text file content
     */
    async fetchTextFile(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
        }
        return await response.text();
    }

    /**
     * Get hardcoded project overview
     */
    getProjectOverview() {
        return `Tasrit Documentary Project - A Holocaust Survivor's Journey

48 animated segments documenting a Romanian Jewish survivor's journey from 1940-1947.
Visual style: 2D animated historical illustration, heavily desaturated sepia tones,
chiaroscuro lighting, moving painting aesthetic.

Journey: Romania → Hungary → Austria → Germany → Israel
Key locations: Iași, Budapest, Vienna, Linz, Bad Reichenhall, Eschwege
Historical period: Holocaust, WWII liberation, displaced persons camps, Israeli independence`;
    }

    /**
     * Load serton context from embedded JSON in page
     */
    loadSertonContext() {
        if (this.sertonContext) {
            return this.sertonContext;
        }

        try {
            const contextElement = document.getElementById('serton-context');
            if (!contextElement) {
                throw new Error('Serton context not found in page');
            }

            this.sertonContext = JSON.parse(contextElement.textContent);
            return this.sertonContext;
        } catch (error) {
            console.error('Error loading serton context:', error);
            // Return minimal context from page title
            this.sertonContext = {
                sertonNumber: this.extractSertonNumberFromURL(),
                sertonTitle: document.title.split('-')[1]?.trim() || 'Unknown',
                setting: 'Not specified',
                emotionalTone: 'Not specified',
                sceneOverview: 'Scene description not available',
                emotionalArc: 'Emotional arc not available'
            };
            return this.sertonContext;
        }
    }

    /**
     * Extract serton number from URL
     */
    extractSertonNumberFromURL() {
        const match = window.location.pathname.match(/Serton_(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Extract shot context from DOM element
     */
    extractShotContext(shotElement) {
        if (!shotElement) {
            throw new Error('Shot element is required');
        }

        const dataset = shotElement.dataset;

        return {
            shotNumber: parseInt(dataset.shotNumber) || 0,
            shotTitle: dataset.shotTitle || 'Untitled Shot',
            shotDescription: dataset.shotDescription || '',
            shotSetting: dataset.shotSetting || '',
            shotAction: dataset.shotAction || '',
            shotEmotion: dataset.shotEmotion || ''
        };
    }

    /**
     * Extract prompt context from prompt box element
     */
    extractPromptContext(promptBoxElement) {
        if (!promptBoxElement) {
            throw new Error('Prompt box element is required');
        }

        const dataset = promptBoxElement.dataset;
        const promptTextElement = promptBoxElement.querySelector('.prompt-text');

        return {
            shotId: dataset.shotId,
            promptType: dataset.promptType || 'image',
            currentPrompt: promptTextElement ? promptTextElement.textContent.trim() : ''
        };
    }

    /**
     * Build complete context object for AI
     */
    async buildCompleteContext(shotElement, promptBoxElement) {
        // Load all context layers
        const global = await this.loadGlobalContext();
        const serton = this.loadSertonContext();
        const shot = this.extractShotContext(shotElement);
        const prompt = this.extractPromptContext(promptBoxElement);

        return {
            global: global,
            serton: serton,
            shot: shot,
            prompt: prompt,
            // Combined for easy access
            shotId: prompt.shotId,
            promptType: prompt.promptType,
            currentPrompt: prompt.currentPrompt
        };
    }

    /**
     * Get context summary for display
     */
    getContextSummary(context) {
        const sertonNum = context.serton.sertonNumber;
        const shotNum = context.shot.shotNumber;
        const shotTitle = context.shot.shotTitle;
        const promptType = context.promptType === 'image' ? 'Image' : 'Video';

        return `Serton ${sertonNum}, Shot ${shotNum}: ${shotTitle} (${promptType} Prompt)`;
    }

    /**
     * Format context for AI system prompt
     */
    formatContextForAI(context) {
        return {
            styleGuide: context.global.styleGuide,
            projectOverview: context.global.projectOverview,

            serton: {
                number: context.serton.sertonNumber,
                title: context.serton.sertonTitle,
                setting: context.serton.setting,
                emotionalTone: context.serton.emotionalTone,
                sceneOverview: context.serton.sceneOverview,
                emotionalArc: context.serton.emotionalArc,
                totalShots: context.serton.totalShots || 'Unknown'
            },

            shot: {
                number: context.shot.shotNumber,
                title: context.shot.shotTitle,
                description: context.shot.shotDescription,
                setting: context.shot.shotSetting,
                action: context.shot.shotAction,
                emotion: context.shot.shotEmotion
            },

            prompt: {
                type: context.promptType,
                current: context.currentPrompt
            }
        };
    }
}

// Export for use in other modules
window.ContextLoader = ContextLoader;
