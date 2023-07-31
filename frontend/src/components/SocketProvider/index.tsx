import { FC, createContext, useContext, useEffect, useRef } from "react";
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
    const socketRef: any = useRef(null)
    socketRef.current = SocketController;
    useEffect(() => {
        if (token) {
            if (joinMeet) {
                socketRef.current.connect(token, joinMeet)
            } else {
                socketRef.current.connect(token)
            }
        } else {
            socketRef.current.disconnect()
        }
    }, [joinMeet])
    useEffect(() => {
        if (!token) {
            socketRef.current.disconnect()
        }
    }, [token])
    return (
        <SocketContext.Provider value={socketRef.current.instance}>
            {children}
        </SocketContext.Provider>
    );
};

const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error("useSocket must be used within a SocketProvider.");
    }
    return socket;
};

export { useSocket };
export default SocketProvider
