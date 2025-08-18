import { useCallback, useRef } from 'react';
import { APPOINTMENT_PATTERNS } from '../../../shared';
import { addSuccessAndRedirect } from '../utils/redirect';

/**
 * Custom hook for chat input handling
 * Extracted from ChatBot.js to improve maintainability
 */
const useChatInput = ({ 
  inputValue, 
  setInputValue, 
  setMessages, 
  pendingCancellation, 
  pendingCompletion, 
  completionStep,
  executeCancelAppointment,
  executeCompleteAppointment,
  collectTipAmount,
  validateAndRespondToCancellation,
  validateAndRespondToCompletion,
  classifyIntent,
  onTipCollected,
  onCompletionSuccess,
  onCancellationSuccess
}) => {
  // Counter for unique message IDs
  const messageIdCounter = useRef(0);
  
  /**
   * Helper to push a message via setMessages
   */
  const addBotMessage = useCallback((text) => {
    const messageId = Date.now() + (++messageIdCounter.current);
    setMessages(prev => [...prev, { id: messageId, type: 'bot', text, timestamp: new Date() }]);
  }, [setMessages]);

  /**
   * Handle user input submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Process the message
    const intent = classifyIntent(userMessage);
    
    // Handle affirmative commands for cancellation or completion
    if (intent.type === 'affirmative') {
      if (pendingCancellation) {
        try {
          const result = await executeCancelAppointment(pendingCancellation);
          if (result.success) {
            if (onCancellationSuccess) onCancellationSuccess();
            addSuccessAndRedirect({ addMessage: addBotMessage, messageText: result.message, date: result.appointment.date });
          }
        } catch (error) {
          addBotMessage("Sorry, I encountered an error while cancelling the appointment. Please try again.");
        }
      } else if (pendingCompletion && completionStep === 2) {
        try {
          const result = await executeCompleteAppointment(pendingCompletion, pendingCompletion?.tip ?? 0);
          if (result.success) {
            if (onCompletionSuccess) onCompletionSuccess();
            addSuccessAndRedirect({ addMessage: addBotMessage, messageText: result.message, date: result.appointment.date });
          }
        } catch (error) {
          addBotMessage("Sorry, I encountered an error while completing the appointment. Please try again.");
        }
      } else {
        addBotMessage("I don't have any pending action to confirm. Please make a request first.");
      }
      return;
    }
    
    // Handle tip collection for completion
    if (pendingCompletion && completionStep === 1) {
      const result = collectTipAmount(userMessage);
      if (!result.success) {
        addBotMessage(result.message);
        return;
      }
      // Tip valid; store and ask for confirmation
      const tipAmount = result.amount;
      if (onTipCollected) onTipCollected(tipAmount);
      const tipMsg = `Tip amount set to: ${tipAmount === 0 ? 'no tip' : `$${tipAmount.toFixed(2)}`}. Type 'yes' to confirm completion.`;
      addBotMessage(tipMsg);
      return;
    }
    
    // Handle cancel appointment commands
    if (intent.type === 'cancel') {
      // Extract cancellation details based on intent
      let cancellationDetails = null;
      
      switch (intent.intent) {
        case 'clientDateTimeFull':
          cancellationDetails = {
            clientName: intent.groups[0],
            time: intent.groups[1],
            date: intent.groups[2],
            year: intent.groups[3] || null
          };
          break;
        case 'cancelClientDateTime':
          cancellationDetails = {
            clientName: intent.groups[0],
            time: intent.groups[1],
            date: intent.groups[2],
            year: intent.groups[3] || null
          };
          break;
        case 'cancelClientDate':
          cancellationDetails = {
            clientName: intent.groups[0],
            time: null,
            date: intent.groups[1],
            year: intent.groups[2] || null
          };
          break;
        case 'cancelClientOnly':
          cancellationDetails = {
            clientName: intent.groups[0],
            time: null,
            date: null,
            year: null
          };
          break;
        default:
          addBotMessage("I'm sorry I didn't understand that cancellation request. I will perform no actions. Please try again.");
          return;
      }
      
      // Validate the appointment with backend before responding
      if (cancellationDetails) {
        validateAndRespondToCancellation(cancellationDetails);
      }
      
    } else if (intent.type === 'complete') {
      // Extract completion details based on intent
      let completionDetails = null;
      
      switch (intent.intent) {
        case 'completeClientDateTimeFull':
          completionDetails = {
            clientName: intent.groups[0],
            time: intent.groups[1],
            date: intent.groups[2],
            year: intent.groups[3] || null
          };
          break;
        case 'completeClientDateTime':
          completionDetails = {
            clientName: intent.groups[0],
            time: intent.groups[1],
            date: null,
            year: null
          };
          break;
        case 'completeClientDate':
          completionDetails = {
            clientName: intent.groups[0],
            time: null,
            date: intent.groups[1],
            year: intent.groups[2] || null
          };
          break;
        case 'completeClientOnly':
          completionDetails = {
            clientName: intent.groups[0],
            time: null,
            date: null,
            year: null
          };
          break;
        default:
          addBotMessage("I'm sorry I didn't understand that completion request. I will perform no actions. Please try again.");
          return;
      }
      
      // Validate the appointment with backend before responding
      if (completionDetails) {
        validateAndRespondToCompletion(completionDetails);
      }
      
    } else if (intent.type === 'unknown') {
      addBotMessage("I'm sorry I didn't understand that request. I will perform no actions. Please try again.");
    }
  }, [
    inputValue, 
    setInputValue, 
    setMessages, 
    pendingCancellation, 
    pendingCompletion, 
    completionStep,
    executeCancelAppointment,
    executeCompleteAppointment,
    collectTipAmount,
    validateAndRespondToCancellation,
    validateAndRespondToCompletion,
    classifyIntent,
    onTipCollected,
    onCompletionSuccess,
    onCancellationSuccess,
    addBotMessage
  ]);

  return {
    handleSubmit
  };
};

export default useChatInput;
