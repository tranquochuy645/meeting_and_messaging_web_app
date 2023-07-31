import { FC, createContext, useContext, useMemo } from "react";
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
    const socketInit = useMemo(() => {
        if (token) {
            if (joinMeet) {
                SocketController.connect(token, joinMeet)
            } else {
                SocketController.connect(token)
            }
        } else {
            SocketController.disconnect()
        }
        return SocketController.instance;
    }, [token, joinMeet])

    return (
        <SocketContext.Provider value={socketInit}>
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
