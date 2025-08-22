import { useCallback, useRef } from 'react';
import { validateTipAmount, parseNaturalLanguageDate } from '../../../shared';
import moment from 'moment';

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
  pendingExpenseEdit,
  pendingExpenseDelete,
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
  onExpenseEditConfirmation,
  onExpenseDeleteConfirmation
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
    
    // Handle expense edit confirmation
    if (pendingExpenseEdit) {
      if (userMessage.toLowerCase().includes('yes')) {
        // User confirmed, execute the edit
        try {
          const updateResponse = await fetch(`/api/expenses/${pendingExpenseEdit.expenseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: pendingExpenseEdit.newAmount })
          });
          
          if (updateResponse.ok) {
            addBotMessage(`✅ Expense amount updated successfully from $${pendingExpenseEdit.currentAmount.toFixed(2)} to $${pendingExpenseEdit.newAmount.toFixed(2)}!`);
            
            // Add redirect message with delay
            setTimeout(() => {
              addBotMessage("Redirecting to the expense tracking page...");
              
              // Redirect after additional delay with expense ID for expansion
              setTimeout(() => {
                window.location.href = `/expenses?expandExpense=${pendingExpenseEdit.expenseId}`;
              }, 2500);
            }, 1000);
          } else {
            addBotMessage("❌ Failed to update expense amount. Please try again.");
          }
        } catch (error) {
          addBotMessage("❌ Error updating expense. Please try again.");
        }
        
        // Clear the pending expense edit
        if (onExpenseEditConfirmation) {
          onExpenseEditConfirmation(null);
        }
        return;
      } else if (userMessage.toLowerCase().includes('no')) {
        addBotMessage("Expense update cancelled. No changes were made.");
        
        // Clear the pending expense edit
        if (onExpenseEditConfirmation) {
          onExpenseEditConfirmation(null);
        }
        return;
      } else {
        addBotMessage("Please type 'yes' to confirm or 'no' to cancel.");
        return;
      }
    }
    
    // Handle expense deletion confirmation
    console.log('🔍 [EXPENSE DELETE CONFIRMATION] Checking pendingExpenseDelete:', pendingExpenseDelete);
    if (pendingExpenseDelete) {
      console.log('🔍 [EXPENSE DELETE CONFIRMATION] Processing confirmation for expense:', pendingExpenseDelete.expense);
      if (userMessage.toLowerCase().includes('yes')) {
        // User confirmed, execute the deletion
        try {
          const deleteResponse = await fetch(`/api/expenses/${pendingExpenseDelete.expenseId}`, {
            method: 'DELETE'
          });
          
          if (deleteResponse.ok) {
            addBotMessage(`✅ Expense "${pendingExpenseDelete.expense.description}" for $${pendingExpenseDelete.expense.amount.toFixed(2)} has been deleted successfully!`);
            
            // Add redirect message with delay
            setTimeout(() => {
              addBotMessage("Redirecting to the expense tracking page...");
              
              // Redirect after additional delay with current month expansion
              setTimeout(() => {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
                window.location.href = `/expenses?expandYear=${currentYear}&expandMonth=${currentMonth}`;
              }, 2500);
            }, 1000);
          } else {
            addBotMessage("❌ Failed to delete expense. Please try again.");
          }
        } catch (error) {
          addBotMessage("❌ Error deleting expense. Please try again.");
        }
        
        // Clear the pending expense deletion
        if (onExpenseDeleteConfirmation) {
          onExpenseDeleteConfirmation(null);
        }
        return;
      } else if (userMessage.toLowerCase().includes('no')) {
        addBotMessage("Expense deletion cancelled. No changes were made.");
        
        // Clear the pending expense deletion
        if (onExpenseDeleteConfirmation) {
          onExpenseDeleteConfirmation(null);
        }
        return;
      } else {
        addBotMessage("Please type 'yes' to confirm or 'no' to cancel.");
        return;
      }
    }
    
    // Only classify intent when NOT in an active workflow
    if (!pendingCancellation && !pendingCompletion && !pendingEdit && !pendingExpenseEdit && !pendingExpenseDelete) {
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
        
      } else if (intent.type === 'edit_expense') {
        // Handle expense editing with specific change - following natural English grammar
        const searchTerm = intent.groups[0];
        const searchDate = intent.groups[1];
        const searchYear = intent.groups[2];
        const changeInfo = intent.groups[3];
        
        // Debug logging
        console.log('🔍 [EXPENSE EDIT] Intent groups:', intent.groups);
        console.log('🔍 [EXPENSE EDIT] Search term:', searchTerm);
        console.log('🔍 [EXPENSE EDIT] Search date:', searchDate);
        console.log('🔍 [EXPENSE EDIT] Search year:', searchYear);
        console.log('🔍 [EXPENSE EDIT] Change info:', changeInfo);
        
        // Search for the expense with date (like appointments)
        try {
          const searchParams = new URLSearchParams({
            description: searchTerm
          });
          
          // Add date parameters if available (following appointment search pattern)
          if (searchDate) {
            const dateString = searchDate + (searchYear ? ' ' + searchYear : '');
            console.log('🔍 [EXPENSE EDIT] Date string for parsing:', dateString);
            const parsedDate = parseNaturalLanguageDate(dateString, searchYear);
            console.log('🔍 [EXPENSE EDIT] Parsed date:', parsedDate);
            if (parsedDate) {
              searchParams.append('date', parsedDate.formattedDate);
              console.log('🔍 [EXPENSE EDIT] Added date parameter:', parsedDate.formattedDate);
            }
          }
          
          if (searchYear) {
            searchParams.append('year', searchYear);
          }
          
          const searchUrl = `/api/expenses/search?${searchParams}`;
          console.log('🔍 [EXPENSE EDIT] Search URL:', searchUrl);
          console.log('🔍 [EXPENSE EDIT] Search parameters:', Object.fromEntries(searchParams));
          const searchResponse = await fetch(searchUrl);
          
          if (!searchResponse.ok) {
            addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
            return;
          }
          
          const expenses = await searchResponse.json();
          
          if (!expenses || expenses.length === 0) {
            addBotMessage(`I couldn't find any expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please try a different description or date.`);
            return;
          }
          
          if (expenses.length > 1) {
            addBotMessage(`I found ${expenses.length} expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please be more specific or add a date.`);
            return;
          }
          
          // Found the expense, now handle the edit
          const expense = expenses[0];
          
          // Determine what field to edit based on the change info
          if (changeInfo.includes('$') || !isNaN(parseFloat(changeInfo))) {
            // Amount change - handle via chatbot
            const newAmount = parseFloat(changeInfo.replace('$', ''));
            if (isNaN(newAmount)) {
              addBotMessage("Please provide a valid amount (e.g., $50.00 or 50.00).");
              return;
            }
            
            // Show confirmation message
            addBotMessage(`I found the expense: "${expense.description}" for $${expense.amount.toFixed(2)} on ${moment(expense.date).format('MMMM DD, YYYY')}. Are you sure you want to change the amount to $${newAmount.toFixed(2)}? Type 'yes' to confirm or 'no' to cancel.`);
            
            // Set pending expense edit state for confirmation
            if (onExpenseEditConfirmation) {
              onExpenseEditConfirmation({
                expenseId: expense.id,
                currentAmount: expense.amount,
                newAmount: newAmount,
                expense: expense
              });
            }
            return;
          } else {
            // Description or category change - redirect to inline editing
            addBotMessage(`I found the expense: "${expense.description}" for $${expense.amount.toFixed(2)} on ${moment(expense.date).format('MMMM DD, YYYY')}. Redirecting you to edit this expense...`);
            
            // Redirect to inline editing after a delay
            setTimeout(() => {
              window.location.href = `/expenses?editExpense=${expense.id}`;
            }, 2000);
            return;
          }
          
        } catch (error) {
          console.error('Error searching for expense:', error);
          addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
        }
        
      } else if (intent.type === 'edit_expense_inline') {
        // Handle expense editing without specific change - redirect to inline editing
        const searchTerm = intent.groups[0];
        const searchDate = intent.groups[1];
        const searchYear = intent.groups[2];
        
        // Debug logging
        console.log('🔍 [EXPENSE EDIT INLINE] Intent groups:', intent.groups);
        console.log('🔍 [EXPENSE EDIT INLINE] Search term:', searchTerm);
        console.log('🔍 [EXPENSE EDIT INLINE] Search date:', searchDate);
        console.log('🔍 [EXPENSE EDIT INLINE] Search year:', searchYear);
        
        // Search for the expense with date (like appointments)
        try {
          const searchParams = new URLSearchParams({
            description: searchTerm
          });
          
          // Add date parameters if available (following appointment search pattern)
          if (searchDate) {
            const dateString = searchDate + (searchYear ? ' ' + searchYear : '');
            console.log('🔍 [EXPENSE EDIT INLINE] Date string for parsing:', dateString);
            const parsedDate = parseNaturalLanguageDate(dateString, searchYear);
            console.log('🔍 [EXPENSE EDIT INLINE] Parsed date:', parsedDate);
            if (parsedDate) {
              searchParams.append('date', parsedDate.formattedDate);
              console.log('🔍 [EXPENSE EDIT INLINE] Added date parameter:', parsedDate.formattedDate);
            }
          }
          
          if (searchYear) {
            searchParams.append('year', searchYear);
          }
          
          const searchUrl = `/api/expenses/search?${searchParams}`;
          console.log('🔍 [EXPENSE EDIT INLINE] Search URL:', searchUrl);
          console.log('🔍 [EXPENSE EDIT INLINE] Search parameters:', Object.fromEntries(searchParams));
          const searchResponse = await fetch(searchUrl);
          
          if (!searchResponse.ok) {
            addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
            return;
          }
          
          const expenses = await searchResponse.json();
          
          if (!expenses || expenses.length === 0) {
            addBotMessage(`I couldn't find any expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please try a different description or date.`);
            return;
          }
          
          if (expenses.length > 1) {
            addBotMessage(`I found ${expenses.length} expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please be more specific or add a date.`);
            return;
          }
          
          // Found the expense, redirect to inline editing
          const expense = expenses[0];
          addBotMessage(`I found the expense: "${expense.description}" for $${expense.amount.toFixed(2)} on ${moment(expense.date).format('MMMM DD, YYYY')}. Redirecting you to edit this expense...`);
          
          // Redirect to inline editing after a delay
          setTimeout(() => {
            window.location.href = `/expenses?editExpense=${expense.id}`;
          }, 2000);
          return;
          
        } catch (error) {
          console.error('Error searching for expense:', error);
          addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
        }
        
      } else if (intent.type === 'help_general') {
        // Handle general help request
        addBotMessage("I can help you with appointments and expenses. Ask me specific questions like:");
        addBotMessage("• 'How can I add a new appointment?'");
        addBotMessage("• 'How can I change an expense?'");
        addBotMessage("• 'How can I see today's appointments?'");
        addBotMessage("• 'How can I cancel an appointment?'");
        addBotMessage("Just ask 'How can I...' and I'll show you the exact commands to use!");
        addBotMessage("💡 **NEW**: I'm now powered by AI training! Try saying things naturally like 'I need to schedule a session' or 'Can you log this expense?'");
        return;
        
      } else if (intent.type === 'how_to_add_appointment') {
        // Handle how to add appointment question
        addBotMessage("To add a new appointment, say 'book a new appointment' or 'I want to book an appointment'. I'll open the booking form for you.");
        return;
        
      } else if (intent.type === 'how_to_change_appointment') {
        // Handle how to change appointment question
        addBotMessage("To change an appointment, say 'change appointment for [client name] at [time] on [date]'. For example: 'change appointment for Sarah at 3:00 PM on August 21st'. I'll then ask you what you want to change it to.");
        return;
        
      } else if (intent.type === 'how_to_cancel_appointment') {
        // Handle how to cancel appointment question
        addBotMessage("To cancel an appointment, say 'cancel appointment for [client name] at [time] on [date]'. For example: 'cancel appointment for John at 2:00 PM on August 19th'.");
        return;
        
      } else if (intent.type === 'how_to_complete_appointment') {
        // Handle how to complete appointment question
        addBotMessage("To complete an appointment, say 'complete appointment for [client name] at [time] on [date]'. I'll ask for the tip amount and mark it as completed.");
        return;
        
      } else if (intent.type === 'how_to_see_appointments') {
        // Handle how to see appointments question
        addBotMessage("To see today's appointments, say 'show my appointments for today'. I'll open the appointments page with today's schedule expanded and focused.");
        return;
        
      } else if (intent.type === 'how_to_add_expense') {
        // Handle how to add expense question
        addBotMessage("To add a new expense, say 'add a new expense' or 'I want to add a new expense'. I'll open the expense form for you.");
        return;
        
      } else if (intent.type === 'how_to_change_expense') {
        // Handle how to change expense question
        addBotMessage("There are TWO ways to change an expense:");
        addBotMessage("1. **Change just the amount**: Say 'change expense [description] on [date] to [new amount]'. For example: 'change expense cleaning supplies on August 21st to $50.00'. I'll update the amount directly.");
        addBotMessage("2. **Change multiple fields**: Say 'change expense [description] on [date]' (without specifying what to change). For example: 'change expense cleaning supplies on August 21st'. I'll redirect you to the inline editing form where you can change amount, date, description, and category.");
        return;
        
      } else if (intent.type === 'how_to_delete_expense') {
        // Handle how to delete expense question
        addBotMessage("To delete an expense, say 'delete expense [description] on [date]'. For example: 'delete expense office supplies on March 15th'.");
        return;
        
      } else if (intent.type === 'show_today_appointments') {
        // Handle showing today's appointments - redirect to appointments page
        addBotMessage("I'll show you your appointments for today. Opening the appointments page...");
        
        // Redirect to appointments page - it will auto-expand and focus on today
        setTimeout(() => {
          window.location.href = `/appointments`;
        }, 2000);
        return;
        
      } else if (intent.type === 'show_appointments') {
        // Handle showing all appointments - redirect to appointments page
        addBotMessage("I'll show you your appointments. Opening the appointments page...");
        
        // Redirect to appointments page
        setTimeout(() => {
          window.location.href = `/appointments`;
        }, 2000);
        return;
        
      } else if (intent.type === 'book_appointment') {
        // Handle appointment booking - redirect to home page with booking modal open
        addBotMessage("I'll help you book a new appointment. Opening the booking form...");
        
        // Redirect to home page with booking modal parameter
        setTimeout(() => {
          window.location.href = `/?bookAppointment=true`;
        }, 2000);
        return;
        
      } else if (intent.type === 'add_expense') {
        // Handle expense addition - redirect to home page with expense modal open
        addBotMessage("I'll help you add a new expense. Opening the expense form...");
        
        // Redirect to home page with expense modal parameter
        setTimeout(() => {
          window.location.href = `/?addExpense=true`;
        }, 2000);
        return;
        
      } else if (intent.type === 'delete_expense') {
        // Handle expense deletion - following the same pattern as editing
        const searchTerm = intent.groups[0];
        const searchDate = intent.groups[1];
        const searchYear = intent.groups[2];
        
        // Debug logging
        console.log('🔍 [EXPENSE DELETE] Intent groups:', intent.groups);
        console.log('🔍 [EXPENSE DELETE] Search term:', searchTerm);
        console.log('🔍 [EXPENSE DELETE] Search date:', searchDate);
        console.log('🔍 [EXPENSE DELETE] Search year:', searchYear);
        console.log('🔍 [EXPENSE DELETE] onExpenseDeleteConfirmation callback exists:', !!onExpenseDeleteConfirmation);
        
        // Search for the expense with date (like appointments)
        try {
          const searchParams = new URLSearchParams({
            description: searchTerm
          });
          
          // Add date parameters if available - with flexible year searching
          if (searchDate) {
            if (searchYear) {
              // Year explicitly provided - use it exactly
              const dateString = searchDate + ' ' + searchYear;
              console.log('🔍 [EXPENSE DELETE] Date string for parsing (with year):', dateString);
              const parsedDate = parseNaturalLanguageDate(dateString, searchYear);
              console.log('🔍 [EXPENSE DELETE] Parsed date:', parsedDate);
              if (parsedDate) {
                searchParams.append('date', parsedDate.formattedDate);
                console.log('🔍 [EXPENSE DELETE] Added date parameter:', parsedDate.formattedDate);
              }
            } else {
              // No year specified - search current year first, then next year if needed
              const currentYear = new Date().getFullYear();
              const dateStringCurrent = searchDate + ' ' + currentYear;
              console.log('🔍 [EXPENSE DELETE] Trying current year first:', dateStringCurrent);
              
              try {
                const parsedDateCurrent = parseNaturalLanguageDate(dateStringCurrent, currentYear.toString());
                searchParams.append('date', parsedDateCurrent.formattedDate);
                console.log('🔍 [EXPENSE DELETE] Added current year date parameter:', parsedDateCurrent.formattedDate);
              } catch (error) {
                console.log('🔍 [EXPENSE DELETE] Current year parsing failed, will search without specific date');
              }
            }
          }
          
          if (searchYear) {
            searchParams.append('year', searchYear);
          }
          
          const searchUrl = `/api/expenses/search?${searchParams}`;
          console.log('🔍 [EXPENSE DELETE] Search URL:', searchUrl);
          console.log('🔍 [EXPENSE DELETE] Search parameters:', Object.fromEntries(searchParams));
          console.log('🔍 [EXPENSE DELETE] Full search params object:', searchParams.toString());
          const searchResponse = await fetch(searchUrl);
          
          if (!searchResponse.ok) {
            addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
            return;
          }
          
          const expenses = await searchResponse.json();
          
          if (!expenses || expenses.length === 0) {
            addBotMessage(`I couldn't find any expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please try a different description or date.`);
            return;
          }
          
          if (expenses.length > 1) {
            addBotMessage(`I found ${expenses.length} expenses matching "${searchTerm}"${searchDate ? ` on ${searchDate}` : ''}. Please be more specific or add a date.`);
            return;
          }
          
          // Found the expense, show confirmation message
          const expense = expenses[0];
          addBotMessage(`I found the expense: "${expense.description}" for $${expense.amount.toFixed(2)} on ${moment(expense.date).format('MMMM DD, YYYY')}. Are you sure you want to delete this expense? Type 'yes' to confirm or 'no' to cancel.`);
          
          // Set pending expense deletion state for confirmation
          console.log('🔍 [EXPENSE DELETE] Setting pending deletion state for expense:', expense);
          if (onExpenseDeleteConfirmation) {
            console.log('🔍 [EXPENSE DELETE] Calling onExpenseDeleteConfirmation callback');
            onExpenseDeleteConfirmation({
              expenseId: expense.id,
              expense: expense
            });
          } else {
            console.log('🔍 [EXPENSE DELETE] ERROR: onExpenseDeleteConfirmation callback is missing!');
          }
          console.log('🔍 [EXPENSE DELETE] Returning from deletion flow');
          return;
          
        } catch (error) {
          console.error('Error searching for expense to delete:', error);
          addBotMessage("Sorry, I encountered an error while searching for the expense. Please try again.");
        }
        
      } else if (intent.type === 'unknown') {
        addBotMessage("I'm sorry I didn't understand that request. I will perform no actions. Please try again.");
      }
    }
  }, [
    inputValue,
    setInputValue,
    pendingCancellation, 
    pendingCompletion, 
    completionStep,
    pendingEdit,
    editStep,
    pendingExpenseEdit,
    pendingExpenseDelete,
    classifyIntent,
    validateAndRespondToCancellation,
    validateAndRespondToCompletion,
    validateAndRespondToEdit,
    onTipCollected,
    onCompletionSuccess,
    onCancellationSuccess,
    onEditCategoryInput,
    onEditReasonInput,
    onEditConfirmation,
    onExpenseEditConfirmation,
    onExpenseDeleteConfirmation,
    addBotMessage,
    addUserMessage
  ]);

  return {
    handleSubmit
  };
};

export default useChatInput;
