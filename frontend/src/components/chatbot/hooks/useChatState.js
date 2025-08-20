import { useState, useCallback } from 'react';

/**
 * Custom hook for managing chat state
 * Extracted from ChatBot.js to improve maintainability
 */
const useChatState = () => {
  // Main chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cancellation workflow state
  const [pendingCancellation, setPendingCancellation] = useState(null);

  // Completion workflow state
  const [pendingCompletion, setPendingCompletion] = useState(null);
  const [completionTip, setCompletionTip] = useState(null);
  const [completionStep, setCompletionStep] = useState(0); // 0=validate, 1=collect tip, 2=confirm

  // Edit workflow state
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editStep, setEditStep] = useState(0); // 0=validate, 1=get category, 2=get reason, 3=confirm
  const [editReason, setEditReason] = useState('');

  // Add a new message to the chat
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Add user message
  const addUserMessage = useCallback((text) => {
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text,
      timestamp: new Date()
    };
    addMessage(userMsg);
  }, [addMessage]);

  // Add bot message
  const addBotMessage = useCallback((text) => {
    const botMsg = {
      id: Date.now() + 1,
      type: 'bot',
      text,
      timestamp: new Date()
    };
    addMessage(botMsg);
  }, [addMessage]);

  // Clear cancellation state
  const clearCancellation = useCallback(() => {
    setPendingCancellation(null);
  }, []);

  // Clear completion state
  const clearCompletion = useCallback(() => {
    setPendingCompletion(null);
    setCompletionTip(null);
    setCompletionStep(0);
  }, []);

  // Set completion step
  const setCompletionStepState = useCallback((step) => {
    setCompletionStep(step);
  }, []);

  // Set completion tip
  const setCompletionTipState = useCallback((tip) => {
    setCompletionTip(tip);
  }, []);

  // Clear edit state
  const clearEdit = useCallback(() => {
    setPendingEdit(null);
    setEditStep(0);
    setEditReason('');
  }, []);

  // Set edit step
  const setEditStepState = useCallback((step) => {
    setEditStep(step);
  }, []);

  // Set edit reason
  const setEditReasonState = useCallback((reason) => {
    setEditReason(reason);
  }, []);

  return {
    // State
    messages,
    inputValue,
    isLoading,
    error,
    pendingCancellation,
    pendingCompletion,
    completionTip,
    completionStep,
    pendingEdit,
    editStep,
    editReason,
    
    // Setters
    setMessages,
    setInputValue,
    setIsLoading,
    setError,
    setPendingCancellation,
    setPendingCompletion,
    setCompletionTipState,
    setCompletionStepState,
    setPendingEdit,
    setEditStepState,
    setEditReasonState,
    
    // Actions
    addMessage,
    addUserMessage,
    addBotMessage,
    clearCancellation,
    clearCompletion,
    clearEdit
  };
};

export default useChatState;
