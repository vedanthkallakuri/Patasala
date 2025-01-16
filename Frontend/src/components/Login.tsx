import "../styles/authentication.scss";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");

  const handleSubmit = async () => {
    if (email == "" || password == "") {
      setError("Please fill in all fields");
      return;
    }
    try {
      await axios
        .post("http://localhost:3000/login", {
          username: email,
          password: password,
        })
        .then((response) => {
          setError("");
          console.log(response);
          localStorage.setItem("token", response.data.token);
          navigate("/dashboard/" + response.data.data[0].username);
          console.log(response.data.token)
        })
        .catch((error) => {
          if (error.response.status === 401) setError("Invalid credentials");
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-container">
          <div className="auth-logo">
            <div className="auth-logo-heading">
              <div className="auth-logo-blue">Pata</div>
              <div className="auth-logo-black">sala</div>
            </div>
            <div className="auth-logo-subtitle">Music Hub</div>
          </div>
          <h1 className="login-header">Login</h1>
          <div className="field">
            <label className="field-label">Email</label>
            <div className="field-input-container">
              <input
                type="input"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <div className="field-input-container">
              <input
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <>
              <div className="error">{error}</div>
            </>
          )}
          <button className="submit-btn-verif" onClick={() => handleSubmit()}>
            Login
          </button>
          <div className="login-register-link">
            <div className="login-register-link-forgotpassword">
              <Link to={"/forgot-password"}>Forgot Password</Link>
            </div>
            <div className="login-register-link-register">
              <Link to={"/register"}>
                Don't have an account? Register here{" "}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
