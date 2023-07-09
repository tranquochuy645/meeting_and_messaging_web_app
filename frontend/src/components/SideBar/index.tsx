import { FC, useEffect, useState } from 'react';
import Card from '../Card';
import './style.css';
import { getSocket } from '../../SocketController';
import { ChatRoom, Participant } from '../ChatBox';

interface SideBarProps {
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
const SideBar: FC<SideBarProps> = ({ token, onRoomChange, onUpdateStatus }) => {
    const [roomsInfo, setRoomsInfo] = useState<ChatRoom[]>([]);
    const handleStatusUpdate = (msg: string[]) => {
        const senderId = msg[0];
        const senderSocketId = msg[1];

        setRoomsInfo(prevRoomsInfo => {
            if (prevRoomsInfo) {
                const updatedRoomsInfo = prevRoomsInfo.map(
                    room => {
                        const updatedParticipants = room.participants.map(
                            (participant: Participant) => {
                                if (participant._id == senderId) {
                                    return {
                                        ...participant,
                                        isOnline: true,
                                        socketId: [senderSocketId]
                                    };
                                }
                                return participant;
                            });

                        return {
                            ...room,
                            participants: updatedParticipants
                        };
                    });

                return updatedRoomsInfo;
            }

            return prevRoomsInfo;
        });
    };
    useEffect(
        () => {
            if (roomsInfo.length > 0) {
                onUpdateStatus(roomsInfo);
            }
            console.log(roomsInfo + "jdfhfidu");
        }, [roomsInfo])


    useEffect(() => {
        if (token) {
            getRoomsInfo(token)
                .then((data) => {
                    setRoomsInfo(data);
                    console.log(data);
                    targetIds = Array.from(
                        new Set(
                            data.flatMap(
                                (obj: ChatRoom) => obj.participants
                                    .filter(participant => participant.isOnline)
                                    .map(participant => participant.socketId)
                            )
                        )
                    );
                    targetIds = targetIds.flat()
                    console.log(targetIds + "Sdfsdfhsiudfsiudfhsu");
                    // The resulting targetIds array will not contain null or undefined values
                    socket = getSocket(token);
                    socket.on("onl", handleStatusUpdate);
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
                        <div key={room._id} onClick={() => onRoomChange(index)}>
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
