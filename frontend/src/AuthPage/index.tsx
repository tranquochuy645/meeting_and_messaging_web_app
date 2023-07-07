import { FC, useState } from 'react';
import './style.css';
import { handleInputPassword } from './e2eEncrypt';

interface AuthPageProps {
  onLogin: (token: string) => void;
}

const AuthPage: FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const handleToggle = () => {
    setIsLogin(prevState => !prevState);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    // Handle login or register form submission
    if (isLogin) {
      const username = event.target.logUsername.value;
      const password = event.target.logPassword.value;
      let hashedPassword
      try{
        hashedPassword=handleInputPassword(password,false);
      }catch(e){
        alert(e);
        return
      }
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: hashedPassword, // Use the hash value instead of the original password
        }),
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              data.authToken && onLogin(data.authToken);
            });
          } else {
            response.json().then((data) => {
              data.message && alert(data.message);
            });
          }
        })
        .catch((error) => {
          alert( error);
        });
    } else {
      const username = event.target.regUsername.value;
      const password = event.target.regPassword.value;
      const passwordCheck = event.target.reRegPassword.value;
      if (password !== passwordCheck) {
        return alert("Passwords do not match");
      }
      let hashedPassword
      try{
        hashedPassword=handleInputPassword(password);
      }catch(e){
        alert(e);
        return
      }
      fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: hashedPassword,
        }),
      })
        .then((response) => {
          response.json().then((data) => {
            data.message && alert(data.message);
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Render login or register fields based on the current state */}
        {isLogin ? (
          <div >
            <label htmlFor="logUsername">Username:</label>
            <input type="text" name="logUsername" required />
            <br />
            <label htmlFor="logPassword">Password:</label>
            <input type="password" name="logPassword" required />
          </div>
        ) : (
          <div>
            <label htmlFor="regUsername">Username:</label>
            <input type="text" name="regUsername" required />
            <br />
            <label htmlFor="regPassword">Password:</label>
            <input type="password" id="regPassword" required />
            <br />
            <label htmlFor="reRegPassword">Password check:</label>
            <input type="password" id="reRegPassword" required />
          </div>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={handleToggle}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
};

export default AuthPage;
