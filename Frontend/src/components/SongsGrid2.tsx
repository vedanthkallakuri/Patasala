import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  GridToolbarContainer,
  GridSlots,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AddRow from "./AddRow";
import TableHeader from "./TableHeader";
import useMutation from "../hooks/useMutation";
import useQuery from "../hooks/useQuery";

import LoadingButton from "@mui/lab/LoadingButton";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Snackbar, { SnackbarCloseReason, SnackbarOrigin } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface EditToolbarProps {
  handleDeleteRow: () => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { handleDeleteRow } = props;

  return (
    <GridToolbarContainer>
      <div className="grid-toolbar">
        <div className="btn-container">
          {/* <button className="btn-info" onClick={handleDeleteRow}>
            <PriorityHighIcon />
          </button> */}
          <button className="btn-delete" id="btn-delete" onClick={handleDeleteRow}>
            <DeleteIcon color="disabled" />
          </button>
        </div>
        <div className="toolbar-default-actions">
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector slotProps={{ tooltip: { title: "Change density" } }} />
          <GridToolbarExport
            slotProps={{
              tooltip: { title: "Export data" },
              button: { variant: "outlined" },
            }}
          />
        </div>
      </div>
    </GridToolbarContainer>
  );
}

export default function ({ authUserId }) {
  axios.defaults.withCredentials = true;

  const [uploaded, setUploaded] = useState(false);

  const [open, setOpen] = useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  /************************* State *************************/

  const [error, setError] = useState("");
  const [addRowError, setAddRowError] = useState("");

  const ErrorText = ({ children, ...props }) => <p className="error-text">{children}</p>;

  // Existing songs to be displayed on load
  const [songs, setSongs] = useState<any[]>([]);

  const [selectedRowsId, setSelectedRowsId] = useState([]);
  const [selected, setSelected] = useState(false);

  // New song when being added
  const [newSong, setNewSong] = useState({
    student_id: authUserId,
    name: "",
    raga_id: "",
    tala_id: "",
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

        setSongs(
          res.data.map((song) => {
            const formatSong = {};
            for (let key in song) {
              if (song[key] == "") {
                formatSong[key] = "--";
              } else {
                formatSong[key] = song[key];
              }
            }
            return formatSong;
          })
        );

        // setSongs(res.data);
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
  };

  /************************* Update Row *************************/

  const processRowUpdate = async (updatedRow, originalRow) => {
    try {
      await axios.put("http://localhost:3000/songs", updatedRow);
    } catch (err) {
      console.log(err);
    }
    setRefreshSongs(!refreshSongs);
  };

  const handleProcessRowUpdateError = (err) => {
    console.log(err);
  };

  /************************* Delete Row *************************/

  const handleDeleteRow = async () => {
    console.log(selectedRowsId);
    try {
      await axios
        .delete("http://localhost:3000/songs", {
          params: {
            ids: selectedRowsId,
          },
        })
        .then((msg) => console.log(msg));
    } catch (err) {
      console.log(err);
    }
    setRefreshSongs(!refreshSongs);
  };

  const setRowSelectionModel = (selectedRowId) => {
    console.log(selectedRowId.length);
    var btn_delete = document.getElementById("btn-delete")!;
    if (selectedRowId.length > 0) {
      btn_delete.style.backgroundColor = "#b9d2ff";
      setSelected(true);
    } else {
      btn_delete.style.backgroundColor = "#FFFFFF";

      console.log("all unselected");
      setSelected(false);
    }
    setSelectedRowsId(selectedRowId);
  };

  /********** */

  const validFileTypes = ["application/pdf"];

  const {
    mutate: uploadImage,
    isLoading: uploading,
    error: uploadError,
  } = useMutation({ url: "http://localhost:3000/documents" });

  const {
    data: imageUrls = [],
    isLoading: imagesLoading,
    error: fetchError,
  } = useQuery("http://localhost:3000/documents");

  const handleUploadScript = async (e) => {
    const form = new FormData(undefined);

    const file = e.target.files[0];

    if (!validFileTypes.find((type) => type === file.type)) {
      setError("File must be in PDF format");
      setUploaded(false);
      return;
    }
    form.append("document", file);
    form.append("userId", authUserId);

    await uploadImage(form);

    setOpen(true);
    setUploaded(true);
  };

  const handleAddRow = async (e) => {
    console.log(newSong);
    if (newSong.name == "" || newSong.raga_id == "" || newSong.tala_id == "" || newSong.date_learned == "") {
      setAddRowError("All required fields must be filled");
      return;
    }

    setNewSong((prev) => ({
      ...prev,
      student_id: authUserId,
    }));
    console.log(newSong);
    try {
      await axios.post("http://localhost:3000/songs", newSong);
    } catch (err) {
      console.log(err);
    }
    setUploaded(false);
    setRefreshSongs(!refreshSongs);
    setAddRowError("");
  };
  /*************************************************************/

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      type: "string",
      width: 150,
      editable: true,
    },
    {
      field: "raga_id",
      headerName: "Raga",
      type: "singleSelect",
      getOptionValue: (value: any) => value.id,
      getOptionLabel: (value: any) => value.name,
      valueOptions: ragas,
      width: 150,
      editable: true,
    },
    {
      field: "tala_id",
      headerName: "Tala",
      type: "singleSelect",
      getOptionValue: (value: any) => value.id,
      getOptionLabel: (value: any) => value.name,
      valueOptions: talas,
      width: 150,
      editable: true,
    },
    { field: "lyricist", headerName: "Lyricist", width: 150, editable: true },
    { field: "composer", headerName: "Composer", width: 150, editable: true },
    { field: "audio", headerName: "Audio", width: 150, editable: true },
    { field: "script", headerName: "Script", width: 150, editable: true },
    {
      field: "date_learned",
      headerName: "Date",
      type: "date",
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
      width: 150,
      editable: true,
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Songs</h1>
        </div>

        {/* <div className="table-container">
          <div className="add-row-container">
            <TableHeader
              headers={[
                { type: "input", name: "Name" },
                { type: "select", name: "Raga" },
                { type: "select", name: "Tala" },
                { type: "input", name: "Lyricist" },
                { type: "input", name: "Composer" },
                { type: "input", name: "Audio" },
                { type: "input", name: "Script" },
                { type: "input", name: "Date" },
                { type: "input", name: "" },
              ]}
            />

            <div className="table-row-add-row">
              <input className="table-value" type="text" name="name" onChange={handleChangeCellAdd} />
              <div className="select-input">
                <select className="table-value" name="raga_id" onChange={handleChangeCellAdd}>
                  <option value="0"></option>
                  {ragas.map((optionValue) => (
                    <option value={optionValue.id}>{optionValue.name}</option>
                  ))}
                </select>
              </div>
              <div className="select-input">
                <select className="table-value" name="tala_id" onChange={handleChangeCellAdd}>
                  <option value="0"></option>
                  {talas.map((optionValue) => (
                    <option value={optionValue.id}>{optionValue.name}</option>
                  ))}
                </select>
              </div>
              <input className="table-value" type="text" name="lyricist" onChange={handleChangeCellAdd} />
              <input className="table-value" type="text" name="composer" onChange={handleChangeCellAdd} />
              <label className="label-upload" htmlFor={"audio-id"}>
                <UploadFileIcon className="upload-file-img" />
                Upload
              </label>
              <input
                className="table-value"
                type="file"
                name="audio"
                id={"audio-id"}
                onChange={handleUpload}
                hidden
              />
              <label className="label-upload" htmlFor={"script-id"}>
                <UploadFileIcon className="upload-file-img" />
                Upload
              </label>
              <input
                className="table-value"
                type="file"
                name="script"
                id={"script-id"}
                onChange={handleUpload}
                hidden
              />
              <input className="table-value" type="date" name="date_learned" onChange={handleChangeCellAdd} />
              <div className="table-value-btn">
                <button className="btn-add" onClick={handleAddRow}>
                  + Add Song
                </button>
              </div>
            </div>
          </div>
        </div> */}

        <div className="table-container">
          <div className="add-row-container">
            <TableHeader
              headers={[
                { type: "input", name: "Name *" },
                { type: "select", name: "Raga *" },
                { type: "select", name: "Tala *" },
                { type: "input", name: "Lyricist" },
                { type: "input", name: "Composer" },
                { type: "input", name: "Audio" },
                { type: "input", name: "Script" },
                { type: "input", name: "Date *" },
                { type: "input", name: "" },
              ]}
            />
            <div className="table-row-add-row">
              <input className="table-value" type="text" name="name" onChange={handleChangeCellAdd} />
              <div className="select-input">
                <select className="table-value" name="raga_id" onChange={handleChangeCellAdd}>
                  <option value=""></option>
                  {ragas.map((optionValue) => (
                    <option value={optionValue.id}>{optionValue.name}</option>
                  ))}
                </select>
              </div>
              <div className="select-input">
                <select className="table-value" name="tala_id" onChange={handleChangeCellAdd}>
                  <option value=""></option>
                  {talas.map((optionValue) => (
                    <option value={optionValue.id}>{optionValue.name}</option>
                  ))}
                </select>
              </div>
              <input className="table-value" type="text" name="lyricist" onChange={handleChangeCellAdd} />
              <input className="table-value" type="text" name="composer" onChange={handleChangeCellAdd} />
              <label id="label-upload-audio" className="label-upload" htmlFor={"audio-id"}>
                <UploadFileIcon className="upload-file-img" />
                Upload
              </label>

              <input
                className="table-value"
                type="file"
                name="audio"
                id={"audio-id"}
                //onChange={handleUpload}
                hidden
              />
              <label id="label-upload-script" className="label-upload" htmlFor={"script-id"}>
                {uploaded ? <CheckCircleIcon /> : <UploadFileIcon className="upload-file-img" />}
                Upload
              </label>
              <Snackbar
                open={open}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={6000}
                onClose={handleClose}
              >
                <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: "100%" }}>
                  File Added
                </Alert>
              </Snackbar>
              <input
                className="table-value"
                type="file"
                name="script"
                id={"script-id"}
                onChange={handleUploadScript}
                hidden
              />
              <input className="table-value" type="date" name="date_learned" onChange={handleChangeCellAdd} />
              <div className="table-value-btn">
                <button className="btn-add" onClick={handleAddRow}>
                  + Add Song
                </button>
              </div>
            </div>

            {/* <AddRow
              inputInfos={[
                { component: "input", type: "text", name: "name", handleChange: handleChangeCellAdd },
                { component: "select", optionValues: ragas, name: "raga_id", handleChange: handleChangeCellAdd },
                { component: "select", optionValues: talas, name: "tala_id", handleChange: handleChangeCellAdd },
                { component: "input", type: "text", name: "lyricist", handleChange: handleChangeCellAdd },
                { component: "input", type: "text", name: "composer", handleChange: handleChangeCellAdd },
                { component: "input-file", type: "file", name: "audio", handleChange: handleChangeCellAdd },
                { component: "input-file", type: "file", name: "script", handleChange: handleChangeCellAdd },
                { component: "input", type: "date", name: "date_learned", handleChange: handleChangeCellAdd },
              ]}
              addRowBtnInfo={{ value: "+ Add Song", handleClick: handleAddRow }}
              uploadFileInfo={{ handleUpload: handleUpload }}
            /> */}
          </div>
          {addRowError && <ErrorText>{addRowError}</ErrorText>}
          {error && <ErrorText>{error}</ErrorText>}
          {uploadError && <ErrorText>{uploadError}</ErrorText>}
          {fetchError && <ErrorText>Failed to load images</ErrorText>}
          <DataGrid
            sx={{ fontFamily: "Poppins", p: "5px 5px" }}
            checkboxSelection
            disableRowSelectionOnClick
            rows={songs}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            onRowSelectionModelChange={(selectedRowId) => {
              setRowSelectionModel(selectedRowId);
            }}
            slots={{
              toolbar: EditToolbar as GridSlots["toolbar"],
            }}
            slotProps={{
              toolbar: { handleDeleteRow },
            }}
          />
        </div>
      </div>
    </>
  );
}
