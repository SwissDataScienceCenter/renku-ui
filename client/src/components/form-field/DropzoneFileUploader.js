/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Progress,
  Table,
  UncontrolledCollapse,
} from "reactstrap";
import { Link } from "react-router-dom";
import Dropzone from "dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faSyncAlt,
  faTimes,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import { formatBytes, isURL } from "../../utils/helpers/HelperFunctions";
import FileExplorer, { getFilesTree } from "../FileExplorer";
import { ErrorLabel, InputLabel } from "../formlabels/FormLabels";
import { FormText } from "../../utils/ts-wrappers";
import AppContext from "../../utils/context/appContext";
import { ThrottledTooltip } from "../Tooltip";

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
  DUPLICATED: "duplicated",
};

const URL_FILE_ID = "urlFileInput";

function getFileStatus(id, error, status) {
  if (status === FILE_STATUS.PENDING) return FILE_STATUS.PENDING;
  if (status !== undefined) return parseInt(status);
  if (error !== undefined) return FILE_STATUS.FAILED;
  if (id !== undefined && id !== null) return FILE_STATUS.UPLOADED;
  return FILE_STATUS.UPLOADING;
}

function isFileUploading(fileStatus) {
  return fileStatus
    ? fileStatus >= FILE_STATUS.UPLOADING && fileStatus < FILE_STATUS.UPLOADED
    : false;
}

function onSendingFile(file, xhr, data) {
  data.append("chunked_content_type", file.type);
}

class FileUploadHandler {
  constructor({ disabled, displayFiles, setDisplayFiles, setErrorOnDrop }) {
    this.disabled = disabled;
    this.displayFiles = displayFiles;
    this.setDisplayFiles = setDisplayFiles;
    this.setErrorOnDrop = setErrorOnDrop;
  }

  getFileByName(fileName) {
    return this.displayFiles.find((file) => file.file_name === fileName);
  }

  updateAndSetDisplayFilesAfterChanges(changed) {
    const displayFiles = this.displayFiles.map((dFile) =>
      dFile.file_name === changed.file_name ? changed : dFile
    );
    this.setDisplayFiles(displayFiles);
  }
}

/**
 * Calculate the tree for the existing files.
 * @param {existingFiles} existingFiles
 * @returns
 */
function calculateExistingFilePathAndTree(existingFiles) {
  const defaultResult = {
    partialPath: "",
    filesTree: null,
  };
  if (existingFiles == null || existingFiles.hasPart == null)
    return defaultResult;
  if (existingFiles.hasPart.length < 1) return defaultResult;
  const value = existingFiles.hasPart;
  if (value[value.length - 1].atLocation == null) return defaultResult;

  const openFolders = value[value.length - 1].atLocation.startsWith("data/")
    ? 2
    : 1;
  const lastElement = value[value.length - 1].atLocation.split("/");
  const partialPath =
    lastElement[0] === "data"
      ? lastElement[0] + "/" + lastElement[1] + "/"
      : lastElement[0] + "/";
  const filesTree = getFilesTree(value, openFolders);
  return {
    partialPath,
    filesTree,
  };
}

/**
 * Manage the display files state.
 */
class DisplayFilesHandler extends FileUploadHandler {
  constructor({
    disabled,
    displayFiles,
    errorOnDrop,
    initialFilesTree,
    name,
    partialFilesPath,
    setDisplayFiles,
    setErrorOnDrop,
    setErrorUrlInput,
    setUrlInputValue,
    value,
  }) {
    super({ disabled, displayFiles, setDisplayFiles, setErrorOnDrop });
    this.errorOnDrop = errorOnDrop;
    this.initialFilesTree = initialFilesTree;
    this.name = name;
    this.partialFilesPath = partialFilesPath;
    this.setErrorUrlInput = setErrorUrlInput;
    this.setUrlInputValue = setUrlInputValue;
    this.value = value;
  }

  deleteFile(file_name) {
    if (this.disabled) return;
    this.setErrorOnDrop("");
    const currentFile = this.getFileByName(file_name);
    if (!currentFile) return;
    this.setDisplayFiles(
      this.displayFiles.filter((file) => file.file_name !== file_name)
    );
  }

