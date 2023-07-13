import { FC, useEffect, useState, useMemo } from 'react';
import Room from '../Room';
import './style.css';
import { getSocket } from '../../SocketController';
import { ChatRoom } from '../ChatBox';
import SearchBar from '../SearchBar';

interface SideBarProps {
    userId: string;
    currentRoomIndex: number;
    token: string;
    onRoomChange: (index: number) => void;
    onUpdateStatus: (roomsInfo: ChatRoom[]) => void;
}

const getRoomsInfo = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        fetch('/api/rooms', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Authorization: 'Bearer ' + token,
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
                    window.location.reload();
                }
                throw new Error('Failed to fetch rooms information');

            })
            .catch((error) => {
                reject(error);
            });
    });
};

const SideBar: FC<SideBarProps> = ({ userId, currentRoomIndex, token, onRoomChange, onUpdateStatus }) => {
    const [roomsInfo, setRoomsInfo] = useState<ChatRoom[]>([]);
    const handleOnlineUpdate = (msg: string[]) => {
        const [senderId, senderSocketId] = msg;
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
                            socketId: participant.socketId.includes(senderSocketId) ? participant.socketId : [...participant.socketId, senderSocketId]
                        };
                    }
                    return participant;
                });

                return { ...room, participants: updatedParticipants };
            });
        });
    };
    const handleOfflineUpdate = (msg: string[]) => {
        const [senderId, senderSocketId] = msg;

        setRoomsInfo((prevRoomsInfo) => {
            if (!prevRoomsInfo) {
                return prevRoomsInfo;
            }

            return prevRoomsInfo.map((room) => {
                const updatedParticipants = room.participants.map((participant) => {
                    if (participant._id === senderId) {
                        const updatedSocketIds = participant.socketId.filter((socketId) => socketId !== senderSocketId);

                        return {
                            ...participant,
                            isOnline: updatedSocketIds.length > 0, // Update the online status based on remaining socket IDs
                            socketId: updatedSocketIds,
                        };
                    }

                    return participant;
                });

                return { ...room, participants: updatedParticipants };
            });
        });
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
        if (token) {
            getRoomsInfo(token)
                .then((data) => {
                    setRoomsInfo(data);
                    const targetIds = Array.from(
                        new Set(
                            data.flatMap((obj: ChatRoom) =>
                                obj.participants
                                    .filter((participant) => participant.isOnline)
                                    .flatMap((participant) => participant.socketId)
                            )
                        )
                    );

                    // The resulting targetIds array will not contain null or undefined values
                    const socket = getSocket(token);
                    socket.on("onl", handleOnlineUpdate);
                    socket.on("off", handleOfflineUpdate);
                    //announce other sockets in the room that I'm online
                    socket.emit("onl", targetIds);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [token]);

    const roomList = useMemo(() => {
        return roomsInfo.map(
            (room: ChatRoom, index: number) => (
                <div className={`chat-room ${index == currentRoomIndex ? 'active' : ''}`}
                    key={room._id}
                    onClick={() => handleRoomClick(index)}>
                    <Room userId={userId} roomData={room.participants} />
                </div>
            ))
    }, [roomsInfo])

    return (
        <div id='SideBar'>
            <SearchBar/>
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

export default SideBar;
