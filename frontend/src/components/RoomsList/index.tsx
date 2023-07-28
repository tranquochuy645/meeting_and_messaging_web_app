import { FC, useEffect, useState, useMemo } from 'react';
import Room from '../Room';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketProvider';
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
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const RoomsList: FC<RoomsListProps> = ({ userId, currentRoomIndex, token, onRoomChange, onUpdateStatus }) => {
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
        console.log("set meet")
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
        console.log("set end meet")

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
    const handleRoomRefresh = () => {
        // Received a ping from the server to resfresh room information
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
        const rooms = document.querySelectorAll('.chat-room')
        rooms?.forEach(
            (room) => { room.classList?.remove('active') }
        )
        rooms[index]?.classList?.add('active')
        onRoomChange(index);
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
            socket.on("room", handleRoomRefresh);
            return (() => {
                socket.off("onl", handleOnlineUpdate);
                socket.off("off", handleOfflineUpdate);
                socket.off("meet", handleMeetUpdate);
                socket.off("end_meet", handleEndMeetUpdate);
                socket.off("room", handleRoomRefresh);
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

    const handleChange = async (event: any, roomId: string) => {
        event.preventDefault();
        const selectedOption = event.target.value;
        switch (selectedOption) {
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
                                action: selectedOption
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
            (room: ChatRoom, index: number) => (
                <div className={`chat-room ${index == currentRoomIndex ? 'active' : ''}`}
                    key={room._id}>
                    <div onClick={() => handleRoomClick(index)}>
                        <Room userId={userId} participants={room.participants} />
                    </div>
                    <select onChange={(e) => handleChange(e, room._id)} defaultValue="">
                        <option value="" disabled>Select an option</option>
                        <option value="delete">Delete</option>
                        <option value="leave">Leave</option>
                    </select>
                </div>
            ))
    }, [roomsInfo])

    return (
        <div id='rooms-list'>
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

export default RoomsList;
