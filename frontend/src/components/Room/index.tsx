import { FC } from 'react';
import './style.css';
import PendingFigure from '../PendingFigure';


interface RoomProps {
    roomData: any[];
    userId: string;
}

const Room: FC<RoomProps> = ({ roomData, userId }) => {
    roomData = roomData.filter(user => user._id !== userId)
    const isGroup = roomData.length > 1;
    const groupMembers = roomData.slice(0, 4); // Get up to four group members
    return (
        <div className="user-card">
            {isGroup ? (
                <>
                    <div className="group-pictures-container">
                        {groupMembers.map((profile, index) => (
                            <div key={index} className="profile">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="group-profile-picture" />
                                ) : (
                                    <PendingFigure size={5} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="profile-names">
                        {groupMembers.length > 0 && (
                            <h3>{groupMembers.map((profile) => profile.fullname).join(', ')}</h3>
                        )}
                        {roomData.length > 4 && (
                            <p className="group-members-count">+{roomData.length - 4} more</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {roomData[0] && roomData[0].avatar ? (
                        <img src={roomData[0].avatar} alt="Profile" className="profile-picture" />
                    ) : (
                        <PendingFigure size={30} />
                    )}
                    <div className="user-info">
                        {roomData[0] && roomData[0].fullname ? (
                            <h3>{roomData[0].fullname}</h3>
                        ) : (
                            <PendingFigure size={30} />
                        )}
                        {roomData[0] && roomData[0].isOnline !== undefined ? (
                            <p className={roomData[0].isOnline ? 'online' : 'offline'}>
                                {roomData[0].isOnline ? 'Online' : 'Offline'}
                            </p>
                        ) : (
                            <PendingFigure size={15} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Room