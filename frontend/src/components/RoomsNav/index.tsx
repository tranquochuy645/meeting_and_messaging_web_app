import { FC, useEffect, useState, useMemo } from 'react';
import RoomProfile from '../RoomProfile';
import RoomOpts from '../RoomOpts';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketProvider';
import { Message } from '../MessagesContainer';
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
    isMeeting: boolean;
    meeting_uuid: string | null;
    latestMessage: Message;
    lastReadTimeStamp: string | null;
}
interface RoomsListProps {
    userId: string;
    currentRoomIndex: number;
    token: string;
    onRoomChange: (index: number) => void;
    onUpdateStatus: (roomsInfo: ChatRoom[]) => void;
}

const getRoomsInfo = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        fetch('/api/v1/rooms', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + token,
            },
        })
            .then((response) => {
                if (response.ok) {
                    return response.json().then((data) => {
                        resolve(data);
                    });
                }
                if (response.status == 401) {
                    alert("Token expired");
                    sessionStorage.removeItem('token');
                    throw new Error()
                }
                if (response.status == 404) {
                    resolve([]); // No room available
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const RoomsNav: FC<RoomsListProps> = ({ userId, currentRoomIndex, token, onRoomChange, onUpdateStatus }) => {
    const [roomsInfo, setRoomsInfo] = useState<ChatRoom[]>([]);
    const socket = useSocket()
    const navigate = useNavigate();
    const handleOnlineUpdate = (msg: string) => {
        const senderId = msg;
        setRoomsInfo(prevRoomsInfo => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }

            return prevRoomsInfo.map(room => {
                const updatedParticipants = room.participants.map(participant => {
                    if (participant._id === senderId) {
                        return {
                            ...participant,
                            isOnline: true,
                        };
                    }
                    return participant;
                });
                return { ...room, participants: updatedParticipants };
            });
        });
    };
    const handleOfflineUpdate = (msg: string) => {
        const senderId = msg;
        setRoomsInfo((prevRoomsInfo) => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }

            return prevRoomsInfo.map((room) => {
                const updatedParticipants = room.participants
                    .map(
                        (participant) => {
                            if (participant._id === senderId) {

                                return {
                                    ...participant,
                                    isOnline: false, // Update the online status based on remaining socket IDs
                                };
                            }

                            return participant;
                        });

                return { ...room, participants: updatedParticipants };
            });
        });
    };
    const handleMeetUpdate = (msg: string[]) => {
        // msg : [ senderId, roomId , meetingId , date]
        // console.log("set meet")
        setRoomsInfo((prevRoomsInfo) => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }
            return prevRoomsInfo.map((room) => {
                if (room._id === msg[1]) {
                    return {
                        ...room,
                        isMeeting: true,
                        meeting_uuid: msg[2],
                    };
                }
                return room;
            });
        });
    };

    const handleEndMeetUpdate = (msg: string[]) => {
        // msg : [  roomId ]
        // console.log("set end meet")

        setRoomsInfo((prevRoomsInfo) => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }
            return prevRoomsInfo.map((room) => {
                if (room._id === msg[0] && room.isMeeting) {
                    return {
                        ...room,
                        isMeeting: false,
                        meeting_uuid: null,
                    };
                }
                return room;
            });
        });
    };
    const handleRoomsRefresh = () => {
        // Received a ping from the server to resfresh rooms information
        getRoomsInfo(token)
            .then(
                (data) => {
                    setRoomsInfo(data);
                }
            ).catch(() => {
                navigate("/auth");
            })
    };
    const handleRoomClick = (index: number) => {
        // I do this to prevent re-rendering the whole list
        const rooms = document.querySelectorAll('.chat-room')
        rooms?.forEach(
            (room) => { room.classList?.remove('active') }
        )
        rooms[index]?.classList?.add('active')
        onRoomChange(index);
    }
    const handleReceiveMessage = (msg: any[]) => {
        //msg: [sender, room id, content, date, [urls]]
        // console.log(msg);
        setRoomsInfo(prevRoomsInfo => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }
            return prevRoomsInfo.map(room => {
                if (room._id === msg[1]) {
                    return {
                        ...room,
                        latestMessage:
                        {
                            sender: msg[0],
                            content: msg[2],
                            timestamp: msg[3],
                            urls: msg[4],
                        }
                    };
                }
                return room; // Return 'room' if the condition is not met
            });
        });
    };

    const handleSeen = (msg: string[]) => {
        //msg: [room id, user id , date] 
        if (msg[1] !== userId) return
        setRoomsInfo((prev) => {
            return prev.map((room) => {
                if (room._id === msg[0])
                    return { ...room, lastReadTimeStamp: msg[2] }
                return room
            })
        })
    }

    useEffect(
        () => {
            if (roomsInfo.length > 0) {
                onUpdateStatus(roomsInfo);
            }
        }, [roomsInfo])

    useEffect(() => {
        if (socket) {
            socket.on("onl", handleOnlineUpdate);
            socket.on("off", handleOfflineUpdate);
            socket.on("meet", handleMeetUpdate);
            socket.on("end_meet", handleEndMeetUpdate);
            socket.on("room", handleRoomsRefresh);
            socket.on("msg", handleReceiveMessage);
            socket.on("seen", handleSeen);
            return (() => {
                socket.off("onl", handleOnlineUpdate);
                socket.off("off", handleOfflineUpdate);
                socket.off("meet", handleMeetUpdate);
                socket.off("end_meet", handleEndMeetUpdate);
                socket.off("room", handleRoomsRefresh);
                socket.off("msg", handleReceiveMessage)
                socket.off("seen", handleSeen);
            })
        }
    }, [socket])
    useEffect(() => {
        getRoomsInfo(token)
            .then((data) => {
                setRoomsInfo(data);
            })
            .catch(() => {
                navigate("/auth");
            });
    }, []);

    const handleAction = async (action: string, roomId: string) => {
        switch (action) {
            case 'leave':
                return fetch(`/api/v1/rooms/${roomId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'content-type': 'application/json',
                            'authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(
                            {
                                action
                            }
                        )
                    }
                )
            case 'delete':
                return fetch(`/api/v1/rooms/${roomId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'content-type': 'application/json',
                            'authorization': 'Bearer ' + token
                        }
                    }
                )
        }
    }
    const roomList = useMemo(() => {
        return roomsInfo.map(
            (room: ChatRoom, index: number) => {
                const myCursor = room?.lastReadTimeStamp;
                const latestMessageContent = room?.latestMessage?.content;
                const latestMessageTimestamp = room?.latestMessage?.timestamp;
                const isUnread =
                    latestMessageTimestamp &&
                    myCursor &&
                    new Date(latestMessageTimestamp) > new Date(myCursor) &&
                    index !== currentRoomIndex;
                return (
                    <div className={`chat-room ${index == currentRoomIndex ? 'active' : ''}`}
                        onClick={() => handleRoomClick(index)}
                        key={room._id}>
                        <div className='chat-room_info' >
                            <RoomProfile userId={userId} participants={room.participants} />
                            <p className={`last-msg ${isUnread ? "unread" : ""}`}>{latestMessageContent}</p>
                            {/* <p>{isUnread ? 'Unread' : 'All Read'}</p> */}
                        </div>
                        <RoomOpts handleAction={handleAction} roomId={room._id} />
                    </div>
                )
            })
    }, [roomsInfo])

    return (
        <div id='rooms-nav'>
            {roomsInfo && roomsInfo.length > 0 ? (
                <div>
                    {roomList}
                </div>
            ) : (
                <p>No rooms to display</p>
            )}
        </div>
    );
};

export default RoomsNav;
