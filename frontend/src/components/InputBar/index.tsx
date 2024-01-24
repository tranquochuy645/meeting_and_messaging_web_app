import { FC, useState, memo } from "react"
import { useSocket } from "../SocketProvider"
import { ChangeEvent } from "react";
import FileInput from "../FileInput";
import { getPresignedPost, postFile } from "../../lib/uploadFile";

import './style.css'
interface InputBarProps {
    token: string;
    userId: string;
    roomId: string;
    onJustSent: () => void;
}

const InputBar: FC<InputBarProps> = ({ token, userId, roomId, onJustSent }) => {
    const [textInputValue, setTextInputValue] = useState("");
    const [filesInput, setFilesInput] = useState<File[]>([]);
    const [mediaInput, setMediaInput] = useState<File[]>([]);
    const socket = useSocket();


    const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextInputValue(event.target.value);
        console.log('typing ...');
        //TODO: Send typing signal to other users 
    };

    const handleSendMessage = async () => {
        if (textInputValue.trim() !== '') {
            // Just send the text msg first
            socket?.emit("msg", [roomId, textInputValue, new Date(), []]);
            onJustSent(); // Signal for parent
            setTextInputValue(''); // Clear input
        }
        let files: File[] = [];
        if (filesInput.length > 0) {
            files = [...files, ...mediaInput];
            setFilesInput([])
        }
        if (mediaInput.length > 0) {
            files = [...files, ...mediaInput]
            setMediaInput([])
        }
        if (files.length > 0) {
            files.forEach(async file => {
                const url = `/media/${userId}/${roomId}/${file.name}`
                const post = await getPresignedPost(url, token);
                if (!post) {
                    alert("Error uploading files: " + file.name);
                    return;
                }
                if (await postFile(post, file)) {
                    socket?.emit("msg", [roomId, null, new Date(), [url]]);
                    onJustSent(); // Signal for parent
                    return;
                }
                alert("Error uploading files: " + file.name);
            })
        }
    };
    const handleUploadMedia = (file: any) => {
        setMediaInput((prev) => [...prev, file])
    }
    const handleUploadFile = (file: any) => {
        setFilesInput((prev) => [...prev, file])
    }
    return (
        <div id='chat-box_input-container'>
            <FileInput
                accept="image/*"
                onChange={handleUploadMedia}
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
            {/* Display selected media file names */}
            {mediaInput.length > 0 &&
                <div>
                    {mediaInput.map((file, index) => (
                        <span key={index}>{file.name}</span>
                    ))}
                </div>
            }

            {/* Display selected files names */}
            {filesInput.length > 0 &&
                <div>
                    {filesInput.map((file, index) => (
                        <span key={index}>{file.name}</span>
                    ))}
                </div>
            }

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