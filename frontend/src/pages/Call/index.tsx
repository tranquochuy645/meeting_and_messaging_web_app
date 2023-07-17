import { useParams,useNavigate } from 'react-router-dom';
import { FC } from 'react';
interface CallProps {
    token: string;
}
const Call: FC<CallProps> = ({ token }) => {
    const nav=useNavigate();
    if(!token){
        nav("/auth")
    }
    const { roomId } = useParams();


    return (
        <div>
            <h1>Call Page</h1>
            <p>Room ID: {roomId}</p>
            <p>token: {token}</p>
            {/* Add your call functionality and UI here */}
        </div>
    );
};

export default Call;
