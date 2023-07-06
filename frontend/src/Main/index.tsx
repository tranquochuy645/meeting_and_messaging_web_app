import { FC, useState, useEffect } from 'react';
import './style.css';
import jsonData from './fakedata.json';
// import PendingFigure from '../components/PendingFigure';
import Layout from '../Layout/Desktop';
import FriendList from '../components/FriendList';
import ChatBox from '../components/ChatBox';

interface MainProps {
    token: string;
}

const Main: FC<MainProps> = ({ token }) => {
    const [data, setData] = useState<any>(null);

    const fetchData = (token: string): Promise<any> => {
        console.log(token);
        return new Promise((resolve) => {
            // Simulating an asynchronous API call
            setTimeout(() => {
                // Replace this with your actual API call
                // Once the data is fetched, resolve the promise
                resolve(jsonData);
            }, 2000);
        });
    };

    useEffect(() => {
        if (!data) {
            fetchData(token)
                .then((responseData) => {
                    setData(responseData);
                })
                .catch((error) => {
                    console.log('Error:', error);
                });
        }
    }, [token]);

    return (
        <Layout>
            <FriendList />
            <ChatBox />
        </Layout>
    );
};

export default Main;
