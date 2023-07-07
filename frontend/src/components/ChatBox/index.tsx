import { FC, ChangeEvent, MouseEventHandler, useState } from 'react';
import './style.css';
// import conversation from '../../dataModels/conversationData.json'
interface ChatBoxProps {
  room: string
}
const ChatBox: FC<ChatBoxProps> = ({ room }) => {
  const [inputValue, setInputValue] = useState('');
  // console.log(room);
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
        {room}
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
