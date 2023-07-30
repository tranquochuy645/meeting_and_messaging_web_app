import { FC } from "react";
import './style.css';
import LazyLoadMediaDetector from "../LazyLoadMediaDetector";
interface OutGoingMessageProps {
    token: string;
    content: string;
    timestamp: string;
    urls?: string[] | null;
    seenList?: string[];
}

const OutGoingMessage: FC<OutGoingMessageProps> = ({ token, content, timestamp, urls, seenList }) => {
    return (
        <div className='message out'>
            <div className='message_wrapper'>
                <p>{content}</p>
            </div>
            <p className='message_timestamp'>{timestamp}</p>
            {
                urls &&
                urls.length > 0 &&
                urls.map((url, index) => {
                    return <LazyLoadMediaDetector key={timestamp + index} token={token} url={url} />
                })}
            {
                seenList && seenList.length > 0 && (
                    <p>Seen by:
                        {seenList.map((e) =>
                            <span>{e}</span>)
                        }
                    </p>
                )
            }
        </div>
    );
};

interface InComingMessageProps extends OutGoingMessageProps {
    avatarSRC: string;
}

const InComingMessage: FC<InComingMessageProps> = ({ token, avatarSRC, content, timestamp, urls, seenList }) => {
    return (
        <div className='message in'>
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
            {
                seenList && seenList.length > 0 && (
                    <p>Seen by:
                        {seenList.map((e) =>
                            <span>{e}</span>)
                        }
                    </p>
                )
            }
        </div>
    );
};

export { OutGoingMessage, InComingMessage };
