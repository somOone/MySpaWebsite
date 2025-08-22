import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { parseNaturalLanguageDate } from '../../shared';

const ExpenseEditWorkflow = ({ 
  expense, 
  onComplete, 
  onCancel, 
  setMessages, 
  messages 
}) => {
  const [editStep] = useState('confirm');
  const [editedExpense, setEditedExpense] = useState({ ...expense });

  useEffect(() => {
    if (editStep === 'confirm') {
      const confirmMsg = {
        id: Date.now(),
        type: 'bot',
        text: `I found an expense: "${expense.description}" for $${expense.amount.toFixed(2)} on ${moment(expense.date).format('MMMM DD, YYYY')} in category "${expense.category_name}". What would you like to change?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMsg]);
    }
  }, [editStep, expense, setMessages]);

  const handleEdit = async (field, value) => {
    try {
      // Update the edited expense
      const updatedExpense = { ...editedExpense };
      
      if (field === 'date') {
        updatedExpense.date = value;
      } else if (field === 'amount') {
        updatedExpense.amount = parseFloat(value);
      } else if (field === 'description') {
        updatedExpense.description = value;
      } else if (field === 'category') {
        // Find category ID by name
        const categoriesResponse = await axios.get('/api/expense-categories');
        const category = categoriesResponse.data.find(cat => 
          cat.name.toLowerCase().includes(value.toLowerCase())
        );
        if (category) {
          updatedExpense.category_id = category.id;
          updatedExpense.category_name = category.name;
        } else {
          const errorMsg = `Category "${value}" not found. Please use an existing category.`;
          const botMsg = {
            id: Date.now(),
            type: 'bot',
            text: `❌ ${errorMsg}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }
      }
      
      setEditedExpense(updatedExpense);
      
      // Send update to backend
      const response = await axios.put(`/api/expenses/${expense.id}`, {
        [field === 'category' ? 'category_id' : field]: updatedExpense[field === 'category' ? 'category_id' : field]
      });
      
      // Show success message
      const successMsg = {
        id: Date.now(),
        type: 'bot',
        text: `✅ Expense updated successfully! The ${field} has been changed.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMsg]);
      
      // Complete the workflow
      onComplete(response.data);
      
    } catch (error) {
      console.error('Error updating expense:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update expense. Please try again.';
      
      const botMsg = {
        id: Date.now(),
        type: 'bot',
        text: `❌ ${errorMsg}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleUserInput = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for different edit commands
    if (lowerMessage.includes('description') || lowerMessage.includes('text')) {
      const newDescription = userMessage.replace(/.*description\s+(?:to|into)\s+/i, '').trim();
      if (newDescription) {
        handleEdit('description', newDescription);
      } else {
        const botMsg = {
          id: Date.now(),
          type: 'bot',
          text: 'What would you like to change the description to?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } else if (lowerMessage.includes('amount') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      const amountMatch = userMessage.match(/\$?([\d.]+)/);
      if (amountMatch) {
        handleEdit('amount', amountMatch[1]);
      } else {
        const botMsg = {
          id: Date.now(),
          type: 'bot',
          text: 'What would you like to change the amount to? (e.g., $50.00)',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } else if (lowerMessage.includes('category')) {
      const newCategory = userMessage.replace(/.*category\s+(?:to|into)\s+/i, '').trim();
      if (newCategory) {
        handleEdit('category', newCategory);
      } else {
        const botMsg = {
          id: Date.now(),
          type: 'bot',
          text: 'What would you like to change the category to?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } else if (lowerMessage.includes('date')) {
      const dateMatch = userMessage.match(/([a-zA-Z]+\s+\d+(?:st|nd|rd|th)?(?:\s+\d{4})?)/i);
      if (dateMatch) {
        const parsedDate = parseNaturalLanguageDate(dateMatch[1]);
        if (parsedDate) {
          handleEdit('date', parsedDate);
        } else {
          const botMsg = {
            id: Date.now(),
            type: 'bot',
            text: 'I couldn\'t understand that date format. Please use a format like "August 21st" or "March 15th 2024".',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
        }
      } else {
        const botMsg = {
          id: Date.now(),
          type: 'bot',
          text: 'What would you like to change the date to? (e.g., "August 21st")',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('never mind')) {
      const botMsg = {
        id: Date.now(),
        type: 'bot',
        text: 'Okay, I won\'t make any changes to the expense.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      onCancel();
    } else {
      // Show help message
      const botMsg = {
        id: Date.now(),
        type: 'bot',
        text: 'I can help you change the description, amount, category, or date. What would you like to change?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  return null; // This component only handles logic, no UI rendering
};

export default ExpenseEditWorkflow;
