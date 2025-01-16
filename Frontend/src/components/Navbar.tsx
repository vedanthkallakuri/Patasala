import { useEffect } from "react";
import "../styles/navbar.scss";
import { useNavigate, Route, Link, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar({ username, profilePic }) {
  const location = useLocation();
  const pathname = location.pathname;

  const currentPage = pathname!.split("/")[1];

  const navigate = useNavigate();

  const logout = async () => {
    try {
      axios.get("http://localhost:3000/logout").then((response) => {
        console.log(response);
      });
    } catch (err) {
      console.log(err);
    }
    navigate("/login");
  };

  useEffect(() => {
    const currentPageNavLogo = document.getElementById(currentPage)!;
    currentPageNavLogo.style.opacity = "1";
  }, [currentPage]);
  return (
    <>
      <div className="navbar-container">
        <div className="navbar">
          <div className="navbar-logo">
            <div className="navbar-logo-heading">
              <div className="navbar-logo-blue">Pata</div>
              <div className="navbar-logo-white">sala</div>
            </div>
            <div className="navbar-logo-subtitle">Music Hub</div>
          </div>
          <div className="navbar-pages">
            <Link to={"/dashboard/" + username} style={{ textDecoration: "inherit", color: "inherit" }}>
              <div id="dashboard" className="navbar-pages-container">
                <img className="navbar-pages-logo" src={"../patasala-nav-db-img.png"} alt="" />
                <div className="navbar-pages-heading">Dashboard</div>
              </div>
            </Link>
            <Link to={"/songs/" + username} style={{ textDecoration: "inherit", color: "inherit" }}>
              <div id="songs" className="navbar-pages-container">
                <img className="navbar-pages-logo" src={"../patasala-nav-songs-img.png"} alt="" />
                <div className="navbar-pages-heading">Songs</div>
              </div>
            </Link>
            <Link to={"/ragas/" + username} style={{ textDecoration: "inherit", color: "inherit" }}>
              <div id="ragas" className="navbar-pages-container">
                <img className="navbar-pages-logo" src={"../patasala-nav-ragas-img.png"} alt="" />
                <div className="navbar-pages-heading">Ragas</div>
              </div>
            </Link>
            <Link to={"/talas/" + username} style={{ textDecoration: "inherit", color: "inherit" }}>
              <div id="talas" className="navbar-pages-container">
                <img className="navbar-pages-logo" src={"../patasala-nav-talas-img.png"} alt="" />
                <div className="navbar-pages-heading">Talas</div>
              </div>
            </Link>
          </div>

          <div className="navbar-profile">
            <img className="navbar-profile-img" src={profilePic} alt="" />
            <div className="navbar-profile-details">
              <div>{username}</div>
              <button onClick={() => logout()} className="navbar-logout">
                <LogoutIcon style={{ fontSize: "17px" }} className="logout-icon" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="dashboard-navbar">
        <div className="logo-container">Patasala</div>
        <div className="dashboard-links-container">
          <div className="dashboard-link">
            <a href="">Songs</a>
          </div>
          <div className="dashboard-link">
            <a href="">Teacher</a>
          </div>
          <div className="dashboard-link">
            <a href="">Practice</a>
          </div>
          <div className="dashboard-link">
            <a href="">Home</a>
          </div>
          <div className="dashboard-link">O</div>
        </div>
      </div> */}
    </>
  );
}
