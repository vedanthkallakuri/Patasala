import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import axios from "axios";
import TableHeader from "./TableHeader.tsx";
import AddRow from "./AddRow.tsx";

export default function TalasGrid2({ authUserId, authUsername }) {
  axios.defaults.withCredentials = true;

  // Existing songs to be displayed on load
  const [talas, setTalas] = useState<any[]>([]);
  const [existingTalas, setExistingTalas] = useState<any[]>([]);
  const [newTala, setNewTala] = useState({
    name: "",
    description: "",
    custom_flag: 1,
    custom_student_id: authUserId,
  });

  const [refreshTalas, setRefreshTalas] = useState(false);

  useEffect(() => {
    const fetchTalas = async () => {
      try {
        const res = await axios.get("http://localhost:3000/talas", {
          params: {
            student_id: authUserId,
          },
        });
        setTalas(res.data);
        setExistingTalas(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTalas();
  }, [authUserId, refreshTalas]);

  const handleChangeCellAdd = (e) => {
    setNewTala((prev) => ({
      ...prev,
      custom_student_id: authUserId,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddRow = async (e) => {
    console.log(newTala);
    try {
      await axios.post("http://localhost:3000/talas", newTala);
    } catch (err) {
      console.log(err);
    }
    setRefreshTalas(!refreshTalas);
  };

  const handleChangeCellUpdate = (e, id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "1";
    setExistingTalas(
      existingTalas.map((tala) => {
        if (tala.id == id) {
          console.log(e.target.name);
          console.log(e.target.value);
          return { ...tala, [e.target.name]: e.target.value };
        } else {
          return { ...tala };
        }
      })
    );
    console.log(existingTalas);
  };

  const handleUpdateRow = async (id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "0.4";

    console.log(existingTalas);
    existingTalas.map((existingTala) => {
      if (existingTala.id == id) {
        updateSong(existingTala);
      }
    });
  };

  const updateSong = async (tala) => {
    try {
      console.log(tala);
      await axios.put("http://localhost:3000/talas", tala);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteRow = async (id) => {
    console.log(id);
    try {
      await axios.delete("http://localhost:3000/talas/" + id);

    } catch (err) {
      console.log(err);
    }
    setRefreshTalas(!refreshTalas);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Talas</h1>
          <div className="page-header-imgs">
            <div className="upload-img-link">
              <img className="upload-img" src="../patasala-songs-upload-img.png" alt="" />
              <div className="upload-header">Import</div>
            </div>
            <CSVLink className="csv-img-link" filename={authUsername + "-patasala-talas"} data={talas}>
              <img className="csv-img" src="../patasala-songs-excel-img.png" alt="" />
              <div className="csv-header">Export CSV</div>
            </CSVLink>
          </div>
        </div>

        <div className="table-container">
          <TableHeader
            headers={[
              { type: "input", name: "Talam" },
              { type: "input", name: "Description" },
              { type: "input", name: "Type" },
              { type: "input", name: "" },
            ]}
          />
          <AddRow
            inputInfos={[
              { component: "input", type: "text", name: "name", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "description", handleChange: handleChangeCellAdd },
              { component: "input-constant", type: "text", name: "blank", constant: "CUSTOM" },
            ]}
            addRowBtnInfo={{ value: "+ Add Talam", handleClick: handleAddRow }}
          />
          {existingTalas.map((tala) => (
            <div className="table-row" id={tala.id}>
              {tala.custom_flag === 0 ? (
                <>
                  <input className="table-value" type="text" id={tala.id} value={tala.name} name="name" disabled />
                  <input
                    className="table-value"
                    type="text"
                    id={tala.id}
                    value={tala.description}
                    name="description"
                    disabled
                  />
                  <input
                    className="table-value-preloaded"
                    type="text"
                    id={tala.id}
                    defaultValue="PRELOADED"
                    name="custom_flag"
                    disabled
                  />
                  <div className="table-value-btn">
                    <button className="btn-disabled" id={"btn-" + tala.id}></button>
                    <button className="btn-disabled"></button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    className="table-value"
                    type="text"
                    id={tala.id}
                    value={tala.name}
                    name="name"
                    onChange={(e) => handleChangeCellUpdate(e, tala.id)}
                  />
                  <input
                    className="table-value"
                    type="text"
                    id={tala.id}
                    value={tala.description}
                    name="description"
                    onChange={(e) => handleChangeCellUpdate(e, tala.id)}
                  />
                  <input
                    className="table-value-custom"
                    type="text"
                    id={tala.id}
                    defaultValue="CUSTOM"
                    name="custom_flag"
                    disabled
                  />
                  <div className="table-value-btn">
                    <button className="btn-update" id={"btn-" + tala.id} onClick={() => handleUpdateRow(tala.id)}>
                      Update
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteRow(tala.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}