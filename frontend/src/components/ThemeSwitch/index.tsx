import { useState, useEffect } from 'react';
import './style.css';

interface Theme {
    text: string;
    background: string;
    theme: string;
}

const themes: { [key: string]: Theme } = {
    light: {
        text: "#000",
        background: "#ffffff",
        theme: "#046d8c",
    },
    dark: {
        text: "#ffffff",
        background: "#000",
        theme: "#240063",
    },
    // Add more themes here if needed
};

const useTheme = () => {
    const [theme, setTheme] = useState<string>(sessionStorage.getItem('theme') || 'light');

    useEffect(() => {
        const selectedTheme = themes[theme];
        Object.entries(selectedTheme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        });
        sessionStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme] as const;
};

const ThemeSwitch = () => {
    const [theme, setTheme] = useTheme();
    const isLightMode = theme === 'light';

    const handleToggle = () => {
        setTheme(isLightMode ? 'dark' : 'light');
    };

    return (
        <div className='theme-switch-container'>
            <input
                type="checkbox"
                id="switcher-input"
                checked={isLightMode}
                onChange={handleToggle}
            />
            <label className={`switcher-label ${isLightMode ? '' : 'active'}`} htmlFor="switcher-input">
                <i className='fas fa-solid fa-sun'></i>
                <span className="switcher-toggler"></span>
                <i className='fas fa-solid fa-moon'></i>
            </label>
        </div>
    );
};

export default ThemeSwitch;
