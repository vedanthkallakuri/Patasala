import "../styles/songs-core.scss";
import Navbar from "./Navbar.tsx";
import SongsGrid from "./SongsGrid.tsx";
import SongsGrid2 from "./SongsGrid2.tsx";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Songs() {
  axios.defaults.withCredentials = true;

  const [authUsername, setAuthUsername] = useState("");
  const [authUserId, setAuthUserId] = useState(null);
  const [authFirstname, setAuthFirstname] = useState("");
  const [authProfilePic, setAuthProfilePic] = useState("");

  console.log(authUserId);
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
        <SongsGrid2 authUserId={authUserId} />
      </div>
    </>
  );
}
