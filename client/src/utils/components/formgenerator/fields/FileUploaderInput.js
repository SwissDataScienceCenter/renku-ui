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
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Progress,
  Table,
  UncontrolledCollapse
} from "reactstrap";
import { Link } from "react-router-dom";
import Dropzone from "dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle, faSyncAlt, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { formatBytes, isURL } from "../../../helpers/HelperFunctions";
import FileExplorer, { getFilesTree } from "../../FileExplorer";
import { ErrorLabel, InputLabel } from "../../formlabels/FormLabels";
import { FormText } from "../../../ts-wrappers";
import AppContext from "../../../context/appContext";
import { ThrottledTooltip } from "../../Tooltip";

const FILE_STATUS = {
  ADDED: 201,
  UPLOADED: 101,
  UPLOADING: 0,
  FAILED: 400,
  PENDING: -1,
};

const FILE_COMPRESSED = {
  WAITING: "waiting",
  UNCOMPRESS_YES: "uncompress_yes",
  UNCOMPRESS_NO: "uncompress_no",
};

const INPUT_URL_ERROR = {
  INVALID: "invalid",
  DUPLICATED: "duplicated"
};

const URL_FILE_ID = "urlFileInput";

function getFileStatus(id, error, status) {
  if (status === FILE_STATUS.PENDING)
    return FILE_STATUS.PENDING;
  if (status !== undefined)
    return parseInt(status);
  if (error !== undefined)
    return FILE_STATUS.FAILED;
  if (id !== undefined && id !== null)
    return FILE_STATUS.UPLOADED;
  return FILE_STATUS.UPLOADING;
}

const isFileUploading = (fileStatus) => {
  return fileStatus ? fileStatus >= FILE_STATUS.UPLOADING && fileStatus < FILE_STATUS.UPLOADED : false;
};

