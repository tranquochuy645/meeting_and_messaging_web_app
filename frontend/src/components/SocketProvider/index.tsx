import { FC, createContext, useContext, useEffect, memo, useState } from "react";
import { Socket } from "socket.io-client";
import SocketController from "../../lib/SocketController";
interface JoinMeetingRequirement {
    roomId: string;
    meetId: string;
}
interface SocketProviderProps {
    token: string;
    children: any;
    joinMeet?: JoinMeetingRequirement;
}

const SocketContext = createContext<Socket | undefined>(undefined);

const SocketProvider: FC<SocketProviderProps> = ({ token, joinMeet, children }) => {
    const [connected, setConnected] = useState<boolean>(false);
    // console.log("provider exec")
    useEffect(() => {
        // console.log("socket effect")
        if (token) {
            if (joinMeet) {
                SocketController.connect(token, joinMeet)
            } else {
                SocketController.connect(token)
            }
            setConnected(true)
        } else {
            SocketController.disconnect()
            setConnected(false)
        }
        return (() => {
            // console.log("unmounted socket provider")
            SocketController.disconnect()
            setConnected(false)
        })
    }, [])
    // No need for dependenciesin this useEffect because this component is memoized and only run when token or joinMeet changes
    return (
        <SocketContext.Provider value={SocketController.instance}>
            {connected ? children : (<>Socket connecting...</>)}
        </SocketContext.Provider>
    );
};

const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

const MemoizedSocketProvider = memo(SocketProvider, (prevProps, nextProps) => {
    return (
        prevProps.token === nextProps.token &&
        JSON.stringify(prevProps.joinMeet) === JSON.stringify(nextProps.joinMeet)
    );
});

export { useSocket };
export default MemoizedSocketProvider
