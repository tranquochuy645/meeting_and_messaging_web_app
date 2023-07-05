import React, { useState } from 'react';

interface Message {
  id: number;
  content: string;
  sender: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') {
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'User',
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.sender}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
