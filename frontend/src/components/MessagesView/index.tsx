import { FC, memo } from 'react'
import { OwnMessage, GuestMessage } from '../ChatMessage';
import { Message } from '../MessagesContainer';
interface MessagesViewProps {
    token: string;
    messages: Message[];
    userId: string;
    participants: any[]
}
const MessagesView: FC<MessagesViewProps> = ({ token, messages, userId, participants }) => {

    return (
        <>
            {
                Array.isArray(messages) &&
                messages.map((message: Message, index: number) => {
                    if (message.sender && message.sender == userId) {
                        return (
                            <OwnMessage
                                token={token}
                                key={index}
                                content={message.content}
                                timestamp={message.timestamp}
                                urls={message.urls}
                            />)
                    } else {
                        const sender = participants.find(
                            (participant) => participant._id === message.sender
                        );
                        const avatarSRC = sender ? sender.avatar : "";
                        return (
                            <GuestMessage
                                token={token}
                                key={index}
                                avatarSRC={avatarSRC}
                                content={message.content}
                                timestamp={message.timestamp}
                                urls={message.urls}
                            />)
                    }
                })
            }
        </>
    )
}
export default memo(MessagesView)