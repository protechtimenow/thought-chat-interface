class SpeechEngine {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.voices = [];
        this.selectedVoice = null;
        this.rate = 1;
        
        this.initSpeechRecognition();
        this.loadVoices();
    }
    
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('Speech Recognition not supported');
            return;
        }
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.onListeningStart && this.onListeningStart();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.onListeningEnd && this.onListeningEnd();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.onSpeechResult && this.onSpeechResult(finalTranscript.trim());
            } else if (interimTranscript) {
                this.onInterimResult && this.onInterimResult(interimTranscript.trim());
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.onError && this.onError(event.error);
        };
    }
    
    loadVoices() {
        const updateVoices = () => {
            this.voices = this.synthesis.getVoices();
            // Prefer English voices
            const englishVoices = this.voices.filter(voice => 
                voice.lang.startsWith('en'));
            this.selectedVoice = englishVoices[0] || this.voices[0];
            this.onVoicesLoaded && this.onVoicesLoaded(this.voices);
        };
        
        updateVoices();
        this.synthesis.onvoiceschanged = updateVoices;
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    speak(text, options = {}) {
        if (!text) return;
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice;
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        
        utterance.onstart = () => {
            this.onSpeechStart && this.onSpeechStart();
        };
        
        utterance.onend = () => {
            this.onSpeechEnd && this.onSpeechEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        this.synthesis.speak(utterance);
    }
    
    setVoice(voiceIndex) {
        if (this.voices[voiceIndex]) {
            this.selectedVoice = this.voices[voiceIndex];
        }
    }
    
    setRate(rate) {
        this.rate = rate;
    }
    
    isSupported() {
        return !!(this.recognition && this.synthesis);
    }
}