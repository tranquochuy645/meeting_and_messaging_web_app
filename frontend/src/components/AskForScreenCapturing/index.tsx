import { FC } from "react";
// This component reuse the AskForMediaDevices component, and use the same css class names
//TODO: apply inheritance practices

const opts={}
// Copied from MDN web docs
const askForScreenCapturing = async () => {
    let captureStream = null;
    try {
        captureStream =
            await navigator.mediaDevices.getDisplayMedia(opts);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
    return captureStream;
}

interface AskForScreenCapturingProps {
  onReady: (stream: MediaStream) => void;
}
const AskForScreenCapturing: FC<AskForScreenCapturingProps> = ({ onReady }) => {
  const initialize = async () => {
    const localStream = await askForScreenCapturing();
    if (localStream) {
      onReady(localStream);
    } else {
      throw new Error("Can not get user screen capture");
    }
  };
  return (
    <>
      <div className="centered-container">
        <p>You need to allow access to screen capturing</p>
        <button id="precall_btn" onClick={() => initialize()}>
          Allow
        </button>
      </div>
    </>
  );
};
export default AskForScreenCapturing;