function FileUploaderInput({
  value, alert, disabled = false, handlers, help, internalValues, label, name, notifyFunction,
  required = false, setInputs, uploadThresholdSoft, formLocation }) {
  //send value as an already built tree/hash to display and
  // delete from the files/paths /data/dataset-name so i can check if the file is there or not
  //AFTER THIS ADD THE FILES AS DISPLAY FILES BUT DON'T DISPLAY THEM
  const [errorOnDrop, setErrorOnDrop] = useState(internalValues ? internalValues.errorOnDrop : "");
  const [initialized, setInitialized] = useState(internalValues ? internalValues.initialized : false);
  const [initialFilesTree, setInitialFilesTree] =
    useState(internalValues ? internalValues.initialFilesTree : undefined);
  const [partialFilesPath, setPartialFilesPath] = useState(internalValues ? internalValues.partialFilesPath : "");
  const [urlInputValue, setUrlInputValue] = useState(internalValues ? internalValues.urlInputValue : "");
  const [errorUrlInput, setErrorUrlInput] = useState(null);
  const [dropzone, setDropzone] = useState(null);
  const { client } = useContext(AppContext);

  useEffect(() => {
    calculateFilePathAndTree();
    setInitialized(true);
  }, [value, initialized, formLocation, handlers, setInputs]); // eslint-disable-line

  useEffect(() => {
    const myDropzone = new Dropzone(
      "#dropzone",
      {
        url: (data) => getUploadURL(data),
        chunking: true,
        forceChunking: true,
        addRemoveLinks: true,
        uploadMultiple: false,
        maxFilesize: 1024, // eslint-disable-line spellcheck/spell-checker
        previewsContainer: false,
        autoProcessQueue: false,
        parallelUploads: 5,
        dictDefaultMessage: "Drag and drop files here or <span>choose a file</span>"
      });

    myDropzone.on("addedfile", (file) => onAddFileUpload(file, myDropzone));
    myDropzone.on("error", (file, message) => onErrorUpload(file, message));
    myDropzone.on("complete", (file) => onCompletedUpload(file, myDropzone));
    myDropzone.on("uploadprogress", (file, progress) => onProgressUpload(file, progress));
    myDropzone.on("sending", (file, xhr, data) => onSendingFile(file, xhr, data));
    setDropzone(myDropzone);
  }, []); // eslint-disable-line

  const onSendingFile = (file, xhr, data) => {
    data.append("chunked_content_type", file.type);
  };

  const onAddFileUpload = (file, myDropzone) => {
    setErrorOnDrop("");
    const existingFile = getFileByName(file.name);
    // No add if file is UPLOADING, FAILED OR UPLOADED
    if (existingFile &&
      ([FILE_STATUS.UPLOADED, FILE_STATUS.FAILED].includes(existingFile?.file_status) ||
      isFileUploading(existingFile?.file_status))) {
      myDropzone.removeFile(file);
      setErrorOnDrop(`${file.name} is already in the list`);
      return;
    }

    const isFileCompressed = file.type === "application/zip";
    // No add if file is an existing .zip with waiting status
    if (existingFile && isFileCompressed && existingFile?.file_status === FILE_COMPRESSED.WAITING) {
      myDropzone.removeFile(file);
      setErrorOnDrop(`${file.name} is already in the list`);
      return;
    }

    let fileToUpload = {
      upload_id: file?.upload?.uuid,
      file_name: file.name,
      file_path: partialFilesPath + file.name,
      file_size: file.size,
      file: file
    };
    // .zip for first time  is removed of the queue, is upload when include uncompress confirmation
    if (file.type === "application/zip" && !existingFile) {
      myDropzone.removeFile(file);
      file.file_id = null;
      fileToUpload.file_status = null;
      fileToUpload.file_uncompress = FILE_COMPRESSED.WAITING;
    }
    else {
      if (existingFile)
        fileToUpload = { ...existingFile, ...fileToUpload };
      // dropzone will not upload the file if not call processQueue
      setTimeout(() => myDropzone.processQueue(), 1000);
    }

    if (existingFile) {
      updateAndSetDisplayFilesAfterChanges(fileToUpload);
    }
    else {
      const allCurrentFiles = getCurrentFiles();
      setDisplayFilesRx(allCurrentFiles.length ? [...allCurrentFiles, fileToUpload] : [fileToUpload]);
    }
  };

  const onErrorUpload = (file, message) => {
    const fileError = message ?? "Error uploading file " + file.name;
    const currentFile = getFileByName(file.name);
    currentFile.file_status = getFileStatus(currentFile.file_id, fileError);
    currentFile.file_error = fileError;
    updateAndSetDisplayFilesAfterChanges(currentFile);
    notifyUpload(currentFile, fileError);
  };

  const onCompletedUpload = (file, myDropzone) => {
    const resultRequest = file.xhr?.response ? JSON.parse(file.xhr?.response) : null;
    const resultFiles = resultRequest ? resultRequest?.result?.files : [];
    // THIS COULD CHANGE PENDING FOR FIX WHEN UPLOAD UNCOMPRESS_YES FILE
    let resultFile = resultFiles ? resultFiles[0] : null;
    const currentFile = { ...getFileByName(file.name), ...resultFile };
    if (currentFile && resultFile) {
      currentFile.file_id = [resultFile.file_id];
      currentFile.file_status = FILE_STATUS.UPLOADED;
      currentFile.file_name = file.name;

      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_YES) {
        currentFile.file_path = resultFile.relative_path.split("/")[0] + "/";
        currentFile.file_alias = file.name !== resultFile.relative_path.split("/")[0].replace(".unpacked", "") ?
          resultFile.relative_path.split("/")[0].replace(".unpacked", "") : undefined;
        currentFile.folder_structure = getFilesTree(resultFiles.map(fileInZip =>
          ({
            "atLocation": fileInZip.relative_path.replace(currentFile.file_path, ""),
            "id": fileInZip.file_id
          })));
        currentFile.file_id = currentFile.folder_structure?.tree?.map(file => file.id);
      }
      updateAndSetDisplayFilesAfterChanges(currentFile);
      notifyUpload(currentFile);
    }
    setInputsInForm();
    // run if there is something left in the queue
    setTimeout(() => myDropzone?.processQueue(), 1000);
  };

  const onProgressUpload = (monitored_file, progress) => {
    const currentFile = getFileByName(monitored_file.name);
    if (currentFile) {
      currentFile.file_status = getFileStatus(currentFile.file_id, currentFile.file_error, progress);
      updateAndSetDisplayFilesAfterChanges(currentFile);
    }
  };

  const onUrlInputChange = (e) => {
    setErrorUrlInput(null);
    setUrlInputValue(e.target.value);
  };

  const onUrlInputEnter = (e) => {
    if (!disabled && (e.key === "Enter" || e.target.id === "addFileButton")) {
      e.preventDefault();
      if (!urlInputValue)
        setErrorUrlInput(INPUT_URL_ERROR.INVALID);
      const fileThere = getFileByName(urlInputValue);
      if (fileThere === undefined && isURL(urlInputValue)) {
        const file_url = {
          file_name: urlInputValue,
          file_path: urlInputValue,
          file_size: 0,
          file_status: getFileStatus(null, undefined, FILE_STATUS.PENDING),
        };
        setDisplayFilesRx([ ...getCurrentFiles(), file_url ]);
        setUrlInputValue("");
        setInputsInForm();
      }
      else if (fileThere) {
        setErrorUrlInput(INPUT_URL_ERROR.DUPLICATED);
      }
      else {
        setErrorUrlInput(INPUT_URL_ERROR.INVALID);
      }
    }
  };

  const getFileByName = (fileName) => {
    return getCurrentFiles().find(file => file.file_name === fileName);
  };

  const updateAndSetDisplayFilesAfterChanges = (file) => {
    const displayFiles = getCurrentFiles()
      .map(dFile => dFile.file_name === file.file_name ? file : dFile);
    setDisplayFilesRx(displayFiles);
  };

  const getUploadURL = (data) => {
    if (data.length && data[0].type === "application/zip") {
      const currentFile = getFileByName(data[0].name);
      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_YES)
        return `${ client.uploadFileURL() }&unpack_archive=true`;
      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_NO)
        return `${ client.uploadFileURL() }&unpack_archive=false`;
    }
    return client.uploadFileURL();
  };

  const setInputsInForm = () => {
    const internalValues = { errorOnDrop, initialized, partialFilesPath, urlInputValue };
    internalValues.displayFiles = getCurrentFiles();
    internalValues.initialFilesTree = calculateFilePathAndTree()?.filesTree;
    const artificialEvent = {
      target: {
        name: name,
        value: internalValues.displayFiles
          .filter(f => [FILE_STATUS.UPLOADED, FILE_STATUS.PENDING].includes(f.file_status)),
        internalValues: internalValues
      },
      isPersistent: () => false
    };
    setInputs(artificialEvent);
  };

  const getCurrentFiles = () => {
    const dFiles = handlers.getFormDraftInternalValuesProperty("files", "displayFiles");
    return dFiles !== undefined ? dFiles : [];
  };

  const setDisplayFilesRx = (newDisplayFiles) => {
    return handlers.setFormDraftInternalValuesProperty("files", "displayFiles", newDisplayFiles);
  };

  const notifyUpload = (file, extras) => {
    if (file.file_status === FILE_STATUS.UPLOADED)
      notifyFunction(true);
    else if (file.file_status === FILE_STATUS.FAILED)
      notifyFunction(false, extras);
  };

  const calculateFilePathAndTree = () => {
    if (value !== undefined && !initialized && value.length > 0) {
      if (value[value.length - 1].atLocation !== undefined) {
        let openFolders = value[value.length - 1].atLocation.startsWith("data/") ? 2 : 1;
        let lastElement = value[value.length - 1].atLocation.split("/");
        let partialPath;
        if (lastElement[0] === "data")
          partialPath = lastElement[0] + "/" + lastElement[1] + "/";
        else partialPath = lastElement[0] + "/";
        const filesTree = getFilesTree(value, openFolders);
        setPartialFilesPath(partialPath);
        setInitialFilesTree(filesTree);
        return {
          partialPath,
          filesTree
        };
      }
    }
    return null;
  };

  // file handlers
  const deleteFile = (file_name) => {
    if (!disabled) {
      setErrorOnDrop("");
      const currentFile = getFileByName(file_name);
      if (currentFile) {
        setDisplayFilesRx(getCurrentFiles()
          .filter(file => file.file_name !== file_name));
        setInputsInForm();
      }
    }
  };

  const cancelUpload = (uploadId) => {
    if (!uploadId)
      return;
    setErrorOnDrop("");
    const dropzoneFiles = dropzone.getActiveFiles();
    const fileToDelete = dropzoneFiles.filter(file => file.upload?.uuid === uploadId);
    if (fileToDelete.length)
      dropzone.removeFile(fileToDelete[0]);
  };

  const retryUpload = (file_name) => {
    if (!disabled) {
      setErrorOnDrop("");
      const currentFile = getFileByName(file_name);
      currentFile.file_status = FILE_STATUS.UPLOADING;
      currentFile.file_error = null;
      updateAndSetDisplayFilesAfterChanges(currentFile);
      dropzone.addFile(currentFile.file);
    }
  };

  const uploadCompressedFile = (file_name, uncompressed) => {
    if (!disabled) {
      const currentFile = getFileByName(file_name);
      if (currentFile) {
        currentFile.file_uncompress = uncompressed;
        updateAndSetDisplayFilesAfterChanges(currentFile);
        if ([FILE_COMPRESSED.UNCOMPRESS_YES, FILE_COMPRESSED.UNCOMPRESS_NO].includes(uncompressed))
          dropzone.addFile(currentFile.file);
      }
    }
  };

  // html comp
  const getFileStatusComp = (file) => {
    switch (file.file_status) {
      case FILE_STATUS.ADDED:
        return <span> in dataset</span>;
      case FILE_STATUS.UPLOADED:
        return <span><FontAwesomeIcon color="var(--bs-success)" icon={faCheck} /> Ready to add</span>;
      case FILE_STATUS.PENDING:
        return <span> File will be uploaded on submit</span>;
      case FILE_STATUS.FAILED:
        return <div>
          <span data-cy="upload-error-message" className="me-2 text-danger fst-italic">
            <FontAwesomeIcon icon={faExclamationTriangle}
              className="me-2" color="var(--bs-danger)" style={{ cursor: "text" }} />
            {file.file_error}
          </span>
        </div>;
      default:
        if (file.file_uncompress === FILE_COMPRESSED.WAITING) {
          return <div style={{ fontWeight: "600" }}>
            <FontAwesomeIcon color="var(--bs-warning)" icon={faExclamationTriangle} />
            <span className="mb-1">&nbsp;Unzip on upload?</span>
            <span className="me-1">
              <span
                data-cy="upload-compressed-yes"
                className="text-primary text-button" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                onClick={() => uploadCompressedFile(file.file_name, FILE_COMPRESSED.UNCOMPRESS_YES)}>Yes</span> or
              <span
                data-cy="upload-compressed-no"
                className="text-primary  text-button" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                onClick={() => uploadCompressedFile(file.file_name, FILE_COMPRESSED.UNCOMPRESS_NO)}>No</span>
            </span>
          </div>;
        }
        if (!file.file_status)
          return <span>File in queue pending upload...</span>;
        return <span>
          <Progress color="primary" value={file.file_status}>{file.file_status}%</Progress>
          {file.file_size >= uploadThresholdSoft ? <small>
            <span className="text-muted"> No need to wait. We will <Link to="/notifications">
              notify you</Link> when the upload is finished.
            </span></small> : null }
        </span>;
    }
  };

  const fileWillBeOverwritten = (file) => {
    if (initialFilesTree === undefined) return false;
    if (file.file_uncompress === FILE_COMPRESSED.WAITING)
      return null;
    if (file.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_NO || file.file_uncompress === undefined ) {
      return initialFilesTree.hash[file.file_path] ? <small><br></br>
        <span className="text-info">
          &nbsp;*This file will be skipped because
          &nbsp;there is a file with the same name inside the dataset.
        </span>
      </small> : null;
    }
    if (file.folder_structure !== undefined) {
      const repeatedFiles = file.folder_structure.leafs
        .filter(file => {
          let suspectedRep = initialFilesTree.hash[partialFilesPath + file.path];
          return (suspectedRep !== undefined) ? suspectedRep.isLeaf : false;
        });
      return repeatedFiles.length > 0 ?
        <small><br></br>
          <span className="text-info">&nbsp;*
            { repeatedFiles.length > 1 ?
                `${repeatedFiles.length} files are already in the dataset and will be skipped.` :
                `${repeatedFiles[0].name} is already in the dataset and will be skipped.`}
          </span></small> : null;
    }
    return null;
  };

  const currentFiles = getCurrentFiles();
  const getActions = (file, index) => {
    if ([FILE_STATUS.UPLOADED, FILE_STATUS.FAILED, FILE_STATUS.PENDING].includes(file.file_status)) {
      const deleteButton = (<div id={"delete-" + index}>
        <FontAwesomeIcon
          style={{ cursor: "pointer" }}
          color="var(--bs-danger)" icon={faTrashAlt}
          data-cy="delete-file-button"
          onClick={() => deleteFile(file.file_name)}/>
        <ThrottledTooltip
          target={"delete-" + index}
          tooltip="Delete file" /></div>);
      const retryButton = file.file_status === FILE_STATUS.FAILED ?
        (<div id={"retry-" + index}>
          <FontAwesomeIcon
            style={{ cursor: "pointer" }} icon={faSyncAlt}
            data-cy="retry-upload-button"
            onClick={() => retryUpload(file.file_name)}/>
          <ThrottledTooltip
            target={"retry-" + index}
            tooltip="Retry upload file" /></div>) : null;
      return (
        <div className="d-flex justify-content-evenly">
          {retryButton}
          {deleteButton}
        </div>
      );
    }
    else if (isFileUploading(file.file_status) && file.file_uncompress !== FILE_COMPRESSED.WAITING) {
      return (<span
        className="text-primary  text-button"
        data-cy="cancel-upload-button"
        style={{ whiteSpace: "nowrap", cursor: "pointer" }}
        onClick={() => cancelUpload(file.upload_id)}>Cancel</span>);
    }
    return null;
  };

  const filesTable = currentFiles.length ? (
    <Table hover bordered className="table-files m-0 bg-white">
      <thead>
        <tr>
          <th style={{ width: "5%" }} className="fw-light">#</th>
          <th style={{ width: "45%" }} className="fw-light">File Name/URL</th>
          <th style={{ width: "10%" }} className="fw-light">Size</th>
          <th style={{ width: "30%" }} className="fw-light">Status</th>
          <th style={{ width: "10%" }} className="fw-light">Actions</th>
        </tr>
      </thead>
      <tbody className={disabled ? "disabled-input" : ""}>
        {currentFiles.map((file, index) => (
          <tr key={file.file_name + "file"} onClick={() => { }}>
            <td>{index + 1}</td>
            <td data-cy="file-name-column">
              <span>{file.file_name}</span>
              {file.file_alias ?
                <small>
                  <br/><br/>
                  <span className="text-danger">
                    *The name of this file contains
                    disallowed characters; it has been renamed to <i> {file.file_alias}</i>
                  </span>
                </small> : null}
              {fileWillBeOverwritten(file)}
              {file.folder_structure ?
                <div>
                  <Button
                    data-cy="display-zip-files-link"
                    className="pe-0 ps-0 pt-0 pb-0 mb-1" color="link" id={"filesCollapse" + (index + 1)}>
                    <small>Show unzipped files</small>
                  </Button>
                  <UncontrolledCollapse
                    key={"#" + (index + 1) + "key"}
                    toggler={"#filesCollapse" + (index + 1)}
                    className="pt-2">
                    <small>
                      <FileExplorer
                        filesTree={file.folder_structure}
                        lineageUrl={" "}
                        insideProject={false}
                        foldersOpenOnLoad={0}
                      /></small>
                  </UncontrolledCollapse>
                </div> : null}
            </td>
            <td>{file.file_size ? formatBytes(file.file_size, 0) : "-"}</td>
            <td>{getFileStatusComp(file)}</td>
            <td className="text-center">
              {getActions(file, index)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : null;

  const getAlert = (alert) => {
    if (alert.length && getCurrentFiles().filter(f => f.file_uncompress === FILE_COMPRESSED.WAITING).length)
      return `${alert} Please see the status messages and reply to any questions.`;
    return alert;
  };

  const errorLabelURLInput = !errorUrlInput ? null :
    (<div className="pb-1">
      { errorUrlInput === INPUT_URL_ERROR.INVALID ?
        <ErrorLabel text="Please insert a valid dataset URL"/> :
        <ErrorLabel text="URL already exist"/>
      }
    </div>);

  const inputUrl = (<>
    <div className="pb-1">
      <span className="text-muted"><small>{ "Insert a URL and press enter:" }</small></span>
    </div>
    <InputGroup size="sm">
      <Input
        type="text"
        name="fileUrl"
        data-cy="input-fileUrl"
        disabled={disabled}
        id={URL_FILE_ID}
        placeholder="Upload a file using a URL"
        onKeyDown={e => onUrlInputEnter(e)}
        onChange={e => onUrlInputChange(e)}
        value={urlInputValue}
      />
      <Button color="primary" id="addFileButton" onClick={e=>onUrlInputEnter(e)}>
        Add File from URL
      </Button>
    </InputGroup>
    {errorLabelURLInput}
  </>);

  const dropFiles = <div className="dropzone" id="dropzone" data-cy="dropzone" />;

  const uploadFileDescription = (<>
    <div className="pt-2">
      <small className="text-muted">
        To upload a folder, zip the folder, upload the zip file, and select Unzip on upload. <br/>
        NOTE: Support for uploading large files in RenkuLab is still under development; {" "}
        consider using the Renku CLI for files larger than 1 GB.
        <Button className="pe-0 ps-1 pt-0 pb-0 mb-1" color="link" id="fileLimitToggler">
          <small>More info.</small>
        </Button>
        <UncontrolledCollapse key="fileLimitToggler" toggler={"#fileLimitToggler"} className="pt-0 ps-3">
          In practice, the file-size limitation on uploads in RenkuLab is dependent on the {" "}
          network connection. Here are some general estimates:<br />
          <ul>
            <li>Files under 500MB can be reliably uploaded within a few minutes</li>
            <li>Files between 500MB and 2GB may be uploadable in RenkuLab, but will take some time</li>
            <li>For files larger than 2GB, we recommend using the Renku CLI for uploading</li>
          </ul>
        </UncontrolledCollapse>
      </small>
    </div>
  </>);

  const currentFilesCard = (initialFilesTree !== undefined ?
    <Card className="mb-4">
      <CardBody style={{ backgroundColor: "#e9ecef" }}>
        <FileExplorer filesTree={initialFilesTree} lineageUrl=" " insideProject={false}/>
      </CardBody>
    </Card>
    : null);

  return (
    <FormGroup className="field-group">
      <InputLabel isRequired={required} text={label}/>
      {currentFilesCard}
      {filesTable}
      <div className="p-2 bg-white upload-file-box">
        {inputUrl}
        {dropFiles}
        {errorOnDrop && (
          <div className="d-flex justify-content-evenly align-items-center">
            <ErrorLabel text={errorOnDrop} />
            <FontAwesomeIcon
              color="var(--bs-danger)"
              style={{ cursor: "pointer" }}
              icon={faTimes} onClick={() => setErrorOnDrop(null)}/>
          </div>)}
        {help && <FormText color="muted">{help}</FormText>}
        {alert && <ErrorLabel text={getAlert(alert)} />}
      </div>
      {uploadFileDescription}
    </FormGroup>
  );
}
export default FileUploaderInput;
export { FILE_STATUS };
