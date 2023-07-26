import { FC, createContext, useContext, useEffect } from "react";
import socketio, { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | undefined>(undefined);
interface JoinMeetingRequirement {
    roomId: string;
    meetId: string;
}
interface SocketProviderProps {
    token: string;
    children: any;
    joinMeet?: JoinMeetingRequirement;
}
const SocketProvider: FC<SocketProviderProps> = ({ token, joinMeet, children }) => {
    const socketUrl = window.location.protocol + "//" + window.location.host;
    const initSocket = (roomId?: string, meetId?: string) => {
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

    const socket = joinMeet ? initSocket(joinMeet.roomId, joinMeet.meetId) : initSocket(); // Create the socket instance when the SocketProvider is mounted
    useEffect(() => {
        if (socket) {
            socket.connect()
            return () => {
                socket.disconnect(); // Disconnect the socket when the SocketProvider is unmounted
            };
        }
    }, [socket]);
    return (
        <SocketContext.Provider value={socket}>
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

export { SocketProvider, useSocket };
