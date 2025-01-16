import "../styles/dashboard.scss";
import Navbar from "./Navbar.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardStats from "./DashboardStats.tsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  // Fetch User Data
  const [authUsername, setAuthUsername] = useState("");
  const [authUserId, setAuthUserId] = useState(0);
  const [authFirstname, setAuthFirstname] = useState("");
  const [authProfilePic, setAuthProfilePic] = useState("");

  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      axios.get("http://localhost:3000/login").then((response) => {
        console.log(response);

        if (response.data.loggedIn == true) {
          setAuthUsername(response.data.user[0].username);
          setAuthUserId(response.data.user[0].user_id);
          setAuthFirstname(response.data.user[0].firstname);
          setAuthProfilePic(response.data.user[0].profile_img);
        } else {
          navigate("/login");
          console.log({ error: "error" });
        }
      });
    };

    getUserData();
  }, []);

  return (
    <>
      <Navbar username={authFirstname} profilePic={authProfilePic} />
      <div className="container">
        <DashboardStats authUserId={authUserId} />
      </div>
    </>
  );
}
