import { FC, useState, useEffect } from 'react';
import './style.css';
import Layout from '../Layout/Desktop';
import SideBar from '../components/SideBar';
import ChatBox from '../components/ChatBox';
interface MainProps {
    token: string;
}
export interface ProfileData {
    _id: string;
    fullname: string;
    avatar: string;
    isOnline: boolean;
    rooms: string[];
}



const getProfile = (token: string): Promise<any> => {
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
            } else {
                throw new Error('Failed to fetch user profile');
            }
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
        <Layout userData={profileData}>
            <SideBar token={token} onRoomChange={handleRoomChange} onUpdateStatus={handleUpdate} />
            {
                roomsInfo.length > 0
                && <ChatBox
                    token={token}
                    thisUserId={profileData?._id}
                    thisUserAvatar={profileData?.avatar}
                    room={roomsInfo[currentRoomIndex]} />
            }
        </Layout>
    );
};

export default Main;