  getUploadURL(client, data) {
    if (data.length && data[0].type === "application/zip") {
      const currentFile = this.getFileByName(data[0].name);
      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_YES)
        return `${client.uploadFileURL()}&unpack_archive=true`;
      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_NO)
        return `${client.uploadFileURL()}&unpack_archive=false`;
    }
    return client.uploadFileURL();
  }

  onUrlInputChange(e) {
    this.setErrorUrlInput(null);
    this.setUrlInputValue(e.target.value);
  }

  onUrlInputEnter(e, urlInputValue) {
    if (this.disabled) return;
    if (e.key !== "Enter" && e.target.id !== "addFileButton") return;

    e.preventDefault();
    if (!urlInputValue) this.setErrorUrlInput(INPUT_URL_ERROR.INVALID);
    const fileThere = this.getFileByName(urlInputValue);
    if (fileThere) {
      this.setErrorUrlInput(INPUT_URL_ERROR.DUPLICATED);
      return;
    }
    if (fileThere == null && isURL(urlInputValue)) {
      const file_url = {
        file_name: urlInputValue,
        file_path: urlInputValue,
        file_size: 0,
        file_status: getFileStatus(null, undefined, FILE_STATUS.PENDING),
      };
      this.setDisplayFiles([...this.displayFiles, file_url]);
      this.setUrlInputValue("");
    } else {
      this.setErrorUrlInput(INPUT_URL_ERROR.INVALID);
    }
  }

  onCompletedUpload(file) {
    const resultRequest = file.xhr?.response
      ? JSON.parse(file.xhr?.response)
      : null;
    const resultFiles = resultRequest ? resultRequest?.result?.files : [];
    // THIS COULD CHANGE PENDING FOR FIX WHEN UPLOAD UNCOMPRESS_YES FILE
    let resultFile = resultFiles ? resultFiles[0] : null;
    const currentFile = {
      ...this.getFileByName(file.name),
      ...resultFile,
    };
    if (currentFile && resultFile) {
      currentFile.file_id = resultFile.file_id;
      currentFile.file_status = FILE_STATUS.UPLOADED;
      currentFile.file_name = file.name;

      if (currentFile.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_YES) {
        currentFile.file_path = resultFile.relative_path.split("/")[0] + "/";
        currentFile.file_alias =
          file.name !==
          resultFile.relative_path.split("/")[0].replace(".unpacked", "")
            ? resultFile.relative_path.split("/")[0].replace(".unpacked", "")
            : undefined;
        currentFile.folder_structure = getFilesTree(
          resultFiles.map((fileInZip) => ({
            atLocation: fileInZip.relative_path.replace(
              currentFile.file_path,
              ""
            ),
            id: fileInZip.file_id,
          }))
        );
        currentFile.file_id = currentFile.folder_structure?.tree?.map(
          (file) => file.id
        );
      }
      this.updateAndSetDisplayFilesAfterChanges(currentFile);
    }
    return currentFile;
  }
}
/**
 * Translate between Dropzone actions and broader component state.
 */
class DropzoneHandler extends FileUploadHandler {
  constructor({
    disabled,
    dropzone,
    displayFiles,
    notifyFunction,
    setDisplayFiles,
    setErrorOnDrop,
    partialFilesPath,
  }) {
    super({ disabled, displayFiles, setDisplayFiles, setErrorOnDrop });
    this.dropzone = dropzone;
    this.notifyFunction = notifyFunction;
    this.uploadCompressedFile = this._uploadCompressedFile.bind(this);
    this.partialFilesPath = partialFilesPath;
  }

  cancelUpload(uploadId) {
    if (!uploadId) return;
    this.setErrorOnDrop("");
    const dropzoneFiles = this.dropzone.getActiveFiles();
    const fileToDelete = dropzoneFiles.filter(
      (file) => file.upload?.uuid === uploadId
    );
    if (fileToDelete.length) this.dropzone.removeFile(fileToDelete[0]);
  }

  notifyUpload(file, extras) {
    if (file.file_status === FILE_STATUS.UPLOADED) this.notifyFunction(true);
    else if (file.file_status === FILE_STATUS.FAILED)
      this.notifyFunction(false, extras);
  }

