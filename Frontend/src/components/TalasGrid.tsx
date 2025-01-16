import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
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
import Button from "@mui/material/Button";

import AddRow from "./AddRow";
import TableHeader from "./TableHeader";

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

export default function TalasGrid({ authUserId }) {
  axios.defaults.withCredentials = true;

  const [addRowError, setAddRowError] = useState("");
  const ErrorText = ({ children, ...props }) => <p className="error-text">{children}</p>;

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

  const [selectedRowsId, setSelectedRowsId] = useState([]);
  const [selected, setSelected] = useState(false);

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
    if (newTala.name == "" || newTala.description == "") {
      setAddRowError("All required fields must be filled");
      return;
    }

    console.log(newTala);
    try {
      await axios.post("http://localhost:3000/talas", newTala);
    } catch (err) {
      console.log(err);
    }
    setRefreshTalas(!refreshTalas);
    setAddRowError("");
  };

  const processRowUpdate = async (updatedRow, originalRow) => {
    try {
      await axios.put("http://localhost:3000/talas", updatedRow);
    } catch (err) {
      console.log(err);
    }
    setRefreshTalas(!refreshTalas);
  };

  const handleProcessRowUpdateError = (err) => {
    console.log(err);
  };

  const handleDeleteRow = async () => {
    console.log(selectedRowsId);
    talas.map((tala) => {
      selectedRowsId.map((id) => {
        if (tala["id"] == id) {
          if (tala["custom_flag"] == 0) {
            return;
          }
        }
      });
    });
    try {
      await axios
        .delete("http://localhost:3000/talas", {
          params: {
            ids: selectedRowsId,
          },
        })
        .then((msg) => console.log(msg));
    } catch (err) {
      console.log(err);
    }
    setRefreshTalas(!refreshTalas);
  };

  const setRowSelectionModel = (selectedRowId) => {
    console.log(selectedRowId.length);
    var btn_delete = document.getElementById("btn-delete")!;
    if (selectedRowId.length > 0) {
      btn_delete.style.backgroundColor = "#b9d2ff";

      console.log("selected");
      setSelected(true);
    } else {
      btn_delete.style.backgroundColor = "#FFFFFF";

      console.log("all unselected");
      setSelected(false);
    }
    setSelectedRowsId(selectedRowId);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      type: "string",
      width: 300,
      editable: true,
    },
    {
      field: "description",
      headerName: "Description",
      type: "string",
      width: 300,
      editable: true,
    },
    {
      field: "custom_flag",
      headerName: "Type",
      type: "number",
      width: 250,
      headerAlign: "left",
      align: "left",

      valueGetter: (value) => {
        if (value == 0) {
          return { title: "PRELOADED", className: "table-value-preloaded" };
        }
        return { title: "CUSTOM", className: "table-value-custom" };
      },
      renderCell: (params) => (
        <input
          className={params.value.className}
          type="text"
          defaultValue={params.value.title}
          name="custom_flag"
          disabled
        />
      ),
      editable: false,
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Talas</h1>
        </div>

        <div className="table-container">
          <div className="add-row-container">
            <TableHeader
              headers={[
                { type: "input", name: "Tala" },
                { type: "select", name: "Description" },
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
              uploadFileInfo={null}
            />
          </div>

          {addRowError && <ErrorText>{addRowError}</ErrorText>}

          <DataGrid
            sx={{ fontFamily: "Poppins", p: "5px 5px" }}
            checkboxSelection
            disableRowSelectionOnClick
            rows={existingTalas}
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
            isCellEditable={(params) => params.row.custom_flag === 1}
          />
        </div>
      </div>
    </>
  );
}
