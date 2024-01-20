import { FC, useEffect, useRef, useState, memo } from 'react';


interface RemoteVideoScreenProps {
    peerId: string;
    remoteStream: MediaStream;
}
const RemoteVideoScreen: FC<RemoteVideoScreenProps> = (
    { peerId, remoteStream }
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
        <>
            <div className='remote-video-ctrl'>
                <p>Peer ID: {peerId}</p>
                <div className='flex'>
                    <button onClick={handleToggleMute}>
                        {
                            muted ?
                                "Unmute"
                                :
                                "Mute"
                        }
                    </button>
                </div>
            </div>
            <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline />
        </>
    );
};

export default memo(RemoteVideoScreen);
