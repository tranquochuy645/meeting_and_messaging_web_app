import { ReactNode, FC } from 'react';
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
        <div>
            <header>
                <h1>Messaging App</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <main>{children}</main>
            <footer>
                <p>© 2023 Messaging App. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
