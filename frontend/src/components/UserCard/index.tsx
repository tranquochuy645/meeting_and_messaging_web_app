import { FC, useEffect, useState } from 'react';
import './style.css';
import PendingFigure from '../PendingFigure';
interface UserCardProps {
    userId: string;
}
const getUserCardProps = async (userId: string): Promise<any> => {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else if (response.status === 404) {
            throw new Error('User not found');
        } else {
            throw new Error('Internal Server Error');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const UserCard: FC<UserCardProps> = ({ userId }) => {
    const [props, setProps] = useState(
        {
            fullname: undefined,
            avatar: undefined
        }
    );
    let isOnline;
    useEffect(
        () => {
            if (userId) {
                getUserCardProps(
                    userId
                ).then(
                    (data) => {
                        setProps(data)
                        console.log(data);
                    }
                )
            }
        }, [userId]
    );


    return (
        <div className="user-card">
            {
                props.avatar ?
                    <img src={props.avatar} alt="Profile" className="profile-picture" />
                    :
                    <PendingFigure size={30} />
            }

            <div className="user-info">
                {
                    props.fullname ?
                        <h3>{props.fullname}</h3>
                        :
                        <PendingFigure size={30} />
                }
                {
                    isOnline !== undefined ?
                        <p className={isOnline ? 'online' : 'offline'}>{isOnline ? 'Online' : 'Offline'}</p>
                        :
                        <PendingFigure size={30} />
                }
            </div>
        </div>
    );
};

export default UserCard;
