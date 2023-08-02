import VisibilitySensor from 'react-visibility-sensor';
import MessagesView from "../MessagesView"
import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketProvider';
import { ChatRoom } from '../RoomsNav';
import PendingFigure from '../PendingFigure';
import './style.css'

export interface Message {
    sender: string;
    content: string;
    timestamp: string;
    urls: string[];
    avatar?: string;
}

export interface ReadCursor {
    _id: string;
    lastReadTimeStamp: string;
}
interface ChatRoomData {
    messages: Message[];
    conversationLength: number;
    readCursors: ReadCursor[]
    isMeeting?: boolean;
    meeting_uuid?: string | null;
}
interface MessagesContainerProps {
    token: string;
    room: ChatRoom;
    userId: string;
    justSent: boolean;
}


const getMessages = (
    roomId: string,
    token: string,
    limit?: string,
    skip?: string): Promise<any> => {
    return fetch(`/api/v1/rooms/${roomId}?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    })
        .then((response) => {
            if (response.status === 304) {
                throw new Error("Already got this")
            }
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
const DEFAULT_MESSAGES_LIMIT: number = 30; // limit on how many messages fetched in one request

const MessagesContainer: FC<MessagesContainerProps> = ({ token, room, userId, justSent }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [conversationLength, setConversationLength] = useState(0)
    const [readCursors, setReadCursors] = useState<any[]>([])
    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const btnScrollRef = useRef<HTMLButtonElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const socket = useSocket();
    const navigate = useNavigate();
    console.log("Render container")

    const handleReceiveMessage = (msg: any[]) => {
        //msg: [sender,  room id,content, date, [urls]]
        if (msg[1] === room._id) {
            const sender = msg[0];
            if (
                //check if sender is participant of the room
                sender !== userId
                && !room.participants.some(
                    (participant) => participant._id === sender)
            ) return
            if (btnScrollRef.current) {
                btnScrollRef.current.style.display = "block"
            }
            const content = msg[2];
            const timestamp = msg[3];
            const urls: string[] = msg[4];
            socket?.emit("seen", [room._id, new Date()])
            setConversationLength((prev) => prev++);
            // Update the messages state to include the received message
            setMessages((prevMessages) => {
                if (prevMessages !== null) {
                    return [...prevMessages, { sender, content, timestamp, urls }];
                } else {
                    return [{ sender, content, timestamp, urls }];
                }
            });
        }
    }

    const scrollBottom = () => {
        if (!bottomRef.current) return
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
        if (btnScrollRef.current) btnScrollRef.current.style.display = "none"
    }

    const handleGetMoreMessages = (isVisible: boolean) => {
        if (!isVisible) return
        if (!messages || messages.length == 0) {
            return
        }
        if (messages.length >= conversationLength) {
            // All messages received
            if (topRef.current) topRef.current.style.display = "none"
            return
        }
        let skip;
        let messagesLimit = DEFAULT_MESSAGES_LIMIT;
        skip = conversationLength - messages.length - messagesLimit
        if (skip < 0) {
            messagesLimit += skip;
            skip = 0;
        }
        getMessages(room._id, token, `${messagesLimit}`, `${skip}`)
            .then((data: ChatRoomData) => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = 300;
                }
                setMessages((prev) => {
                    if (prev)
                        return data.messages.concat(prev)
                    return data.messages
                });
                data.conversationLength && setConversationLength(data.conversationLength);
                data.readCursors && setReadCursors(data.readCursors)
            })
            .catch(
                () => {
                    navigate("/auth");
                });

    }


    useEffect(
        () => {
            try {
                if (!token || !room) {
                    return;
                }
                getMessages(room._id, token)
                    .then((data: ChatRoomData) => {
                        data.messages && setMessages(data.messages);
                        data.conversationLength && setConversationLength(data.conversationLength);
                        data.readCursors && setReadCursors(data.readCursors)
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
        if (socket) {
            socket.on("msg", handleReceiveMessage);
            return (() => {
                socket.off("msg", handleReceiveMessage);
            })
        }
    }, [socket, room._id])

    useEffect(() => {
        if (topRef.current) { topRef.current.style.display = "none"; }
        const tOut = setTimeout(() => {
            if (topRef.current &&
                messagesContainerRef.current &&
                messagesContainerRef.current.scrollHeight > messagesContainerRef.current.clientHeight) {
                topRef.current.style.display = "flex";
            }
            // Only allow the top visibility sensor to be displayed after initial render
        }, 1000);

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(tOut);
        };
    }, [room._id]);


    useEffect(() => {
        if (!messagesContainerRef.current || !messages) return
        if (messages.length <= DEFAULT_MESSAGES_LIMIT) {
            // if this is the first load 
            return scrollBottom()
        }
        if (Math.abs(messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop - messagesContainerRef.current.clientHeight) < 300) {
            console.log("bottom")
            //currently at bottom
            return scrollBottom()
        }
        if (messages[messages.length - 1].sender != userId) return
        if (justSent) {
            // if it is this user who have just send a message
            justSent = false;
            return scrollBottom()
        }
    }, [messages]);

    return (
        <>
            <div ref={messagesContainerRef} id="messages-container">
                <VisibilitySensor onChange={handleGetMoreMessages} >
                    <div ref={topRef} id="topRef">
                        <PendingFigure size={50} />
                    </div>
                </VisibilitySensor>
                {messages &&
                    <MessagesView
                        readCursors={readCursors}
                        token={token}
                        messages={messages}
                        roomId={room._id}
                        userId={userId}
                        participants={room.participants}
                    />
                }
                <div ref={bottomRef}></div>
            </div>
            <button id='btn_scroll' ref={btnScrollRef}
                onClick={() => { scrollBottom() }}
            >
                {Array.isArray(messages) && messages.length > 1 && messages[messages.length - 1].content}
                <i className='bx bx-down-arrow-alt'></i>
            </button>
        </>
    )
}
export default MessagesContainer