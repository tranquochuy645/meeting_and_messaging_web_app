import { useParams, useNavigate } from 'react-router-dom';
import { FC, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../SocketController';
import { Socket } from 'socket.io-client';
import RemoteVideoScreen from '../../components/RemoteVideoScreen';
import './style.css';

const Call: FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const [peersList, setPeersList] = useState<any[]>([])
    const initialize = async () => {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoPlayerRef.current) {
            localVideoPlayerRef.current.srcObject = localStreamRef.current;
        } else {
            throw new Error("Can not get user media")
        }
    }

    const handleNewPeer = async (peerId: string) => {
        setPeersList(
            (prev) => {
                const peer = {
                    id: peerId
                }
                return [...prev, peer]
            }
        )
    }
    const handleOffer = async (msg: any[]) => {
        // msg: [peerId, offer]
        setPeersList(
            (prev) => {
                const peer = {
                    id: msg[0],
                    offer: msg[1]
                }
                return [...prev, peer]
            }
        )
    }
    const handleAnswer = async (msg: any[]) => {
        // msg: [peerId, answer]
        setPeersList(prev => {
            return prev.map(peer => {
                if (peer.id === msg[0]) {
                    return { ...peer, answer: msg[1] };
                }
                return peer;
            });
        });
    }
    const handleIceCandidate = async (msg: any[]) => {
        // msg: [peerId, iceCandidate]
        setPeersList(prev => {
            return prev.map(peer => {
                if (peer.id === msg[0]) {
                    return { ...peer, ice: msg[1] };
                }
                return peer;
            });
        });
    }
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (!token) {
            navigate('/auth');
            return;
        }
        console.log('render');
        initialize().then(() => {
            // Register event listeners
            const socket = getSocket(token, true);
            socket.on('new_peer', handleNewPeer);
            socket.on('offer', handleOffer);
            socket.on('answer', handleAnswer);
            socket.on('ice_candidate', handleIceCandidate);
            socketRef.current = socket;
        })
        return () => {
            // Clean up resources on unmount
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
    const handleSendToPeer = (type: string, msg: any) => {
        socketRef.current?.emit(type, msg);
    }


    return (
        <div>
            <h1>Call Page</h1>
            <p>Room ID: {roomId}</p>
            {/* <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline /> */}
            <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
            {peersList.map(
                (peer: any) =>
                    <RemoteVideoScreen
                        key={peer.id}
                        peerId={peer.id}
                        localStream={localStreamRef.current}
                        offer={peer.offer}
                        answer={peer.answer}
                        ice={peer.ice}
                        onSendToPeer={handleSendToPeer}
                    />
            )}
        </div>
    );
};

export default Call;
