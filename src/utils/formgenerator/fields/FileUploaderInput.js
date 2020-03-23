/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renku-ui
 *
 *  FileUploaderInput.js
 *  Presentational components.
 */
import React, { useState, useEffect, useRef } from "react";
import { FormGroup, Label, Table, Spinner } from "reactstrap";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faTrashAlt, faSyncAlt, faExclamationTriangle, faFolder }
  from "@fortawesome/free-solid-svg-icons";
import { formatBytes } from "./../../HelperFunctions";

const FILE_STATUS = {
  ADDED: "added",
  UPLOADED: "uploaded",
  UPLOADING: "uploading",
  FAILED: "failed"
};

const FILE_COMPRESSED = {
  WAITING: "waiting",
  UNCOMPRESS_YES: "uncompress_yes",
  UNCOMPRESS_NO: "uncompress_no",
};

function useFiles({ initialState = [] }) {
  const [state, setState] = useState(initialState);
  function withBlobs(files) {
    const destructured = [...files];
    const blobs = destructured
      .map(file => {
        return file;
      })
      .filter(elem => elem !== null);
    setState(blobs);
  }
  return [state, withBlobs];
}

function getFileStatus(id, error, status) {
  if (status !== undefined)
    return FILE_STATUS.ADDED;
  if (error !== undefined)
    return FILE_STATUS.FAILED;
  if (id !== undefined && id !== null)
    return FILE_STATUS.UPLOADED;
  return FILE_STATUS.UPLOADING;
}

function getFileObject(name, size, id, error, alias, controller, uncompress, status) {
  return {
    file_name: name,
    file_size: size,
    file_id: id,
    file_error: error,
    file_alias: alias,
    file_status: getFileStatus(id, error, status),
    file_controller: controller,
    file_uncompress: uncompress
  };
}

