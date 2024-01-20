import { FC } from "react";
import "./style.css";
interface AskForMediaDevicesProps {
  onReady: (stream: MediaStream) => void;
}
const AskForMediaDevices: FC<AskForMediaDevicesProps> = ({ onReady }) => {
  const initialize = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localStream) {
      onReady(localStream);
    } else {
      throw new Error("Can not get user media");
    }
  };
  return (
    <>
      <div className="centered-container">
        <p>You need to allow access to camera and mic</p>
        <button id="precall_btn" onClick={() => initialize()}>
          Allow
        </button>
      </div>
    </>
  );
};
export default AskForMediaDevices;
