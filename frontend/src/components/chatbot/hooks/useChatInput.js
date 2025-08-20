import { useCallback, useRef } from 'react';
import { APPOINTMENT_PATTERNS, validateTipAmount } from '../../../shared';
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
  pendingEdit,
  editStep,
  executeCancelAppointment,
  executeCompleteAppointment,
  executeEditAppointment,
  collectTipAmount,
  validateAndRespondToCancellation,
  validateAndRespondToCompletion,
  validateAndRespondToEdit,
  classifyIntent,
  onTipCollected,
  onCompletionSuccess,
  onCancellationSuccess,
  onEditCategoryInput,
  onEditReasonInput,
  onEditConfirmation
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
   * Helper to add a user message to the chat
   */
  const addUserMessage = useCallback((text) => {
    const messageId = Date.now() + (++messageIdCounter.current);
    setMessages(prev => [...prev, { id: messageId, type: 'user', text, timestamp: new Date() }]);
  }, [setMessages]);

  /**
   * Handle user input submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Debug: Log current state
    console.log('🔍 [DEBUG] handleSubmit called with:', {
      userMessage,
      pendingCancellation,
      pendingCompletion,
      pendingEdit,
      editStep,
      completionStep
    });
    
    // Add user message to chat
    addUserMessage(userMessage);
    
    // Handle tip collection for completion workflow
    if (pendingCompletion && completionStep === 2) {
      const result = validateTipAmount(userMessage);
      if (!result.isValid) {
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

    // Handle completion confirmation (step 3)
    if (pendingCompletion && completionStep === 3) {
      if (userMessage.toLowerCase().includes('yes')) {
        if (onCompletionSuccess) onCompletionSuccess(true);
        return;
      } else if (userMessage.toLowerCase().includes('no')) {
        if (onCompletionSuccess) onCompletionSuccess(false);
        return;
      } else {
        addBotMessage("Please type 'yes' to confirm or 'no' to cancel.");
        return;
      }
    }

    // Handle edit workflow steps
    if (pendingEdit) {
      console.log('🔍 [DEBUG] Edit workflow active:', { pendingEdit, editStep, userMessage });
      if (editStep === 1) {
        // User is providing new category
        const category = userMessage.toLowerCase().trim();
        console.log('🔍 [DEBUG] Processing category input:', category);
        if (['facial', 'massage', 'combo'].includes(category)) {
          console.log('🔍 [DEBUG] Valid category, calling onEditCategoryInput');
          if (onEditCategoryInput) onEditCategoryInput(category);
          return;
        } else {
          console.log('🔍 [DEBUG] Invalid category, asking for valid options');
          addBotMessage("Please specify a valid category: facial, massage, or combo.");
          return;
        }
      } else if (editStep === 2) {
        // User is providing cancellation reason
        console.log('🔍 [DEBUG] Processing reason input');
        if (onEditReasonInput) onEditReasonInput(userMessage);
        return;
      } else if (editStep === 3) {
        // User is confirming the edit
        console.log('🔍 [DEBUG] Processing confirmation input');
        if (userMessage.toLowerCase().includes('yes')) {
          if (onEditConfirmation) onEditConfirmation(true);
          return;
        } else if (userMessage.toLowerCase().includes('no')) {
          if (onEditConfirmation) onEditConfirmation(false);
          return;
        } else {
          addBotMessage("Please type 'yes' to confirm or 'no' to cancel.");
          return;
        }
      }
    }
    
    // Handle cancellation confirmation
    if (pendingCancellation) {
      if (userMessage.toLowerCase().includes('yes')) {
        if (onCancellationSuccess) onCancellationSuccess(true);
        return;
      } else if (userMessage.toLowerCase().includes('no')) {
        if (onCancellationSuccess) onCancellationSuccess(false);
        return;
      } else {
        addBotMessage("Please type 'yes' to confirm or 'no' to cancel.");
        return;
      }
    }
    
    // Only classify intent when NOT in an active workflow
    if (!pendingCancellation && !pendingCompletion && !pendingEdit) {
      const intent = classifyIntent(userMessage);
      
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
          case 'categoryDateTimeFull':
            cancellationDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'firstNameDateTimeFull':
            cancellationDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'lastNameDateTimeFull':
            cancellationDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'clientDateTime':
            cancellationDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: null,
              year: null
            };
            break;
          case 'clientDate':
            cancellationDetails = {
              clientName: intent.groups[0],
              time: null,
              date: intent.groups[1],
              year: intent.groups[2] || null
            };
            break;
          case 'clientOnly':
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
          case 'completeCategoryDateTimeFull':
            completionDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'completeFirstNameDateTimeFull':
            completionDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'completeLastNameDateTimeFull':
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
        
      } else if (intent.type === 'edit') {
        // Extract edit details based on intent
        let editDetails = null;
        
        switch (intent.intent) {
          case 'editClientDateTimeFull':
            editDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: intent.groups[2],
              year: intent.groups[3] || null
            };
            break;
          case 'editClientDateTime':
            editDetails = {
              clientName: intent.groups[0],
              time: intent.groups[1],
              date: null,
              year: null
            };
            break;
          case 'editClientDate':
            editDetails = {
              clientName: intent.groups[0],
              time: null,
              date: intent.groups[1],
              year: intent.groups[2] || null
            };
            break;
          case 'editClientOnly':
            editDetails = {
              clientName: intent.groups[0],
              time: null,
              date: null,
              year: null
            };
            break;
          default:
            addBotMessage("I'm sorry I didn't understand that edit request. I will perform no actions. Please try again.");
            return;
        }
        
        // Validate the appointment with backend before responding
        if (editDetails) {
          validateAndRespondToEdit(editDetails);
        }
        
      } else if (intent.type === 'unknown') {
        addBotMessage("I'm sorry I didn't understand that request. I will perform no actions. Please try again.");
      }
    }
  }, [
    inputValue, 
    setInputValue, 
    setMessages, 
    pendingCancellation, 
    pendingCompletion, 
    completionStep,
    pendingEdit,
    editStep,
    executeCancelAppointment,
    executeCompleteAppointment,
    executeEditAppointment,
    collectTipAmount,
    validateAndRespondToCancellation,
    validateAndRespondToCompletion,
    validateAndRespondToEdit,
    classifyIntent,
    onTipCollected,
    onCompletionSuccess,
    onCancellationSuccess,
    onEditCategoryInput,
    onEditReasonInput,
    onEditConfirmation,
    addBotMessage
  ]);

  return {
    handleSubmit
  };
};

export default useChatInput;
