import { FC, memo } from 'react';
import './style.css';

interface Participant {
    _id: string;
    avatar: string;
    fullname: string;
    isOnline: boolean;
    bio?: string;
}
interface RoomProfileProps {
    participants: Participant[];
    userId: string;
}

const RoomProfile: FC<RoomProfileProps> = ({ participants, userId }) => {
    participants = participants.filter(user => user._id !== userId)
    if (participants.length === 0) {
        return (
            <div className="card">
                <h3>No other participants in this room.</h3>
            </div>
        );
    }

    const isGroup = participants.length > 1;
    const groupMembers = participants.slice(0, 4); // Get up to four group members


    return (
        <div className="card">
            {isGroup ? (
                <>
                    <div className="group-pictures-container">
                        {groupMembers.map((profile, index) => (
                            <div key={index} className="profile">
                                <img src={profile.avatar} alt="Profile" className="group-profile-picture" />
                            </div>
                        ))}
                    </div>
                    <div className="profile-names">
                        {groupMembers.length > 0 && (
                            <h3>{groupMembers.map((profile) => profile.fullname).join(', ')}</h3>
                        )}
                        {participants.length > 4 && (
                            <p className="group-members-count">+{participants.length - 4} more</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <img src={participants[0].avatar} alt="Profile" className="profile-picture" />
                    <h3>
                        {participants[0].fullname + "  "}
                        <span className={participants[0].isOnline ? 'online' : 'offline'}>
                            &bull;
                        </span>
                    </h3>
                    {participants[0].bio && <p>{participants[0].bio}</p>}
                </>
            )}
        </div>
    );
};

export default memo(RoomProfile);
