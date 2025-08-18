import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';
import { ChatContainer } from './chatbot/index';
import { 
  useChatState, 
  useIntentClassification, 
  useAppointmentActions,
  useChatInput 
} from './chatbot/hooks';
import { convertMilitaryTo12Hour, standardizeTimeForBackend } from '../shared';

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
        setCompletionStepState: setCompletionStep
      } = useChatState();
  
    // Use different names to avoid conflicts with existing functions
  const { classifyIntent: hookClassifyIntent } = useIntentClassification();
        // Speech functionality extracted to useSpeech hook - not currently used in this component
        const { 
        executeCancelAppointment: hookExecuteCancelAppointment,
        executeCompleteAppointment: hookExecuteCompleteAppointment,
        collectTipAmount: hookCollectTipAmount
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

  // Use the extracted executeCancelAppointment from useAppointmentActions hook
  // Old function removed - now using hookExecuteCancelAppointment

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
        const notFoundMsg = "Sorry, I couldn't find that appointment. It may have already been cancelled or doesn't exist.";
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
      
      // Search for the appointment in the backend (only open appointments)
      const searchParams = new URLSearchParams({
        clientName: completionDetails.clientName,
        time: standardizedTime,
        date: completionDetails.date,
        completed: 'false' // Only find open appointments
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
      setCompletionStep(1);
      
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

  // Helper from tip collection step to store tip and advance step
  const setTipAndAdvance = useCallback((amount) => {
    // Store tip on pendingCompletion object and advance to step 2
    setPendingCompletion(prev => prev ? { ...prev, tip: amount } : prev);
    setCompletionStep(2);
  }, [setPendingCompletion, setCompletionStep]);

  // Helper to clear completion state
  const clearCompletionState = useCallback(() => {
    setPendingCompletion(null);
    setCompletionStep(0);
  }, [setPendingCompletion, setCompletionStep]);

  // Helper to clear cancellation state
  const clearCancellationState = useCallback(() => {
    setPendingCancellation(null);
  }, [setPendingCancellation]);

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
        executeCancelAppointment: hookExecuteCancelAppointment,
        executeCompleteAppointment: hookExecuteCompleteAppointment,
        collectTipAmount: hookCollectTipAmount,
        validateAndRespondToCancellation,
        validateAndRespondToCompletion,
        classifyIntent: hookClassifyIntent,
        onTipCollected: setTipAndAdvance,
        onCompletionSuccess: clearCompletionState,
        onCancellationSuccess: clearCancellationState
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
