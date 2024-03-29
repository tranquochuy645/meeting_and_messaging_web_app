import { FC, useState } from "react";
import "./style.css";
import { isWeakPassword } from "../../lib/e2eEncrypt/isWeakPassword";
import ThemeSwitch from "../../components/ThemeSwitch";
interface AuthPageProps {
  onLogin: (token: string) => void;
}

const Auth: FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const handleToggle = () => {
    setIsLogin((prevState) => !prevState);
  };
  const handleSubmit = (event: any) => {
    event.preventDefault();
    // Handle login or register form submission
    if (isLogin) {
      const username = event.target.logUsername.value;
      const password = event.target.logPassword.value;

      fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => {
          response.json().then((data) => {
            data.message && alert(data.message);
            response.ok && data.access_token && onLogin(data.access_token);
          });
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      const username = event.target.regUsername.value;
      const password = event.target.regPassword.value;
      const passwordCheck = event.target.reRegPassword.value;
      if (password != passwordCheck) {
        return alert("Passwords do not match");
      }
      if (isWeakPassword(password)) {
        return alert("weak password");
      }

      fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => {
          response.json().then((data) => {
            response.ok && handleToggle();
            data.message && alert(data.message);
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  return (
    <>
      <ThemeSwitch />
      <div id="auth-page">
        <div className="wrapper">
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={handleSubmit}>
            {/* Render login or register fields based on the current state */}
            {isLogin ? (
              <div className={`form ${isLogin ? "login" : "register"} `}>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Username"
                    name="logUsername"
                    required
                  />
                  <i className="bx bxs-user"></i>
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    placeholder="Password"
                    name="logPassword"
                    required
                  />
                  <i className="bx bxs-lock-alt"></i>
                </div>
              </div>
            ) : (
              <div className={`form ${isLogin ? "login" : "register"} `}>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Username"
                    name="regUsername"
                    required
                  />
                </div>

                <div className="input-box">
                  <input
                    type="password"
                    placeholder="Password"
                    name="regPassword"
                    required
                  />
                </div>

                <div className="input-box">
                  <input
                    type="password"
                    placeholder="Repeat Password"
                    name="reRegPassword"
                    required
                  />
                </div>
              </div>
            )}
            <button className="btn" type="submit">
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </form>
          <button className="btn" onClick={handleToggle}>
            {isLogin ? "Sign up" : "Go to sign in"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Auth;
