import "../styles/authentication.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const resetPassword = async () => {
    if (email == "") {
      setError("Please fill all fields");
      return;
    }
    try {
      await axios
        .post("http://localhost:3000/resetPassword", {
          email: email,
        })
        .then((response) => {
          console.log(response);
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setError(response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    try {
      axios.get("http://localhost:3000/login").then((response) => {
        if (response.data.loggedIn == true) {
          setLoginStatus(response.data.user[0].username);
          console.log(response);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  //console.log(usernameLog, passwordLog);
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
          <h1 className="login-header">Reset Password</h1>
          <div className="field">
            <label className="field-label">Email</label>
            <div className="field-input-container">
              <input type="input" className="field-input" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          {error && (
            <>
              <div className="error">
                <div className="error-asterisk">*</div>
                {error}
              </div>
            </>
          )}
          <button className="submit-btn-verif" onClick={resetPassword}>
            Send Code
          </button>
          <div className="login-register-link">
            <div className="login-register-link-register">
              <Link to={"/login"}>Already have an account? Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
