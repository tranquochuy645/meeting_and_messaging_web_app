import { FC, useRef, KeyboardEvent, useState } from "react"
import { Message } from "../MessagesContainer"
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
    const [searchResults, setSearchResults] = useState<MessageWithIndex[]>([]);
    const handleSearch = () => {
        const searchTerm = searchInputRef.current?.value;
        if (!searchTerm) {
            return;
        }
        fetch(
            "/api/v1/rooms/" + roomId + "?regex=" + searchTerm + "&limit=10",
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
                            setSearchResults(data)
                        }
                    )
                }
            }
        )
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    return (
        <div>
            <div className="flex">
                <input
                    type="text"
                    placeholder="Search for messages..."
                    ref={searchInputRef}
                    onKeyPress={handleKeyPress}
                />
                {searchInputRef.current?.value && (<p>{searchResults.length} result{searchResults.length > 1 && "s"}</p>)}
            </div>
            {searchResults.map(
                (el) => (
                    <div key={el.index+"res"} onClick={
                        () => {
                            onJumpToMessage(el.index);
                            setSearchResults([]);
                        }
                    }>{el.content+"-"+el.index}</div>
                )
            )}
        </div>
    )
}
export default FindMessage