import { FC, useEffect, useState, useRef, memo, useMemo, useCallback } from 'react';
import { OutGoingMessage, InComingMessage } from '../ChatMessage';
import { Message, ReadCursor } from '../MessagesContainer';
import { useSocket } from '../SocketProvider';

interface MessagesViewProps {
    readCursors: ReadCursor[];
    conversationLength: number;
    token: string;
    roomId: string;
    messages: Message[];
    userId: string;
    participants: any[];
}



const MessagesView: FC<MessagesViewProps> = ({ conversationLength, readCursors, token, messages, roomId, userId, participants }) => {
    const [cursorsMap, setCursorsMap] = useState<{ [key: string]: number }>({});
    const lengthRef = useRef(messages.length);
    const socket = useSocket();

    // Create a participant lookup map for quick access
    const participantsLookup: { [key: string]: any } = useMemo(() => {
        return Object.fromEntries(
            participants.map((participant) => [participant._id, participant])
        );
    }, [participants])

    // Function to get the sender's avatar based on message's sender
    const getSenderAvatar = useMemo(
        () => (id: string, participantLookup: { [key: string]: any }): string => {
            const sender = participantLookup[id];
            return sender ? sender.avatar : '';
        },
        []
    );

    const handleSeen = useCallback((msg: string[]) => {
        //msg: [room id, user id , date] 
        if (msg[0] !== roomId) return;
        setCursorsMap((prevCursorsMap) => {
            return {
                ...prevCursorsMap,
                [msg[1]]: lengthRef.current - 1
            };
        });
    }, [roomId])

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
        const updatedCursorsMap: { [key: string]: number } = {};
        readCursors
            .filter((cursor) => cursor._id != userId)
            .forEach((cursor) => {
                const cursorTimestamp = new Date(cursor.lastReadTimeStamp).getTime();
                let left = 0;
                let right = messages.length - 1;
                let index = -1;
                // binary search to find the latest message that is seen
                while (left <= right) {
                    const mid = Math.floor((left + right) / 2);
                    const messageTimestamp = new Date(messages[mid].timestamp).getTime();

                    if (messageTimestamp <= cursorTimestamp) {
                        index = mid;
                        left = mid + 1;
                    } else {
                        right = mid - 1;
                    }
                }
                if (index !== -1) {
                    updatedCursorsMap[cursor._id] = index;
                }
            });
        setCursorsMap(updatedCursorsMap);
    }, [readCursors]);




    return (
        <>
            {
                messages.map((message: Message, index: number) => {
                    const seenList = participants
                        .filter((p: any) => (cursorsMap[p._id] == index))
                        .map((p: any) => p.fullname);
                    if (message.sender && message.sender === userId) {
                        return (
                            <OutGoingMessage
                                token={token}
                                key={index}
                                index={conversationLength+index-messages.length}
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
                            index={conversationLength+index-messages.length}
                            avatarSRC={getSenderAvatar(message.sender, participantsLookup)}
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
