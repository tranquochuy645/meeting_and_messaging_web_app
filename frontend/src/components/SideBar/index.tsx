import { FC, useEffect, useState } from 'react';
import Card from '../Card';
import './style.css';
import { getSocket } from '../../SocketController';
import { ChatRoom } from '../ChatBox';

interface SideBarProps {
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
                    response.json().then((data) => {
                        resolve(data);
                    });
                } else {
                    throw new Error('Failed to fetch rooms information');
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};
let socket: any;
let targetIds: Array<string>;
const SideBar: FC<SideBarProps> = ({ currentRoomIndex, token, onRoomChange, onUpdateStatus }) => {
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
                    targetIds = Array.from(
                        new Set(
                            data.flatMap((obj: ChatRoom) =>
                                obj.participants
                                    .filter((participant) => participant.isOnline)
                                    .flatMap((participant) => participant.socketId)
                            )
                        )
                    );

                    // The resulting targetIds array will not contain null or undefined values
                    socket = getSocket(token);
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

    return (
        <div id='SideBar'>
            {roomsInfo && roomsInfo.length > 0 ? (
                <div>
                    {roomsInfo.map((room: ChatRoom, index: number) => (
                        <div className={`chat-room ${index == currentRoomIndex ? 'active' : ''}`}
                            key={room._id}
                            onClick={() => onRoomChange(index)}>
                            <Card cardData={room.participants} />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No rooms to display</p>
            )}
        </div>
    );
};

export default SideBar;
