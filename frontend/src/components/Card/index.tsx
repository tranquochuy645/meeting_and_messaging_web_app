import { FC } from 'react';
import './style.css';
import PendingFigure from '../PendingFigure';
import { ProfileData } from '../../Main';
interface CardProps {
    cardData: [ProfileData];
}

const Card: FC<CardProps> = ({ cardData }) => {
    const props = cardData[0];
    return (
        < div className="user-card" >
            {
                props && props.avatar ?
                    <img src={props.avatar} alt="Profile" className="profile-picture" />
                    :
                    <PendingFigure size={30} />
            }

            < div className="user-info" >
                {
                    props && props.fullname ?
                        <h3>{props.fullname}</h3>
                        :
                        <PendingFigure size={30} />
                }
                {
                    props && props.isOnline !== undefined ?
                        <p className={props.isOnline ? 'online' : 'offline'}>
                            {props.isOnline ? 'Online' : 'Offline'}
                        </p>
                        :
                        <PendingFigure size={15} />
                }
            </div >
        </div >
    );
};

export default Card;
