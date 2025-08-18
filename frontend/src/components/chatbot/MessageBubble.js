import React from 'react';

const MessageBubble = ({ message }) => {
  return (
    <div 
      className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
    >
      <div className="message-content">
        {message.text}
      </div>
      <div className="message-timestamp">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageBubble;
