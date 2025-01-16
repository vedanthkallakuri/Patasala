import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function AddRow({ inputInfos, addRowBtnInfo, uploadFileInfo }) {
  return (
    <>
      <div className="table-row-add-row">
        {inputInfos.map(
          (inputInfo) =>
            (inputInfo.component === "input" && (
              <input
                className="table-value"
                type={inputInfo.type}
                name={inputInfo.name}
                onChange={inputInfo.handleChange}
              />
            )) ||
            (inputInfo.component === "input-constant" && (
              <input
                className="table-value"
                type={inputInfo.type}
                name={inputInfo.name}
                value={inputInfo.constant}
                disabled
              />
            )) ||
            (inputInfo.component === "input-file" && (
              <>
                <label className="label-upload" htmlFor={inputInfo.name + "-id"}>
                  <UploadFileIcon className="upload-file-img" />
                  Upload
                </label>

                <input
                  className="table-value"
                  type={inputInfo.type}
                  name={inputInfo.name}
                  value={inputInfo.constant}
                  id={inputInfo.name + "-id"}
                  onChange={uploadFileInfo.handleUpload}
                  hidden
                />
              </>
            )) ||
            (inputInfo.component === "select" && (
              <div className="select-input">
                <select className="table-value" name={inputInfo.name} onChange={inputInfo.handleChange}>
                  <option value="0"></option>

                  {inputInfo.optionValues.map((optionValue) => (
                    <option value={optionValue.id}>{optionValue.name}</option>
                  ))}
                </select>
              </div>
            ))
        )}
        <div className="table-value-btn">
          <button className="btn-add" onClick={addRowBtnInfo.handleClick}>
            {addRowBtnInfo.value}
          </button>
        </div>{" "}
      </div>
    </>
  );
}
