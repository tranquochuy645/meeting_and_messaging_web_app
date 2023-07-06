import { ReactNode, FC } from 'react';
import UserCard from '../../components/UserCard';
import ThemeSwitch from '../../components/ThemeSwitch';
import './style.css';

interface LayoutProps {
    children: ReactNode;
    _id: string;
}


const Layout: FC<LayoutProps> = ({ children, _id }) => {
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        window.location.reload();
    }

    return (
        <>
            <header>

                {_id && <UserCard userId={_id} />}
                <div className='flex'>
                    <ThemeSwitch />
                    <button id="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <main className='flex'>{children}</main>
            <footer style={{ display: "none" }}>
                <p>© 2023 Messaging App. All rights reserved.</p>
            </footer >
        </>
    );
};

export default Layout