  onAddFileUpload(file) {
    this.setErrorOnDrop("");
    const existingFile = this.getFileByName(file.name);
    // No add if file is UPLOADING, FAILED OR UPLOADED
    if (
      existingFile &&
      ([FILE_STATUS.UPLOADED, FILE_STATUS.FAILED].includes(
        existingFile?.file_status
      ) ||
        isFileUploading(existingFile?.file_status))
    ) {
      this.dropzone.removeFile(file);
      this.setErrorOnDrop(`${file.name} is already in the list`);
      return;
    }

    const isFileCompressed = file.type === "application/zip";
    // No add if file is an existing .zip with waiting status
    if (
      existingFile &&
      isFileCompressed &&
      existingFile?.file_status === FILE_COMPRESSED.WAITING
    ) {
      this.dropzone.removeFile(file);
      this.setErrorOnDrop(`${file.name} is already in the list`);
      return;
    }

    let fileToUpload = {
      upload_id: file?.upload?.uuid,
      file_name: file.name,
      file_path: this.partialFilesPath + file.name,
      file_size: file.size,
      file: file,
    };
    // .zip for first time  is removed of the queue, is upload when include uncompress confirmation
    if (file.type === "application/zip" && !existingFile) {
      this.dropzone.removeFile(file);
      file.file_id = null;
      fileToUpload.file_status = null;
      fileToUpload.file_uncompress = FILE_COMPRESSED.WAITING;
    } else {
      if (existingFile) fileToUpload = { ...existingFile, ...fileToUpload };
      // dropzone will not upload the file if not call processQueue
      setTimeout(() => {
        this.dropzone.processQueue();
      }, 1000);
    }

    if (existingFile) {
      this.updateAndSetDisplayFilesAfterChanges(fileToUpload);
    } else {
      const allCurrentFiles = this.displayFiles;
      this.setDisplayFiles(
        allCurrentFiles.length
          ? [...allCurrentFiles, fileToUpload]
          : [fileToUpload]
      );
    }
  }

  onErrorUpload(file, message) {
    const fileError = message ?? "Error uploading file " + file.name;
    const currentFile = { ...this.getFileByName(file.name) };
    currentFile.file_status = getFileStatus(currentFile.file_id, fileError);
    currentFile.file_error = fileError;
    this.updateAndSetDisplayFilesAfterChanges(currentFile);
    this.notifyUpload(currentFile, fileError);
  }

  onCompletedUpload(processedFile) {
    if (processedFile) {
      this.notifyUpload(processedFile, undefined);
    }
    // run if there is something left in the queue
    setTimeout(() => this.dropzone?.processQueue(), 1000);
  }

  onProgressUpload(file, progress) {
    const currentFile = { ...this.getFileByName(file.name) };
    if (currentFile) {
      currentFile.file_status = getFileStatus(
        currentFile.file_id,
        currentFile.file_error,
        progress
      );
      this.updateAndSetDisplayFilesAfterChanges(currentFile);
    }
  }

  retryUpload(file_name) {
    if (this.disabled) return;
    this.setErrorOnDrop("");
    const currentFile = this.getFileByName(file_name);
    currentFile.file_status = FILE_STATUS.UPLOADING;
    currentFile.file_error = null;
    this.updateAndSetDisplayFilesAfterChanges(currentFile);
    this.dropzone.addFile(currentFile.file);
  }

  _uploadCompressedFile(file_name, uncompressed) {
    if (this.disabled) return;
    const currentFile = this.getFileByName(file_name);
    if (!currentFile) return;
    const updatedFile = { ...currentFile };
    updatedFile.file_uncompress = uncompressed;
    if (
      [FILE_COMPRESSED.UNCOMPRESS_YES, FILE_COMPRESSED.UNCOMPRESS_NO].includes(
        uncompressed
      )
    )
      this.dropzone.addFile(updatedFile.file);
    this.updateAndSetDisplayFilesAfterChanges(updatedFile);
  }
}

function CurrentFilesCard({ initialFilesTree }) {
  if (initialFilesTree == null) return null;
  return (
    <Card className="mb-4">
      <CardBody style={{ backgroundColor: "#e9ecef" }}>
        <FileExplorer
          filesTree={initialFilesTree}
          lineageUrl=" "
          insideProject={false}
        />
      </CardBody>
    </Card>
  );
}

