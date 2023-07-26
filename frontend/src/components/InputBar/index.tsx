import { FC, useState, memo } from "react"
import { useSocket } from "../SocketProvider"
import { ChangeEvent } from "react";
import './style.css'
interface InputBarProps {
    roomId: string
    onJustSent: () => void;
}
const InputBar: FC<InputBarProps> = ({ roomId, onJustSent }) => {
    const [textInputValue, setTextInputValue] = useState("");
    const socket = useSocket();
    const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextInputValue(event.target.value);
        console.log('typing ...');
    };

    const handleSendMessage = () => {
        if (textInputValue.trim() !== '') {
            socket?.emit("msg", [roomId, textInputValue, new Date()]);
            onJustSent();
            setTextInputValue('');
        }
    };
    return (
        <div id='chat-box_input-container'>
            <input
                type="text"
                value={textInputValue}
                id='input_message'
                onChange={handleTextInputChange}
                onKeyDown={(e) => { e.key == 'Enter' && handleSendMessage() }}
            />
            <button onClick={handleSendMessage} className="btn">
                <i className='bx bxs-send' ></i>
            </button>
        </div>
    )
}
export default memo(InputBar)