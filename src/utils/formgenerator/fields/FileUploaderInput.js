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
import ValidationAlert from './ValidationAlert';
import HelpText from './HelpText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrashAlt, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { formatBytes } from './../../HelperFunctions';

const FILE_STATUS = {
  ADDED: "added",
  UPLOADED: "uploaded",
  UPLOADING: "uploading",
  FAILED: "failed"
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

function getFileStatus(id, error, status){
  if(status !== undefined)
    return FILE_STATUS.ADDED;
  if(error !== undefined)
    return FILE_STATUS.FAILED;
  if(id !== undefined && id!==null)
    return FILE_STATUS.UPLOADED;
  return FILE_STATUS.UPLOADING;
}

function getFileObject(name, size, id, error, alias, status){
  return {
    file_name: name,
    file_size: size,
    file_id: id,
    file_error: error,
    file_alias: alias,
    file_status: getFileStatus(id, error, status)
  }
}

function FileuploaderInput({ name, label, alert, value, setInputs, help, disabled=false, uploadFileFunction }) {
  const [files, setFiles] = useFiles({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [filesErrors, setFilesErrors] = useState([]);
  const [errorOnDrop, setErrorOnDrop] = useState("");
  const [initialized, setInitialized] = useState(false);
  const $input = useRef(null);

  useEffect(()=>{
    if(value !== undefined && !initialized)
      setDisplayFiles(value.map(file => getFileObject(file.name, null, undefined, undefined, undefined, FILE_STATUS.ADDED)))
    setInitialized(true);
  },[value, initialized])

  useEffect(() => {
    const artifitialEvent = {
      target: { name: name, value: uploadedFiles },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
    setDisplayFiles(prevDisplayFiles =>
      prevDisplayFiles.map(dFile => {
        let uploadingFile = uploadedFiles.find(uFile => uFile.file_name === dFile.file_name);
        if (uploadingFile !== undefined)
          return getFileObject(
            uploadingFile.file_name, 
            uploadingFile.file_size, 
            uploadingFile.file_id, 
            filesErrors.find(file => file.file_name === uploadingFile.file_name),  
            uploadingFile.file_alias)
        return dFile;
      })
    )
    // eslint-disable-next-line 
  }, [uploadedFiles]);

  useEffect(() => {
    setDisplayFiles(prevDisplayFiles =>
      prevDisplayFiles.map(dFile => {
        let errorFile = filesErrors.find(eFile => eFile.file_name === dFile.file_name);
        if (errorFile !== undefined)
          return getFileObject(errorFile.file_name, errorFile.file_size, null, errorFile.file_error, errorFile.file_alias)
        return dFile;
      })
    )
  }, [filesErrors]);

  let uploadFile = (file) => {
    uploadFileFunction(file).then((response) => {
      if(response.status >=400) throw new Error();
      response.json().then((body) => {
        if (body.error) {
          setFilesErrors(prevFilesErrors => [...prevFilesErrors, 
            getFileObject(file.name, file.size, undefined, body.error.reason, undefined )]
          )
          return [];
        } else {
          let newFileObj = body.result.files[0];
          if (newFileObj.file_name !== undefined && newFileObj.file_name !== file.name) {
            newFileObj = getFileObject(file.name, newFileObj.file_size, newFileObj.file_id, undefined, newFileObj.file_name)
          }
          setUploadedFiles(prevUploadedFiles => [...prevUploadedFiles, newFileObj]);
          return newFileObj;
        }
      });
    }).catch((error) => {
      setFilesErrors(prevFilesErrors => [...prevFilesErrors, 
        getFileObject(file.name, file.size, undefined, "Error uploading the file", undefined )])
      return [];
    })
  }

  let onDropOrChange = (e) => {
    e.preventDefault();
    e.persist();
    if(!disabled){
      let eventFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      let droppedFiles = getFilteredFiles(Array.from(eventFiles))
      droppedFiles.map(file => uploadFile(file));
      setFiles([...files, ...droppedFiles]);
      const newDisplayFiles = droppedFiles
        .map(file => getFileObject(file.name, file.size, null, undefined, undefined))
      setDisplayFiles([...displayFiles, ...newDisplayFiles])
    }
  }

  let deleteFile = (file_name) => {
    if(!disabled){
      setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
      setDisplayFiles(prevDisplayFiles => prevDisplayFiles.filter(file => file.file_name !== file_name));
      setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter(file => file.file_name !== file_name));    
    }
  }

  let retryUpload = (file_name) => {
    if(!disabled){
      let retryFile = files.find(file => file.name === file_name)
      if(retryFile !== undefined){
        const displayFilesFiltered = displayFiles.map(file => {
          if(file.file_name === file_name)
            return getFileObject(retryFile.name, retryFile.size, null, undefined, undefined)
          return file;
        });
        setDisplayFiles([...displayFilesFiltered])
        setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
        uploadFile(retryFile)
      }
    }
  }

  let getFilteredFiles = (files) => {
    let dropErrorMessage = "";
    let filteredFiles = files.filter(file => {
      if ( displayFiles.find( dFile => (dFile.file_name === file.name || dFile.file_alias === file.name) ) === undefined )
        return true
      else{
        dropErrorMessage = dropErrorMessage ===  "" ? 
          "Files can't have the same name (This file(s) alredy exist(s): "+file.name 
          : ", "+file.name;
        return false;
      }
    })
    dropErrorMessage = dropErrorMessage !== "" ? dropErrorMessage+")." : ""; 
    setErrorOnDrop(dropErrorMessage);
    return filteredFiles;
  }

  let getFileStatusComp = (file) => {
    switch(file.file_status){
    case FILE_STATUS.ADDED :
      return <span> in dataset</span>
    case FILE_STATUS.UPLOADED :
      return <span><FontAwesomeIcon color="var(--success)" icon={faCheck}/> ready to add</span>
    case FILE_STATUS.FAILED :
      return  <div>
        <span className="mr-2">
          <FontAwesomeIcon style={{ cursor:"text"}} color="var(--danger)" icon={faTimes}/> {file.file_error}</span>
        <span className="text-primary" style={{whiteSpace:"nowrap", cursor:"pointer"}} 
          onClick={ () => retryUpload(file.file_name)}>
          <FontAwesomeIcon color="var(--primary)" icon={faSyncAlt} /> Retry 
        </span>
      </div>
    case FILE_STATUS.UPLOADING :
      return <span><Spinner color="primary" size="sm" /> uploading</span>
    default:
      return null;
    }
  }

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
          <tbody className={disabled? "disabled-input":""}>
            { displayFiles.map((file, index) => (
              <tr key={file.file_name + "file"} onClick={()=>{}}>
                <td>{index + 1}</td>
                <td>
                  <span>{file.file_name}</span>
                  {
                    file.file_alias ? <small><br></br>
                      <span className="text-danger"> *The name of this file contains disallowed characters; it has been renamed to 
                        <i> {file.file_alias}</i></span></small> 
                      : null
                  }
                </td>
                <td>{file.file_size ? formatBytes(file.file_size): "-"}</td>
                <td>{getFileStatusComp(file)}</td>
                <td>
                  { 
                    file.file_status === FILE_STATUS.ADDED || file.file_status === FILE_STATUS.UPLOADING ?
                      null :
                      <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt} onClick={ () => deleteFile(file.file_name)}/>
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
          <tfoot className={disabled? "disabled-input":""} onClick={() => { $input.current.click();}}>
            <tr>
              <td colSpan="5">
                Drag and Drop files or click <span className="text-primary" style={{cursor:"pointer"}}>here</span> to open file dialog.
                <br /><small className="text-muted">NOTE: We are still working on the UI upload of big files, we encourage you to use our CLI for uploading big files. </small>
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
          onDropOrChange(e)
        }}
        disabled={disabled}
        multiple={true}
      />
      <div><span><small className="text-danger">{ errorOnDrop }</small></span></div>
      <HelpText content={help} />
      <ValidationAlert content={alert} />
    </FormGroup>
  );
}
export default FileuploaderInput;
