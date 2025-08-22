import React from 'react';

const ChatInput = ({ inputValue, onInputChange, onSubmit, disabled, inputRef }) => {
  return (
    <form onSubmit={onSubmit} className="chat-input-form">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={onInputChange}
        placeholder="Type your message..."
        className="chat-input"
      />
      <button 
        type="submit" 
        disabled={disabled}
        className="chat-send-btn"
      >
        ➤
      </button>
    </form>
  );
};

export default ChatInput;
