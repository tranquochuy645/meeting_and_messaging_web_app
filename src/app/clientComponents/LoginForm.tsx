'use client'
import { useRef } from 'react';

const LoginForm: React.FC = async () => {
    let userRef = useRef<HTMLInputElement>(null);
    let passRef = useRef<HTMLInputElement>(null);
    const onLogin = async () => {
        console.log('onLogin');
        const user = userRef.current?.value
        const pass = passRef.current?.value
        if (user && pass) {
            let body = {
                username: user,
                password: pass
            };
            const response = await fetch(
                'http://localhost:3000/api/auth',
                {
                    method: 'POST',
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            )
            if (response.ok) {
                console.log('ok');
            } else {
                console.log('not ok');
            }
        }
    }

    return (
        < >
            <div>
                <label htmlFor="username">Username</label>
                <input
                    ref={userRef}
                    type="text"
                    placeholder='username'
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    ref={passRef}
                    type="password"
                    placeholder='password'
                />
            </div>
            <button  onClick={await onLogin}>Login</button>
        </>
    );
};

export default LoginForm;
