import { useCallback } from 'react';
import { convertMilitaryTo12Hour, standardizeTimeForBackend, validateTipAmount } from '../../shared';

/**
 * CompletionWorkflow component
 * Handles the appointment completion workflow
 * Extracted from ChatBot.js to improve maintainability
 */
const CompletionWorkflow = ({ 
  completionDetails, 
  onComplete, 
  onError,
  addBotMessage,
  setCompletionTip,
  setCompletionStep
}) => {
  /**
   * Validate completion request with backend before responding
   */
  const validateAndRespondToCompletion = useCallback(async () => {
    try {
      // console.log('🔍 [COMPLETION VALIDATION] Starting validation for completion request');
      // console.log('🔍 [COMPLETION VALIDATION] Client Name:', completionDetails.clientName);
      // console.log('🔍 [COMPLETION VALIDATION] Time:', completionDetails.time);
      // console.log('🔍 [COMPLETION VALIDATION] Date:', completionDetails.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(completionDetails.time);
      // console.log('🔍 [COMPLETION VALIDATION] Standardized time for backend:', standardizedTime);
      
      // Show "checking" message first
      const checkingMsg = "Let me check if that appointment exists...";
      addBotMessage(checkingMsg);
      
      // Search for the appointment in the backend (only open appointments)
      const searchParams = new URLSearchParams({
        clientName: completionDetails.clientName,
        time: standardizedTime,
        date: completionDetails.date,
        status: 'pending' // Only find open appointments
      });
      
      // Add year parameter if available
      if (completionDetails.year) {
        searchParams.append('year', completionDetails.year);
        // console.log('🔍 [COMPLETION VALIDATION] Added year parameter:', completionDetails.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      // console.log('🔍 [COMPLETION VALIDATION] Search URL:', searchUrl);
      
      const searchResponse = await fetch(searchUrl);
      // console.log('🔍 [COMPLETION VALIDATION] Search response status:', searchResponse.status);
      
      if (!searchResponse.ok) {
        // console.log('🔍 [COMPLETION VALIDATION] Search request failed with status:', searchResponse.status);
        
        if (searchResponse.status === 400) {
          try {
            const errorData = await searchResponse.json();
            const errorMsg = errorData.message || "There is something wrong with your request. Can you double-check and make the request again?";
            addBotMessage(errorMsg);
            return;
          } catch (parseError) {
            const errorMsg = "There is something wrong with your request. Can you double-check and make the request again?";
            addBotMessage(errorMsg);
            return;
          }
        } else {
          const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
          addBotMessage(errorMsg);
          return;
        }
      }
      
      const appointments = await searchResponse.json();
      // console.log('🔍 [COMPLETION VALIDATION] Parsed appointments:', appointments);
      
      if (!appointments || appointments.length === 0) {
        // console.log('🔍 [COMPLETION VALIDATION] No open appointments found in search results');
        const notFoundMsg = "Sorry, I couldn't find an open appointment for that client at that time. It may have already been completed or doesn't exist.";
        addBotMessage(notFoundMsg);
        return;
      }
      
      // Appointment found! Store details and ask for tip
      const appointment = appointments[0];
      // console.log('🔍 [COMPLETION VALIDATION] Found appointment:', appointment);
      
      // Store the completion details for later execution
      onComplete({
        ...completionDetails,
        appointment: appointment
      });
      setCompletionStep(1); // Move to tip collection step
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      const tipRequestMsg = `I found an appointment for ${appointment.client} at ${displayTime} on ${appointment.date}. To complete it, I need the tip amount:`;
      addBotMessage(tipRequestMsg);
      
      const tipInstructionsMsg = "What was the tip amount? (You can say 0, none, or the dollar amount)";
      addBotMessage(tipInstructionsMsg);
      
    } catch (error) {
      console.error('🔍 [COMPLETION VALIDATION] Error during validation:', error);
      
      const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
      addBotMessage(errorMsg);
      onError(error);
    }
  }, [completionDetails, addBotMessage, onComplete, onError, setCompletionStep]);

  /**
   * Collect tip amount for completion
   */
  const collectTipAmount = useCallback((userInput) => {
    try {
      const validation = validateTipAmount(userInput);
      
      if (!validation.isValid) {
        const botMsg = validation.message;
        addBotMessage(botMsg);
        return;
      }
      
      // Tip is valid, store it and move to confirmation
      setCompletionTip(validation.amount);
      setCompletionStep(2); // Move to confirmation step
      
      const tipText = validation.amount === 0 ? 'no tip' : `tip: $${validation.amount.toFixed(2)}`;
      const confirmMsg = `Perfect! I'll complete the appointment with ${tipText}. Type 'yes' to confirm.`;
      addBotMessage(confirmMsg);
      
    } catch (error) {
      console.error('🔍 [COMPLETION] Error collecting tip:', error);
      
      const errorMsg = "Sorry, I encountered an error while processing the tip. Please try again.";
      addBotMessage(errorMsg);
    }
  }, [addBotMessage, setCompletionTip, setCompletionStep]);

  /**
   * Execute appointment completion
   */
  const executeCompleteAppointment = useCallback(async (pendingCompletion, completionTip) => {
    try {
      // console.log('🔍 [COMPLETION] Starting appointment completion process');
      
      if (!pendingCompletion) {
        // console.log('🔍 [COMPLETION] No pending completion details found');
        const errorMsg = "I don't have any appointment details to complete. Please try requesting the completion again.";
        addBotMessage(errorMsg);
        return;
      }

      // console.log('🔍 [COMPLETION] Pending completion details:', pendingCompletion);
      // console.log('🔍 [COMPLETION] Tip amount:', completionTip);
      
      // Find the appointment to complete
      const appointment = pendingCompletion.appointment;
      // console.log('🔍 [COMPLETION] Appointment to complete:', appointment);
      
      // Complete the appointment with tip
      const completeUrl = `/api/appointments/${appointment.id}/complete`;
      // console.log('🔍 [COMPLETION] Complete URL:', completeUrl);
      
      const completeResponse = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tip: completionTip
        })
      });
      
      // console.log('🔍 [COMPLETION] Complete response status:', completeResponse.status);
      
      if (!completeResponse.ok) {
        // console.log('🔍 [COMPLETION] Complete request failed with status:', completeResponse.status);
        throw new Error('Failed to complete appointment');
      }
      
      // console.log('🔍 [COMPLETION] Complete request successful');
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Success! Show success message
      const tipText = completionTip === 0 ? 'no tip' : `tip: $${completionTip.toFixed(2)}`;
      const successMessage = `I successfully completed the appointment for ${appointment.client} at ${displayTime} on ${appointment.date} with ${tipText}.`;
      // console.log('🔍 [COMPLETION] Success message:', successMessage);
      
      addBotMessage(successMessage);
      
      // Clear completion state
      onComplete(null);
      
      // Show redirecting message and delay navigation
      const redirectMsg = `Redirecting to appointments page for ${appointment.date}...`;
      addBotMessage(redirectMsg);
      
      // Navigate to Manage Appointments page after 2.5 seconds
      setTimeout(() => {
        // console.log('🔄 Navigating to appointments page for date:', appointment.date);
        const appointmentsUrl = `/appointments?date=${appointment.date}`;
        window.location.href = appointmentsUrl;
      }, 2500);
      
    } catch (error) {
      console.error('🔍 [COMPLETION] Error executing completion:', error);
      
      const errorMsg = "Sorry, I encountered an error while trying to complete the appointment. Please try again.";
      addBotMessage(errorMsg);
      onError(error);
    }
  }, [addBotMessage, onComplete, onError]);

  return {
    validateAndRespondToCompletion,
    collectTipAmount,
    executeCompleteAppointment
  };
};

export default CompletionWorkflow;
