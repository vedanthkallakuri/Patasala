import "../styles/landing.scss";
import axios from "axios";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  return (
    <>
      <div className="landing-wrapper">
        {/* <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              loginGoogle(credentialResponse);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </GoogleOAuthProvider> */}
        <div className="landing-container-1">
          <div className="header">
            <div className="header-links">
              <ul>Purpose</ul>
              <ul>Customization</ul>
              <ul>Feedback</ul>
            </div>
            <div className="header-title">Patasala</div>
            <div className="header-login">
              <button onClick={() => navigate("/login")} className="header-login-btn">
                Log In
              </button>
              <button onClick={() => navigate("/register")} className="header-register-btn">
                Register <ArrowForwardIcon style={{ fontSize: 15 }} />
              </button>
            </div>
          </div>
          <div className="section-1">
            <div className="section-1-tagline">
              Organize your music <MusicNoteIcon style={{ fontSize: 80 }} /> effortlessly.
            </div>
            <div className="section-1-sub-tagline">Your songs, files, and progress all in one place</div>
            <button className="section-1-button">
              Get Started <ArrowForwardIcon />
            </button>
          </div>
        </div>
        <div className="dashboard-example-img">
          <img src="./public/dashboard-example.jpg" alt="" />
        </div>
        <div className="section-2">
          <div className="section-2-header">
            <div className="section-2-tagline">
              Everything you'll need to store your musical progress in Indian music
            </div>
            <div className="section-2-sub-tagline">Patasala will declutter your musical life</div>
            <button className="section-2-button">
              Organize your music <ArrowForwardIcon />
            </button>
          </div>
          <div className="section-2-checklist">
            <div className="section-2-checklist-item-1">
              <TaskAltIcon />
              Work with preloaded ragas and talas or add your own custom ones!
            </div>
            <div className="section-2-checklist-item-2">
              <TaskAltIcon />
              See important stats on your dashboard page for a birdseye view.
            </div>
            <div className="section-2-checklist-item-3">
              <TaskAltIcon />
              Store every important detail for any song you've learnt.
            </div>
          </div>
        </div>

        <div className="section-3">
          <div className="section-3-text">
            <div className="section-3-tagline">Give us Your Feedback!</div>
            <div className="section-3-sub-tagline">
              We are a newly made application in our testing phases of development. We would love to hear your
              comments and suggestions!
            </div>
          </div>
          <div className="section-3-elements">
            <div className="section-3-email">
              <TypeAnimation sequence={[`patasalamusic@gmail.com`, 1000]} repeat={Infinity} />
            </div>
            <button className="section-3-button">
              Start with Patasala <ArrowForwardIcon />
            </button>
          </div>
        </div>
        <div className="footer">
          <div className="footer-link">Privacy Policy</div>
          <div className="footer-link">Terms of Use</div>
          <div className="footer-link">Made by VK</div>
        </div>
      </div>
    </>
  );
}
