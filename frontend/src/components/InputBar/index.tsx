import { FC, useState, memo } from "react"
import { useSocket } from "../SocketProvider"
import { ChangeEvent } from "react";
import FileInput from "../FileInput";
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
    const handleUploadImage = (file: any) => { console.log(file) }
    const handleUploadFile = (file: any) => { console.log(file) }
    return (
        <div id='chat-box_input-container'>
            <FileInput
                accept="image/*"
                onChange={handleUploadImage}
                id="chatbox_upload-img"
                icon={
                    <i className='bx bx-image-add' ></i>
                } />
            <FileInput
                accept="*"
                onChange={handleUploadFile}
                id="chatbox_upload-file"
                icon={
                    <i className='bx bx-paperclip'></i>
                } />
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