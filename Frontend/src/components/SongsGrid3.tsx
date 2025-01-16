import { useState, useEffect } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowsProp,
} from "@mui/x-data-grid";
import {
  GridToolbarContainer,
  GridSlots,
  GridRowModesModel,
  GridRowModes,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface EditToolbarProps {
  setSongs: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setSongs, setRowModesModel } = props;
  const id = ;
  const handleClick = () => {
    setSongs((oldRows) => [
      ...oldRows,
      {
        id,
        name: "",
        raga_id: null,
        tala_id: null,
        lyricist: "",
        composer: "",
        audio: "",
        script: "",
        date: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <div className="grid-toolbar">
        <div className="btn-container">
          <div className="btn-add">
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
              Add record
            </Button>
          </div>
          <button className="btn-delete" color="primary">
            <div>Delete</div>
            <DeleteIcon />
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

export default function ({ authUserId, authUsername }) {
  axios.defaults.withCredentials = true;

  /************************* State *************************/

  // Existing songs to be displayed on load
  const [songs, setSongs] = useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [selectedRowsId, setSelectedRowsId] = useState([]);

  const [selected, setSelected] = useState(false);

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
    date_learned: new Date().toLocaleDateString(),
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

  // /************************* Add Row *************************/

  // const handleChangeCellAdd = (e) => {
  //   setNewSong((prev) => ({
  //     ...prev,
  //     student_id: authUserId,
  //     [e.target.name]: e.target.value,
  //   }));
  // };

  // const handleAddRow = async () => {
  //   try {
  //     await axios.post("http://localhost:3000/songs", newSong);
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   setRefreshSongs(!refreshSongs);
  // };

  // /************************* Update Row *************************/

  // const processRowUpdate = async (newRow) => {
  //   const updatedRow = { ...newRow, isNew: false };
  //   setSongs(songs.map((song) => (song.id === newRow.id ? updatedRow : song)));
  //   console.log(songs);
  //   try {
  //     await axios.put("http://localhost:3000/songs", updatedRow);
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   setRefreshSongs(!refreshSongs);
  // };

  // const handleProcessRowUpdateError = (err) => {
  //   console.log(err);
  // };

  // /************************* Delete Row *************************/

  // const handleDeleteRow = async () => {
  //   console.log(selectedRowsId);
  //   try {
  //     await axios
  //       .delete("http://localhost:3000/songs", {
  //         params: {
  //           ids: selectedRowsId,
  //         },
  //       })
  //       .then((msg) => console.log(msg));
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   setRefreshSongs(!refreshSongs);
  // };

  // const setRowSelectionModel = (selectedRowId) => {
  //   console.log(selectedRowId.length);
  //   if (selectedRowId.length > 0) {
  //     console.log("selected");
  //     setSelected(true);
  //   } else {
  //     console.log("all unselected");
  //     setSelected(false);
  //   }
  //   setSelectedRowsId(selectedRowId);
  // };

  /********** */

  // const handleClick = async () => {
  //   setNewSong((prev) => ({
  //     ...prev,
  //     student_id: authUserId,
  //   }));
  //   console.log(newSong);
  //   try {
  //     await axios.post("http://localhost:3000/songs", newSong);
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   setRefreshSongs(!refreshSongs);
  // };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setSongs(songs.map((song) => (song.id === newRow.id ? updatedRow : song)));

    try {
      await axios.put("http://localhost:3000/songs", updatedRow);
    } catch (err) {
      console.log(err);
    }
    
    console.log(songs);
    return updatedRow;
  };
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

        <div className="table-container">
          {/* <AddRow
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
          /> */}
          <DataGrid
            sx={{ fontFamily: "Poppins", p: "5px 5px" }}
            rows={songs}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slots={{
              toolbar: EditToolbar as GridSlots["toolbar"],
            }}
            slotProps={{
              toolbar: { setSongs, setRowModesModel },
            }}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </div>
      </div>
    </>
  );
}
