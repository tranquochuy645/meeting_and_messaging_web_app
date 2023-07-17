import { useParams, useNavigate } from 'react-router-dom';
import { FC, useEffect, useRef } from 'react';
import { getSocket } from '../../SocketController';
import { Socket } from 'socket.io-client';
import './style.css';

const peerConnectionConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        }
    ],
    iceCandidatePoolSize: 10,
};


const Call: FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const remoteVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const localDescriptionRef = useRef<any>(null);
    const initialize = async () => {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (localVideoPlayerRef.current) {
            localVideoPlayerRef.current.srcObject = localStreamRef.current;
        } else {
            throw new Error("cc")
        }
    }
    const createPeerConnection = async (peerId: string) => {
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        remoteStreamRef.current = new MediaStream();
        if (remoteVideoPlayerRef.current) {
            remoteVideoPlayerRef.current.srcObject = remoteStreamRef.current;
        } else {
            throw new Error("cc")
        }

        localStreamRef.current?.getTracks()
            .forEach((track) => {
                localStreamRef.current &&
                    peerConnectionRef.current?.addTrack(track, localStreamRef.current)
            })
        peerConnectionRef.current.ontrack = (e) => {
            e.streams[0].getTracks()
                .forEach((track) => {
                    remoteStreamRef.current?.addTrack(track)
                })
        }
        peerConnectionRef.current.onicecandidate = async (e) => {
            e.candidate &&
                socketRef.current?.emit("ice_candidate", [peerId, e.candidate]);
        }
    }
    const createOffer = async (peerId: string) => {
        await createPeerConnection(peerId);
        localDescriptionRef.current = await peerConnectionRef.current?.createOffer();
        await peerConnectionRef.current?.setLocalDescription(localDescriptionRef.current);

    }
    const createAnswer = async (peerId: string, offer: any) => {
        await createPeerConnection(peerId);
        await peerConnectionRef.current?.setRemoteDescription(offer);
        localDescriptionRef.current = await peerConnectionRef.current?.createAnswer()
        await peerConnectionRef.current?.setLocalDescription(localDescriptionRef.current);
        socketRef.current?.emit("answer", [peerId, localDescriptionRef.current]);
    }

    const handleNewPeer = async (peerId: string) => {
        console.log(peerId);
        await createOffer(peerId);
        socketRef.current?.emit("offer", [peerId, localDescriptionRef.current]);
    }
    const handleOffer = async (msg: any[]) => {
        // msg: [peerId, offer]
        await createAnswer(msg[0], msg[1]);
    }
    const handleAnswer = async (msg: any[]) => {
        // msg: [peerId, answer]
        await peerConnectionRef.current?.setRemoteDescription(msg[1]);
    }
    const handleIceCandidate = async (msg: any[]) => {
        // msg: [peerId, iceCandidate]
        peerConnectionRef.current?.addIceCandidate(msg[1])
    }
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (!token) {
            navigate('/auth');
            return;
        }
        console.log('render');
        initialize();
        // Register event listeners
        const socket = getSocket(token, true);
        socket.on('new_peer', handleNewPeer);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice_candidate', handleIceCandidate);
        socketRef.current = socket;


        return () => {
            // Clean up resources on unmount
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);


    return (
        <div>
            <h1>Call Page</h1>
            <p>Room ID: {roomId}</p>
            <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline />
            <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
        </div>
    );
};

export default Call;
