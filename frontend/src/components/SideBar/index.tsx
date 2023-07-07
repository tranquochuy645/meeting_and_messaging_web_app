import { FC, useEffect, useState } from 'react';
import Card from '../Card';
import './style.css';

interface SideBarProps {
    token: string;
    onRoomChange: (roomId: string) => void;
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

const SideBar: FC<SideBarProps> = ({ token, onRoomChange }) => {
    const [roomsInfo, setRoomsInfo] = useState<Array<any> | null>(null);

    useEffect(() => {
        if (token) {
            getRoomsInfo(token)
                .then((data) => {
                    setRoomsInfo(data);
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
                    {
                        roomsInfo.map(
                            (room: any) => (
                                <div key={room._id} onClick={() => onRoomChange(room._id)}>
                                    <Card
                                        cardData={room.participants}
                                    />
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
