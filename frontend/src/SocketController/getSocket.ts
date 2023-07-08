import socketio from "socket.io-client";
const socket_url = window.location.protocol + "//" + window.location.host;

let socket: typeof socketio.prototype | null;
const getSocket = (token: string) => {
    if (!socket || !socket.connected) {
        console.log("Attempting to connect");
        socket = socketio(socket_url, {
            extraHeaders: {
                Authorization: "Bearer " + token
            }
        });
        socket.on("connect_error", (err:Error) => {
            console.log(err.message); // prints the message associated with the error
        });
    };
    return socket;
}
export { getSocket };