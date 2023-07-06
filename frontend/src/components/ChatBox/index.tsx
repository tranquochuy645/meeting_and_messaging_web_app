import { ChangeEvent, MouseEventHandler, useState } from 'react';
import './style.css';
import conversation from '../../dataModels/conversationData.json'

const ChatBox = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log("typing ...");
  };
  const handleSendMessage: MouseEventHandler = () => {
    console.log(inputValue);
  }
  return (
    <div className="chat-box">
      <div className="message-container">
        {
          conversation.messages.map(
            (message) => (
              <p>{message.content}</p>
            )
          )
        }
      </div>
      <div className="input-container flex">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="input-field"
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