function FileuploaderInput({ name, label, alert, value, setInputs, help, disabled = false,
  uploadFileFunction, filesOnUploader }) {
  const [files, setFiles] = useFiles({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [filesErrors, setFilesErrors] = useState([]);
  const [errorOnDrop, setErrorOnDrop] = useState("");
  const [initialized, setInitialized] = useState(false);
  const $input = useRef(null);

  useEffect(() => {
    if (value !== undefined && !initialized) {
      setDisplayFiles(value.map(file => getFileObject(
        file.name, null, undefined, undefined, undefined, undefined, undefined, FILE_STATUS.ADDED)));
    }
    setInitialized(true);
  }, [value, initialized]);

  useEffect(() => {
    const artifitialEvent = {
      target: { name: name, value: uploadedFiles },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
    setDisplayFiles(prevDisplayFiles =>
      prevDisplayFiles.map(dFile => {
        let uploadingFile = uploadedFiles.find(uFile => uFile.file_name === dFile.file_name);
        if (uploadingFile !== undefined) {
          return getFileObject(
            uploadingFile.file_name,
            uploadingFile.file_size,
            uploadingFile.file_id,
            filesErrors.find(file => file.file_name === uploadingFile.file_name),
            uploadingFile.file_alias,
            uploadingFile.file_controller,
            uploadingFile.file_uncompress);
        }
        return dFile;
      })
    );
    // eslint-disable-next-line
  }, [uploadedFiles]);

  useEffect(() => {
    setDisplayFiles(prevDisplayFiles =>
      prevDisplayFiles.map(dFile => {
        // eslint-disable-next-line
        let errorFile = filesErrors.find(eFile => eFile.file_name === dFile.file_name);
        if (errorFile !== undefined) {
          return getFileObject(
            errorFile.file_name, errorFile.file_size, null, errorFile.file_error, errorFile.file_alias,
            errorFile.file_controller, errorFile.file_uncompress);
        }
        return dFile;
      })
    );
  }, [filesErrors]);

  let uploadFile = (file) => {
    uploadFileFunction(file, file.file_controller, file.file_uncompress).then((response) => {
      if (response.status >= 400) throw new Error();
      response.json().then((body) => {
        if (body.error) {
          setFilesErrors(prevFilesErrors => [...prevFilesErrors,
            getFileObject(file.name, file.size, undefined, body.error.reason, undefined,
              file.file_controller, file.file_uncompress)]
          );
          return [];
        }
        let newFileObj = body.result.files[0];
        if (newFileObj.file_name !== undefined && newFileObj.file_name !== file.name) {
          newFileObj = getFileObject(
            file.name, newFileObj.file_size, newFileObj.file_id, undefined, newFileObj.file_name,
            response.controller, file.file_uncompress);
        }
        setUploadedFiles(prevUploadedFiles => [...prevUploadedFiles, newFileObj]);
        return newFileObj;

      });
    }).catch((error) => {
      if (error.code !== DOMException.ABORT_ERR) {
        setFilesErrors(prevFilesErrors => [...prevFilesErrors,
          getFileObject(file.name, file.size, undefined, "Error uploading the file", undefined,
            file.file_controller, file.file_uncompress)]);
        return [];
      }
    });
  };

  let onDropOrChange = (e) => {
    e.preventDefault();
    e.persist();
    if (!disabled) {
      let eventFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      let droppedFiles = getFilteredFiles(Array.from(eventFiles));

      droppedFiles = "signal" in new Request("") ?
        droppedFiles.map(file => {
          file.file_controller = new AbortController();
          return file;
        })
        : droppedFiles;

      const nonCompressedFiles = droppedFiles.filter(file => file.type !== "application/zip");
      setFiles([...files, ...droppedFiles]);
      nonCompressedFiles.map(file => uploadFile(file, file.file_controller));
      const newDisplayFiles = droppedFiles.map(file=> {
        return file.type === "application/zip" ?
          getFileObject(file.name, file.size, null, undefined, undefined, file.file_controller, FILE_COMPRESSED.WAITING)
          :
          getFileObject(file.name, file.size, null, undefined, undefined, file.file_controller);
      });

      filesOnUploader.current = displayFiles.filter(file => file.file_status !== FILE_STATUS.ADDED).length
        + newDisplayFiles.length;
      setDisplayFiles([...displayFiles, ...newDisplayFiles]);
    }
  };

  let deleteFile = (file_name, file_controller) => {
    if (!disabled) {
      setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
      setDisplayFiles(prevDisplayFiles => prevDisplayFiles.filter(file => file.file_name !== file_name));
      setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter(file => file.file_name !== file_name));
      const filteredFiles = files.filter(file => file.name !== file_name);
      setFiles([...filteredFiles]);
      filesOnUploader.current = filesOnUploader.current - 1 ;
      $input.current.value = "";
      if (file_controller) file_controller.abort();
    }
  };

  let retryUpload = (file_name) => {
    if (!disabled) {
      let retryFile = files.find(file => file.name === file_name);
      if (retryFile !== undefined) {
        const displayFilesFiltered = displayFiles.map(file => {
          if (file.file_name === file_name) {
            return getFileObject(retryFile.name, retryFile.size, null, undefined, retryFile.file_alias,
              retryFile.file_controller, file.file_uncompress);
          }
          return file;
        });
        setDisplayFiles([...displayFilesFiltered]);
        setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
        uploadFile(retryFile);
      }
    }
  };

  let uploadCompressedFile = (file_name, uncompress) => {
    if (!disabled) {
      let compressedFile = files.find(file => file.name === file_name);
      if (compressedFile !== undefined) {
        const displayFilesFiltered = displayFiles.map(file => {
          if (file.file_name === file_name) {
            return getFileObject(compressedFile.name, compressedFile.size, null, undefined,
              compressedFile.file_alias, compressedFile.file_controller, compressedFile === true ?
                FILE_COMPRESSED.UNCOMPRESS_YES : FILE_COMPRESSED.UNCOMPRESS_NO );
          }
          return file;
        });
        setDisplayFiles([...displayFilesFiltered]);
        setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
        compressedFile.file_uncompress = uncompress;
        uploadFile(compressedFile);
      }
    }
  };

  let getFilteredFiles = (files) => {
    let dropErrorMessage = "";
    let filteredFiles = files.filter(file => {
      if (displayFiles.find(dFile => (dFile.file_name === file.name || dFile.file_alias === file.name)) === undefined)
        return true;

      dropErrorMessage = dropErrorMessage === "" ?
        "Files can't have the same name (This file(s) alredy exist(s): " + file.name
        : dropErrorMessage + ", " + file.name;
      return false;

    });
    dropErrorMessage = dropErrorMessage !== "" ? dropErrorMessage + ")." : "";
    setErrorOnDrop(dropErrorMessage);
    return filteredFiles;
  };

  let getFileStatusComp = (file) => {
    switch (file.file_status) {
      case FILE_STATUS.ADDED:
        return <span> in dataset</span>;
      case FILE_STATUS.UPLOADED:
        return <span><FontAwesomeIcon color="var(--success)" icon={faCheck} /> ready to add</span>;
      case FILE_STATUS.FAILED:
        return <div>
          <span className="mr-2">
            <FontAwesomeIcon style={{ cursor: "text" }} color="var(--danger)" icon={faTimes} /> {file.file_error}</span>
          <span className="text-primary" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => retryUpload(file.file_name)}>
            <FontAwesomeIcon color="var(--primary)" icon={faSyncAlt} /> Retry
          </span>
        </div>;
      case FILE_STATUS.UPLOADING:
        if (file.file_uncompress === FILE_COMPRESSED.WAITING) {
          return <div style={{ fontWeight: "600" }}>
            <FontAwesomeIcon color="var(--warning)" icon={faExclamationTriangle} />
            <span className="ml-1">Unzip on upload?</span>
            <span className="mr-1">
              <span className="text-primary text-button" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                onClick={() => uploadCompressedFile(file.file_name, true)}>Yes</span> or
              <span className="text-primary  text-button" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                onClick={() => uploadCompressedFile(file.file_name, false)}>No</span>
            </span>
          </div>;
        }
        return <span><Spinner color="primary" size="sm" /> uploading</span>;
      default:
        return null;
    }
  };

  return (
    <FormGroup>
      <Label htmlFor={name}>{label}</Label>
      <div
        onDrop={e => {
          onDropOrChange(e);
        }}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDragLeave={e => {
          e.preventDefault();
        }}
      >
        <Table hover bordered className="table-files mb-1">
          <thead>
            <tr>
              <th className="font-weight-light">#</th>
              <th className="font-weight-light">File Name</th>
              <th className="font-weight-light">File Size</th>
              <th className="font-weight-light">Status</th>
              <th className="font-weight-light">Delete</th>
            </tr>
          </thead>
          <tbody className={disabled ? "disabled-input" : ""}>
            {displayFiles.map((file, index) => (
              <tr key={file.file_name + "file"} onClick={() => { }}>
                <td>{index + 1}</td>
                <td>
                  <span>{file.file_name}</span>
                  {
                    file.file_alias ? <small><br></br>
                      <span className="text-danger"> *The name of this file contains
                        disallowed characters; it has been renamed to <i> {file.file_alias}</i>
                      </span></small>
                      : null
                  }
                </td>
                <td>{file.file_size ? formatBytes(file.file_size) : "-"}</td>
                <td>{getFileStatusComp(file)}</td>
                <td>
                  {
                    file.file_status === FILE_STATUS.UPLOADED || file.file_status === FILE_STATUS.FAILED ?
                      <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt}
                        onClick={() => deleteFile(file.file_name)} />
                      : (file.file_status === FILE_STATUS.UPLOADING && file.file_controller !== undefined ?
                        <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt}
                          onClick={() => deleteFile(file.file_name, file.file_controller)} />
                        : null)
                  }
                </td>
              </tr>
            ))
            }
            <tr>
              <td colSpan="5">
                &nbsp;
              </td>
            </tr>
          </tbody>
          <tfoot className={disabled ? "disabled-input" : ""} onClick={() => { $input.current.click(); }}>
            <tr>
              <td colSpan="5">
                Drag and Drop files or click <span className="text-primary"
                  style={{ cursor: "pointer" }}>here</span> to open file dialog.
                <br />
                <span className="text-muted font-italic">
                  <FontAwesomeIcon className="pr-1" color="var(--primary)" icon={faFolder} />
                  If you want to upload a folder you can do this using a zip file, we can unzip it for you on upload.
                </span>
                <br></br>
                <small className="text-muted">NOTE: We are still working on the
                  UI upload of big files, we encourage you to use our CLI for uploading big files.
                </small>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
      <input
        style={{ display: "none" }}
        type="file"
        ref={$input}
        onChange={e => {
          onDropOrChange(e);
        }}
        disabled={disabled}
        multiple={true}
      />
      <div><span><small className="text-danger">{errorOnDrop}</small></span></div>
      <HelpText content={help} />
      <ValidationAlert content={alert} />
    </FormGroup>
  );
}
export default FileuploaderInput;
