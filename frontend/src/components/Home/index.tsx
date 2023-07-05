import { FC, useState, useEffect } from 'react';
import './style.css';
import jsonData from './fakedata.json';
import PendingFigure from '../PendingFigure';
import Layout from '../Layout/Desktop';

interface HomeProps {
    token: string;
}

const Home: FC<HomeProps> = ({ token }) => {
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
            <div className="message-app">
                {!data ? <PendingFigure size={300}/> : (
                    // Render actual content once data is fetched
                    <section className="main">
                        <div className="friends-list">
                            {data.friends.map((friend: any) => (
                                <div key={friend.id}>{friend.name}</div>
                            ))}
                        </div>

                        <div className="start-conversation">
                            <h2>Start a New Conversation</h2>
                            {data.conversations.map((conversation: any) => (
                                <div key={conversation.id}>
                                    Participants: {conversation.participants.join(', ')}
                                </div>
                            ))}
                        </div>

                        <div className="message-list">
                            {data.conversations.map((conversation: any) => (
                                <div key={conversation.id}>
                                    {conversation.messages.map((message: any) => (
                                        <div key={message.id}>
                                            {message.sender}: {message.content}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="message-input">
                            {/* Render message input */}
                            {/* Replace this with your actual message input component */}
                            <input type="text" placeholder="Type your message..." />
                            <button>Send</button>
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default Home;
