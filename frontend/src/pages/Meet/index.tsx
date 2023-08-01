import { useParams, useNavigate } from 'react-router-dom';
import { FC,  useState } from 'react';
import SocketProvider from '../../components/SocketProvider';
import AskForMediaDevices from '../../components/AskForMediaDevices';
import MeetingWindow from '../../components/MeetingWindow';
import './style.css';

const Meet: FC = () => {
    const { meetId } = useParams();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const navigate = useNavigate();
    console.log("meet page render")
    // Try to find token & roomId in session storage first
    let token = sessionStorage.getItem('token');
    let originalRoomId = sessionStorage.getItem('room');
    if (!meetId) {
        navigate('/auth');
    } else if (!token || !originalRoomId) {
        //This if happen when token || originalRoomId is not set in session storage
        const urlParams = new URLSearchParams(window.location.search);
        const pr_1 = urlParams.get('token');
        const pr_2 = urlParams.get('room');
        //Try to find on url params

        if (!pr_1 || !pr_2) {
            //If still not found
            //Navigate to auth page
            navigate('/auth');
        } else {
            // Remove the 'token' parameter from the URL
            urlParams.delete('token');
            urlParams.delete('room');
            const newURL = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newURL);
            token = pr_1;
            originalRoomId = pr_2;
            sessionStorage.setItem('token', pr_1);
            sessionStorage.setItem('room', pr_2);
        }

    }
    console.log('render');

    return (
        <div id="meeting-page">
            {token && originalRoomId && meetId && localStream ?
                <SocketProvider
                    token={token}
                    joinMeet={{ roomId: originalRoomId, meetId: meetId }}>
                    <MeetingWindow localStream={localStream} />
                </SocketProvider>
                :
                <AskForMediaDevices onReady={(stream) => { setLocalStream(stream) }} />
            }
        </div>
    );
};

export default Meet;
