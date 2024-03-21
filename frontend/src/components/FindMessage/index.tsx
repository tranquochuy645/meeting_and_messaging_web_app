import { FC, useRef, KeyboardEvent, useState, useEffect, memo } from "react"
import { Message } from "../MessagesContainer"
import "./style.css"
interface MessageWithIndex extends Message {
    index: number; // Real index in the context of the full conversation
}
interface FindMessageProps {
    onJumpToMessage: (index: number) => void
    roomId: string
    token: string
}

const FindMessage: FC<FindMessageProps> = ({ roomId, token, onJumpToMessage }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [highLight, setHighLight] = useState(-1);
    const [searchResults, setSearchResults] = useState<MessageWithIndex[]>([]);
    const handleSearch = () => {
        const searchTerm = searchInputRef.current?.value;
        if (!searchTerm) {
            return;
        }
        fetch(
            "/api/v1/rooms/" + roomId + "?regex=" + searchTerm,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "authorization": "Bearer " + token
                }
            }
        ).then(
            (response) => {
                if (response.ok) {
                    response.json().then(
                        data => {
                            setSearchResults(data);
                            setHighLight(
                                data.length > 0 ?
                                    data.length - 1
                                    :
                                    -1
                            );
                        }
                    )
                }
            }
        )
    };
    const handleClear = () => {
        searchResults.forEach(
            r => document.getElementById("msg-" + r.index)?.classList.remove("highlight")
        );
        if (searchInputRef.current)
            searchInputRef.current.value = "";
        setSearchResults([]);
        setHighLight(-1);
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const handleUp = () => {
        setHighLight(
            (prev) => {
                if (prev > 0)
                    return --prev;
                return prev;
            })
    }
    const handleDown = () => {
        setHighLight(
            (prev) => {
                if (prev < searchResults.length - 1)
                    return ++prev;
                return prev;
            })
    }

    useEffect(() => {
        if (highLight < 0) return;
        searchResults[highLight] && onJumpToMessage(searchResults[highLight].index);
    }, [highLight])

    useEffect(() => {
        handleClear();
    }, [roomId])

    return (
        <div className="search-container">
            <i className='search_symbol bx bx-search' ></i>
            <input
                className="search_input"
                type="text"
                placeholder="Search for messages..."
                ref={searchInputRef}
                onKeyPress={handleKeyPress}
            />
            {
                searchInputRef.current?.value &&
                (<div className="search_result">
                    <button className="search_btn" onClick={() => handleUp()}>
                        <i className='bx bxs-chevron-up'></i>
                    </button>
                    <button className="search_btn" onClick={() => handleDown()}>
                        <i className='bx bxs-chevron-down'></i>
                    </button>
                    <p>
                        {
                            highLight + 1 + " of " +
                            searchResults.length + " result" +
                            (searchResults.length > 1 ? "s" : "")
                        }
                    </p>
                    <button className="search_btn" onClick={() => handleClear()}>
                        <i className='bx bx-x'></i>
                    </button>
                </div>
                )
            }
        </div >
    )
}
export default memo(FindMessage);