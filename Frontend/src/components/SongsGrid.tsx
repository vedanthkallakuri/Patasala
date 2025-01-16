import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import axios from "axios";
import TableHeader from "./TableHeader";
import AddRow from "./AddRow";

export default function ({ authUserId, authUsername }) {
  axios.defaults.withCredentials = true;

  /************************* State *************************/

  // Existing songs to be displayed on load
  const [songs, setSongs] = useState<any[]>([]);

  // Existing songs to be updated on change
  const [existingSongs, setExistingSongs] = useState<any[]>([]);

  // New song when being added
  const [newSong, setNewSong] = useState({
    student_id: authUserId,
    name: "",
    raga_id: null,
    tala_id: null,
    lyricist: "",
    composer: "",
    audio: "",
    script: "",
    date_learned: "",
  });

  // All ragas from raga table
  const [ragas, setRagas] = useState<any[]>([]);

  // All talas from tala table
  const [talas, setTalas] = useState<any[]>([]);

  // Add Row button
  const [refreshSongs, setRefreshSongs] = useState(false);

  /************************* Fetch On Load *************************/

  // Song/Raga/Tala data
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/songs", {
          params: { student_id: authUserId },
        });
        setSongs(res.data);
        setExistingSongs(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchRagas = async () => {
      try {
        const res = await axios.get("http://localhost:3000/ragas", {
          params: {
            student_id: authUserId,
          },
        });
        setRagas(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchTalas = async () => {
      try {
        const res = await axios.get("http://localhost:3000/talas", {
          params: {
            student_id: authUserId,
          },
        });
        setTalas(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchSongs();
    fetchRagas();
    fetchTalas();
  }, [authUserId, refreshSongs]);

  /************************* Add Row *************************/

  const handleChangeCellAdd = (e) => {
    setNewSong((prev) => ({
      ...prev,
      student_id: authUserId,
      [e.target.name]: e.target.value,
    }));
    console.log(newSong);
  };

  const handleAddRow = async (e) => {
    console.log(newSong);
    try {
      await axios.post("http://localhost:3000/songs", newSong);
    } catch (err) {
      console.log(err);
    }
    setRefreshSongs(!refreshSongs);
  };

  /************************* Update Row *************************/

  const handleChangeCellUpdate = (e, id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "1";
    console.log(songs);
    setExistingSongs(
      existingSongs.map((song) => {
        if (song.id == id) {
          console.log(e.target.name);
          console.log(e.target.value);
          return { ...song, [e.target.name]: e.target.value };
        } else {
          return { ...song };
        }
      })
    );
    console.log(existingSongs);
  };

  const handleUpdateRow = async (id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "0.4";

    console.log(existingSongs);
    existingSongs.map((existingSong) => {
      if (existingSong.id == id) {
        updateSong(existingSong);
      }
    });
  };

  const updateSong = async (song) => {
    try {
      console.log(song);
      await axios.put("http://localhost:3000/songs", song);
    } catch (err) {
      console.log(err);
    }
  };

  /************************* Delete Row *************************/

  const handleDeleteRow = async (id) => {
    console.log(id);
    try {
      await axios.delete("http://localhost:3000/songs/" + id);
    } catch (err) {
      console.log(err);
    }
    setRefreshSongs(!refreshSongs);
  };

  /*************************************************************/

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Songs</h1>
          <div className="page-header-imgs">
            <div className="upload-img-link">
              <img className="upload-img" src="../patasala-songs-upload-img.png" alt="" />
              <div className="upload-header">Import</div>
            </div>
            <CSVLink className="csv-img-link" filename={authUsername + "-patasala-songs"} data={songs}>
              <img className="csv-img" src="../patasala-songs-excel-img.png" alt="" />
              <div className="csv-header">Export CSV</div>
            </CSVLink>
          </div>
        </div>

        <div className="table-container">
          <TableHeader
            headers={[
              { type: "input", name: "Song" },
              { type: "select", name: "Raga" },
              { type: "select", name: "Tala" },
              { type: "input", name: "Lyricist" },
              { type: "input", name: "Composer" },
              { type: "input", name: "Audio" },
              { type: "input", name: "Script" },
              { type: "input", name: "Date Learned" },
              { type: "input", name: "" },
            ]}
          />
          <AddRow
            inputInfos={[
              { component: "input", type: "text", name: "name", handleChange: handleChangeCellAdd },
              { component: "select", optionValues: ragas, name: "raga_id", handleChange: handleChangeCellAdd },
              { component: "select", optionValues: talas, name: "tala_id", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "lyricist", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "composer", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "audio", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "script", handleChange: handleChangeCellAdd },
              { component: "input", type: "date", name: "date_learned", handleChange: handleChangeCellAdd },
            ]}
            addRowBtnInfo={{ value: "+ Add Song", handleClick: handleAddRow }}
          />

          {existingSongs.map((song) => (
            <div className="table-row" id={song.id}>
              <input
                className="table-value"
                type="text"
                id={song.student_id}
                value={song.name}
                name="name"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <select
                className="table-value"
                name="raga_id"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              >
                <option value={song.raga_name}>{song.raga_name}</option>
                {ragas.map((raga) => (
                  <option value={raga.id}>{raga.name}</option>
                ))}
              </select>
              <select
                className="table-value"
                name="tala_id"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              >
                <option value={song.tala_name}>{song.tala_name}</option>
                {talas.map((tala) => (
                  <option value={tala.id}>{tala.name}</option>
                ))}
              </select>
              <input
                className="table-value"
                type="text"
                value={song.lyricist}
                name="lyricist"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <input
                className="table-value"
                type="text"
                value={song.composer}
                name="composer"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <input
                className="table-value"
                type="text"
                value={song.audio}
                name="audio"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <input
                className="table-value"
                type="text"
                value={song.script}
                name="script"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <input
                className="table-value"
                type="text"
                value={song.date_learned}
                name="date_learned"
                onChange={(e) => handleChangeCellUpdate(e, song.id)}
              />
              <div className="table-value-btn">
                <button
                  className="btn-update"
                  id={"btn-" + song.id}
                  onClick={() => handleUpdateRow(song.id)}
                >
                  Update
                </button>
                <button className="btn-delete" onClick={() => handleDeleteRow(song.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
