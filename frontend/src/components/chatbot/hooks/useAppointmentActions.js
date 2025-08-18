import { useCallback } from 'react';
import { convertMilitaryTo12Hour, standardizeTimeForBackend, validateTipAmount } from '../../../shared';

/**
 * Custom hook for appointment-related actions
 * Extracted from ChatBot.js to improve maintainability
 */
const useAppointmentActions = () => {
  /**
   * Execute appointment cancellation
   */
  const executeCancelAppointment = useCallback(async (pendingCancellation) => {
    try {
      // console.log('🔍 [CANCELLATION] Starting appointment cancellation process');
      
      if (!pendingCancellation) {
        // console.log('🔍 [CANCELLATION] No pending cancellation details found');
        throw new Error('No appointment details to cancel');
      }

      // console.log('🔍 [CANCELLATION] Pending cancellation details:', pendingCancellation);
      
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
      
      const searchResponse = await fetch(searchUrl);
      // console.log('🔍 [CANCELLATION] Search response status:', searchResponse.status);
      
      if (!searchResponse.ok) {
        throw new Error(`Search failed with status: ${searchResponse.status}`);
      }
      
      const appointments = await searchResponse.json();
      // console.log('🔍 [CANCELLATION] Found appointments:', appointments);
      
      if (!appointments || appointments.length === 0) {
        throw new Error('No open appointments found');
      }
      
      // Delete the appointment
      const appointment = appointments[0];
      const deleteUrl = `/api/appointments/${appointment.id}`;
      // console.log('🔍 [CANCELLATION] Delete URL:', deleteUrl);
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        throw new Error(`Delete failed with status: ${deleteResponse.status}`);
      }
      
      // console.log('🔍 [CANCELLATION] Appointment deleted successfully');
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      return {
        success: true,
        message: `I successfully cancelled the appointment for ${appointment.client} at ${displayTime} on ${appointment.date}.`,
        appointment
      };
      
    } catch (error) {
      console.error('🔍 [CANCELLATION] Error during cancellation:', error);
      throw error;
    }
  }, []);

  /**
   * Execute appointment completion
   */
  const executeCompleteAppointment = useCallback(async (pendingCompletion, completionTip) => {
    try {
      console.log('🔍 [COMPLETION] Starting appointment completion process');
      
      if (!pendingCompletion) {
        console.log('🔍 [COMPLETION] No pending completion details found');
        throw new Error('No appointment details to complete');
      }

      console.log('🔍 [COMPLETION] Pending completion details:', pendingCompletion);
      console.log('🔍 [COMPLETION] Tip amount:', completionTip);
      
      // Find the appointment to complete
      const appointment = pendingCompletion.appointment;
      console.log('🔍 [COMPLETION] Appointment to complete:', appointment);
      
      // Complete the appointment with tip
      const completeUrl = `/api/appointments/${appointment.id}/complete`;
      console.log('🔍 [COMPLETION] Complete URL:', completeUrl);
      
      const completeResponse = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tip: completionTip
        })
      });
      
      console.log('🔍 [COMPLETION] Complete response status:', completeResponse.status);
      
      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        console.log('🔍 [COMPLETION] Complete error response:', errorText);
        throw new Error('Failed to complete appointment');
      }
      
      console.log('🔍 [COMPLETION] Complete request successful');
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Success! Show success message
      const tipText = completionTip === 0 ? 'no tip' : `tip: $${completionTip.toFixed(2)}`;
      const successMessage = `I successfully completed the appointment for ${appointment.client} at ${displayTime} on ${appointment.date} with ${tipText}.`;
      console.log('🔍 [COMPLETION] Success message:', successMessage);
      
      return {
        success: true,
        message: successMessage,
        appointment
      };
      
    } catch (error) {
      console.error('🔍 [COMPLETION] Error executing completion:', error);
      throw error;
    }
  }, []);

  /**
   * Collect and validate tip amount
   */
  const collectTipAmount = useCallback((userInput) => {
    try {
      const validation = validateTipAmount(userInput);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message
        };
      }
      
      // Tip is valid
      return {
        success: true,
        amount: validation.amount,
        message: `Tip amount set to: ${validation.amount === 0 ? 'no tip' : `$${validation.amount.toFixed(2)}`}`
      };
      
    } catch (error) {
      console.error('🔍 [COMPLETION] Error collecting tip:', error);
      return {
        success: false,
        message: "Sorry, I encountered an error while processing the tip. Please try again."
      };
    }
  }, []);

  return {
    executeCancelAppointment,
    executeCompleteAppointment,
    collectTipAmount
  };
};

export default useAppointmentActions;
