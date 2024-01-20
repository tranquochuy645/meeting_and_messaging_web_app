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
        <div className="message">
            <div className="message_left"></div>
            <div className='message_right out'>
                {
                    content &&
                    <div className='message_item'>
                        <p className="message_content">{content}</p>
                    </div>

                }
                {
                    urls &&
                    urls.length > 0 &&
                    <div className='message_item'>
                        {
                            urls.map((url, index) => {
                                return <LazyLoadMediaDetector key={timestamp + index} token={token} url={url} />
                            })
                        }
                    </div>
                }
                <p className='message_timestamp'>{timestamp}</p>
                {
                    seenList && seenList.length > 0 && (
                        <p className='message_seenby'>Seen by:
                            {seenList.map((e, index) =>
                                <span key={index}>{" " + e}</span>)
                            }
                        </p>
                    )
                }
            </div>
        </div>
    );
};

interface InComingMessageProps extends OutGoingMessageProps {
    avatarSRC: string;
}

const InComingMessage: FC<InComingMessageProps> = ({ token, avatarSRC, content, timestamp, urls, seenList }) => {
    return (
        <div className="message">
            <div className="message_left">
                <img className="inchat-avatar" src={avatarSRC} alt="Sender Avatar" />
            </div>
            <div className='message_right in'>
                {content &&
                    <div className='message_item'>
                        <p className="message_content">{content}</p>
                    </div>

                }
                {
                    urls &&
                    urls.length > 0 &&
                    <div className='message_item'>
                        {
                            urls.map((url, index) => {
                                return <LazyLoadMediaDetector key={timestamp + index} token={token} url={url} />
                            })
                        }
                    </div>
                }
                <p className='message_timestamp'>{timestamp}</p>
                {
                    seenList && seenList.length > 0 && (
                        <p className='message_seenby' >Seen by:
                            {seenList.map((e, index) =>
                                <span key={index}>{e}</span>)
                            }
                        </p>
                    )
                }
            </div>
        </div>
    );
};

export { OutGoingMessage, InComingMessage };
