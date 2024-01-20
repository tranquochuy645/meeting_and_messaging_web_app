import { FC } from 'react';
import './style.css'
interface RoomOptsProps {
    roomId: string;
    handleAction: (action: string, roomId: string) => void;
}

const RoomOpts: FC<RoomOptsProps> = ({ roomId, handleAction }) => {
    return (
        <div className='opts-wrapper'>
            <input className='checkbox' type='checkbox' id={`${roomId}_opts`} />
            <label className='checkbox_label' htmlFor={`${roomId}_opts`}>
                <i className='bx bx-dots-vertical-rounded'></i>
            </label>
            <div className='chat-room_opts'>
                <button className="chat-room_opts_btn leave" onClick={() => handleAction('leave', roomId)}>Leave</button>
                <button className="chat-room_opts_btn delete" onClick={() => handleAction('delete', roomId)}>Delete</button>
            </div>
        </div>
    );
};

export default RoomOpts;
