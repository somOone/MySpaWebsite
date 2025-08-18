import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for speech recognition and synthesis
 * Extracted from ChatBot.js to improve maintainability
 */
const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        // console.log('🎤 Speech recognition started');
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // console.log('🎤 Speech recognized:', transcript);
        // This will be handled by the parent component
        return transcript;
      };
      
      recognitionRef.current.onerror = (event) => {
        // console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        // console.log('🎤 Speech recognition ended');
        setIsListening(false);
      };
    }
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Start listening for speech input
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // console.error('🎤 Error starting speech recognition:', error);
      }
    }
  }, [isListening]);

  // Stop listening for speech input
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // console.error('🎤 Error stopping speech recognition:', error);
      }
    }
  }, [isListening]);

  // Speak text using speech synthesis
  const speak = useCallback((text) => {
    if (synthesisRef.current && !isSpeaking) {
      try {
        setIsSpeaking(true);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
          // console.log('🔊 Speech synthesis started');
        };
        
        utterance.onend = () => {
          // console.log('🔊 Speech synthesis ended');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          // console.error('🔊 Speech synthesis error:', event.error);
          setIsSpeaking(false);
        };
        
        synthesisRef.current.speak(utterance);
        
        // Fallback timer in case speech synthesis events don't fire
        setTimeout(() => {
          setIsSpeaking(false);
        }, 5000);
        
      } catch (error) {
        // console.error('🔊 Error with speech synthesis:', error);
        setIsSpeaking(false);
      }
    }
  }, [isSpeaking]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current && isSpeaking) {
      try {
        synthesisRef.current.cancel();
        setIsSpeaking(false);
      } catch (error) {
        // console.error('🔊 Error stopping speech synthesis:', error);
      }
    }
  }, [isSpeaking]);

  return {
    // State
    isListening,
    isSpeaking,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};

export default useSpeech;
