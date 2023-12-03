import { SyntheticEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import "./auth.css";

type AuthComponentProps = {
  authService: AuthService;
  setUserNameCb: (userName: string) => void;
};

const AuthComponent = ({ authService, setUserNameCb }: AuthComponentProps) => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    console.log("logged");
    if (userName && password) {
      const loginResponse = await authService.login(userName, password);

      const loggedUserName = loginResponse?.username;
      console.log({ loggedUserName });
      if (loggedUserName) {
        setUserNameCb(loggedUserName);
      }

      if (loggedUserName) {
        setLoginSuccess(true);
      } else {
        setErrorMessage("invalid credentials");
      }
    } else {
      setErrorMessage("UserName and password required!");
    }
  };

  function renderLoginError() {
    if (errorMessage) {
      return <label>{errorMessage}</label>;
    }
  }

  return (
    <div role="main">
      {loginSuccess && <Navigate to="/profile" replace={true} />}
      <h2>Please login</h2>
      <form className="form">
        <div>
          <label htmlFor="userName">User name</label>
          <input
            className="auth-input"
            value={userName}
            id="userName"
            name="userName"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            id="password"
          />
        </div>
        <div>
          <button className="submit-btn" type="button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </form>
      <br />
      {renderLoginError()}
    </div>
  );
};

export default AuthComponent;
