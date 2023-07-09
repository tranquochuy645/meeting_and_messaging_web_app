import { FC } from 'react';
import './style.css';
import PendingFigure from '../PendingFigure';

interface CardProps {
    cardData: any[];
}

const Card: FC<CardProps> = ({ cardData }) => {
    const isGroup = cardData.length > 1;
    const groupMembers = cardData.slice(0, 4); // Get up to four group members

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
                        {cardData.length > 4 && (
                            <p className="group-members-count">+{cardData.length - 4} more</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {cardData[0] && cardData[0].avatar ? (
                        <img src={cardData[0].avatar} alt="Profile" className="profile-picture" />
                    ) : (
                        <PendingFigure size={30} />
                    )}
                    <div className="user-info">
                        {cardData[0] && cardData[0].fullname ? (
                            <h3>{cardData[0].fullname}</h3>
                        ) : (
                            <PendingFigure size={30} />
                        )}
                        {cardData[0] && cardData[0].isOnline !== undefined ? (
                            <p className={cardData[0].isOnline ? 'online' : 'offline'}>
                                {cardData[0].isOnline ? 'Online' : 'Offline'}
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

export default Card;
