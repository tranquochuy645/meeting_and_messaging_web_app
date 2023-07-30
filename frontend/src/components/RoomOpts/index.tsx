import { FC } from 'react';

interface RoomOptsProps {
    roomId: string;
    handleAction: (action: string, roomId: string) => void;
}

const RoomOpts: FC<RoomOptsProps> = ({ roomId, handleAction }) => {
    return (
        <>
            <input className='checkbox' type='checkbox' id={`${roomId}_opts`} />
            <label className='checkbox_label' htmlFor={`${roomId}_opts`}>
                <i className='bx bx-dots-vertical-rounded'></i>
            </label>
            <div className='chat-room_opts'>
                <button onClick={() => handleAction('leave', roomId)}>Leave</button>
                <button onClick={() => handleAction('delete', roomId)}>Delete</button>
            </div>
        </>
    );
};

export default RoomOpts;
