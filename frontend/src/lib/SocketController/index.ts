import socketio from "socket.io-client";

// Interface for the meeting requirements used when connecting to a meeting
interface JoinMeetingRequirement {
    roomId: string;
    meetId: string;
}

export default class SocketController {
    // URL to connect the socket (based on the current host)
    private static readonly _url = window.location.protocol + "//" + window.location.host;

    // Create a socket instance with autoConnect set to false and initial extraHeaders
    private static _instance = socketio(SocketController._url, {
        autoConnect: false,
        extraHeaders: {},
    });

    // Getter to access the socket instance
    public static get instance() {
        return SocketController._instance;
    }

    // Method to connect the socket with custom headers and meeting requirements
    public static connect(token: string, meetingRequirements?: JoinMeetingRequirement) {
        // Disconnect the socket (if already connected)
        SocketController.disconnect();

        // Set the Authorization header with the provided token
        if (SocketController._instance.io.opts.extraHeaders) {
            SocketController._instance.io.opts.extraHeaders.Authorization = "Bearer " + token;
        }

        // Event listener to handle actions after socket is connected
        SocketController._instance.on("ok", () => {
            if (meetingRequirements) {
                const { roomId, meetId } = meetingRequirements;
                SocketController._instance.emit("join_meet", [roomId, meetId]);
            } else {
                SocketController._instance.emit("join_chat");
            }
        });

        // Event listener to handle connection errors
        SocketController._instance.on("connect_error", (err) => {
            console.error(err.message);
        });

        // Connect the socket
        SocketController._instance.connect();
    }

    // Method to disconnect the socket and clear extraHeaders
    public static disconnect() {
        // Remove any existing event listeners before connecting
        // console.log("rm all listeners");
        SocketController._instance.removeAllListeners();
        SocketController._instance.disconnect();
        SocketController._instance.io.opts.extraHeaders = {};
    }
}
