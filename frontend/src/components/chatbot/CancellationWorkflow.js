import React, { useCallback } from 'react';
import { convertMilitaryTo12Hour, standardizeTimeForBackend } from '../../shared';

/**
 * CancellationWorkflow component
 * Handles the appointment cancellation workflow
 * Extracted from ChatBot.js to improve maintainability
 */
const CancellationWorkflow = ({ 
  cancellationDetails, 
  onComplete, 
  onError,
  addBotMessage 
}) => {
  /**
   * Validate cancellation request with backend before responding
   */
  const validateAndRespondToCancellation = useCallback(async () => {
    try {
      // console.log('🔍 [VALIDATION] Starting validation for cancellation request');
      // console.log('🔍 [VALIDATION] Client Name:', cancellationDetails.clientName);
      // console.log('🔍 [VALIDATION] Time:', cancellationDetails.time);
      // console.log('🔍 [VALIDATION] Date:', cancellationDetails.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(cancellationDetails.time);
      // console.log('🔍 [VALIDATION] Standardized time for backend:', standardizedTime);
      
      // Show "checking" message first
      const checkingMsg = "Let me check if that appointment exists...";
      addBotMessage(checkingMsg);
      
      // Search for the appointment in the backend (only open appointments)
      const searchParams = new URLSearchParams({
        clientName: cancellationDetails.clientName,
        time: standardizedTime,
        date: cancellationDetails.date,
        completed: 'false' // Only find open appointments
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
            const errorMsg = errorData.message || "There is something wrong with your request. Can you double-check and make the request again?";
            addBotMessage(errorMsg);
            return;
          } catch (parseError) {
            const errorMsg = "There is something wrong with your request. Can you double-check and make the request again?";
            addBotMessage(errorMsg);
            return;
          }
        } else {
          const errorText = await searchResponse.text();
          // console.log('🔍 [VALIDATION] Search error response:', errorText);
          
          const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
          addBotMessage(errorMsg);
          return;
        }
      }
      
      const appointments = await searchResponse.json();
      // console.log('🔍 [VALIDATION] Parsed appointments:', appointments);
      
      if (!appointments || appointments.length === 0) {
        // console.log('🔍 [VALIDATION] No open appointments found in search results');
        const notFoundMsg = "Sorry, I couldn't find an open appointment for that client at that time. It may have already been cancelled or doesn't exist.";
        addBotMessage(notFoundMsg);
        return;
      }
      
      // Appointment found! Store details and ask for confirmation
      const appointment = appointments[0];
      // console.log('🔍 [VALIDATION] Found appointment:', appointment);
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      const confirmMsg = `I found an appointment for ${appointment.client} at ${displayTime} on ${appointment.date}. Type 'yes' to confirm cancellation.`;
      addBotMessage(confirmMsg);
      
      // Store the cancellation details for later execution
      onComplete({
        ...cancellationDetails,
        appointment: appointment
      });
      
    } catch (error) {
      console.error('🔍 [VALIDATION] Error during validation:', error);
      
      const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
      addBotMessage(errorMsg);
      onError(error);
    }
  }, [cancellationDetails, addBotMessage, onComplete, onError]);

  /**
   * Execute appointment cancellation
   */
  const executeCancelAppointment = useCallback(async (pendingCancellation) => {
    try {
      // console.log('🔍 [CANCELLATION] Starting appointment cancellation process');
      
      if (!pendingCancellation) {
        // console.log('🔍 [CANCELLATION] No pending cancellation details found');
        const errorMsg = "I don't have any appointment details to cancel. Please try requesting the cancellation again.";
        addBotMessage(errorMsg);
        return;
      }

      // console.log('🔍 [CANCELLATION] Pending cancellation details:', pendingCancellation);
      // console.log('🔍 [CANCELLATION] Client Name:', pendingCancellation.clientName);
      // console.log('🔍 [CANCELLATION] Time:', pendingCancellation.time);
      // console.log('🔍 [CANCELLATION] Date:', pendingCancellation.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(pendingCancellation.time);
      // console.log('🔍 [CANCELLATION] Standardized time for backend:', standardizedTime);
      
      // Search for the appointment in the backend (only open appointments)
      const searchParams = new URLSearchParams({
        clientName: pendingCancellation.clientName,
        time: standardizedTime,
        date: pendingCancellation.date,
        completed: 'false' // Only find open appointments
      });
      
      // Add year parameter if available
      if (pendingCancellation.year) {
        searchParams.append('year', pendingCancellation.year);
        // console.log('🔍 [CANCELLATION] Added year parameter:', pendingCancellation.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      // console.log('🔍 [CANCELLATION] Search URL:', searchUrl);
      // console.log('🔍 [CANCELLATION] Search parameters:', Object.fromEntries(searchParams));
      
      // console.log('🔍 [CANCELLATION] Making search request to backend...');
      const searchResponse = await fetch(searchUrl);
      // console.log('🔍 [CANCELLATION] Search response status:', searchResponse.status);
      // console.log('🔍 [CANCELLATION] Search response ok:', searchResponse.ok);
      
      if (!searchResponse.ok) {
        // console.log('🔍 [CANCELLATION] Search request failed with status:', searchResponse.status);
        
        if (searchResponse.status === 400) {
          // Handle 400 errors (like date parsing failures) gracefully
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
          const errorText = await searchResponse.text();
          // console.log('🔍 [CANCELLATION] Search error response:', errorText);
          
          const errorMsg = "Sorry, I encountered an error while checking for the appointment. Please try again.";
          addBotMessage(errorMsg);
          return;
        }
      }
      
      const appointments = await searchResponse.json();
      // console.log('🔍 [CANCELLATION] Found appointments:', appointments);
      
      if (!appointments || appointments.length === 0) {
        // console.log('🔍 [CANCELLATION] No open appointments found in search results');
        const notFoundMsg = "Sorry, I couldn't find an open appointment for that client at that time. It may have already been cancelled or doesn't exist.";
        addBotMessage(notFoundMsg);
        return;
      }
      
      // Delete the appointment
      const appointment = appointments[0];
      const deleteUrl = `/api/appointments/${appointment.id}`;
      // console.log('🔍 [CANCELLATION] Delete URL:', deleteUrl);
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        // console.log('🔍 [CANCELLATION] Delete request failed with status:', deleteResponse.status);
        // console.log('🔍 [CANCELLATION] Delete error response:', errorText);
        
        const errorMsg = "Sorry, I encountered an error while trying to cancel the appointment. Please try again.";
        addBotMessage(errorMsg);
        return;
      }
      
      // console.log('🔍 [CANCELLATION] Appointment deleted successfully');
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Success! Show success message
      const successMessage = `I successfully cancelled the appointment for ${appointment.client} at ${displayTime} on ${appointment.date}.`;
      // console.log('🔍 [CANCELLATION] Success message:', successMessage);
      
      addBotMessage(successMessage);
      
      // Clear cancellation state
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
      console.error('🔍 [CANCELLATION] Error during cancellation:', error);
      
      const errorMsg = "Sorry, I encountered an error while trying to cancel the appointment. Please try again.";
      addBotMessage(errorMsg);
      onError(error);
    }
  }, [addBotMessage, onComplete, onError]);

  return {
    validateAndRespondToCancellation,
    executeCancelAppointment
  };
};

export default CancellationWorkflow;