function DeleteButton({ displayFilesHandler, file, index }) {
  return (
    <div id={"delete-" + index}>
      <FontAwesomeIcon
        style={{ cursor: "pointer" }}
        icon={faTrashAlt}
        data-cy="delete-file-button"
        onClick={() => displayFilesHandler.deleteFile(file.file_name)}
      />
      <ThrottledTooltip target={"delete-" + index} tooltip="Delete file" />
    </div>
  );
}

function RetryButton({ dropzoneHandler, file, index }) {
  if (file.file_status === FILE_STATUS.FAILED) return null;
  return (
    <div id={"retry-" + index}>
      <FontAwesomeIcon
        style={{ cursor: "pointer" }}
        icon={faSyncAlt}
        data-cy="retry-upload-button"
        onClick={() => dropzoneHandler.retryUpload(file.file_name)}
      />
      <ThrottledTooltip target={"retry-" + index} tooltip="Retry upload file" />
    </div>
  );
}

function FilesTableRowActions({
  displayFilesHandler,
  dropzoneHandler,
  file,
  index,
}) {
  if (
    [FILE_STATUS.UPLOADED, FILE_STATUS.FAILED, FILE_STATUS.PENDING].includes(
      file.file_status
    )
  ) {
    return (
      <div className="d-flex justify-content-evenly">
        <RetryButton
          dropzoneHandler={dropzoneHandler}
          file={file}
          index={index}
        />
        <DeleteButton
          displayFilesHandler={displayFilesHandler}
          file={file}
          index={index}
        />
      </div>
    );
  }
  if (
    isFileUploading(file.file_status) &&
    file.file_uncompress !== FILE_COMPRESSED.WAITING
  ) {
    return (
      <span
        className="text-primary  text-button"
        data-cy="cancel-upload-button"
        style={{ whiteSpace: "nowrap", cursor: "pointer" }}
        onClick={() => displayFilesHandler.cancelUpload(file.upload_id)}
      >
        Cancel
      </span>
    );
  }
  return null;
}

function FileOverwriteWarning({ file, initialFilesTree, partialFilesPath }) {
  if (initialFilesTree == null) return null;
  if (file.file_uncompress === FILE_COMPRESSED.WAITING) return null;
  if (
    file.file_uncompress === FILE_COMPRESSED.UNCOMPRESS_NO ||
    file.file_uncompress == null
  ) {
    return initialFilesTree.hash[file.file_path] ? (
      <small>
        <br></br>
        <span className="text-info">
          &nbsp;*This file will be skipped because &nbsp;there is a file with
          the same name inside the dataset.
        </span>
      </small>
    ) : null;
  }
  if (file.folder_structure !== undefined) {
    const repeatedFiles = file.folder_structure.leafs.filter((file) => {
      const suspectedRep = initialFilesTree.hash[partialFilesPath + file.path];
      return suspectedRep !== undefined ? suspectedRep.isLeaf : null;
    });
    return repeatedFiles.length > 0 ? (
      <small>
        <br></br>
        <span className="text-info">
          &nbsp;*
          {repeatedFiles.length > 1
            ? `${repeatedFiles.length} files are already in the dataset and will be skipped.`
            : `${repeatedFiles[0].name} is already in the dataset and will be skipped.`}
        </span>
      </small>
    ) : null;
  }
  return null;
}

