import React from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatContainer = ({ 
  messages, 
  inputValue, 
  onInputChange, 
  onSubmit, 
  onClose, 
  messagesEndRef 
}) => {
  return (
    <div className="chat-container">
      <ChatHeader onClose={onClose} />
      
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        inputValue={inputValue}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        disabled={!inputValue.trim()}
      />
    </div>
  );
};

export default ChatContainer;
