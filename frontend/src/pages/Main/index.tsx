import { FC, useState, useEffect } from 'react';
import './style.css';
import SideBar from '../../components/SideBar';
import ChatBox from '../../components/ChatBox';
import TopBar from '../../components/TopBar';
import PendingFigure from '../../components/PendingFigure';
interface MainProps {
    token: string;
}
export interface ProfileData {
    _id: string;
    fullname: string;
    avatar: string;
    isOnline: boolean;
    rooms: string[];
    invitations: string[];
}



export const getProfile = (token: string): Promise<any> => {
    return fetch('/api/users/', {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            if (response.status == 401) {
                alert("Token expired");
                sessionStorage.removeItem('token');
                window.location.reload();
            }
            throw new Error('Failed to fetch user profile');
        });
};

const Main: FC<MainProps> = ({ token }) => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [roomsInfo, setRoomsInfo] = useState<any[]>([]);
    const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
    const handleRoomChange = (index: number) => {
        setCurrentRoomIndex(index);
    }
    const handleUpdate = (rooms: any) => {
        setRoomsInfo(rooms);
    }


    useEffect(() => {
        if (token) {
            getProfile(token)
                .then((data: any) => {
                    setProfileData(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [token]);


    return (
        <>
            {
                profileData ?
                    <TopBar token={token} profileData={profileData} />
                    :
                    <PendingFigure size={100} />}
            {
                profileData ?
                    (<main className='flex'>
                        <SideBar userId={profileData._id}
                            currentRoomIndex={currentRoomIndex}
                            token={token} onRoomChange={handleRoomChange}
                            onUpdateStatus={handleUpdate} />
                        {
                            roomsInfo.length > 0
                            && <ChatBox
                                profile={profileData}
                                token={token}
                                room={roomsInfo[currentRoomIndex]} />
                        }
                    </main>)
                    :
                    (<PendingFigure size={500} />)
            }
            <footer style={{ display: "none" }}>
                <p>© 2023 Messaging App. All rights reserved.</p>
            </footer >
        </>
    );
};

export default Main;
