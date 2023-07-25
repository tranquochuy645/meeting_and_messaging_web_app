import { useParams, useNavigate } from 'react-router-dom';
import { FC, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../lib/SocketController';
import { Socket } from 'socket.io-client';
import RemoteVideoScreen from '../../components/RemoteVideoScreen';
import './style.css';

const Meet: FC = () => {
    const { meetId } = useParams();
    let token = sessionStorage.getItem('token');
    let originalRoomId = sessionStorage.getItem('room');
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const [deny, setDeny] = useState(true);
    const [ready, setReady] = useState(false);
    const [peersList, setPeersList] = useState<any[]>([])
    const initialize = async () => {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoPlayerRef.current) {
            localVideoPlayerRef.current.srcObject = localStreamRef.current;
        } else {
            throw new Error("Can not get user media")
        }
    }
    const handleReady = () => {
        setReady(false)// Hide the button
        console.log("run this")

        if (!token || !originalRoomId || !meetId) {
            alert("Session error, please login again !");
            return navigate("/auth")
        }
        // Initialize socketio and send ready signal
        const socket = getSocket(token, originalRoomId, meetId);
        // Register event listeners
        socket.on('new_peer', handleNewPeer);
        socket.on('off_peer', handleOffPeer);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice_candidate', handleIceCandidate);
        socketRef.current = socket;
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
    const handleSendToPeer = (type: string, msg: any) => {
        socketRef.current?.emit(type, msg);
    }
    useEffect(() => {
        if (!meetId) {
            return navigate('/auth');
        }
        if (!token || !originalRoomId) {
            const urlParams = new URLSearchParams(window.location.search);
            const pr_1 = urlParams.get('token');
            const pr_2 = urlParams.get('room');
            if (!pr_1 || !pr_2) {
                return navigate('/auth');
            }
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
        console.log('render');
    }, []);
    useEffect(() => {
        if (!deny) {
            initialize()
                .then(() => {
                    // If user granted access to camera and microphone
                    setReady(true);
                })
                .catch(() => {
                    // User refused 
                    // Show a deny screen
                    setDeny(true);
                })
        }
        return () => {
            // Clean up resources on unmount
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
    }, [deny]);



    return (
        <div id="meeting-page">
            {deny ?
                <>
                    <h1>Meeting Page</h1>
                    <p>Meet UUID: {meetId}</p>
                    <p> You need to allow access to camera and mic</p>
                    <button onClick={() => setDeny(false)}>Allow</button>
                </>
                :
                <>
                    <section id="meeting-page_section_local" className={`${peersList.length > 0 ? " aside" : ""}`}>
                        <div className='flex meeting-page_ctrl'>
                            <button onClick={handleToggleCamera}>Toggle camera</button>
                            <button onClick={handleToggleSound}>Toggle sound</button>
                            {ready && <button onClick={handleReady}>Ready !</button>}
                        </div>
                        <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
                    </section>
                    {
                        peersList.length > 0 &&
                        <section id="meeting-page_section_remote"
                            className={`${peersList.length > 1 ? "stacked" : ""}`}>
                            {peersList.map(
                                (peer: any) =>
                                <div  className={`remote-peer-container ${peer.id}`}>
                                    <RemoteVideoScreen
                                        key={peer.id}
                                        peerId={peer.id}
                                        localStream={localStreamRef.current}
                                        offer={peer.offer}
                                        answer={peer.answer}
                                        ice={peer.ice}
                                        onSendToPeer={handleSendToPeer}
                                    />
                                </div>
                            )}
                        </section>
                    }

                </>
            }
        </div>
    );
};

export default Meet;
