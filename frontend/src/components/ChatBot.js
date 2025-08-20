import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';
import { ChatContainer } from './chatbot/index';
import { 
  useChatState, 
  useIntentClassification, 
  useAppointmentActions,
  useChatInput 
} from './chatbot/hooks';
import { convertMilitaryTo12Hour, standardizeTimeForBackend, calculatePayment, translateCategoryToDatabase, translateCategoryToUser, parseNaturalLanguageDate } from '../shared';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Use extracted hooks
        const { 
        messages, 
        setMessages, 
        inputValue, 
        setInputValue, 
        pendingCancellation, 
        setPendingCancellation,
        pendingCompletion,
        setPendingCompletion,
        completionTip,
        setCompletionTipState: setCompletionTip,
        completionStep,
        setCompletionStepState: setCompletionStep,
        pendingEdit,
        setPendingEdit,
        editStep,
        setEditStepState: setEditStep,
        editReason,
        setEditReasonState: setEditReason,
        clearEdit
      } = useChatState();
  
    // Use different names to avoid conflicts with existing functions
  const { classifyIntent: hookClassifyIntent } = useIntentClassification();
        // Speech functionality extracted to useSpeech hook - not currently used in this component
        const { 
        executeCancelAppointment: hookExecuteCancelAppointment,
        executeCompleteAppointment: hookExecuteCompleteAppointment,
        executeEditAppointment: hookExecuteEditAppointment,
        collectTipAmount: hookCollectTipAmount,
        searchAppointment: hookSearchAppointment
      } = useAppointmentActions();
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: `Hi! I'm your spa assistant. I can help you manage appointments. Type your requests directly. For example: "cancel appointment for test at 2:00 PM on August 19th"`,
        timestamp: new Date()
      }
    ]);
  }, [setMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to validate cancellation request with backend before responding
  const validateAndRespondToCancellation = useCallback(async (cancellationDetails) => {
    try {
      // console.log('🔍 [VALIDATION] Starting validation for cancellation request');
      // console.log('🔍 [VALIDATION] Client Name:', cancellationDetails.clientName);
      // console.log('🔍 [VALIDATION] Time:', cancellationDetails.time);
      // console.log('🔍 [VALIDATION] Date:', cancellationDetails.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(cancellationDetails.time);
      // console.log('🔍 [VALIDATION] Standardized time for backend:', standardizedTime);
      
      // Show "checking" message first
      const checkingMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Let me check if that appointment exists...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, checkingMsg]);
      
      // Search for the appointment in the backend
      const searchParams = new URLSearchParams({
        clientName: cancellationDetails.clientName,
        time: standardizedTime,
        date: cancellationDetails.date
      });
      
      // Add year parameter if available
      if (cancellationDetails.year) {
        searchParams.append('year', cancellationDetails.year);
        // console.log('🔍 [VALIDATION] Added year parameter:', cancellationDetails.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      // console.log('🔍 [VALIDATION] Search URL:', searchUrl);
      // console.log('🔍 [VALIDATION] Search parameters:', Object.fromEntries(searchParams));
      
      // console.log('🔍 [VALIDATION] Making search request to backend...');
      const searchResponse = await fetch(searchUrl);
      // console.log('🔍 [VALIDATION] Search response status:', searchResponse.status);
      // console.log('🔍 [VALIDATION] Search response ok:', searchResponse.ok);
      
      if (!searchResponse.ok) {
        // console.log('🔍 [VALIDATION] Search request failed with status:', searchResponse.status);
        
        if (searchResponse.status === 400) {
          // Handle 400 errors (like date parsing failures) gracefully
          try {
            const errorData = await searchResponse.json();
            // console.log('🔍 [VALIDATION] Search error data:', errorData);
            
            // Show user-friendly error message from backend
            const errorMsg = errorData.message || "There is something wrong with your request. Can you double-check and make the request again?";
            const botMsg = {
              id: Date.now() + 2,
              type: 'bot',
              text: errorMsg,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            return;
          } catch (parseError) {
            console.error('🔍 [VALIDATION] Failed to parse error response:', parseError);
            // Fallback to generic message if can't parse error response
            const botMsg = {
              id: Date.now() + 2,
              type: 'bot',
              text: "There is something wrong with your request. Can you double-check and make the request again?",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            return;
          }
        } else {
          // Handle other errors (500, etc.)
          const errorText = await searchResponse.text();
          // console.log('🔍 [VALIDATION] Search error response:', errorText);
          
          const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
          const botMsg = {
            id: Date.now() + 2,
            type: 'bot',
            text: errorMsg,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }
      }
      
      // console.log('🔍 [VALIDATION] Search request successful, parsing response...');
      const appointments = await searchResponse.json();
      // console.log('🔍 [VALIDATION] Parsed appointments:', appointments);
      // console.log('🔍 [VALIDATION] Appointments array length:', appointments ? appointments.length : 'null/undefined');
      
      if (!appointments || appointments.length === 0) {
        // console.log('🔍 [VALIDATION] No appointments found in search results');
        const notFoundMsg = "Sorry, I couldn't find that appointment. It may have already been cancelled, completed, or doesn't exist.";
        const botMsg = {
          id: Date.now() + 2,
          type: 'bot',
          text: notFoundMsg,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }
      
      // Appointment found! Store details and ask for confirmation
      const appointment = appointments[0]; // Take the first match
      // console.log('🔍 [VALIDATION] Found appointment:', appointment);
      
      // Store the cancellation details for later execution
      setPendingCancellation(cancellationDetails);
      
      // Convert time to 12-hour format for display (military time → 12-hour)
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Now it's safe to say "I found..." because we've actually validated it
      const foundMsg = `I found an appointment for ${appointment.client} at ${displayTime} on ${appointment.date}. Type 'yes' to cancel it.`;
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: foundMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error('🔍 [VALIDATION] Error during validation:', error);
      console.error('🔍 [VALIDATION] Error message:', error.message);
      console.error('🔍 [VALIDATION] Error stack:', error.stack);
      
      const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  }, [setMessages, setPendingCancellation]);

  // Function to validate completion request with backend before responding
  const validateAndRespondToCompletion = useCallback(async (completionDetails) => {
    try {
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(completionDetails.time);
      
      // Show "checking" message first
      const checkingMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Let me check if that appointment exists...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, checkingMsg]);
      
      // Search for appointments
      const searchParams = new URLSearchParams({
        clientName: completionDetails.clientName,
        time: standardizedTime,
        date: completionDetails.date,
        status: 'pending' // Only find open appointments
      });
      
      // Add year parameter if available
      if (completionDetails.year) {
        searchParams.append('year', completionDetails.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        if (searchResponse.status === 400) {
          try {
            const errorData = await searchResponse.json();
            const errorMsg = errorData.message || "There is something wrong with your request. Can you double-check and make the request again?";
            const botMsg = {
              id: Date.now() + 2,
              type: 'bot',
              text: errorMsg,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            return;
          } catch (parseError) {
            const errorMsg = "There is something wrong with your request. Can you double-check and make the request again?";
            const botMsg = {
              id: Date.now() + 2,
              type: 'bot',
              text: errorMsg,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            return;
          }
        } else {
          const errorText = await searchResponse.text();
          
          const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
          const botMsg = {
            id: Date.now() + 2,
            type: 'bot',
            text: errorMsg,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }
      }
      
      const appointments = await searchResponse.json();
      
      if (!appointments || appointments.length === 0) {
        const notFoundMsg = "Sorry, I couldn't find an open appointment for that client at that time. It may have already been completed or doesn't exist.";
        const botMsg = {
          id: Date.now() + 2,
          type: 'bot',
          text: notFoundMsg,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }
      
      // Appointment found! Store details and ask for tip
      const appointment = appointments[0];
      
      // Store the completion details for later execution
      setPendingCompletion({
        ...completionDetails,
        appointment: appointment
      });
      
      // Move workflow to tip collection step
      setCompletionStep(2);
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Ask for tip amount
      const tipMsg = `I found an open appointment for ${appointment.client} at ${displayTime} on ${appointment.date}. What was the tip amount? (required)`;
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: tipMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error('🔍 [COMPLETION VALIDATION] Error during validation:', error);
      
      const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  }, [setMessages, setPendingCompletion, setCompletionStep]);

  // Function to validate edit request with backend before responding
  const validateAndRespondToEdit = useCallback(async (editDetails) => {
    try {
      // Show "checking" message first
      const checkingMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Let me check if that appointment exists and can be edited...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, checkingMsg]);
      
      // Use the single search function from useAppointmentActions
      const appointment = await hookSearchAppointment(editDetails);
      
      // Appointment found! Store details and ask for new category
      setPendingEdit({
        ...editDetails,
        currentCategory: appointment.category,
        currentPayment: appointment.payment
      });
      
      // Move workflow to category selection step
      setEditStep(1);
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Ask for new category
      const categoryMsg = `I found the appointment for ${appointment.client} at ${displayTime} on ${appointment.date} for a ${appointment.category.toLowerCase()} - $${appointment.payment.toFixed(2)}. What do you want to change it to?`;
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: categoryMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error('🔍 [EDIT VALIDATION] Error during validation:', error);
      
      const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
      const botMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  }, [setMessages, setPendingEdit, setEditStep, hookSearchAppointment]);

  // Helper from tip collection step to store tip and advance step
  const setTipAndAdvance = useCallback((amount) => {
    // Store tip on pendingCompletion object and advance to step 3 (confirmation)
    setPendingCompletion(prev => prev ? { ...prev, tip: amount } : prev);
    setCompletionStep(3);
  }, [setPendingCompletion, setCompletionStep]);

  // Helper to clear cancellation state
  const clearCancellationState = useCallback(() => {
    setPendingCancellation(null);
  }, [setPendingCancellation]);

  // Helper to handle redirect after successful operations
  const handleSuccessfulRedirect = useCallback((date) => {
    // Show redirecting message
    const redirectMsg = `Redirecting to appointments page for ${date}...`;
    const redirectBotMsg = {
      id: Date.now() + 1,
      type: 'bot',
      text: redirectMsg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, redirectBotMsg]);
    
    // Navigate to Manage Appointments page after 2.5 seconds
    setTimeout(() => {
      // Convert natural language date to proper date format for URL
      let formattedDate = date;
      try {
        const parsedDate = parseNaturalLanguageDate(date);
        formattedDate = parsedDate.formattedDate; // This will be YYYY-MM-DD format
      } catch (error) {
        console.warn('Could not parse date for redirect, using original:', date);
      }
      
      const appointmentsUrl = `/appointments?date=${formattedDate}`;
      window.location.href = appointmentsUrl;
    }, 2500);
  }, [setMessages]);

  // Helper to handle successful cancellation confirmation
  const handleCancellationSuccess = useCallback(async (isConfirmed) => {
    if (!isConfirmed) {
      const cancelMsg = "Cancellation cancelled. The appointment remains unchanged.";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: cancelMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      clearCancellationState();
      return;
    }
    
    try {
      // Execute the cancellation
      const result = await hookExecuteCancelAppointment(pendingCancellation);
      
      // Show success message
      const successMsg = result.message;
      const successBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: successMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successBotMsg]);
      
      // Handle redirect after successful cancellation
      handleSuccessfulRedirect(pendingCancellation.date);
      
      clearCancellationState();
      
    } catch (error) {
      console.error('Cancellation execution error:', error);
      
      const errorMsg = `Sorry, I couldn't cancel the appointment: ${error.message}`;
      const errorBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMsg]);
      
      clearCancellationState();
    }
  }, [pendingCancellation, setMessages, clearCancellationState, hookExecuteCancelAppointment, handleSuccessfulRedirect]);

  // Helper to clear completion state
  const clearCompletionState = useCallback(() => {
    setPendingCompletion(null);
    setCompletionTip(null);
    setCompletionStep(0);
  }, [setPendingCompletion, setCompletionTip, setCompletionStep]);

  // Helper to handle successful completion confirmation
  const handleCompletionSuccess = useCallback(async (isConfirmed) => {
    if (!isConfirmed) {
      const cancelMsg = "Completion cancelled. The appointment remains unchanged.";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: cancelMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      clearCompletionState();
      return;
    }
    
    try {
      // Execute the completion
      const result = await hookExecuteCompleteAppointment(pendingCompletion, pendingCompletion?.tip);
      
      // Show success message
      const successMsg = result.message;
      const successBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: successMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successBotMsg]);
      
      // Handle redirect after successful completion
      handleSuccessfulRedirect(pendingCompletion.date);
      
      clearCompletionState();
      
    } catch (error) {
      console.error('Completion execution error:', error);
      
      const errorMsg = `Sorry, I couldn't complete the appointment: ${error.message}`;
      const errorBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMsg]);
      
      clearCompletionState();
    }
  }, [pendingCompletion, setMessages, clearCompletionState, hookExecuteCompleteAppointment, handleSuccessfulRedirect]);

  // Helper to clear edit state
  const clearEditState = useCallback(() => {
    setPendingEdit(null);
    setEditStep(0);
    setEditReason('');
  }, [setPendingEdit, setEditStep, setEditReason]);

  // Helper to handle category input and advance to reason step
  const handleCategoryInput = useCallback((category) => {
    setPendingEdit(prev => prev ? { ...prev, newCategory: category } : prev);
    setEditStep(2);
    
    // Ask for cancellation reason
    const reasonMsg = "Is there a change reason? You can say 'no' or 'none', or enter a reason.";
    const botMsg = {
      id: Date.now() + 1,
      type: 'bot',
      text: reasonMsg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
  }, [setPendingEdit, setEditStep, setMessages]);

  // Helper to handle reason input and advance to confirmation step
  const handleReasonInput = useCallback((reason) => {
    setEditReason(reason);
    setEditStep(3);
    
    // Calculate new payment and show confirmation
    const dbCategory = translateCategoryToDatabase(pendingEdit?.newCategory);
    const newPayment = calculatePayment(dbCategory);
    
    setPendingEdit(prev => prev ? { ...prev, newPayment, reason } : prev);
    
    const oldCategory = translateCategoryToUser(pendingEdit?.currentCategory);
    const newCategory = pendingEdit?.newCategory;
    const oldPayment = pendingEdit?.currentPayment;
    
    const confirmationMsg = `Perfect! I'll change ${pendingEdit?.clientName}'s appointment from ${oldCategory} to ${newCategory}. The payment will automatically update from $${oldPayment?.toFixed(2)} to $${newPayment.toFixed(2)}.

Type 'yes' to confirm this change, or 'no' to cancel.`;
    
    const botMsg = {
      id: Date.now() + 1,
      type: 'bot',
      text: confirmationMsg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
  }, [setEditReason, setEditStep, setMessages, setPendingEdit, pendingEdit]);

  // Helper to handle edit confirmation and execute
  const handleEditConfirmation = useCallback(async (isConfirmed) => {
    if (!isConfirmed) {
      const cancelMsg = "Edit cancelled. The appointment remains unchanged.";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: cancelMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      clearEditState();
      return;
    }
    
    try {
      setEditStep(4); // Move to execution step
      
      const executingMsg = "Updating the appointment...";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: executingMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
      const result = await hookExecuteEditAppointment(pendingEdit);
      
      const successMsg = result.message;
      const successBotMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: successMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successBotMsg]);
      
      // Handle redirect after successful edit
      handleSuccessfulRedirect(pendingEdit.date);
      
      clearEditState();
      
    } catch (error) {
      console.error('Edit execution error:', error);
      
      const errorMsg = `Sorry, I couldn't update the appointment: ${error.message}`;
      const errorBotMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMsg]);
      
      clearEditState();
    }
  }, [pendingEdit, setEditStep, setMessages, clearEditState, hookExecuteEditAppointment, handleSuccessfulRedirect]);

  // Add the useChatInput hook after all functions are defined
      const { handleSubmit: hookHandleSubmit } = useChatInput({
        inputValue,
        setInputValue,
        setMessages,
        pendingCancellation,
        setPendingCancellation,
        pendingCompletion,
        setPendingCompletion,
        completionStep,
        setCompletionStep,
        pendingEdit,
        editStep,
        executeCancelAppointment: hookExecuteCancelAppointment,
        executeCompleteAppointment: hookExecuteCompleteAppointment,
        executeEditAppointment: hookExecuteEditAppointment,
        collectTipAmount: hookCollectTipAmount,
        validateAndRespondToCancellation,
        validateAndRespondToCompletion,
        validateAndRespondToEdit,
        classifyIntent: hookClassifyIntent,
        onTipCollected: setTipAndAdvance,
        onCompletionSuccess: handleCompletionSuccess,
        onCancellationSuccess: handleCancellationSuccess,
        onEditCategoryInput: handleCategoryInput,
        onEditReasonInput: handleReasonInput,
        onEditConfirmation: handleEditConfirmation
      });



  // All utility functions and patterns are now imported from shared utilities

  // Use the extracted classifyIntent from useIntentClassification hook
  // Old function removed - now using hookClassifyIntent

  // Use the extracted handleSubmit from useChatInput hook
  // Old function removed - now using hookHandleSubmit

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <ChatContainer 
          messages={messages}
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSubmit={hookHandleSubmit}
          onClose={() => setIsOpen(false)}
          messagesEndRef={messagesEndRef}
        />
      )}
    </>
  );
};

export default ChatBot;
