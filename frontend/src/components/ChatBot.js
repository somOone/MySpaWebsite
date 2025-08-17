import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';

// Import utility functions and patterns
import { APPOINTMENT_PATTERNS } from '../utils/regexPatterns';
import { convertMilitaryTo12Hour, standardizeTimeForBackend } from '../utils/timeUtils';
import { validateClientName, validateTimeFormat, validateDateFormat } from '../utils/validationUtils';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingCancellation, setPendingCancellation] = useState(null); // Store pending cancellation details
  const messagesEndRef = useRef(null);

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
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to execute appointment cancellation
  const executeCancelAppointment = useCallback(async () => {
    try {
      console.log('🔍 [CANCELLATION] Starting appointment cancellation process');
      
      if (!pendingCancellation) {
        console.log('🔍 [CANCELLATION] No pending cancellation details found');
        const errorMsg = "I don't have any appointment details to cancel. Please try requesting the cancellation again.";
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: errorMsg,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      console.log('🔍 [CANCELLATION] Pending cancellation details:', pendingCancellation);
      console.log('🔍 [CANCELLATION] Client Name:', pendingCancellation.clientName);
      console.log('🔍 [CANCELLATION] Time:', pendingCancellation.time);
      console.log('🔍 [CANCELLATION] Date:', pendingCancellation.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(pendingCancellation.time);
      console.log('🔍 [CANCELLATION] Standardized time for backend:', standardizedTime);
      
      // Search for the appointment in the backend
      const searchParams = new URLSearchParams({
        clientName: pendingCancellation.clientName,
        time: standardizedTime,
        date: pendingCancellation.date
      });
      
      // Add year parameter if available
      if (pendingCancellation.year) {
        searchParams.append('year', pendingCancellation.year);
        console.log('🔍 [CANCELLATION] Added year parameter:', pendingCancellation.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      console.log('🔍 [CANCELLATION] Search URL:', searchUrl);
      console.log('🔍 [CANCELLATION] Search parameters:', Object.fromEntries(searchParams));
      
      console.log('🔍 [CANCELLATION] Making search request to backend...');
      const searchResponse = await fetch(searchUrl);
      console.log('🔍 [CANCELLATION] Search response status:', searchResponse.status);
      console.log('🔍 [CANCELLATION] Search response ok:', searchResponse.ok);
      
      if (!searchResponse.ok) {
        console.log('🔍 [CANCELLATION] Search request failed with status:', searchResponse.status);
        
        if (searchResponse.status === 400) {
          // Handle 400 errors (like date parsing failures) gracefully
          try {
            const errorData = await searchResponse.json();
            console.log('🔍 [CANCELLATION] Search error data:', errorData);
            
            // Show user-friendly error message from backend
            const errorMsg = errorData.message || "There is something wrong with your request. Can you double-check and make the request again?";
            const botMsg = {
              id: Date.now() + 1,
              type: 'bot',
              text: errorMsg,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setPendingCancellation(null);
            return;
          } catch (parseError) {
            console.error('🔍 [CANCELLATION] Failed to parse error response:', parseError);
            // Fallback to generic message if can't parse error response
            const botMsg = {
              id: Date.now() + 1,
              type: 'bot',
              text: "There is something wrong with your request. Can you double-check and make the request again?",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setPendingCancellation(null);
            return;
          }
        } else {
          // Handle other errors (500, etc.) by throwing
          const errorText = await searchResponse.text();
          console.log('🔍 [CANCELLATION] Search error response:', errorText);
          throw new Error('Failed to search for appointment');
        }
      }
      
      console.log('🔍 [CANCELLATION] Search request successful, parsing response...');
      const appointments = await searchResponse.json();
      console.log('🔍 [CANCELLATION] Parsed appointments:', appointments);
      console.log('🔍 [CANCELLATION] Appointments array length:', appointments ? appointments.length : 'null/undefined');
      
      if (!appointments || appointments.length === 0) {
        console.log('🔍 [CANCELLATION] No appointments found in search results');
        const notFoundMsg = "Sorry, I couldn't find that appointment. It may have already been cancelled or doesn't exist.";
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: notFoundMsg,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setPendingCancellation(null);
        return;
      }
      
      // Find the exact appointment to cancel
      const appointment = appointments[0]; // Take the first match
      console.log('🔍 [CANCELLATION] Found appointment to cancel:', appointment);
      console.log('🔍 [CANCELLATION] Appointment ID:', appointment.id);
      console.log('🔍 [CANCELLATION] Appointment client:', appointment.client);
      console.log('🔍 [CANCELLATION] Appointment time:', appointment.time);
      console.log('🔍 [CANCELLATION] Appointment date:', appointment.date);
      
      // Delete the appointment
      const deleteUrl = `/api/appointments/${appointment.id}`;
      console.log('🔍 [CANCELLATION] Delete URL:', deleteUrl);
      console.log('🔍 [CANCELLATION] Making delete request...');
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE'
      });
      
      console.log('🔍 [CANCELLATION] Delete response status:', deleteResponse.status);
      console.log('🔍 [CANCELLATION] Delete response ok:', deleteResponse.ok);
      
      if (!deleteResponse.ok) {
        console.log('🔍 [CANCELLATION] Delete request failed with status:', deleteResponse.status);
        const errorText = await deleteResponse.text();
        console.log('🔍 [CANCELLATION] Delete error response:', errorText);
        throw new Error('Failed to delete appointment');
      }
      
      console.log('🔍 [CANCELLATION] Delete request successful');
      
      // Convert time to 12-hour format for display (military time → 12-hour)
      const displayTime = convertMilitaryTo12Hour(appointment.time);
      
      // Success! Clear pending cancellation and show success message
      const successMessage = `I successfully cancelled the appointment for ${appointment.client} at ${displayTime} on ${appointment.date}.`;
      console.log('🔍 [CANCELLATION] Success message:', successMessage);
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: successMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
      setPendingCancellation(null);
      console.log('🔍 [CANCELLATION] Cleared pending cancellation');
      
      // Show redirecting message and delay navigation
      const redirectMsg = {
        id: Date.now() + 2,
        type: 'bot',
        text: `Redirecting to appointments page for ${appointment.date}...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, redirectMsg]);
      
      // Navigate to Manage Appointments page after 2.5 seconds
      setTimeout(() => {
        console.log('🔄 Navigating to appointments page for date:', appointment.date);
        const appointmentsUrl = `/appointments?date=${appointment.date}`;
        window.location.href = appointmentsUrl;
      }, 2500);
      
    } catch (error) {
      console.error('🔍 [CANCELLATION] Error executing cancellation:', error);
      console.error('🔍 [CANCELLATION] Error message:', error.message);
      console.error('🔍 [CANCELLATION] Error stack:', error.stack);
      
      const errorMsg = "Sorry, I encountered an error while trying to cancel the appointment. Please try again.";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  }, [pendingCancellation]);

  // Function to validate cancellation request with backend before responding
  const validateAndRespondToCancellation = useCallback(async (cancellationDetails) => {
    try {
      console.log('🔍 [VALIDATION] Starting validation for cancellation request');
      console.log('🔍 [VALIDATION] Client Name:', cancellationDetails.clientName);
      console.log('🔍 [VALIDATION] Time:', cancellationDetails.time);
      console.log('🔍 [VALIDATION] Date:', cancellationDetails.date);
      
      // Standardize time format for backend
      const standardizedTime = standardizeTimeForBackend(cancellationDetails.time);
      console.log('🔍 [VALIDATION] Standardized time for backend:', standardizedTime);
      
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
        console.log('🔍 [VALIDATION] Added year parameter:', cancellationDetails.year);
      }
      
      const searchUrl = `/api/appointments/search?${searchParams}`;
      console.log('🔍 [VALIDATION] Search URL:', searchUrl);
      console.log('🔍 [VALIDATION] Search parameters:', Object.fromEntries(searchParams));
      
      console.log('🔍 [VALIDATION] Making search request to backend...');
      const searchResponse = await fetch(searchUrl);
      console.log('🔍 [VALIDATION] Search response status:', searchResponse.status);
      console.log('🔍 [VALIDATION] Search response ok:', searchResponse.ok);
      
      if (!searchResponse.ok) {
        console.log('🔍 [VALIDATION] Search request failed with status:', searchResponse.status);
        
        if (searchResponse.status === 400) {
          // Handle 400 errors (like date parsing failures) gracefully
          try {
            const errorData = await searchResponse.json();
            console.log('🔍 [VALIDATION] Search error data:', errorData);
            
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
          console.log('🔍 [VALIDATION] Search error response:', errorText);
          
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
      
      console.log('🔍 [VALIDATION] Search request successful, parsing response...');
      const appointments = await searchResponse.json();
      console.log('🔍 [VALIDATION] Parsed appointments:', appointments);
      console.log('🔍 [VALIDATION] Appointments array length:', appointments ? appointments.length : 'null/undefined');
      
      if (!appointments || appointments.length === 0) {
        console.log('🔍 [VALIDATION] No appointments found in search results');
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
      console.log('🔍 [VALIDATION] Found appointment:', appointment);
      
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
  }, []);

  // Utility function to convert military time to 12-hour format for display
  // OLD FUNCTION - COMMENTED OUT FOR REFACTORING
  /*
  const convertMilitaryTo12Hour = (timeString) => {
    if (timeString.includes('hours')) {
      // Military time format: "1900 hours" → "7:00 PM"
      const militaryTime = timeString.replace(/\s*hours?/i, '');
      const hour = parseInt(militaryTime.substring(0, 2));
      const minute = militaryTime.substring(2, 4);
      
      if (hour === 0) {
        return `12:${minute} AM`;
      } else if (hour === 12) {
        return `12:${minute} PM`;
      } else if (hour > 12) {
        return `${hour - 12}:${minute} PM`;
      } else {
        return `${hour}:${minute} AM`;
      }
    }
    // Return as-is if it's already 12-hour format
    return timeString;
  };
  */

  // Utility function to standardize time format for backend database queries
  // OLD FUNCTION - COMMENTED OUT FOR REFACTORING
  /*
  const standardizeTimeForBackend = (timeString) => {
    if (timeString.includes('hours')) {
      // Military time: "1730 hours" → "5:30 PM"
      const militaryTime = timeString.replace(/\s*hours?/i, '');
      const hour = parseInt(militaryTime.substring(0, 2));
      const minute = militaryTime.substring(2, 4);
      
      if (hour === 0) {
        return `12:${minute} AM`;
      } else if (hour === 12) {
        return `12:${minute} PM`;
      } else if (hour > 12) {
        return `${hour - 12}:${minute} PM`;
      } else {
        return `${hour}:${minute} AM`;
      }
    } else {
      // 12-hour format: standardize to "X:XX AM/PM" format
      // Remove dots and convert to uppercase for consistency
      return timeString.replace(/\./g, '').toUpperCase();
    }
  };
  */

  // NEW: Use imported functions from timeUtils.js
  // convertMilitaryTo12Hour and standardizeTimeForBackend are now imported

  // Command patterns for text input
  // NEW: Use imported patterns from utilities
  const commandPatterns = APPOINTMENT_PATTERNS;

  // Classify user intent
  const classifyIntent = (userMessage) => {
    console.log('🔍 classifyIntent called with:', userMessage);
    
    // Debug: Test the specific pattern manually using imported patterns
    const testPattern = APPOINTMENT_PATTERNS.clientDateTimeFull.regex;
    const testMatch = userMessage.match(testPattern);
    console.log('🔍 Manual test of clientDateTimeFull pattern:', testMatch);
    console.log('🔍 Test string:', userMessage);
    console.log('🔍 Test pattern:', testPattern.toString());
    
    for (const [intent, pattern] of Object.entries(commandPatterns)) {
      const match = userMessage.match(pattern.regex);
      console.log('🔍 Testing pattern:', intent, 'regex:', pattern.regex.toString(), 'match:', match);
      if (match) {
        console.log('🔍 Pattern matched! Intent:', intent, 'groups:', match.slice(1));
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type 
        };
      }
    }
    console.log('🔍 No patterns matched, returning unknown');
    return { intent: 'unknown', confidence: 0.0, groups: [], type: 'unknown' };
  };

  // Handle user input
  const handleSubmit = async (e) => {
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
    
    // Handle affirmative commands for cancellation
    if (intent.type === 'affirmative') {
      console.log('🔍 Handling affirmative command - executing cancellation');
      // Execute the cancellation directly
      executeCancelAppointment();
      return;
    }
    
    // Handle cancel appointment commands
    if (intent.type === 'cancel') {
      console.log('🔍 Handling cancel command with intent:', intent.intent, 'groups:', intent.groups);
      
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
          const response = "I'm sorry I didn't understand that request. I will perform no actions. Please try again.";
          const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: response,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return;
      }
      
      // Validate the appointment with backend before responding
      if (cancellationDetails) {
        validateAndRespondToCancellation(cancellationDetails);
      }
      
    } else if (intent.type === 'unknown') {
      const response = "I'm sorry I didn't understand that request. I will perform no actions. Please try again.";
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

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
        <div className="chat-container">
          <div className="chat-header">
            <h3>💬 Spa Assistant</h3>
            <div className="chat-controls">
              <button 
                className="close-chat"
                onClick={() => {
                  setIsOpen(false);
                }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="chat-send-btn"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
