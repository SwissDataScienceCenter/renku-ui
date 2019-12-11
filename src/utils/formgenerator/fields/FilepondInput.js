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
 *  FilePondInput.js
 *  Presentational components.
 */
import React, { useState, useEffect, useRef } from "react";
import { FormGroup, Label, Table, Spinner } from "reactstrap";
import ValidationAlert from './ValidationAlert';
import HelpText from './HelpText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { formatBytes } from './../../HelperFunctions';

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


function FilePondInput({ name, label, type, value, alert, setInputs, help, disabled=false }) {
  const maxFiles = 10;
  const [over, setOver] = useState(false);
  const [files, setFiles] = useFiles({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [filesErrors, setFilesErrors] = useState([]);
  const [errorOnDrop, setErrorOnDrop] = useState("");
  const $input = useRef(null);

  useEffect(() => {
    // action on update of uploadedFiles
    const artifitialEvent = {
      target: { name: name, value: uploadedFiles },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
    setDisplayFiles(prevDisplayFiles =>
      prevDisplayFiles.map(dFile => {
        let uploadingFile = uploadedFiles.find(uFile => uFile.file_name === dFile.file_name);
        if (uploadingFile !== undefined)
          return {
            file_name: uploadingFile.file_name,
            file_size: uploadingFile.file_size,
            file_id: uploadingFile.file_id,
            file_alias: uploadingFile.file_alias,
            file_error: filesErrors.find(file => file.file_name === uploadingFile.file_name)
          }
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
          return {
            file_name: errorFile.file_name,
            file_size: errorFile.file_size,
            file_id: null,
            file_error: errorFile.file_error,
            file_alias: errorFile.file_alias
          }
        return dFile;
      })
    )
  }, [filesErrors]);

  let uploadFile = (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('file_name', file.name);

    let headers = new Headers({
      'credentials': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    });

    return fetch('https://virginia.dev.renku.ch/api/renku/cache.files_upload?override_existing=true', {
      method: 'POST',
      headers: headers,
      body: data,
      processData: false
    }).then((response) => {
      if(response.status >=400) throw new Error();
      response.json().then((body) => {
        if (body.error) {
          setFilesErrors(prevFilesErrors => [...prevFilesErrors, { file_name:file.name , file_size:file.size, file_error: body.error.reason}])
          return [];
        } else {
          let new_file = body.result.files[0];
          if(body.result.files[0].file_name !== undefined && body.result.files[0].file_name !== file.name){
            new_file = { 
              "file_name": file.name, 
              "file_size": new_file.file_size,
              "file_id": new_file.file_id,
              "file_alias": new_file.file_name
            }
          }
          setUploadedFiles(prevUploadedFiles => [...prevUploadedFiles, new_file]);
          return new_file;
        }
      });
    }).catch((error) => {
      setFilesErrors(prevFilesErrors => [...prevFilesErrors, { file_name:file.name , file_size:file.size, file_error: "Error uploading the file."}])
      return [];
    })
  }

  let onDropOrChange = (e) => {
    e.preventDefault();
    e.persist();
    if(!disabled){
      let files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      let droppedFiles = getFilteredFiles(Array.from(files))
      droppedFiles.map(file => uploadFile(file));
      setFiles([...files, ...droppedFiles]);
      const newDisplayFiles = droppedFiles
        .map(file => ({
          file_name: file.name,
          file_id: null,
          file_size: file.size,
          file_error: undefined
        }))
      setDisplayFiles([...displayFiles, ...newDisplayFiles])
      setOver(false);
    }
  }

  let deleteFile = (file_name) => {
    if(!disabled){
      setFilesErrors(prevfilesErrors => prevfilesErrors.filter(file => file.file_name !== file_name));
      setDisplayFiles(prevDisplayFiles => prevDisplayFiles.filter(file => file.file_name !== file_name));
      setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter(file => file.file_name !== file_name));    
    }
  }

  let getFilteredFiles = (files) => {
    let dropErrorMessage = "";
    let filteredFiles = files.filter(file => {
      if ( displayFiles.find( dFile => dFile.file_name === file.name ) === undefined )
        return true
      else{
        dropErrorMessage = dropErrorMessage ===  "" ? "Files can't have the same name (This file(s) alredy exist(s): "+file.name : ", "+file.name;
        return false;
      }
    })
    dropErrorMessage = dropErrorMessage !== "" ? dropErrorMessage+")." : ""; 
    setErrorOnDrop(dropErrorMessage);
    return filteredFiles;
  }

  useEffect(() => {
    // // if (onDrop) {
    // //   onDrop(files);
    // // }
  }, [files]);
  return (
    <FormGroup>
      <Label htmlFor={name}>{label}</Label>
      <div
        onDrop={e => {
          onDropOrChange(e);
        }}
        onDragOver={e => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setOver(false);
        }}
        className={over ? "over" : ""}
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
                  {file.file_alias ? <small><br></br><span className="text-danger"> *File was renamed to:{file.file_alias}</span></small> : null}
                </td>
                <td>{formatBytes(file.file_size)}</td>
                <td>{
                  file.file_id !== null ?
                    <span><FontAwesomeIcon color="var(--success)" icon={faCheck}/> uploaded</span>
                    : file.file_error !== undefined ?
                      <span><FontAwesomeIcon color="var(--danger)" icon={faTimes}/> {file.file_error}</span>
                      : <span><Spinner color="primary" size="sm" /> uploading</span>
                }</td>
                <td>
                  <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt} onClick={ () => deleteFile(file.file_name)}/>
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
        multiple={maxFiles > 1}
      />
      <div><span><small className="text-danger">{ errorOnDrop }</small></span></div>
      <HelpText content={help} />
      <ValidationAlert content={alert} />
    </FormGroup>
  );
}
export default FilePondInput;
