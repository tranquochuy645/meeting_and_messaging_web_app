import { FC, useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../SocketProvider";
import RemoteVideoScreen from "../../components/RemoteVideoScreen";
import RTCClient from "../../lib/RTCClient";
import "./style.css";

const MAX_PEERS_DISPLAYED_AT_ONCE = 4;

interface MeetingWindowProps {
  localStream: MediaStream;
}

interface Peer {
  id: string;
  client: RTCClient;
}

const handleShareScreen = () => {
  const url = window.location + `?share=true`;
  window.open(url)
}

const MeetingWindow: FC<MeetingWindowProps> = ({ localStream }) => {
  const localVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const socket = useSocket();
  const [peersList, setPeersList] = useState<{ [key: string]: Peer }>({});

  const handleToggleCamera = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !event.target.checked;
    });
  };

  const handleToggleSound = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !event.target.checked;
    });
  };

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

  const handleAnswer = useCallback(async (msg: any[]) => {
    const [peerId, answer] = msg;
    setPeersList((prev) => {
      const updatedPeer = { ...prev[peerId] };
      updatedPeer.client.setRemoteDescription(answer);
      return { ...prev, [peerId]: updatedPeer };
    });
  }, []);

  const handleIceCandidate = useCallback(async (msg: any[]) => {
    const [peerId, iceCandidate] = msg;
    setPeersList((prev) => {
      const updatedPeer = { ...prev[peerId] };
      if (!updatedPeer.client) {
        return prev;
      }
      updatedPeer.client.addIce(iceCandidate);
      return { ...prev, [peerId]: updatedPeer };
    });
  }, []);
  const handlePin = useCallback((peerId: string) => {
    document.querySelectorAll(".remote-peer-container").forEach(
      (e: Element) => {
        e.classList.remove("pinned");
      }
    )
    document.getElementById(peerId)?.classList.add("pinned");
    const sec = document.getElementById("meeting-page_section_remote");
    sec?.classList.remove("row");
    sec?.classList.add("col");
  }, []);

  useEffect(() => {
    if (localVideoPlayerRef.current && localStream instanceof MediaStream) {
      localVideoPlayerRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (socket && localStream) {
      // console.log("update socket")
      // socket.on('terminate_offer', handleTerminateOffer);
      // socket.on('terminate_answer', handleTerminateAnswer);
      socket.on('new_peer', handleNewPeer);
      socket.on('off_peer', handleOffPeer);
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice_candidate', handleIceCandidate);
      return (() => {
        // console.log('clean up listeners');
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

  useEffect(
    () => {
      // Avoid rerendering the whole thing
      const defaultMode = !document.querySelector(".pinned");
      const section = document.getElementById("meeting-page_section_remote");
      section?.classList.replace(`${defaultMode ? "col" : "row"}`, `${defaultMode ? "row" : "col"}`)
    }, [!!document.querySelector(".pinned")]
  );
  return (
    <>
      <section id="meeting-page_section_local" className={`${Object.keys(peersList).length > 0 ? " aside" : ""}`}>
        <div id="local_ctrl" className='flex'>
          <label className="local_ctrl_btn" htmlFor='toggle-local-cam'>
            <input
              id="toggle-local-cam"
              type='checkbox'
              onChange={handleToggleCamera}
            />
            <div>
              <i className='bx bxs-video-off'></i>
              <i className='bx bxs-video'></i>
            </div>
          </label>
          <label className="local_ctrl_btn" htmlFor='toggle-local-audio'>
            <input
              id="toggle-local-audio"
              type='checkbox'
              onChange={handleToggleSound}
            />
            <div>
              <i className='bx bxs-microphone-off'></i>
              <i className='bx bxs-microphone'></i>
            </div>
          </label>
          <button className="local_ctrl_btn" onClick={handleShareScreen}>
            <i className='bx bx-upload'></i>
          </button>
        </div>
        <video id="local_video" ref={localVideoPlayerRef} autoPlay playsInline muted />
      </section>
      {
        Object.keys(peersList).length > 0 &&
        <section id="meeting-page_section_remote" className="row">
          {Object.values(peersList).slice(0, MAX_PEERS_DISPLAYED_AT_ONCE).map(
            (peer: Peer) =>
              <div
                key={peer.id}
                id={peer.id}
                className={`remote-peer-container ${Object.keys(peersList).length > 1 ? "stacked" : ""}`}
              >
                <RemoteVideoScreen
                  pinCallBack={handlePin}
                  peerId={peer.id}
                  remoteStream={peer.client.remoteStream}
                />
              </div>
          )}
          {Object.keys(peersList).length > MAX_PEERS_DISPLAYED_AT_ONCE ?
            <div
              className={`remote-peer-container stacked others`}
            >
              {`+${Object.keys(peersList).length - MAX_PEERS_DISPLAYED_AT_ONCE} other participant${Object.keys(peersList).length - MAX_PEERS_DISPLAYED_AT_ONCE > 1 ? "s" : ""}`}
            </div>
            :
            null
          }
        </section>
      }
    </>
  )
};

export default MeetingWindow;
