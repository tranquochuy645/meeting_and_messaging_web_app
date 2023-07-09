import { FC, ChangeEvent, MouseEventHandler, useState, useEffect } from 'react';
import './style.css';
import { getSocket } from '../../SocketController';
interface Message {
  avatar?: string;
  sender: string;
  content: string;
}
export interface Participant {
  _id: string;
  fullname: string;
  avatar: string;
  isOnline: boolean;
  socketId: string | undefined | null;
}

export interface ChatRoom {
  _id: string;
  participants: Participant[];
}

interface ChatBoxProps {
  // onMessageEmit: (message: Message) => void;
  token: string;
  room: ChatRoom;
  thisUserAvatar: string | undefined;
  thisUserId: string | undefined;
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
let targetIds: Array<string | null | undefined>;
let socket: any;
const ChatBox: FC<ChatBoxProps> = ({ room, token, thisUserAvatar, thisUserId }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    try {
      if (!token || !room) {
        return;
      }
      if (!room._id) {
        return
      }
      targetIds = room.participants
        .map((participant) => participant.socketId) // Create an array of socketIds
        .filter((socketId) => socketId !== null && socketId !== undefined);
      // The resulting targetIds array will not contain null or undefined values

      getMessages(room._id, token)
        .then((data) => {
          setMessages(data.messages as Message[]);
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      console.error(err);
    }
  }, [token, room]);
  useEffect(() => {
    socket = getSocket(token);
    socket?.on("msg", handleReceiveMessage);
  }, [token])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log('typing ...');
  };

  const handleSendMessage: MouseEventHandler<HTMLButtonElement> = () => {
    if (inputValue.trim() !== '') {
      socket?.emit("msg", [targetIds, inputValue]);
      setMessages((prevMessages) => {
        const newMessage: Message = {
          avatar: thisUserAvatar || "",
          sender: thisUserId || "",
          content: inputValue.trim()
        };
        if (prevMessages !== null) {
          return [...prevMessages, newMessage];
        } else {
          return [newMessage];
        }
      });
      setInputValue('');
    }
  };


  const handleReceiveMessage = (msg: string[]) => {
    const sender = msg[0];
    const content = msg[1];
    // Update the messages state to include the received message
    setMessages((prevMessages) => {
      if (prevMessages !== null) {
        return [...prevMessages, { sender, content }];
      } else {
        return [{ sender, content }];
      }
    });
  }


  return (
    <div className="chat-box">
      <div className="message-container">
        {
          Array.isArray(messages) &&
          messages.map((message: Message, index: number) => {
            if (!message.avatar) {
              const sender = room.participants.find(
                (participant) => participant._id === message.sender
              );
              message.avatar = sender ? sender.avatar : "";
            }
            return (
              <div key={message.sender + index}>
                {message.avatar && (
                  <img className="inchat-avatar" src={message.avatar} alt="Sender Avatar" />
                )}
                <span>{message.content}</span>
              </div>
            );
          })
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
