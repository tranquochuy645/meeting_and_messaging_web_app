import { useParams, useNavigate } from 'react-router-dom';
import { FC, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../SocketController';
import { Socket } from 'socket.io-client';
import RemoteVideoScreen from '../../components/RemoteVideoScreen';
import './style.css';

const Meet: FC = () => {
    const { meetId } = useParams();
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

    const handleToggleCamera = () => {
        // Make sure there is a local stream and a peer connection
        if (localStreamRef.current) {
            // Get all the video tracks from the local stream
            const videoTracks = localStreamRef.current.getVideoTracks();

            // Toggle the state of each video track
            videoTracks.forEach((track) => {
                // If the track is enabled, disable it (turn off the camera)
                // If the track is disabled, enable it (turn on the camera)
                track.enabled = !track.enabled;
            });
        }
    }
    const handleToggleSound = () => {
        // Make sure there is a local stream and a peer connection
        if (localStreamRef.current) {
            // Get all the audio tracks from the local stream
            const audioTracks = localStreamRef.current.getAudioTracks();

            // Toggle the state of each audio track
            audioTracks.forEach((track) => {
                // If the track is enabled, disable it (turn off the microphone)
                // If the track is disabled, enable it (turn on the microphone)
                track.enabled = !track.enabled;
            });
        }
    };
    const handleOffPeer = (peerId: string) => {
        setPeersList((prev) => {
            // Filter the previous peers list to exclude the peer with the specified peerId
            const updatedPeersList = prev.filter((peer) => peer.id !== peerId);
            return updatedPeersList;
        });
    };


    const handleNewPeer = (peerId: string) => {
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
        const originalRoomId = urlParams.get('room');
        const token = urlParams.get('token');
        if (!token || !originalRoomId || !meetId) {
            return navigate('/auth');
        }
        console.log('render');
        initialize().then(() => {
            // Register event listeners
            const socket = getSocket(token, originalRoomId, meetId);
            socket.on('new_peer', handleNewPeer);
            socket.on('off_peer', handleOffPeer);
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
            <h1>Meeting Page</h1>
            <p>Meet UUID: {meetId}</p>
            {/* <video className="remote-video" ref={remoteVideoPlayerRef} autoPlay playsInline /> */}
            <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
            <button onClick={handleToggleCamera}>Toggle camera</button>
            <button onClick={handleToggleSound}>Toggle sound</button>
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

export default Meet;
