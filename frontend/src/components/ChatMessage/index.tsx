import { FC } from "react";
import './style.css'
interface OwnMessageProps {
    content: string;
    timestamp: string;
}
const OwnMessage: FC<OwnMessageProps> = ({ content, timestamp }) => {
    return (
        <div className='message own'>
            <div className='message_wrapper'>
                <p>{content}</p>
            </div>
            <p className='message_timestamp'>{timestamp}</p>
        </div>
    )
}
interface GuestMessageProps extends OwnMessageProps {
    avatarSRC: string;
}
const GuestMessage: FC<GuestMessageProps> = ({ avatarSRC, content, timestamp }) => {
    return (
        <div className='message guest'>
            <div className='message_wrapper'>
                <img className="inchat-avatar" src={avatarSRC} alt="Sender Avatar" />
                <p>{content}</p>
            </div>
            <p className='message_timestamp'>{timestamp}</p>
        </div>
    )
}
export {
    OwnMessage,
    GuestMessage
}