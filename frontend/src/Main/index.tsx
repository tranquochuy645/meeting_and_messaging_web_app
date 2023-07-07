import { FC, useState, useMemo } from 'react';
import './style.css';
// import jsonData from './fakedata.json';
// import PendingFigure from '../components/PendingFigure';
import Layout from '../Layout/Desktop';
import AsideLeft from '../components/AsideLeft';
import ChatBox from '../components/ChatBox';

interface MainProps {
    token: string;
}
const getProfile = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        fetch('/api/users/', {
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
                    reject(new Error('Failed to fetch user profile'));
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const Main: FC<MainProps> = ({ token }) => {
    const [profileData, setProfileData] = useState(
        {
            _id: "",
            rooms: [
            ],
        }
    );
    useMemo(
        () => {
            if (token) {
                getProfile(
                    token,
                ).then(
                    (data: any) => {
                        setProfileData(data);
                        // console.log(data);
                    }
                );
            }
        }, [token]
    )

    return (
        <Layout _id={profileData._id}>
            <AsideLeft rooms={profileData.rooms} token={token} />
            <ChatBox />
        </Layout>
    );
};

export default Main;
