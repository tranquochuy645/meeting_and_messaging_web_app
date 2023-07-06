import UserCard from '../UserCard';
import friendsData from '../../dataModels/friendsData.json';
import './style.css';

const FriendList = () => {
    const friends = friendsData
    return (
        <div id='friendList'>
            <h2>Friend List</h2>
            {friends.length > 0 ? (
                <div>
                    {friends.map((friend: any) => (
                        <UserCard
                            key={friend.id}
                            name={friend.name}
                            profilePicture={friend.profilePicture}
                            isOnline={friend.isOnline}
                        />
                    ))}
                </div>
            ) : (
                <p>No friends to display</p>
            )}
        </div>
    );
};

export default FriendList;
