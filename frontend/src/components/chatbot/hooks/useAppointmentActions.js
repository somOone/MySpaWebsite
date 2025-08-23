import { useCallback } from 'react';
import moment from 'moment';
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
      
      // Search for appointments
      const searchParams = new URLSearchParams({
        clientName: pendingCancellation.clientName,
        time: standardizedTime,
        date: pendingCancellation.date,
        status: 'pending' // Only find open appointments
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
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(pendingCompletion.time);
      console.log('🔍 [COMPLETION] Standardized time for backend:', standardizedTime);
      
      // Search for appointments
      const searchParams = new URLSearchParams({
        clientName: pendingCompletion.clientName,
        time: standardizedTime,
        date: pendingCompletion.date,
        status: 'pending' // Only find open appointments
      });
      
      // Add year parameter if available
      if (pendingCompletion.year) {
        searchParams.append('year', pendingCompletion.year);
        console.log('🔍 [COMPLETION] Added year parameter:', pendingCompletion.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      console.log('🔍 [COMPLETION] Search URL:', searchUrl);
      
      const searchResponse = await fetch(searchUrl);
      console.log('🔍 [COMPLETION] Search response status:', searchResponse.status);
      
      if (!searchResponse.ok) {
        throw new Error(`Search failed with status: ${searchResponse.status}`);
      }
      
      const appointments = await searchResponse.json();
      console.log('🔍 [COMPLETION] Found appointments:', appointments);
      
      if (!appointments || appointments.length === 0) {
        throw new Error('No open appointments found');
      }
      
      // Complete the appointment
      const appointment = appointments[0];
      
      // Add time validation before allowing completion
      const now = moment();
      const appointmentDate = moment(appointment.date);
      const appointmentTime = moment(`${appointment.date} ${appointment.time}`, 'YYYY-MM-DD h:mm A');
      const appointmentEndTime = moment(appointmentTime).add(1, 'hour');
      
      if (appointmentDate.isAfter(now, 'day')) {
        throw new Error('Future appointments cannot be completed');
      }
      
      if (appointmentDate.isSame(now, 'day') && now.isBefore(appointmentEndTime)) {
        throw new Error(`Appointment cannot be completed until it has finished (at ${appointmentEndTime.format('h:mm A')})`);
      }
      
      const completeUrl = `/api/appointments/${appointment.id}/complete`;
      console.log('🔍 [COMPLETION] Complete URL:', completeUrl);
      
      const completeResponse = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tip: completionTip || 0
        })
      });
      
      if (!completeResponse.ok) {
        throw new Error(`Complete failed with status: ${completeResponse.status}`);
      }
      
      console.log('🔍 [COMPLETION] Appointment completed successfully');
      
      // Convert time to 12-hour format for display
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      return {
        success: true,
        message: `I successfully completed the appointment for ${appointment.client} at ${displayTime} on ${appointment.date}.`,
        appointment
      };
      
    } catch (error) {
      console.error('🔍 [COMPLETION] Error during completion:', error);
      throw error;
    }
  }, []);

  /**
   * Execute appointment editing
   */
  const executeEditAppointment = useCallback(async (pendingEdit) => {
    try {
      console.log('🔍 [EDIT] Starting appointment edit process');
      
      if (!pendingEdit) {
        console.log('🔍 [EDIT] No pending edit details found');
        throw new Error('No appointment details to edit');
      }

      console.log('🔍 [EDIT] Pending edit details:', pendingEdit);
      
      // 1. Validate appointment exists and is editable
      const appointment = await validateAppointmentForEdit(pendingEdit);
      
      // 2. Translate user-friendly category to database format
      const dbCategory = translateCategoryToDatabase(pendingEdit.newCategory);
      
      // 3. Calculate new payment based on translated category
      const newPayment = calculatePayment(dbCategory);
      
      // 4. Execute the edit via existing PUT endpoint
      const editResponse = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: dbCategory,
          payment: newPayment,
          update_reason: pendingEdit.reason || 'Edited via ChatBot'
        })
      });
      
      if (!editResponse.ok) {
        throw new Error(`Edit failed: ${editResponse.status}`);
      }
      
      // 5. Return success with updated details (using user-friendly terms)
      const userFriendlyCategory = translateCategoryToUser(dbCategory);
      return {
        success: true,
        message: `I successfully updated the appointment for ${appointment.client} from ${translateCategoryToUser(appointment.category)} to ${userFriendlyCategory}. The payment has been updated to $${newPayment.toFixed(2)}.`,
        appointment: { ...appointment, category: dbCategory, payment: newPayment }
      };
      
    } catch (error) {
      console.error('🔍 [EDIT] Error during edit:', error);
      throw error;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Single search function for appointments - used by both validation and execution
   */
  const searchAppointment = async (searchDetails) => {
    console.log('🔍 [SEARCH] Input time:', searchDetails.time);
    
    // Test the function directly
    console.log('🔍 [SEARCH] Function test - standardizeTimeForBackend("2 PM"):', standardizeTimeForBackend("2 PM"));
    
    // Standardize time format for backend (convert 12-hour to 24-hour)
    const standardizedTime = standardizeTimeForBackend(searchDetails.time);
    console.log('🔍 [SEARCH] Standardized time:', standardizedTime);
    
    const searchParams = new URLSearchParams({
      clientName: searchDetails.clientName,
      time: standardizedTime,
      date: searchDetails.date,
      status: 'pending' // Only pending appointments can be edited
    });
    
    console.log('🔍 [SEARCH] Search params:', Object.fromEntries(searchParams));
    
    // Add year parameter if available
    if (searchDetails.year) {
      searchParams.append('year', searchDetails.year);
    }
    
    const searchResponse = await fetch(`/api/appointments/search?${searchParams}`);
    if (!searchResponse.ok) {
      throw new Error('Failed to search for appointment');
    }
    
    const appointments = await searchResponse.json();
    if (!appointments || appointments.length === 0) {
      throw new Error('No pending appointment found for editing');
    }
    
    return appointments[0];
  };

  /**
   * Validate appointment for editing
   */
  const validateAppointmentForEdit = async (pendingEdit) => {
    // Use the single search function
    const appointment = await searchAppointment(pendingEdit);
    
    // Validate category change is valid (using translated category)
    const dbCategory = translateCategoryToDatabase(pendingEdit.newCategory);
    const validCategories = ['Facial', 'Massage', 'Facial + Massage'];
    if (!validCategories.includes(dbCategory)) {
      throw new Error(`Invalid category: ${pendingEdit.newCategory}`);
    }
    
    return appointment;
  };

  /**
   * Calculate payment based on category
   */
  const calculatePayment = (category) => {
    const prices = {
      'Facial': 100.00,
      'Massage': 120.00,
      'Facial + Massage': 200.00
    };
    return prices[category] || 0;
  };

  /**
   * Translate user-friendly category to database format
   */
  const translateCategoryToDatabase = (userCategory) => {
    const normalized = userCategory.toLowerCase().trim();
    const translations = {
      'combo': 'Facial + Massage',
      'facial': 'Facial',
      'massage': 'Massage',
      'facial + massage': 'Facial + Massage',
      'facial and massage': 'Facial + Massage'
    };
    
    return translations[normalized] || userCategory;
  };

  /**
   * Translate database category to user-friendly format
   */
  const translateCategoryToUser = (dbCategory) => {
    const translations = {
      'Facial + Massage': 'combo',
      'Facial': 'facial',
      'Massage': 'massage'
    };
    
    return translations[dbCategory] || dbCategory;
  };

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
    executeEditAppointment,
    collectTipAmount,
    searchAppointment
  };
};

export default useAppointmentActions;
