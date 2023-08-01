import { FC, useEffect, useRef, useState } from 'react';
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
    const [peersList, setPeersList] = useState<Peer[]>([])

    const handleToggleCamera = () => {
        // Make sure there is a local stream and a peer connection
        if (localStream) {
            // Get all the video tracks from the local stream
            const videoTracks = localStream.getVideoTracks();

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
        if (localStream) {
            // Get all the audio tracks from the local stream
            const audioTracks = localStream.getAudioTracks();

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


    const handleNewPeer = async (peerId: string) => {
        const newClient = new RTCClient(localStream,
            (ice) => {
                socket?.emit("ice_candidate", [peerId, ice])
            })
        const localDes = await newClient.createOffer();
        socket?.emit("offer", [peerId, localDes])
        setPeersList(
            (prev) => {
                const updated = prev.filter((peer) => peer.id !== peerId)
                const peer = {
                    id: peerId,
                    client: newClient
                }
                return [...updated, peer]
            }
        )

    }
    const handleOffer = async (msg: any[]) => {
        // msg: [peerId, offer]
        const newClient = new RTCClient(
            localStream,
            (ice) => {
                socket?.emit("ice_candidate", [msg[0], ice])
            })
        const localDes = await newClient.createAnswer(msg[1]);
        socket?.emit("answer", [msg[0], localDes])
        setPeersList(
            (prev) => {
                const updated = prev.filter((peer) => peer.id !== msg[0])
                const peer = {
                    id: msg[0],
                    client: newClient
                }
                return [...updated, peer]
            }
        )
    }
    const handleAnswer = async (msg: any[]) => {
        // msg: [peerId, answer]
        setPeersList(prev => {
            return prev.map(peer => {
                if (peer.id === msg[0]) {
                    peer.client.setRemoteDescription(msg[1])
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
                    peer.client.addIce(msg[1])
                }
                return peer;
            });
        });
    }

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
    }, [socket, localStream])
    return (
        <>
            <section id="meeting-page_section_local" className={`${peersList.length > 0 ? " aside" : ""}`}>
                <div className='flex meeting-page_ctrl'>
                    <button onClick={handleToggleCamera}>Toggle camera</button>
                    <button onClick={handleToggleSound}>Toggle sound</button>
                </div>
                <video id="local-video" ref={localVideoPlayerRef} autoPlay playsInline muted />
            </section>
            {
                peersList.length > 0 &&
                <section id="meeting-page_section_remote"
                    className={`${peersList.length > 1 ? "stacked" : ""}`}>
                    {peersList.map(
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
