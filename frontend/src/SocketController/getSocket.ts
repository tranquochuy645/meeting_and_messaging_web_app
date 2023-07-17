import socketio from "socket.io-client";
const socket_url = window.location.protocol + "//" + window.location.host;

let socket: typeof socketio.prototype | null;
const getSocket = (token: string, meet: boolean = false) => {
    if (!socket || !socket.connected) {
        console.log("Attempting to connect");
        socket = socketio(socket_url , {
            extraHeaders: {
                Authorization: "Bearer " + token
            }
        });
        socket.on("connect_error", (err: Error) => {
            console.error(err.message); // prints the message associated with the error
        });
        socket.on("connect",()=>{
            if(meet){
                socket.emit("join_meet");
            }else{
                socket.emit("join_chat");
            }
        })
    };
    return socket;
}
export { getSocket };