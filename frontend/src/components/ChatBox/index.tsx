import { FC, ChangeEvent, MouseEventHandler, useState, useEffect } from 'react';
import './style.css';

interface Participant {
  _id: string;
  fullname: string;
  avatar: string;
  isOnline: boolean;
  socket: string | undefined;
}

interface ChatRoom {
  _id: string;
  participants: Participant[];
}

interface ChatBoxProps {
  token: string;
  room: ChatRoom;
}

const getMessages = (roomId: string, token: string): Promise<any> => {
  return fetch(`/api/rooms/${roomId}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch messages');
      }
    });
};

const ChatBox: FC<ChatBoxProps> = ({ room, token }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      if (!token || !room) {
        return;
      }
      if (!room._id) {
        return
      }
      getMessages(room._id, token)
        .then((data) => {
          setMessages(data.messages as string[]);
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      console.log(err);
    }
  }, [token, room]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log('typing ...');
  };

  const handleSendMessage: MouseEventHandler<HTMLButtonElement> = () => {
    console.log(inputValue);
  };

  return (
    <div className="chat-box">
      <div className="message-container">
        {Array.isArray(messages) &&
          messages.map((message: string) => <p key={message}>{message}</p>)}
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
