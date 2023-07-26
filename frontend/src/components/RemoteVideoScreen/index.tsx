import { FC, useEffect, useRef, useState, memo } from 'react';
import './style.css';
import { useSocket } from '../SocketProvider';

const peerConnectionConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        }
    ],
    iceCandidatePoolSize: 10,
};

interface RemoteVideoScreenProps {
    peerId: string;
    offer: any;
    answer: any;
    ice: any;
    localStream: MediaStream | null;
}
const RemoteVideoScreen: FC<RemoteVideoScreenProps> = (
    { peerId, offer, answer, ice, localStream }
) => {
    console.log("render remote video screen")
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const remoteVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const localDescriptionRef = useRef<any>(null);
    const socket = useSocket();
    const [muted, setMuted] = useState(false);

    const createPeerConnection = async (peerId: string) => {
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);

        peerConnectionRef.current.onconnectionstatechange = () => {
            switch (peerConnectionRef.current?.connectionState) {
                case 'connected':
                    console.log("connected");
                    break;
                case 'disconnected':
                    console.log("disconnected");
                    break;
                case 'failed':
                    console.log("failed");
                    break;
                case 'closed':
                    console.log("closed");
                    break;
                default:
                    console.log("connecting")
            }
        };

        remoteStreamRef.current = new MediaStream();
        if (remoteVideoPlayerRef.current) {
            remoteVideoPlayerRef.current.srcObject = remoteStreamRef.current;
        } else {
            throw new Error("41")
        }

        localStream?.getTracks()
            .forEach((track) => {
                peerConnectionRef.current?.addTrack(track, localStream)
            })
        peerConnectionRef.current.ontrack = (e) => {
            e.streams[0].getTracks()
                .forEach((track) => {
                    remoteStreamRef.current?.addTrack(track)
                })
        }
        peerConnectionRef.current.onicecandidate = async (e) => {
            e.candidate &&
                socket.emit("ice_candidate", [peerId, e.candidate]);
        }
    }

    const createOffer = async (peerId: string) => {
        await createPeerConnection(peerId);
        localDescriptionRef.current = await peerConnectionRef.current?.createOffer();
        await peerConnectionRef.current?.setLocalDescription(localDescriptionRef.current);
        socket.emit("offer", [peerId, localDescriptionRef.current]);
    }
    const createAnswer = async (peerId: string, offer: any) => {
        await createPeerConnection(peerId);
        await peerConnectionRef.current?.setRemoteDescription(offer);
        localDescriptionRef.current = await peerConnectionRef.current?.createAnswer()
        await peerConnectionRef.current?.setLocalDescription(localDescriptionRef.current);
        socket.emit("answer", [peerId, localDescriptionRef.current]);
    }


    const handleAnswer = async (data: any) => {
        await peerConnectionRef.current?.setRemoteDescription(data);
    }
    const handleIceCandidate = async (data: any) => {
        // msg: [peerId, iceCandidate]
        peerConnectionRef.current?.addIceCandidate(data)
    }
    useEffect(() => {
        if (offer) {
            createAnswer(peerId, offer)
        } else {
            createOffer(peerId)
        }
    }, []);
    useEffect(() => {
        if (answer) {
            handleAnswer(answer);
        }
    }, [answer])
    useEffect(() => {
        if (ice) {
            console.log(ice);
            handleIceCandidate(ice);
        }
    }, [ice])
    const handleToggleMute = () => {
        if (remoteVideoPlayerRef.current) {
            remoteVideoPlayerRef.current.muted = !remoteVideoPlayerRef.current.muted
            setMuted(remoteVideoPlayerRef.current.muted)
        }
    }



    return (
        <>
            <p>Peer ID: {peerId}</p>
            <div className='flex meeting-page_ctrl'>
                <button onClick={handleToggleMute}>
                    {
                        muted ?
                            "Unmute"
                            :
                            "Mute"
                    }
                </button>
            </div>
            <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline />
        </>
    );
};

export default memo(RemoteVideoScreen);
