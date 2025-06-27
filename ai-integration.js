// AI Integration Examples
// Replace the generateResponse() function in app.js with one of these implementations

class AIIntegration {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || 'your-api-key-here';
        this.model = 'gpt-4';
        this.conversationHistory = [];
    }

    // OpenAI Integration
    async generateResponseOpenAI(input) {
        try {
            this.conversationHistory.push({ role: 'user', content: input });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant having a voice conversation. Keep responses conversational and under 100 words.' },
                        ...this.conversationHistory
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            this.conversationHistory.push({ role: 'assistant', content: reply });
            
            // Keep conversation history manageable
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-8);
            }

            return reply;
        } catch (error) {
            console.error('OpenAI API error:', error);
            return \"I'm having trouble connecting to my AI service. Please try again.\";
        }
    }

    // Anthropic Claude Integration
    async generateResponseClaude(input) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 150,
                    messages: [{ role: 'user', content: input }],
                    system: 'You are having a voice conversation. Keep responses brief and conversational.'
                })
            });

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            return \"I'm experiencing technical difficulties. Please try again.\";
        }
    }

    // Local LLM Integration (using Ollama or similar)
    async generateResponseLocal(input) {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: `Human: ${input}\\n\\nAssistant: `,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        max_tokens: 100
                    }
                })
            });

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Local LLM error:', error);
            return \"My local AI model isn't responding. Please check the connection.\";
        }
    }

    // WebSocket Integration for Real-time Streaming
    async setupRealtimeConnection() {
        const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01');
        
        ws.onopen = () => {
            console.log('Real-time AI connection established');
            
            // Configure session
            ws.send(JSON.stringify({
                type: 'session.update',
                session: {
                    modalities: ['text', 'audio'],
                    instructions: 'You are a helpful assistant having a voice conversation.',
                    voice: 'alloy',
                    input_audio_format: 'pcm16',
                    output_audio_format: 'pcm16',
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 200
                    }
                }
            }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleRealtimeMessage(message);
        };

        return ws;
    }

    handleRealtimeMessage(message) {
        switch (message.type) {
            case 'response.audio.delta':
                // Handle streaming audio response
                this.playAudioChunk(message.delta);
                break;
            case 'response.text.delta':
                // Handle streaming text response
                this.displayTextChunk(message.delta);
                break;
            case 'conversation.item.created':
                // Handle conversation updates
                console.log('New conversation item:', message.item);
                break;
        }
    }

    // Advanced: Multimodal Integration (Text + Audio + Video)
    async generateMultimodalResponse(input, audioData = null, videoFrame = null) {
        const payload = {
            text: input,
            timestamp: Date.now(),
            context: this.getConversationContext()
        };

        if (audioData) {
            payload.audio = audioData; // Base64 encoded audio
        }

        if (videoFrame) {
            payload.image = videoFrame; // Base64 encoded image from webcam
        }

        try {
            const response = await fetch('/api/multimodal-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return {
                text: data.response,
                audio: data.audioResponse, // TTS response
                actions: data.suggestedActions // UI actions to take
            };
        } catch (error) {
            console.error('Multimodal API error:', error);
            return { text: \"I couldn't process that multimodal input. Please try again.\" };
        }
    }

    getConversationContext() {
        return {
            messageCount: this.conversationHistory.length,
            recentTopics: this.extractTopics(this.conversationHistory.slice(-5)),
            userPreferences: this.getUserPreferences(),
            timestamp: new Date().toISOString()
        };
    }

    extractTopics(messages) {
        // Simple keyword extraction - could be replaced with NLP
        const keywords = messages.join(' ')
            .toLowerCase()
            .match(/\\b\\w{4,}\\b/g) || [];
        
        const freq = {};
        keywords.forEach(word => freq[word] = (freq[word] || 0) + 1);
        
        return Object.entries(freq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    getUserPreferences() {
        return {
            responseLength: localStorage.getItem('preferredResponseLength') || 'medium',
            voice: localStorage.getItem('preferredVoice') || 'default',
            topics: JSON.parse(localStorage.getItem('interestedTopics') || '[]')
        };
    }
}

// Usage Example:
// const aiIntegration = new AIIntegration();
// 
// // In your ThoughtChatInterface class, replace generateResponse with:
// async generateResponse(input) {
//     return await this.aiIntegration.generateResponseOpenAI(input);
// }