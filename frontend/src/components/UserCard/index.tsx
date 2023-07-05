import { FC } from 'react';
import './style.css';
interface UserCardProps {
    name: string;
    profilePicture: string;
    isOnline: boolean;
}

const UserCard: FC<UserCardProps> = ({ name, profilePicture, isOnline }) => {
    return (
        <div className="user-card">
            <img src={profilePicture} alt="Profile" className="profile-picture" />
            <div className="user-info">
                <h3>{name}</h3>
                <p className={isOnline ? 'online' : 'offline'}>{isOnline ? 'Online' : 'Offline'}</p>
            </div>
        </div>
    );
};

export default UserCard;
