import { FC, createContext, memo, useContext, useEffect } from "react";
import socketio, { Socket } from "socket.io-client";

interface JoinMeetingRequirement {
    roomId: string;
    meetId: string;
}
interface SocketProviderProps {
    token: string;
    children: any;
    joinMeet?: JoinMeetingRequirement;
}
let socketGlobal: Socket | undefined;
const SocketContext = createContext<Socket | undefined>(undefined);
const socketUrl = window.location.protocol + "//" + window.location.host;
const initSocket = (token: string, roomId?: string, meetId?: string) => {
    const socket = socketio(socketUrl, {
        autoConnect: false,
        extraHeaders: {
            Authorization: "Bearer " + token,
        },
    });

    socket.on("connect_error", (err) => {
        console.error(err.message);
    });

    socket.on("ok", () => {
        console.log("Socket connected");
        if (meetId && roomId) {
            socket.emit("join_meet", [roomId, meetId]);
        } else {
            socket.emit("join_chat");
        }
    });

    return socket;
};
const SocketProvider: FC<SocketProviderProps> = ({ token, joinMeet, children }) => {

    if (!token && socketGlobal) {
        socketGlobal.disconnect()
    }
    if (token && !socketGlobal) {
        socketGlobal = joinMeet ? initSocket(token, joinMeet.roomId, joinMeet.meetId) : initSocket(token);
        socketGlobal.connect()
    }
    useEffect(() => {
        console.log("join meet change")
        if (token && socketGlobal) {
            socketGlobal.disconnect()
            socketGlobal = joinMeet ? initSocket(token, joinMeet.roomId, joinMeet.meetId) : initSocket(token);
            socketGlobal.connect()
        }
    }, [joinMeet])
    return (
        <SocketContext.Provider value={socketGlobal}>
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
export default memo(SocketProvider)
