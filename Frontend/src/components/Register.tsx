import "../styles/authentication.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

export default function Register() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fieldAuth = () => {
    if (email == "" || password == "") {
      return "Please fill in all fields";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Double check your email format";
    }
    if (!PASSWORD_REGEX.test(password)) {
      return "Password must be at least 8 characters long, contain 1 uppercase character, 1 special character, and 1 number";
    }
  };

  const handleSubmit = async () => {
    const error = fieldAuth();
    console.log(error);
    if (error) {
      setError(error);
      return;
    }
    try {
      await axios
        .post(
          "http://localhost:3000/register",
          { email, password },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        )
        .then((response) => {
          setError("");
          navigate("/login");
        })
        .catch((error) => {
          if (error.response.status === 409) setError("User already exists");
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="auth-logo">
          <div className="auth-logo-heading">
            <div className="auth-logo-blue">Pata</div>
            <div className="auth-logo-black">sala</div>
          </div>
          <div className="auth-logo-subtitle">Music Hub</div>
        </div>
        <h1 className="login-header">Register</h1>
        <div className="field">
          <label className="field-label">Email</label>
          <div className="field-input-container">
            <input
              type="input"
              className="field-input"
              name="username"
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
              name="password"
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
        <button className="submit-btn-verif" onClick={handleSubmit}>
          Register
        </button>{" "}
        <div className="login-register-link">
          <div className="login-register-link-register">
            <Link to={"/login"}>Already have an account? Login here </Link>
          </div>
        </div>{" "}
      </div>
    </div>
  );
}
