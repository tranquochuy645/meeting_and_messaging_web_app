import { FC, useEffect, useRef, useState, memo } from 'react';
import "./style.css"
interface RemoteVideoScreenProps {
    peerId: string;
    remoteStream: MediaStream;
    pinCallBack: (peerId: string) => void;
}
const RemoteVideoScreen: FC<RemoteVideoScreenProps> = (
    { peerId, remoteStream, pinCallBack }
) => {
    const remoteVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const [muted, setMuted] = useState(false);
    const handleToggleMute = () => {
        if (remoteVideoPlayerRef.current) {
            remoteVideoPlayerRef.current.muted = !remoteVideoPlayerRef.current.muted
            setMuted(remoteVideoPlayerRef.current.muted)
        }
    }
    useEffect(() => {
        if (remoteVideoPlayerRef.current && remoteStream) {
            remoteVideoPlayerRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, remoteVideoPlayerRef])
    return (
        <div className='remote-video-wrapper'>
            <div className='remote-video-ctrl'>
                {/* TODO: Use this peer id to display user's name */}
                <p>{peerId}</p>
                <div className='flex'>
                    <button onClick={handleToggleMute}>
                        {
                            muted ?
                                <i className='bx bxs-volume-mute'></i>
                                :
                                <i className='bx bxs-volume-full'></i>
                        }
                    </button>
                    <button className='btn-pin' onClick={() => pinCallBack(peerId)}>
                        <i className='bx bxs-pin' ></i>
                    </button>
                </div>
            </div>
            <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline />
        </div>
    );
};

export default memo(RemoteVideoScreen);
