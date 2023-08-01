import { FC, useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../SocketProvider';
import RemoteVideoScreen from '../../components/RemoteVideoScreen';
import RTCClient from '../../lib/RTCClient';
import './style.css';
interface MeetingWindowProps {
    localStream: MediaStream;
}

interface Peer {
    id: string;
    client: RTCClient;
}
const MeetingWindow: FC<MeetingWindowProps> = ({ localStream }) => {
    const localVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const socket = useSocket()
    const [peersList, setPeersList] = useState<{ [key: string]: Peer }>({});

    const handleToggleCamera = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
        }
    }, [localStream]);

    const handleToggleSound = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
        }
    }, [localStream]);

    const handleOffPeer = useCallback((peerId: string) => {
        setPeersList((prev) => {
            const updatedPeersList = { ...prev };
            delete updatedPeersList[peerId];
            return updatedPeersList;
        });
    }, []);

    const handleNewPeer = useCallback(
        async (peerId: string) => {
            const newClient = new RTCClient(localStream, (ice) => {
                socket?.emit("ice_candidate", [peerId, ice]);
            });

            const localDes = await newClient.createOffer();
            socket?.emit("offer", [peerId, localDes]);

            setPeersList((prev) => ({
                ...prev,
                [peerId]: {
                    id: peerId,
                    client: newClient,
                },
            }));
        },
        [localStream, socket]
    );

    const handleOffer = useCallback(
        async (msg: any[]) => {
            const [peerId, offer] = msg;
            const newClient = new RTCClient(localStream, (ice) => {
                socket?.emit("ice_candidate", [peerId, ice]);
            });

            const localDes = await newClient.createAnswer(offer);
            socket?.emit("answer", [peerId, localDes]);

            setPeersList((prev) => ({
                ...prev,
                [peerId]: {
                    id: peerId,
                    client: newClient,
                },
            }));
        },
        [localStream, socket]
    );

    const handleAnswer = useCallback(
        async (msg: any[]) => {
            const [peerId, answer] = msg;
            setPeersList((prev) => {
                const updatedPeer = { ...prev[peerId] };
                updatedPeer.client.setRemoteDescription(answer);
                return { ...prev, [peerId]: updatedPeer };
            });
        },
        []
    );

    const handleIceCandidate = useCallback(
        async (msg: any[]) => {
            const [peerId, iceCandidate] = msg;
            setPeersList((prev) => {
                const updatedPeer = { ...prev[peerId] };
                if (!updatedPeer.client) {
                    return prev
                }
                updatedPeer.client.addIce(iceCandidate);
                return { ...prev, [peerId]: updatedPeer };
            });
        },
        []
    );

    useEffect(() => {
        if (localVideoPlayerRef.current && localStream instanceof MediaStream) {
            localVideoPlayerRef.current.srcObject = localStream
        }
    }, [localStream])
    useEffect(() => {
        if (socket && localStream) {
            console.log('setup listeners')
            // socket.on('terminate_offer', handleTerminateOffer);
            // socket.on('terminate_answer', handleTerminateAnswer);
            socket.on('new_peer', handleNewPeer);
            socket.on('off_peer', handleOffPeer);
            socket.on('offer', handleOffer);
            socket.on('answer', handleAnswer);
            socket.on('ice_candidate', handleIceCandidate);
            return (() => {
                console.log('clean up listeners');
                // socket.off('terminate_offer', handleTerminateOffer);
                // socket.off('terminate_answer', handleTerminateAnswer);
                socket.off('new_peer', handleNewPeer);
                socket.off('off_peer', handleOffPeer);
                socket.off('offer', handleOffer);
                socket.off('answer', handleAnswer);
                socket.off('ice_candidate', handleIceCandidate);
            })
        }
    }, [socket,
        localStream,
        handleNewPeer,
        handleOffPeer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,])
    return (
        <>
            <section id="meeting-page_section_local" className={`${Object.keys(peersList).length > 0 ? " aside" : ""}`}>
                <div className='flex meeting-page_ctrl'>
                    <button onClick={handleToggleCamera}>Toggle camera</button>
                    <button onClick={handleToggleSound}>Toggle sound</button>
                </div>
                <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
            </section>
            {
                Object.keys(peersList).length > 0 &&
                <section id="meeting-page_section_remote"
                    className={`${Object.keys(peersList).length > 1 ? "stacked" : ""}`}>
                    {Object.values(peersList).map(
                        (peer: Peer) =>
                            <div key={peer.id} className={`remote-peer-container ${peer.id}`}>
                                <RemoteVideoScreen
                                    peerId={peer.id}
                                    remoteStream={peer.client.remoteStream}
                                />
                            </div>
                    )}
                </section>}
        </>
    )
};

export default MeetingWindow;
