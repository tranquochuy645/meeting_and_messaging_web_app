import { ReactNode, FC } from 'react';
import Card from '../../components/Card';
import ThemeSwitch from '../../components/ThemeSwitch';
import './style.css';
import { ProfileData } from '../../Main';
interface LayoutProps {
    children: ReactNode;
    userData: ProfileData | null;
}


const Layout: FC<LayoutProps> = ({ children, userData }) => {
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        window.location.reload();
    }

    return (
        <>
            <header>

                {userData && <Card cardData={[userData]} />}
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