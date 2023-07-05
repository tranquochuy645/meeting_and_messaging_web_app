import { useState } from 'react';
import './style.css'
const darkTheme = {
    text: "#000",
    bg: "#ffffff"
}
const lightTheme = {
    text: "#ffffff",
    bg: "#000"
}
const ThemeSwitch = () => {
    const [isLightMode, setIsLightMode] = useState(sessionStorage.getItem('theme') === "light");

    const handleToggle = () => {
        if (isLightMode) {
            setIsLightMode(false);
            sessionStorage.setItem('theme', 'dark');
            document.querySelector('.switcher-label')?.classList.add('active');
            document.documentElement.style.setProperty("--text-color", darkTheme.text);
            document.documentElement.style.setProperty("--background-color", darkTheme.bg);
        } else {
            setIsLightMode(true);
            sessionStorage.setItem('theme', 'light');
            document.querySelector('.switcher-label')?.classList.remove('active');
            document.documentElement.style.setProperty("--text-color", lightTheme.text);
            document.documentElement.style.setProperty("--background-color", lightTheme.bg);
        }
    };

    return (
        <div className='theme-switch-container'>
            <input
                type="checkbox"
                id="switcher-input"
                checked={isLightMode}
                onChange={handleToggle}
            />
            <label className="switcher-label" htmlFor="switcher-input">
                <i className='fas fa-solid fa-sun'></i>
                <span className="switcher-toggler"></span>
                <i className='fas fa-solid fa-moon'></i>
            </label>
        </div>
    );
};

export default ThemeSwitch;
