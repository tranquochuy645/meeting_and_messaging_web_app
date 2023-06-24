import { FC,FormEvent, useState } from 'react';

interface AuthFormProps {
    onLogin: (token:string) => void;
  }
const AuthForm:FC<AuthFormProps> = ({onLogin}) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin(prevState => !prevState);
  };

  const handleSubmit= (event:FormEvent) => {
    event.preventDefault();
    // Handle login or register form submission
    // You can add your logic here to handle the form submission
    // For demonstration purposes, we'll just log the form type
    if (isLogin) {
      console.log('Login form submitted');
    } else {
      console.log('Register form submitted');
    }
    console.log(event);
    

    onLogin("abcsssssss");
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Render login or register fields based on the current state */}
        {isLogin ? (
          <div>
            <label htmlFor="login-email">Email:</label>
            <input type="email" id="login-email" required />
            <br />
            <label htmlFor="login-password">Password:</label>
            <input type="password" id="login-password" required />
          </div>
        ) : (
          <div>
            <label htmlFor="register-name">Name:</label>
            <input type="text" id="register-name" required />
            <br />
            <label htmlFor="register-email">Email:</label>
            <input type="email" id="register-email" required />
            <br />
            <label htmlFor="register-password">Password:</label>
            <input type="password" id="register-password" required />
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

export default AuthForm;
