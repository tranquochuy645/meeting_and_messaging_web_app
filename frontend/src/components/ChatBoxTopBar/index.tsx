import ThemeSwitch from "../ThemeSwitch"
import { FC, memo, useEffect } from "react";
import { useSocket } from "../SocketProvider";
import Room from "../RoomProfile";
import { ChatRoom } from "../RoomsNav";
import './style.css'
interface ChatBoxTopBarProps {
    token: string;
    room: ChatRoom;
    userId: string;
}
const ChatBoxTopBar: FC<ChatBoxTopBarProps> = ({ token, room, userId }) => {
    const socket = useSocket();
    const handleMakeCall = () => {
        socket.emit("meet", [room._id, new Date()]);
    }
    const handleJoinCall = (uuid: string) => {
        const url = `/meet/${uuid}?token=${token}&room=${room._id}`;
        window.open(url)
    }
    const handleReceiveCall = (msg: string[]) => {
        console.log(msg);
        // msg: [sender id,room ID, meeting UUID, date]
        if (msg[0] == userId) {
            // it's the call this user made
            if (msg[3]) {
                //already joined
                return
            }
            return handleJoinCall(msg[2]);
        }

        // Show a notification
        if (Notification.permission === "granted") {
            const notification = new Notification("Incoming Call", {
                body: "You have an incoming call. Do you want to join?",
                icon: "path/to/notification-icon.png",
                requireInteraction: true,
            });

            // Handle user's response to the notification
            notification.addEventListener("click", () => {
                // Open a new tab and pass the UUID to it
                handleJoinCall(msg[2])
            });
        } else if (Notification.permission !== "denied") {
            // Request permission to show notifications
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    // Show the notification after permission is granted
                    handleReceiveCall(msg);
                }
            });
        }
    };
    room && useEffect(() => {
        if (socket) {
            socket.on("meet", handleReceiveCall);
            return (() => {
                socket.off("meet", handleReceiveCall);
            })
        }
    }, [socket, room._id])
    return (
        <div id="chat-box_topbar" className='flex'>
            {room && <div id="chat-box_topbar_left">
                <Room  userId={userId} participants={room.participants} />

                {room.isMeeting && room.meeting_uuid ? (
                    <>
                        <p>This room is in a meeting</p>
                        <button
                            onClick={
                                () => handleJoinCall(room.meeting_uuid as string)
                            }
                        >Join
                        </button>
                    </>)
                    :
                    (<button className="btn" onClick={handleMakeCall}>
                        <i className='bx bxs-video' ></i>
                    </button>)
                }
            </div>}
            <ThemeSwitch />
        </div>
    )
}
export default memo(ChatBoxTopBar)