function FilesTableRow({
  displayFilesHandler,
  dropzoneHandler,
  file,
  index,
  uploadThresholdSoft,
}) {
  return (
    <tr
      key={file.file_name + "file"}
      onClick={() => {
        // eslint-disable-line @typescript-eslint/no-empty-function
      }}
    >
      <td>{index + 1}</td>
      <td data-cy="file-name-column">
        <span>{file.file_name}</span>
        {file.file_alias && (
          <small>
            <br />
            <br />
            <span className="text-danger">
              *The name of this file contains disallowed characters; it has been
              renamed to <i> {file.file_alias}</i>
            </span>
          </small>
        )}
        <FileOverwriteWarning
          file={file}
          initialFilesTree={displayFilesHandler.initialFilesTree}
          partialFilesPath={displayFilesHandler.partialFilesPath}
        />
        {file.folder_structure && (
          <div>
            <Button
              data-cy="display-zip-files-link"
              className="pe-0 ps-0 pt-0 pb-0 mb-1"
              color="link"
              id={"filesCollapse" + (index + 1)}
            >
              <small>Show unzipped files</small>
            </Button>
            <UncontrolledCollapse
              key={"#" + (index + 1) + "key"}
              toggler={"#filesCollapse" + (index + 1)}
              className="pt-2"
            >
              <small>
                <FileExplorer
                  filesTree={file.folder_structure}
                  lineageUrl={" "}
                  insideProject={false}
                  foldersOpenOnLoad={0}
                />
              </small>
            </UncontrolledCollapse>
          </div>
        )}
      </td>
      <td>{file.file_size ? formatBytes(file.file_size, 0) : "-"}</td>
      <td>
        <FileStatusComp
          file={file}
          uploadCompressedFile={dropzoneHandler.uploadCompressedFile}
          uploadThresholdSoft={uploadThresholdSoft}
        />
      </td>
      <td className="text-center">
        <FilesTableRowActions
          displayFilesHandler={displayFilesHandler}
          dropzoneHandler={dropzoneHandler}
          file={file}
          index={index}
          uploadCompressedFile={dropzoneHandler.uploadCompressedFile}
          uploadThresholdSoft={uploadThresholdSoft}
        />
      </td>
    </tr>
  );
}

function FilesTable({
  disabled,
  displayFiles,
  displayFilesHandler,
  dropzoneHandler,
  uploadThresholdSoft,
}) {
  const currentFiles = displayFiles;
  if (currentFiles == null) return null;
  if (currentFiles.length < 1) return null;
  return (
    <Table hover bordered className="table-files m-0 bg-white">
      <thead>
        <tr>
          <th style={{ width: "5%" }} className="fw-light">
            #
          </th>
          <th style={{ width: "45%" }} className="fw-light">
            File Name/URL
          </th>
          <th style={{ width: "10%" }} className="fw-light">
            Size
          </th>
          <th style={{ width: "30%" }} className="fw-light">
            Status
          </th>
          <th style={{ width: "10%" }} className="fw-light">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className={disabled ? "disabled-input" : ""}>
        {currentFiles.map((file, index) => (
          <FilesTableRow
            displayFilesHandler={displayFilesHandler}
            dropzoneHandler={dropzoneHandler}
            key={index}
            file={file}
            index={index}
            uploadThresholdSoft={uploadThresholdSoft}
          />
        ))}
      </tbody>
    </Table>
  );
}

function InputUrl({
  disabled,
  displayFilesHandler,
  errorUrlInput,
  urlInputValue,
}) {
  if (displayFilesHandler == null) return null;
  return (
    <>
      <div className="pb-1">
        <span className="text-muted">
          <small>{"Insert a URL and press enter:"}</small>
        </span>
      </div>
      <InputGroup size="sm" className="input-left">
        <Input
          type="text"
          name="fileUrl"
          data-cy="input-fileUrl"
          disabled={disabled}
          id={URL_FILE_ID}
          placeholder="Upload a file using a URL"
          onKeyDown={(e) =>
            displayFilesHandler.onUrlInputEnter(e, urlInputValue)
          }
          onChange={(e) => displayFilesHandler.onUrlInputChange(e)}
          value={urlInputValue}
        />
        <Button
          className="btn-outline-rk-pink"
          id="addFileButton"
          onClick={(e) => displayFilesHandler.onUrlInputEnter(e)}
        >
          Add File from URL
        </Button>
      </InputGroup>
      {!errorUrlInput ? null : (
        <div className="pb-1">
          {errorUrlInput === INPUT_URL_ERROR.INVALID ? (
            <ErrorLabel text="Please insert a valid dataset URL" />
          ) : (
            <ErrorLabel text="URL already exist" />
          )}
        </div>
      )}
    </>
  );
}

function UploadFileDescription() {
  return (
    <>
      <div className="pt-2">
        <small className="text-muted">
          To upload a folder, zip the folder, upload the zip file, and select
          Unzip on upload. <br />
          NOTE: Support for uploading large files in RenkuLab is still under
          development; consider using the Renku CLI for files larger than 1 GB.
          <Button
            className="pe-0 ps-1 pt-0 pb-0 mb-1"
            color="link"
            id="fileLimitToggler"
          >
            <small>More info.</small>
          </Button>
          <UncontrolledCollapse
            key="fileLimitToggler"
            toggler={"#fileLimitToggler"}
            className="pt-0 ps-3"
          >
            In practice, the file-size limitation on uploads in RenkuLab is
            dependent on the network connection. Here are some general
            estimates:
            <br />
            <ul>
              <li>
                Files under 500MB can be reliably uploaded within a few minutes
              </li>
              <li>
                Files between 500MB and 2GB may be uploadable in RenkuLab, but
                will take some time
              </li>
              <li>
                For files larger than 2GB, we recommend using the Renku CLI for
                uploading
              </li>
            </ul>
          </UncontrolledCollapse>
        </small>
      </div>
    </>
  );
}

