import { FC } from "react";
import './style.css';
import LazyLoadMediaDetector from "../LazyLoadMediaDetector";
interface OwnMessageProps {
    token: string;
    content: string;
    timestamp: string;
    urls?: string[] | null;
}

const OwnMessage: FC<OwnMessageProps> = ({ token, content, timestamp, urls }) => {
    return (
        <div className='message own'>
            <div className='message_wrapper'>
                <p>{content}</p>
            </div>
            <p className='message_timestamp'>{timestamp}</p>
            {urls &&
                urls.length > 0 &&
                urls.map((url, index) => {
                    return <LazyLoadMediaDetector key={timestamp + index} token={token} url={url} />
                })}
        </div>
    );
};

interface GuestMessageProps extends OwnMessageProps {
    avatarSRC: string;
}

const GuestMessage: FC<GuestMessageProps> = ({ token, avatarSRC, content, timestamp, urls }) => {
    return (
        <div className='message guest'>
            <div className='message_wrapper'>
                <img className="inchat-avatar" src={avatarSRC} alt="Sender Avatar" />
                <p>{content}</p>
                {urls &&
                    urls.length > 0 &&
                    urls.map((url, index) => {
                        return <LazyLoadMediaDetector key={timestamp + index} token={token} url={url} />
                    })}
            </div>
            <p className='message_timestamp'>{timestamp}</p>
        </div>
    );
};

export { OwnMessage, GuestMessage };
