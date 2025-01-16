import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import axios from "axios";
import TableHeader from "./TableHeader.tsx";
import AddRow from "./AddRow.tsx";

export default function RagasGrid({ authUserId, authUsername }) {
  axios.defaults.withCredentials = true;

  // Existing songs to be displayed on load
  const [ragas, setRagas] = useState<any[]>([]);
  const [existingRagas, setExistingRagas] = useState<any[]>([]);
  const [newRaga, setNewRaga] = useState({
    name: "",
    arohanam: "",
    avarohanam: "",
    custom_flag: 1,
    custom_student_id: authUserId,
  });

  const [refreshRagas, setRefreshRagas] = useState(false);

  useEffect(() => {
    const fetchRagas = async () => {
      try {
        const res = await axios.get("http://localhost:3000/ragas", {
          params: {
            student_id: authUserId,
          },
        });
        setRagas(res.data);
        setExistingRagas(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRagas();
  }, [authUserId, refreshRagas]);

  const handleChangeCellAdd = (e) => {
    setNewRaga((prev) => ({
      ...prev,
      custom_student_id: authUserId,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddRow = async (e) => {
    console.log(newRaga);
    try {
      await axios.post("http://localhost:3000/ragas", newRaga);
    } catch (err) {
      console.log(err);
    }
    setRefreshRagas(!refreshRagas);
  };

  const handleChangeCellUpdate = (e, id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "1";
    setExistingRagas(
      existingRagas.map((raga) => {
        if (raga.id == id) {
          console.log(e.target.name);
          console.log(e.target.value);
          return { ...raga, [e.target.name]: e.target.value };
        } else {
          return { ...raga };
        }
      })
    );
    console.log(existingRagas);
  };

  const handleUpdateRow = async (id) => {
    var btn = document.getElementById("btn-" + id)!;
    btn.style.opacity = "0.4";

    console.log(existingRagas);
    existingRagas.map((existingRaga) => {
      if (existingRaga.id == id) {
        updateSong(existingRaga);
      }
    });

  };

  const updateSong = async (raga) => {
    try {
      console.log(raga);
      await axios.put("http://localhost:3000/ragas", raga);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteRow = async (id) => {
    console.log(id);
    try {
      await axios.delete("http://localhost:3000/ragas/" + id);

    } catch (err) {
      console.log(err);
    }
    setRefreshRagas(!refreshRagas);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Ragas</h1>
          <div className="page-header-imgs">
            <div className="upload-img-link">
              <img className="upload-img" src="../patasala-songs-upload-img.png" alt="" />
              <div className="upload-header">Import</div>
            </div>
            <CSVLink className="csv-img-link" filename={authUsername + "-patasala-ragas"} data={ragas}>
              <img className="csv-img" src="../patasala-songs-excel-img.png" alt="" />
              <div className="csv-header">Export CSV</div>
            </CSVLink>
          </div>
        </div>

        <div className="table-container">
          <TableHeader
            headers={[
              { type: "input", name: "Ragam" },
              { type: "select", name: "Arohanam" },
              { type: "select", name: "Avarohanam" },
              { type: "input", name: "Type" },
              { type: "input", name: "" },
            ]}
          />
          <AddRow
            inputInfos={[
              { component: "input", type: "text", name: "name", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "arohanam", handleChange: handleChangeCellAdd },
              { component: "input", type: "text", name: "avarohanam", handleChange: handleChangeCellAdd },
              { component: "input-constant", type: "text", name: "blank", constant: "CUSTOM" },
            ]}
            addRowBtnInfo={{ value: "+ Add Ragam", handleClick: handleAddRow }}
          />
          {existingRagas.map((raga) => (
            <div className="table-row" id={raga.id}>
              {raga.custom_flag === 0 ? (
                <>
                  <input className="table-value" type="text" id={raga.id} value={raga.name} name="name" disabled />
                  <input
                    className="table-value"
                    type="text"
                    id={raga.id}
                    value={raga.arohanam}
                    name="arohanam"
                    disabled
                  />
                  <input
                    className="table-value"
                    type="text"
                    id={raga.id}
                    value={raga.avarohanam}
                    name="avarohanam"
                    disabled
                  />
                  <input
                    className="table-value-preloaded"
                    type="text"
                    id={raga.id}
                    defaultValue="PRELOADED"
                    name="custom_flag"
                    disabled
                  />
                  <div className="table-value-btn">
                    <button className="btn-disabled" id={"btn-" + raga.id}></button>
                    <button className="btn-disabled"></button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    className="table-value"
                    type="text"
                    id={raga.id}
                    value={raga.name}
                    name="name"
                    onChange={(e) => handleChangeCellUpdate(e, raga.id)}
                  />
                  <input
                    className="table-value"
                    type="text"
                    id={raga.id}
                    value={raga.arohanam}
                    name="arohanam"
                    onChange={(e) => handleChangeCellUpdate(e, raga.id)}
                  />
                  <input
                    className="table-value"
                    type="text"
                    id={raga.id}
                    value={raga.avarohanam}
                    name="avarohanam"
                    onChange={(e) => handleChangeCellUpdate(e, raga.id)}
                  />
                  <input
                    className="table-value-custom"
                    type="text"
                    id={raga.id}
                    defaultValue="CUSTOM"
                    name="custom_flag"
                    disabled
                  />
                  <div className="table-value-btn">
                    <button className="btn-update" id={"btn-" + raga.id} onClick={() => handleUpdateRow(raga.id)}>
                      Update
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteRow(raga.id)}>
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

//    <input
//     className="table-value"
//     type="text"
//     id={raga.id}
//     value={raga.name}
//     name="name"
//     onChange={(e) => handleChangeCellUpdate(e, raga.id)
//     }
//   />
//   <input
//     className="table-value"
//     type="text"
//     id={raga.id}
//     value={raga.arohanam}
//     name="arohanam"
//     onChange={(e) => handleChangeCellUpdate(e, raga.id)}
//   />
//   <input
//     className="table-value"
//     type="text"
//     id={raga.id}
//     value={raga.avarohanam}
//     name="avarohanam"
//     onChange={(e) => handleChangeCellUpdate(e, raga.id)}
//   />
//   {raga.custom_flag === 1 ? (
//     <input
//       className="table-value-custom"
//       type="text"
//       id={raga.id}
//       defaultValue="CUSTOM"
//       name="custom_flag"
//       disabled
//     />
//   ) : (
//     <input
//       className="table-value-preloaded"
//       type="text"
//       id={raga.id}
//       defaultValue="PRELOADED"
//       name="custom_flag"
//       disabled
//     />
//   )}
//   {raga.custom_flag === 1 ? (
//     <div className="table-value-btn">
//       <button className="btn-update" id={"btn-" + raga.id} onClick={() => handleUpdateRow(raga.id)}>
//         Update
//       </button>
//       <button className="btn-delete" onClick={() => handleDeleteRow(raga.id)}>
//         Delete
//       </button>
//     </div>
//   ) : (
//     <div className="table-value-btn">
//       <button className="btn-disabled" id={"btn-" + raga.id}></button>
//       <button className="btn-disabled"></button>
//     </div>
//   )}
