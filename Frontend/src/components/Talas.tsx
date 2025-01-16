import "../styles/ragas-core.scss";
import Navbar from "./Navbar.tsx";
import TalasGrid from "./TalasGrid.tsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Talas() {
  axios.defaults.withCredentials = true;

  // User Data
  const [authUsername, setAuthUsername] = useState("");
  const [authUserId, setAuthUserId] = useState(null);
  const [authFirstname, setAuthFirstname] = useState("");
  const [authProfilePic, setAuthProfilePic] = useState("");

  const navigate = useNavigate();

  console.log(authUserId);

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
        <TalasGrid authUserId={authUserId} />
      </div>
    </>
  );
}
