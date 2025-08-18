import React from 'react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="chat-header">
      <h3>💬 Spa Assistant</h3>
      <div className="chat-controls">
        <button 
          className="close-chat"
          onClick={onClose}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
