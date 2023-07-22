import SearchBar from '../SearchBar';
import { FC, useState } from 'react';
import './style.css'
interface RoomMakerProps {
    token: string;
}
const RoomMaker: FC<RoomMakerProps> = ({ token }) => {
    const [usersList, setUsersList] = useState<any[]>([])
    const handleChooseUser = (user: any) => {
        if (usersList.some(el => el._id == user._id)) {
            return alert("already selected this user")
        }
        setUsersList((prev) => [...prev, user])
    }
    const removeUserFromUsersList = (index: number) => {
        console.log('remove user from users list');
        if (index >= 0 && index < usersList.length) {
            setUsersList((prev) => {
                const updatedList = prev.filter((_, i) => i !== index);
                return updatedList;
            });
        }
    };
    const handleCreateNewRoom = async () => {
        if (usersList.length == 0) {
            return alert('Please select a user');
        }
        const userIdsList = usersList.map(user => user._id);
        try {
            const response = await fetch(
                "/api/v1/rooms",
                {
                    method: 'POST',
                    headers: {
                        "content-type": "application/json",
                        "authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        invited: userIdsList
                    })
                }
            )
            if (response.ok) {
                setUsersList([]);
            } else {
                alert("deo biet sao bug luon")
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div id="room-maker">
            <SearchBar token={token} onChoose={handleChooseUser} />
            {
                usersList.length > 0 && (
                    <div className='flex'>
                        <div id="chosenList" className='flex'>{usersList.map(
                            (user, index) => {
                                return (
                                    <div className='chosenUser flex' key={user.fullname}>
                                        <p> {user.fullname}</p>
                                        <span onClick={
                                            () => removeUserFromUsersList(index)
                                        }>X</span>
                                    </div >
                                )
                            }

                        )}
                        </div>
                        <button className='btn' onClick={handleCreateNewRoom}>
                            <i className='bx bxs-message-square-add' ></i>
                        </button>
                    </div>
                )
            }

        </div>
    );
};

export default RoomMaker;
