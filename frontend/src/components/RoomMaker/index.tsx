import { FC, useState, useRef, useEffect, KeyboardEvent } from 'react';

import './style.css'
interface RoomMakerProps {
    token: string;
}
const RoomMaker: FC<RoomMakerProps> = ({ token }) => {
    const [usersList, setUsersList] = useState<any[]>([])
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    const handleSearch = () => {
        const searchTerm = searchInputRef.current?.value;
        if (!searchTerm) {
            return;
        }

        fetch(
            `/api/v1/search/${searchTerm}`,
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + token
                }
            }
        )
            .then(response => {
                if (response.ok) {
                    return response.json().then(
                        data => {
                            setSearchResults(data);
                        }
                    );
                }
                console.log(response.status);
            });
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            searchInputRef.current &&
            !searchInputRef.current.contains(event.target as Node)
        ) {
            setSearchResults([]);
            searchInputRef.current.value = "";
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div id="room-maker" className={`${searchResults.length > 0 ? "focus" : ""}`}>
            <div id="search-bar-wrapper" className='flex'>
                <div id="search-bar">
                    {/* <button className='btn' onClick={handleSearch}><i className='bx bx-search' ></i></button> */}
                    <div id="chosenList" className='flex'>{usersList.map(
                        (user, index) => {
                            return (
                                <div className='chosenUser flex' key={user.fullname}>
                                    <p> {user.fullname}</p>
                                    <span onClick={
                                        () => removeUserFromUsersList(index)
                                    }><i className='bx bx-x-circle' ></i></span>
                                </div >
                            )
                        }

                    )}
                        {
                            usersList.length > 0 && (
                                <div className='flex'>
                                    <button className='btn' onClick={handleCreateNewRoom}>
                                        <i className='bx bxs-message-square-add ' id='btn_createroom' ></i>
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    <input
                        type="text"
                        placeholder="Search for users..."
                        ref={searchInputRef}
                        onKeyPress={handleKeyPress}
                    />
                </div>

            </div>
            {searchResults.length > 0 && (
                <div id="search_dropdown">
                    {searchResults.map(result => (
                        <div className="search_dropdown_opts"
                            key={result._id}
                            onClick={
                                () => {
                                    handleChooseUser({ _id: result._id, fullname: result.fullname })
                                }}>
                            <img className='profile-picture' src={result.avatar} alt="Avatar" />
                            <h3>{result.fullname}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomMaker;