function FileUploaderAlert({ alert, displayFiles }) {
  const text =
    alert.length &&
    displayFiles.filter((f) => f.file_uncompress === FILE_COMPRESSED.WAITING)
      .length
      ? `${alert} Please see the status messages and reply to any questions.`
      : alert;
  return <ErrorLabel text={text} />;
}

function FileStatusComp({ file, uploadCompressedFile, uploadThresholdSoft }) {
  if (file.file_uncompress === FILE_COMPRESSED.WAITING) {
    return (
      <div style={{ fontWeight: "600" }}>
        <FontAwesomeIcon
          color="var(--bs-warning)"
          icon={faExclamationTriangle}
        />
        <span className="mb-1">&nbsp;Unzip on upload?</span>
        <span className="me-1 d-flex gap-2">
          <span
            data-cy="upload-compressed-yes"
            className="text-primary text-button"
            style={{ whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() =>
              uploadCompressedFile(
                file.file_name,
                FILE_COMPRESSED.UNCOMPRESS_YES
              )
            }
          >
            Yes
          </span>
          or
          <span
            data-cy="upload-compressed-no"
            className="text-primary  text-button"
            style={{ whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() =>
              uploadCompressedFile(
                file.file_name,
                FILE_COMPRESSED.UNCOMPRESS_NO
              )
            }
          >
            No
          </span>
        </span>
      </div>
    );
  }
  if (!file.file_status) return <span>File in queue pending upload...</span>;
  if (file.file_status === FILE_STATUS.ADDED) return <span> in dataset</span>;
  if (file.file_status === FILE_STATUS.UPLOADED)
    return (
      <span>
        <FontAwesomeIcon color="var(--bs-success)" icon={faCheck} /> Ready to
        add
      </span>
    );
  if (file.file_status === FILE_STATUS.PENDING)
    return <span> File will be uploaded on submit</span>;
  if (file.file_status === FILE_STATUS.FAILED)
    return (
      <div>
        <span
          data-cy="upload-error-message"
          className="me-2 text-danger fst-italic"
        >
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="me-2"
            color="var(--bs-danger)"
            style={{ cursor: "text" }}
          />
          {file.file_error}
        </span>
      </div>
    );
  return (
    <span>
      <Progress color="primary" value={file.file_status}>
        {file.file_status}%
      </Progress>
      {file.file_size >= uploadThresholdSoft ? (
        <small>
          <span className="text-muted">
            {" "}
            No need to wait. We will <Link to="/notifications">
              notify you
            </Link>{" "}
            when the upload is finished.
          </span>
        </small>
      ) : null}
    </span>
  );
}

function FileUploaderInput({
  alert,
  disabled = false,
  displayFiles,
  existingFiles,
  help,
  label,
  name,
  notifyFunction,
  required = false,
  setDisplayFiles,
  uploadThresholdSoft,
  value,
}) {
  //send value as an already built tree/hash to display and
  // delete from the files/paths /data/dataset-name so i can check if the file is there or not
  //AFTER THIS ADD THE FILES AS DISPLAY FILES BUT DON'T DISPLAY THEM
  const [errorOnDrop, setErrorOnDrop] = useState("");
  const [urlInputValue, setUrlInputValue] = useState("");
  const [errorUrlInput, setErrorUrlInput] = useState(null);
  const [displayFilesHandler, setDisplayFilesHandler] = useState(null);
  const [dropzone, setDropzone] = useState(null);
  const [dropzoneHandler, setDropzoneHandler] = useState(null);

  const { client } = useContext(AppContext);

  const pathAndTree = calculateExistingFilePathAndTree(existingFiles);
  const { filesTree: initialFilesTree, partialPath: partialFilesPath } =
    pathAndTree;

  useEffect(() => {
    if (dropzone != null) return;
    const displayFilesHandler = new DisplayFilesHandler({
      disabled,
      displayFiles,
      errorOnDrop,
      initialFilesTree,
      name,
      partialFilesPath,
      setDisplayFiles,
      setErrorOnDrop,
      setErrorUrlInput,
      setUrlInputValue,
      value,
    });

    const myDropzone = new Dropzone("#dropzone", {
      url: (data) => displayFilesHandler.getUploadURL(client, data),
      chunking: true,
      forceChunking: true,
      addRemoveLinks: true,
      uploadMultiple: false,
      maxFilesize: 1024, // eslint-disable-line spellcheck/spell-checker
      previewsContainer: false,
      autoProcessQueue: false,
      parallelUploads: 5,
      dictDefaultMessage:
        "Drag and drop files here or <span>choose a file</span>",
    });
    const dropzoneHandler = new DropzoneHandler({
      disabled,
      displayFiles,
      dropzone: myDropzone,
      notifyFunction,
      setDisplayFiles,
      setErrorOnDrop,
      partialFilesPath,
    });

    myDropzone.on("sending", (file, xhr, data) =>
      onSendingFile(file, xhr, data)
    );
    myDropzone.on("addedfile", (file) => dropzoneHandler.onAddFileUpload(file));
    myDropzone.on("error", (file, message) =>
      dropzoneHandler.onErrorUpload(file, message)
    );
    myDropzone.on("complete", (file) => {
      const processedFile = displayFilesHandler.onCompletedUpload(file);
      return dropzoneHandler.onCompletedUpload(processedFile);
    });
    myDropzone.on("uploadprogress", (file, progress) =>
      dropzoneHandler.onProgressUpload(file, progress)
    );
    setDisplayFilesHandler(displayFilesHandler);
    setDropzone(myDropzone);
    setDropzoneHandler(dropzoneHandler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // this is just initialization, so no deps -- updates happen below

  useEffect(() => {
    if (displayFilesHandler) displayFilesHandler.displayFiles = displayFiles;
    if (dropzoneHandler) dropzoneHandler.displayFiles = displayFiles;
  }, [displayFilesHandler, dropzoneHandler, displayFiles]);
  useEffect(() => {
    if (displayFilesHandler)
      displayFilesHandler.initialFilesTree = initialFilesTree;
  }, [displayFilesHandler, initialFilesTree]);
  useEffect(() => {
    if (displayFilesHandler)
      displayFilesHandler.partialFilesPath = partialFilesPath;
    if (dropzoneHandler) dropzoneHandler.partialFilesPath = partialFilesPath;
  }, [displayFilesHandler, dropzoneHandler, partialFilesPath]);
  useEffect(() => {
    if (!displayFilesHandler) return;
    displayFilesHandler.value = value;
  }, [displayFilesHandler, value]);

  return (
    <FormGroup className="field-group">
      <InputLabel isRequired={required} text={label} />
      <CurrentFilesCard initialFilesTree={initialFilesTree} />
      <FilesTable
        disabled={disabled}
        displayFiles={displayFiles}
        displayFilesHandler={displayFilesHandler}
        dropzoneHandler={dropzoneHandler}
        uploadThresholdSoft={uploadThresholdSoft}
      />
      <div className="p-2 bg-white upload-file-box">
        <InputUrl
          disabled={disabled}
          errorUrlInput={errorUrlInput}
          displayFilesHandler={displayFilesHandler}
          urlInputValue={urlInputValue}
        />
        <div className="dropzone" id="dropzone" data-cy="dropzone" />
        {errorOnDrop && (
          <div className="d-flex justify-content-evenly align-items-center">
            <ErrorLabel text={errorOnDrop} />
            <FontAwesomeIcon
              color="var(--bs-danger)"
              style={{ cursor: "pointer" }}
              icon={faTimes}
              onClick={() => setErrorOnDrop(null)}
            />
          </div>
        )}
        {help && <FormText color="muted">{help}</FormText>}
        {alert && (
          <FileUploaderAlert alert={alert} displayFiles={displayFiles} />
        )}
      </div>
      <UploadFileDescription />
    </FormGroup>
  );
}
export default FileUploaderInput;
export { FILE_STATUS };
