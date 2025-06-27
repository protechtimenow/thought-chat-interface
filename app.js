class ThoughtChatInterface {
    constructor() {
        this.speechEngine = new SpeechEngine();
        this.messages = [];
        this.isProcessing = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSpeechEngine();
        
        this.addMessage('assistant', 'Hello! I\'m ready to listen to your thoughts. Click the microphone to speak or type your message.');
    }
    
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.voiceButton = document.getElementById('voiceButton');
        this.textInput = document.getElementById('textInput');
        this.sendButton = document.getElementById('sendButton');
        this.status = document.getElementById('status');
        this.brainWave = document.querySelector('.brain-wave');
        this.autoSpeakCheckbox = document.getElementById('autoSpeak');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
    }
    
    setupEventListeners() {
        this.voiceButton.addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        this.sendButton.addEventListener('click', () => {
            this.sendTextMessage();
        });
        
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });
        
        this.voiceSelect.addEventListener('change', (e) => {
            this.speechEngine.setVoice(parseInt(e.target.value));
        });
        
        this.speedSlider.addEventListener('input', (e) => {
            const rate = parseFloat(e.target.value);
            this.speedValue.textContent = rate.toFixed(1) + 'x';
            this.speechEngine.setRate(rate);
        });
    }
    
    setupSpeechEngine() {
        this.speechEngine.onListeningStart = () => {
            this.updateStatus('Listening to your thoughts...');
            this.voiceButton.textContent = '🔴 Listening...';
            this.voiceButton.classList.add('listening');
            this.brainWave.classList.add('listening');
        };
        
        this.speechEngine.onListeningEnd = () => {
            this.updateStatus('Processing your thoughts...');
            this.voiceButton.textContent = '🎤 Think & Speak';
            this.voiceButton.classList.remove('listening');
            this.brainWave.classList.remove('listening');
        };
        
        this.speechEngine.onSpeechResult = (transcript) => {
            this.handleUserInput(transcript);
        };
        
        this.speechEngine.onInterimResult = (transcript) => {
            this.updateStatus(`Hearing: "${transcript}"`);
        };
        
        this.speechEngine.onError = (error) => {
            this.updateStatus(`Voice error: ${error}. Try typing instead.`);
        };
        
        this.speechEngine.onVoicesLoaded = (voices) => {
            this.populateVoiceSelect(voices);
        };
        
        this.speechEngine.onSpeechStart = () => {
            this.updateStatus('Speaking response...');
        };
        
        this.speechEngine.onSpeechEnd = () => {
            this.updateStatus('Ready to listen to your thoughts...');
        };
    }
    
    populateVoiceSelect(voices) {
        this.voiceSelect.innerHTML = '';
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice === this.speechEngine.selectedVoice) {
                option.selected = true;
            }
            this.voiceSelect.appendChild(option);
        });
    }
    
    toggleVoiceInput() {
        if (this.speechEngine.isListening) {
            this.speechEngine.stopListening();
        } else {
            this.speechEngine.startListening();
        }
    }
    
    sendTextMessage() {
        const text = this.textInput.value.trim();
        if (text) {
            this.textInput.value = '';
            this.handleUserInput(text);
        }
    }
    
    async handleUserInput(inputText) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.addMessage('user', inputText);
        this.updateStatus('Thinking...');
        
        try {
            // Simulate AI response - replace with actual API call
            const response = await this.generateResponse(inputText);
            this.addMessage('assistant', response);
            
            if (this.autoSpeakCheckbox.checked) {
                this.speechEngine.speak(response);
            } else {
                this.updateStatus('Ready to listen to your thoughts...');
            }
        } catch (error) {
            console.error('Error generating response:', error);
            this.addMessage('assistant', 'I apologize, but I encountered an error processing your thought. Please try again.');
            this.updateStatus('Ready to listen to your thoughts...');
        } finally {
            this.isProcessing = false;
        }
    }
    
    async generateResponse(input) {
        // This is a placeholder - you would integrate with your preferred AI API
        // Examples: OpenAI, Anthropic, local model, etc.
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
        
        const responses = [
            `I understand you're thinking about: "${input}". Let me reflect on that...`,
            `That's an interesting thought about "${input}". Here's my perspective...`,
            `Your thought "${input}" reminds me of several interesting concepts...`,
            `I hear your thought about "${input}". Let me share some insights...`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messageDiv.innerHTML = `
            <div style="opacity: 0.7; font-size: 0.8em; margin-bottom: 0.3em;">${timestamp}</div>
            ${text}
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        this.messages.push({ sender, text, timestamp });
    }
    
    updateStatus(statusText) {
        this.status.textContent = statusText;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.speechSynthesis || !window.webkitSpeechRecognition && !window.SpeechRecognition) {
        alert('Your browser doesn\'t fully support speech features. Please use Chrome, Edge, or Safari for the best experience.');
    }
    
    const app = new ThoughtChatInterface();
});