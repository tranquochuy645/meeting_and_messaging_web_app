import {
  FC,
  ChangeEvent,
  useState,
  useEffect,
  useRef,
  useMemo
} from 'react';
import './style.css';
import { getSocket } from '../../SocketController';
import { ProfileData } from '../../pages/Main';
import { useNavigate } from 'react-router-dom';
import ThemeSwitch from '../ThemeSwitch';
import Room from '../Room';
import { ChatRoom } from '../RoomsList';
interface Message {
  sender: string;
  content: string;
  avatar?: string;
  timestamp: string;
}

interface ChatRoomData {
  messages: Message[];
  isMeeting?: boolean;
  meeting_uuid?: string | null;
}

interface ChatBoxProps {
  // onMessageEmit: (message: Message) => void;
  token: string;
  room: ChatRoom;
  profile: ProfileData;
}

const getMessages = (roomId: string, token: string): Promise<any> => {
  return fetch(`/api/v1/rooms/${roomId}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      if (response.status == 401) {
        alert("Token expired");
        sessionStorage.removeItem('token');
      }
      throw new Error('Failed to fetch messages');
    });
};

let socket: any;
const ChatBox: FC<ChatBoxProps> = ({ room, token, profile }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [meeting, setMeeting] = useState<string | null>()
  const roomIdRef = useRef(room._id);
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  // const roomProfileRef = useRef<ReactNode | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log('typing ...');
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      socket?.emit("msg", [room._id, inputValue, new Date()]);
      setInputValue('');
    }
  };


  const handleReceiveMessage = (msg: string[]) => {
    //msg: [sender, content, date, room id]
    if (msg[1] === roomIdRef.current) {
      const sender = msg[0];
      if (
        //check if sender is participant of the room
        sender !== profile?._id
        && !room.participants.some(
          (participant) => participant._id === sender)
      ) {
        return
      }
      const content = msg[2];
      const timestamp = msg[3];
      // Update the messages state to include the received message
      setMessages((prevMessages) => {
        if (prevMessages !== null) {
          return [...prevMessages, { sender, content, timestamp }];
        } else {
          return [{ sender, content, timestamp }];
        }
      });
    } else {
      console.log("New message, room: " + msg[1]) // do something
    }
  }
  const handleMakeCall = () => {
    socket?.emit("meet", [room._id, new Date()]);
  }
  const handleJoinCall = (uuid: string) => {
    const url = `/meet/${uuid}?token=${token}&room=${room._id}`;
    window.open(url)

  }
  const handleReceiveCall = (msg: string[]) => {
    // msg: [sender id,room ID, meeting UUID, date]
    if (msg[1] == room._id) {
      setMeeting(msg[2]);
    }
    if (msg[0] == profile?._id) {
      // it's the call this user made
      if (msg[3]) {
        //already joined
        return
      }
      return handleJoinCall(msg[2]);
    }

    // Show a notification
    if (Notification.permission === "granted") {
      const notification = new Notification("Incoming Call", {
        body: "You have an incoming call. Do you want to join?",
        icon: "path/to/notification-icon.png",
        requireInteraction: true,
      });

      // Handle user's response to the notification
      notification.addEventListener("click", () => {
        // Open a new tab and pass the UUID to it
        handleJoinCall(msg[2])
      });
    } else if (Notification.permission !== "denied") {
      // Request permission to show notifications
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // Show the notification after permission is granted
          handleReceiveCall(msg);
        }
      });
    }
  };
  const handleEndCall = () => {
    setMeeting(null)
  }

  useEffect(
    () => {
      try {
        if (!token || !room) {
          return;
        }
        getMessages(room._id, token)
          .then((data: ChatRoomData) => {
            setMessages(data.messages);
            if (data.meeting_uuid) {
              setMeeting(data.meeting_uuid)
            } else {
              setMeeting(null);
            }
          })
          .catch(
            () => {
              navigate("/auth");
            });
      }
      catch (err) {
        console.error(err);
      }
    }, [token, room._id]
  )
  useEffect(() => {
    if (token) {
      socket = getSocket(token);
      socket?.on("msg", handleReceiveMessage);
      socket?.on("meet", handleReceiveCall);
      socket?.on("end_meet", handleEndCall)
    }
  }, [token])
  useEffect(() => {
    roomIdRef.current = room._id;
  }, [room._id]);
  useEffect(() => {
    function handleScroll() {
      // Add your scroll event logic here
      // For example, you can check if the user has scrolled to the bottom of the container.
      if (messagesContainerRef.current) {
        console.log(messagesContainerRef.current.scrollTop)
        console.log(messagesContainerRef.current.scrollHeight)
        console.log(messagesContainerRef.current.clientHeight)
      }
    }

    if (messagesContainerRef.current) {
      console.log(messagesContainerRef.current)
      messagesContainerRef.current.addEventListener("scroll", handleScroll);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const messagesContainer = useMemo(() => {
    const reversed = messages?.reverse()
    return (
      <>
        {
          Array.isArray(reversed) &&
          reversed.map((message: Message, index: number) => {
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
              <div key={index}
                className={`message ${message.sender == profile?._id ? 'own' : ''}`}>
                <div className='message_wrapper'>
                  {message.sender != profile?._id && avatarSRC && (
                    <img className="inchat-avatar" src={avatarSRC} alt="Sender Avatar" />
                  )}
                  <p>{message.content}</p>
                </div>
                <p className='message_timestamp'>{message.timestamp}</p>
              </div>
            );
          })
        }
      </>
    )
  }, [messages])

  return (
    <div id="chat-box">
      <div id="chat-box_topbar" className='flex'>
        <div id="chat-box_topbar_left">
          <Room userId={profile?._id} participants={room.participants} />
          <button className="btn" onClick={handleMakeCall}>
            <i className='bx bxs-video' ></i>
          </button>
        </div>
        <ThemeSwitch />
      </div>
      {meeting && (
        <>
          <p>This room is in a meeting</p>
          <button onClick={() => handleJoinCall(meeting)}>Join</button>
        </>
      )}
      <div ref={messagesContainerRef} id="messages-container">
        {messagesContainer}
      </div>
      <div id='chat-box_input-container'>
        <input
          type="text"
          value={inputValue}
          id='input_message'
          onChange={handleInputChange}
          onKeyDown={(e) => { e.key == 'Enter' && handleSendMessage() }}
        />
        <button onClick={handleSendMessage} className="btn">
          <i className='bx bxs-send' ></i>
        </button>
      </div>
      <img id="chat-bg" src="/assets/img/img_new/pattern.png" />
    </div>
  );
};

export default ChatBox;
