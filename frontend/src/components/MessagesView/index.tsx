import { FC, useEffect, useState, useRef, memo, useMemo } from 'react';
import { OutGoingMessage, InComingMessage } from '../ChatMessage';
import { Message, ReadCursor } from '../MessagesContainer';
import { useSocket } from '../SocketProvider';

interface MessagesViewProps {
    readCursors: ReadCursor[];
    token: string;
    roomId: string;
    messages: Message[];
    userId: string;
    participants: any[];
}



const getSenderAvatar = (id: string, participantLookup: { [key: string]: any }): string => {
    const sender = participantLookup[id];
    return sender ? sender.avatar : '';
};


const MessagesView: FC<MessagesViewProps> = ({ readCursors, token, messages, roomId, userId, participants }) => {
    const [cursorsMap, setCursorsMap] = useState<{ [key: string]: number }>({});
    const lengthRef = useRef(messages.length);
    const socket = useSocket();

    // Create a participant lookup map for quick access
    const participantsLookupRef = useRef<{ [key: string]: any }>({})
    participantsLookupRef.current = useMemo(() => {
        return Object.fromEntries(
            participants.map((participant) => [participant._id, participant])
        );
    }, [participants])

    // Function to get the sender's avatar based on message's sender

    const handleSeen = (msg: string[]) => {
        //msg: [room id, user id , date] 
        if (msg[0] !== roomId) return;
        setCursorsMap((prevCursorsMap) => {
            return {
                ...prevCursorsMap,
                [msg[1]]: lengthRef.current - 1
            };
        });
    }
    useEffect(() => {
        lengthRef.current = messages.length
    }, [messages.length])

    useEffect(() => {
        if (socket) {
            socket.on("seen", handleSeen);
            return (() => {
                socket.off("seen", handleSeen);
            })
        }
    }, [socket, roomId])


    useEffect(() => {
        const updatedCursorsMap: { [key: string]: number } = {}
        readCursors
            .filter((cursor) => cursor._id !== userId)
            .forEach((cursor) => {
                const cursorTimestamp = new Date(cursor.lastReadTimeStamp).getTime();
                for (let i = messages.length - 1; i >= 0; i--) {
                    const messageTimestamp = new Date(messages[i].timestamp).getTime();
                    if (messageTimestamp <= cursorTimestamp) {
                        updatedCursorsMap[cursor._id] = i;
                        break;
                    }
                }
            });
        setCursorsMap(updatedCursorsMap);
    }, [readCursors]);



    return (
        <>
            {
                messages.map((message: Message, index: number) => {
                    let seenList: string[] = []
                    participants.forEach((p: any) => {
                        if (cursorsMap[p._id] == index) {
                            seenList.push(p.fullname)
                        }
                    });
                    if (message.sender && message.sender === userId) {
                        return (
                            <OutGoingMessage
                                token={token}
                                key={index}
                                content={message.content}
                                timestamp={message.timestamp}
                                urls={message.urls}
                                seenList={seenList}
                            />
                        );
                    }
                    return (
                        <InComingMessage
                            token={token}
                            key={index}
                            avatarSRC={getSenderAvatar(message.sender, participantsLookupRef.current)}
                            content={message.content}
                            timestamp={message.timestamp}
                            urls={message.urls}
                            seenList={seenList}
                        />
                    );
                })
            }
        </>
    );
};

export default memo(MessagesView);
