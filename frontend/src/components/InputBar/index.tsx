import { FC, useState, memo } from "react"
import { useSocket } from "../SocketProvider"
import { ChangeEvent } from "react";
import FileInput from "../FileInput";
import './style.css'
interface InputBarProps {
    token: string;
    userId: string;
    roomId: string;
    onJustSent: () => void;
}

const InputBar: FC<InputBarProps> = ({ token, userId, roomId, onJustSent }) => {
    const [textInputValue, setTextInputValue] = useState("");
    const [filesInput, setFilesInput] = useState<any[]>([]);
    const [mediaInput, setMediaInput] = useState<any[]>([]);
    const socket = useSocket();
    const Upload = async (files: any[]) => {
        try {
            const formData = new FormData();
            files.forEach(file => { formData.append(`file${files.length > 1 ? "s" : ""}`, file) })
            const response = await fetch(
                `/media/${userId}/${roomId}?token=${token}&count=${files.length}`,
                {
                    method: 'POST',
                    body: formData
                }
            )
            const data = await response.json();
            return data
        } catch (error) {
            throw error
        }
    }

    const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextInputValue(event.target.value);
        console.log('typing ...');
    };

    const handleSendMessage = async () => {
        let files = []
        let urls: string[] = [];
        if (filesInput.length > 0) {
            console.log(filesInput.length)
            files = filesInput
            setFilesInput([])
        }
        if (mediaInput.length > 0) {
            console.log(mediaInput.length)
            files = [...files, ...mediaInput]
            setMediaInput([])
        }
        if (files.length > 0) {
            try {
                const data = await Upload(files);
                if (data.urls) {
                    urls = data.urls
                }
            } catch (e: any) {
                return alert("error uploading files: " + e.message)
            }
        }
        if (textInputValue.trim() !== '' || urls.length !== 0) {
            console.log(urls)
            socket?.emit("msg", [roomId, textInputValue, new Date(), urls]);
            onJustSent();
            setTextInputValue('');
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