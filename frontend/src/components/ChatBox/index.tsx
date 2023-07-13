import { FC, ChangeEvent, MouseEventHandler, useState, useEffect, useRef } from 'react';
import './style.css';
import { getSocket } from '../../SocketController';
import { ProfileData } from '../../pages/Main';

interface Message {
  sender: string;
  content: string;
  avatar?: string;
  timestamp: string;
}

export interface Participant {
  _id: string;
  fullname: string;
  avatar: string;
  isOnline: boolean;
  socketId: string[];
}

export interface ChatRoom {
  _id: string;
  participants: Participant[];
}

interface ChatBoxProps {
  // onMessageEmit: (message: Message) => void;
  token: string;
  room: ChatRoom;
  profile: ProfileData | null;
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
let targetIds: Array<any>;
let socket: any;


const ChatBox: FC<ChatBoxProps> = ({ room, token, profile }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const roomIdRef = useRef(room._id);
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log('typing ...');
  };

  const handleSendMessage: MouseEventHandler<HTMLButtonElement> = () => {
    if (inputValue.trim() !== '') {
      socket?.emit("msg", [targetIds, inputValue, new Date(), room._id]);
      setInputValue('');
    }
  };

  const handleReceiveMessage = (msg: string[]) => {
    if (msg[3] === roomIdRef.current) {
      const sender = msg[0];
      const content = msg[1];
      const timestamp = msg[2];
      // Update the messages state to include the received message
      setMessages((prevMessages) => {
        if (prevMessages !== null) {
          return [...prevMessages, { sender, content, timestamp }];
        } else {
          return [{ sender, content, timestamp }];
        }
      });
    } else {
      console.log("New message, room: " + msg[3]) // do something
    }
  }
  useEffect(
    () => {
      try {
        if (!token || !room) {
          return;
        }
        getMessages(room._id, token)
          .then((data) => {
            setMessages(data.messages as Message[]);
          })
          .catch((err) => {
            throw err;
          });
      }
      catch (err) {
        console.error(err);
      }
    }, [token, room._id]
  )
  useEffect(() => {
    socket = getSocket(token);
    socket?.on("msg", handleReceiveMessage);
  }, [token])
  useEffect(() => {
    roomIdRef.current = room._id;
  }, [room._id]);
  useEffect(() => {
    try {
      if (!room._id) {
        return
      }
      targetIds = room.participants
        .map((participant) => participant.socketId) // Create an array of socketIds
        .filter((socketId) => socketId !== null && socketId !== undefined);
      targetIds = targetIds.flat();
      // The resulting targetIds array will not contain null or undefined values

    } catch (err) {
      console.error(err);
    }
  }, [room]);


  return (
    <div className="chat-box">
      <div className="message-container">
        {
          Array.isArray(messages) &&
          messages.map((message: Message, index: number) => {
            let avatarSRC: string;
            if (message.sender && message.sender == profile?._id) {
              avatarSRC = profile.avatar
            } else {
              const sender = room.participants.find(
                (participant) => participant._id === message.sender
              );
              avatarSRC = sender ? sender.avatar : "";
            }
            return (
              <div key={message.sender + index}>
                {avatarSRC && (
                  <img className="inchat-avatar" src={avatarSRC} alt="Sender Avatar" />
                )}
                <span>{message.content}</span>
                <span>{message.timestamp}</span>
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
