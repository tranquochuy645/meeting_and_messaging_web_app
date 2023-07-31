import socketio from "socket.io-client";
interface JoinMeetingRequirement {
    roomId: string;
    meetId: string;
}
export default class SocketController {
    private static readonly _url = window.location.protocol + "//" + window.location.host;
    private static _instance = socketio(
        SocketController._url,
        {
            autoConnect: false,
            extraHeaders: {}
        }
    )
    public static get instance() {
        if (SocketController._instance) return SocketController._instance;
    }
    public static connect(token: string, meetingRequirements?: JoinMeetingRequirement) {
        SocketController._instance.removeAllListeners();
        SocketController.disconnect();
        if (SocketController._instance.io.opts.extraHeaders) {
            SocketController._instance.io.opts.extraHeaders.Authorization = "Bearer " + token;
        }
        if (meetingRequirements) {
            SocketController._instance.once("ok", () => {
                const { roomId, meetId } = meetingRequirements;
                SocketController._instance.emit("join_meet", [roomId, meetId]);
            })
        } else {
            SocketController._instance.once("ok", () => {
                SocketController._instance.emit("join_chat");
            })
        }
        SocketController._instance.on("connect_error", (err) => {
            console.error(err.message);
        })
        SocketController._instance.connect();
    }
    public static disconnect() {
        SocketController._instance.disconnect();
        SocketController._instance.io.opts.extraHeaders = {};
    }
}