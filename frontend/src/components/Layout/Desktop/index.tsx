import { ReactNode, FC } from 'react';
import UserCard from '../../UserCard';
import ThemeSwitch from '../../ThemeSwitch';
import './style.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        window.location.reload();
    }
    return (
        <>
            <header>
                <UserCard isOnline={true} name="Nguyen Van A" profilePicture="" />
                <div className='flex'>
                    <ThemeSwitch />
                    <button id="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <main>{children}</main>
            <footer>
                <p>© 2023 Messaging App. All rights reserved.</p>
            </footer>
        </>
    );
};

export default Layout;
