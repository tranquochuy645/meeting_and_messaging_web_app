// import UserCard from '../UserCard'; import './style.css';
import { FC, useEffect } from 'react';
interface AsideLeftProps {
    rooms: any;
    token: string;
}
const AsideLeft: FC<AsideLeftProps> = ({ rooms, token }) => {
    useEffect(() => {
        rooms && rooms.length && rooms.length > 0
            && rooms.forEach(
                (room: string) => {
                    fetch(`/api/rooms/${room}`, {
                        method: 'GET',
                        headers: {
                            'content-type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    })
                        .then((response) => {
                            if (response.ok) {
                                // response.json().then((data) => {

                                // });
                            } else {
                                throw new Error('Failed to fetch room');
                            }
                        })
                        .catch((error) => {
                            throw error
                        });
                }
            );
    }, [rooms])

    return (
        <div id='asideLeft'>
            {rooms.length > 0 ? (
                <div>
                    {/* {
                        rooms.map(
                            (room: any) => {
                                switch (room.type) {
                                    case "global":
                                        return (
                                            <h2>#World Channel</h2>
                                        )
                                    case "group":
                                        return (
                                            <h2>{
                                                room.participants.map(
                                                    (participant: any) => {
                                                        return (
                                                            <>
                                                                #{participant}
                                                            </>
                                                        )
                                                    }
                                                )
                                            }</h2>
                                        )
                                    case "direct":
                                        return (
                                            <h2>????</h2>
                                        )
                                    default:
                                        return null

                                }
                                if (room.type == "global") {
                                    return (
                                        <h2>#World Channel</h2>
                                    )
                                } else {
                                    return (
                                        room.patici
                                    )
                                }
                            }
                        )
                    } */}
                </div>
            ) : (
                <p>No rooms to display</p>
            )}
        </div>
    );
};

export default AsideLeft;
