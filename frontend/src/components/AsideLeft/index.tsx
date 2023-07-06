// import UserCard from '../UserCard'; import './style.css';
import { FC, useEffect } from 'react';
interface AsideLeftProps {
    conversations: any
}
const AsideLeft: FC<AsideLeftProps> = ({ conversations }) => {
    useEffect(() => {
        conversations.length > 0
            && conversations.forEach(
                (conversation: any) => {
                    console.log(conversation)
                }
            );
    }, [conversations])

    return (
        <div id='asideLeft'>
            {conversations.length > 0 ? (
                <div>
                    {
                        conversations.map(
                            () => (
                                <p>?????????????</p>
                            )
                        )
                    }
                </div>
            ) : (
                <p>No conversations to display</p>
            )}
        </div>
    );
};

export default AsideLeft;
