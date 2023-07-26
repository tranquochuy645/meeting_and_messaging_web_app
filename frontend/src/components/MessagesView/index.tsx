import { FC, memo } from 'react'
import { OwnMessage, GuestMessage } from '../ChatMessage';
import { Message } from '../MessagesContainer';

interface MessagesViewProps {
    messages: Message[];
    userId: string;
    participants: any[]
}
const MessagesView: FC<MessagesViewProps> = ({ messages, userId, participants }) => {

    return (
        <>
            {
                Array.isArray(messages) &&
                messages.map((message: Message, index: number) => {
                    if (message.sender && message.sender == userId) {
                        return (
                            <OwnMessage
                                key={index}
                                content={message.content}
                                timestamp={message.timestamp}
                            />)
                    } else {
                        const sender = participants.find(
                            (participant) => participant._id === message.sender
                        );
                        const avatarSRC = sender ? sender.avatar : "";
                        return (
                            <GuestMessage
                                key={index}
                                avatarSRC={avatarSRC}
                                content={message.content}
                                timestamp={message.timestamp}
                            />)
                    }
                })
            }
        </>
    )
}
export default memo(MessagesView)