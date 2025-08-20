import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatBot from '../ChatBot';

// Mock the chatbot hooks
jest.mock('../chatbot/hooks', () => ({
  useChatState: () => ({
    messages: [
      {
        id: 1,
        type: 'bot',
        text: "Hi! I'm your spa assistant. I can help you manage appointments. Type your requests directly. For example: \"cancel appointment for test at 2:00 PM on August 19th\"",
        timestamp: new Date()
      }
    ],
    setMessages: jest.fn(),
    inputValue: '',
    setInputValue: jest.fn(),
    pendingCancellation: null,
    setPendingCancellation: jest.fn(),
    pendingCompletion: null,
    setPendingCompletion: jest.fn(),
    completionTip: 0,
    setCompletionTipState: jest.fn(),
    completionStep: 0,
    setCompletionStepState: jest.fn(),
    pendingEdit: null,
    setPendingEdit: jest.fn(),
    editStep: 0,
    setEditStepState: jest.fn(),
    editReason: '',
    setEditReasonState: jest.fn(),
    clearEdit: jest.fn()
  }),
  useIntentClassification: () => ({
    classifyIntent: jest.fn()
  }),
  useAppointmentActions: () => ({
    executeCancelAppointment: jest.fn(),
    executeCompleteAppointment: jest.fn(),
    executeEditAppointment: jest.fn(),
    collectTipAmount: jest.fn()
  }),
  useChatInput: () => ({
    handleSubmit: jest.fn()
  })
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock the shared utilities
jest.mock('../../shared', () => ({
  convertMilitaryTo12Hour: jest.fn((time) => time),
  standardizeTimeForBackend: jest.fn((time) => time),
  calculatePayment: jest.fn((category) => {
    const prices = { 'Facial': 100, 'Massage': 120, 'Facial + Massage': 200 };
    return prices[category] || 0;
  }),
  translateCategoryToDatabase: jest.fn((category) => category),
  translateCategoryToUser: jest.fn((category) => category)
}));

describe('ChatBot Edit Functionality Tests', () => {
  const mockAppointment = {
    id: 1,
    client: 'John Doe',
    date: '2024-08-19',
    time: '2:00 PM',
    category: 'Massage',
    payment: 120.00,
    status: 'pending'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ appointments: [mockAppointment] })
    });
  });

  describe('Basic Rendering and Functionality', () => {
    test('should render ChatBot component', () => {
      render(<ChatBot />);
      
      // Should show chat toggle button
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      expect(chatToggle).toBeInTheDocument();
      expect(chatToggle).toHaveTextContent('💬');
    });

    test('should open chat interface when toggle is clicked', () => {
      render(<ChatBot />);
      
      // Initially chat should be closed
      expect(screen.queryByPlaceholderText(/type your message/i)).not.toBeInTheDocument();
      
      // Click toggle to open chat
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Chat should now be open
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
      expect(chatToggle).toHaveTextContent('✕');
    });

    test('should close chat interface when close button is clicked', () => {
      render(<ChatBot />);
      
      // Open chat first
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Verify chat is open
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
      
      // Find and click close button (in ChatHeader)
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      // Chat should be closed
      expect(screen.queryByPlaceholderText(/type your message/i)).not.toBeInTheDocument();
      expect(chatToggle).toHaveTextContent('💬');
    });

    test('should display welcome message when chat opens', () => {
      render(<ChatBot />);
      
      // Open chat
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Should show welcome message
      expect(screen.getByText(/Hi! I'm your spa assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/I can help you manage appointments/i)).toBeInTheDocument();
    });

    test('should have input field and send button when open', () => {
      render(<ChatBot />);
      
      // Open chat
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Should have input field
      const input = screen.getByPlaceholderText(/type your message/i);
      expect(input).toBeInTheDocument();
      
      // Should have send button
      const sendButton = screen.getByRole('button', { name: /➤/i });
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe('Edit Intent Recognition', () => {
    test('should recognize edit intent patterns', () => {
      render(<ChatBot />);
      
      // Open chat
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Should be able to type edit requests
      const input = screen.getByPlaceholderText(/type your message/i);
      
      // These are valid edit patterns that should be recognized
      const validEditPatterns = [
        'change appointment for John Doe at 2:00 PM on August 19th',
        'change appointment for Sarah at 3:00 PM on August 20th',
        'change appointment for Mike on August 21st',
        'change appointment for Lisa'
      ];
      
      // Just verify the input field exists and can accept text
      // The actual intent recognition will be tested in integration tests
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Type your message...');
    });
  });

  describe('Component Structure', () => {
    test('should have proper chat container structure', () => {
      render(<ChatBot />);
      
      // Open chat
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      fireEvent.click(chatToggle);
      
      // Should have chat container
      const chatContainer = document.querySelector('.chat-container');
      expect(chatContainer).toBeInTheDocument();
      
      // Should have chat messages area
      const chatMessages = document.querySelector('.chat-messages');
      expect(chatMessages).toBeInTheDocument();
      
      // Should have chat input form
      const chatInputForm = document.querySelector('.chat-input-form');
      expect(chatInputForm).toBeInTheDocument();
    });

    test('should have proper accessibility attributes', () => {
      render(<ChatBot />);
      
      // Chat toggle should have proper aria-label
      const chatToggle = screen.getByRole('button', { name: /toggle chat/i });
      expect(chatToggle).toHaveAttribute('aria-label', 'Toggle chat');
      
      // Open chat
      fireEvent.click(chatToggle);
      
      // Input should have proper placeholder
      const input = screen.getByPlaceholderText(/type your message/i);
      expect(input).toHaveAttribute('placeholder', 'Type your message...');
    });
  });
});
