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
import { FormGroup, Table, Button, UncontrolledCollapse,
  Card, CardBody, Input, InputGroup, InputGroupAddon, Progress } from "reactstrap";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import FormLabel from "./FormLabel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faTrashAlt, faSyncAlt, faExclamationTriangle, faFolder }
  from "@fortawesome/free-solid-svg-icons";
import { formatBytes, isURL } from "./../../HelperFunctions";
import { FileExplorer, getFilesTree } from "../../UIComponents";

const FILE_STATUS = {
  ADDED: 201,
  UPLOADED: 101,
  UPLOADING: 0,
  FAILED: 400,
  PENDING: -1
};

const FILE_COMPRESSED = {
  WAITING: "waiting",
  UNCOMPRESS_YES: "uncompress_yes",
  UNCOMPRESS_NO: "uncompress_no",
};

const URL_FILE_ID = "urlFileInput";

function useFiles({ initialState = [] }) {
  const [state, setState] = useState(initialState);
  function withBlobs(files) {
    const deStructured = [...files];
    const blobs = deStructured
      .map(file => {
        return file;
      })
      .filter(elem => elem !== null);
    setState(blobs);
  }
  return [state, withBlobs];
}

function getFileStatus(id, error, status) {
  if (status === FILE_STATUS.PENDING)
    return FILE_STATUS.PENDING;
  if (status !== undefined)
    return status;
  if (error !== undefined)
    return FILE_STATUS.FAILED;
  if (id !== undefined && id !== null)
    return FILE_STATUS.UPLOADED;
  return FILE_STATUS.UPLOADING;
}

function getFileObject(name, path, size, id, error, alias, controller, uncompress, folderStructure, progress_id, status) {
  return {
    file_name: name,
    file_path: path,
    file_size: size,
    file_id: id,
    file_error: error,
    file_alias: alias,
    file_status: getFileStatus(id, error, status),
    file_controller: controller,
    file_uncompress: uncompress,
    folder_structure: folderStructure, //this is for uncompressed files
    file_progress_id: progress_id
  };
}

export function useIsMounted() {
  // component is certainly mounted from the beginning
  const componentIsMounted = useRef(true);
  useEffect(() => {
  // when non-SSR + (ComponentDidMount or ComponentDidUpdate):
  // do nothing.
  // when non-SSR + ComponentWillUnmount:
    return () => { componentIsMounted.current = false; };
  }, []);
  return componentIsMounted;
}

function FileUploaderInput({ name, label, alert, value, setInputs, help, disabled = false,
  uploadFileFunction, filesOnUploader, required = false, notifyFunction, internalValues, handlers, formLocation }) {


  //send value as an already built tree/hash to display and
  // delete from the files/paths /data/dataset-name so i can check if the file is there or not
  //AFTER THIS ADD THE FILES AS DISPLAY FILES BUT DON'T DISPLAY THEM
  const [files, setFiles] = useFiles(internalValues ? { initialState: internalValues.files } : {});
  //const [uploadedFiles, setUploadedFiles] = useState(internalValues ? internalValues.uploadedFiles : []);
  //const [displayFiles, setDisplayFiles] = useState(internalValues ? internalValues.displayFiles : []);
  //const [filesErrors, setFilesErrors] = useState(internalValues ? internalValues.filesErrors : []);
  const [errorOnDrop, setErrorOnDrop] = useState(internalValues ? internalValues.errorOnDrop : "");
  const [initialized, setInitialized] = useState(internalValues ? internalValues.initialized : false);
  const [initialFilesTree, setInitialFilesTree] =
    useState(internalValues ? internalValues.initialFilesTree : undefined);
  const [partialFilesPath, setPartialFilesPath] = useState(internalValues ? internalValues.partialFilesPath : "");
  const [urlInputValue, setUrlInputValue] = useState(internalValues ? internalValues.urlInputValue : "");
  const $input = useRef(internalValues ? internalValues.input : null);
  // const [isMounted, setIsMounted] = useState(true);
  // const componentIsMounted = useIsMounted();
  // const location = useRef(formLocation);

  const getInternalValues = () => {
    const internalValues = {
      files,
      errorOnDrop, initialized, initialFilesTree, partialFilesPath, urlInputValue, $input };
    internalValues.uploadedFiles = getUploadedFilesRx();
    internalValues.displayFiles = getDisplayFilesRx();
    internalValues.filesErrors = getFilesErrorsRx();
  };

  const setDisplayFilesRx = (newDisplayFiles) =>{
    return handlers.setFormDraftInternalValuesProperty(formLocation, "files", "displayFiles", newDisplayFiles);
  };

  const getDisplayFilesRx = () => {
    const dFiles = handlers.getFormDraftInternalValuesProperty(formLocation, "files", "displayFiles");
    return dFiles !== undefined ? dFiles : [];
  };

  const updateDisplayFilesRxAfterChanges = (newDisplayFiles) => {
    const prevDisplayFiles = getDisplayFilesRx();
    const filesErrors = getFilesErrorsRx();
    setDisplayFilesRx(
      prevDisplayFiles.map(dFile => {
        let uploadingFile = newDisplayFiles.find(uFile => uFile.file_name === dFile.file_name);
        if (uploadingFile !== undefined) {
          return getFileObject(
            uploadingFile.file_name,
            partialFilesPath + uploadingFile.file_name,
            uploadingFile.file_size,
            uploadingFile.file_id,
            filesErrors.find(file => file.file_name === uploadingFile.file_name),
            uploadingFile.file_alias,
            uploadingFile.file_controller,
            uploadingFile.file_uncompress,
            uploadingFile.folder_structure,
            uploadingFile.file_progress_id,
            uploadingFile.file_status
          );
        }
        return dFile;
      })
    );
  };

  const setInputsInForm = (newUploadedFiles) => {

    const artificialEvent = {
      target: {
        name: name,
        value: newUploadedFiles//getUploadedFilesRx()
        , internalValues: getInternalValues()
      },
      isPersistent: () => false
    };
    setInputs(artificialEvent);
  };

  const setUploadedFilesRx = (newUploadedFiles) =>{
    updateDisplayFilesRxAfterChanges(newUploadedFiles);
    setInputsInForm(newUploadedFiles);
    return handlers.setFormDraftInternalValuesProperty(formLocation, "files", "uploadedFiles", newUploadedFiles);
  };

  const getUploadedFilesRx = () => {
    const uFiles = handlers.getFormDraftInternalValuesProperty(formLocation, "files", "uploadedFiles");
    return uFiles !== undefined ? uFiles : [];
  };

  // //useFiles(internalValues ? { initialState: internalValues.files } : {})
  // const setUploadedFilesRx = (newUploadedFiles) =>{
  //   updateDisplayFilesRxAfterChanges(newUploadedFiles);
  //   return handlers.setFormDraftInternalValuesProperty(formLocation, "files", "uploadedFiles", newUploadedFiles);
  // };

  // const getUploadedFilesRx = () => {
  //   const uFiles = handlers.getFormDraftInternalValuesProperty(formLocation, "files", "uploadedFiles");
  //   return uFiles !== undefined ? uFiles : [];
  // };


  const setFilesErrorsRx = (newFilesErrors) =>{
    // updateDisplayFilesRxAfterChanges(newFilesErrors);
    // //
    const prevDisplayFiles = getDisplayFilesRx();
    setDisplayFilesRx( prevDisplayFiles.map(dFile => {
      // eslint-disable-next-line
      let errorFile = newFilesErrors.find(eFile => eFile.file_name === dFile.file_name);
      if (errorFile !== undefined) {
        return getFileObject(
          errorFile.file_name, errorFile.file_path, errorFile.file_size, null, errorFile.file_error,
          errorFile.file_alias, errorFile.file_controller, errorFile.file_uncompress, errorFile.folder_structure,
          errorFile.file_progress_id);
      }
      return dFile;
    })
    );
    return handlers.setFormDraftInternalValuesProperty(formLocation, "files", "filesErrors", newFilesErrors);
  };

  const getFilesErrorsRx = () => {
    const uFiles = handlers.getFormDraftInternalValuesProperty(formLocation, "files", "filesErrors");
    return uFiles !== undefined ? uFiles : [];
  };

  // useEffect(()=>{
  //   console.log("setting is mounted " + formIsMounted.current);
  //   componentIsMounted.current = true;

  //   return ()=>{
  //     console.log("now unmounted " + formIsMounted.current);
  //     componentIsMounted.current = false;
  //   };
  // }, []);

  useEffect(() => {
    console.log("is this making things change????");
    if (value !== undefined && !initialized && value.length > 0) {
      if (value[value.length - 1].atLocation !== undefined) {
        let openFolders = value[value.length - 1].atLocation.startsWith("data/") ? 2 : 1;
        let lastElement = value[value.length - 1].atLocation.split("/");
        if (lastElement[0] === "data")
          setPartialFilesPath(lastElement[0] + "/" + lastElement[1] + "/");
        else setPartialFilesPath(lastElement[0] + "/");
        setInitialFilesTree(getFilesTree(value, openFolders));
      }
      // else {
      //   //should this be here???
      //   //here consider a mixed thing!!!!!
      //   setDisplayFiles();
      // }
    }
    setInitialized(true);
  }, [value, initialized]);

  // useEffect(()=>{
  //   console.log("FILESSSSS EFFECT!!!!");
  //   //console.log(files);
  // //  const internalValues = getInternalValues();
  //   internalValues.displayFiles = getDisplayFilesRx();
  //   internalValues.filesErrors = getFilesErrorsRx();
  //   internalValues.displayFiles = getDisplayFilesRx();
  //   const artificialEvent = {
  //     target: {
  //       name: name,
  //       value: getUploadedFilesRx()
  //       //, internalValues: internalValues
  //     },
  //     isPersistent: () => false
  //   };
  //   setInputs(artificialEvent);
  //   // eslint-disable-next-line
  // // },[displayFiles, files]);
  // }, [files]);


  // this is updated now when the uploaded file is updated!!!
  // useEffect(() => {
  //   // const artificialEvent = {
  //   //   target: { name: name, value: uploadedFiles, internalValues: getInternalValues() },
  //   //   isPersistent: () => false
  //   // };
  //   // setInputs(artificialEvent);
  //   setDisplayFiles(prevDisplayFiles =>
  //     prevDisplayFiles.map(dFile => {
  //       let uploadingFile = getUploadedFilesRx().find(uFile => uFile.file_name === dFile.file_name);
  //       if (uploadingFile !== undefined) {
  //         return getFileObject(
  //           uploadingFile.file_name,
  //           partialFilesPath + uploadingFile.file_name,
  //           uploadingFile.file_size,
  //           uploadingFile.file_id,
  //           filesErrors.find(file => file.file_name === uploadingFile.file_name),
  //           uploadingFile.file_alias,
  //           uploadingFile.file_controller,
  //           uploadingFile.file_uncompress,
  //           uploadingFile.folder_structure,
  //           uploadingFile.file_progress_id,
  //           uploadingFile.file_status
  //         );
  //       }
  //       return dFile;
  //     })
  //   );
  //   // eslint-disable-next-line
  // }, [uploadedFiles]);

  // ON FILES ERRORS CHANGE!!!!
  // useEffect(() => {
  //   const prevDisplayFiles = getDisplayFilesRx();
  //   setDisplayFilesRx( prevDisplayFiles.map(dFile => {
  //     // eslint-disable-next-line
  //       let errorFile = filesErrors.find(eFile => eFile.file_name === dFile.file_name);
  //     if (errorFile !== undefined) {
  //       return getFileObject(
  //         errorFile.file_name, errorFile.file_path, errorFile.file_size, null, errorFile.file_error,
  //         errorFile.file_alias, errorFile.file_controller, errorFile.file_uncompress, errorFile.folder_structure, errorFile.file_progress_id);
  //     }
  //     return dFile;
  //   })
  //   );
  // }, [filesErrors]);
  // ON FILES ERRORS CHANGE!!!!

  //
  //  UNCOMMENT TO ADD NOTIFICATIONS!!!
  //
  // useEffect(()=>{
  //   const filesUploading = displayFiles.filter(file => file.file_status >= FILE_STATUS.UPLOADING
  //         && file.file_status < FILE_STATUS.UPLOADED);
  //   const filesWithErrors = displayFiles.filter(file => file.file_status === FILE_STATUS.FAILED);
  //   if (displayFiles.length > 0 && filesUploading.length === 0 && filesWithErrors.length === 0)
  //     notifyFunction("All files finished");
  //   else if (filesWithErrors > 0)
  //     notifyFunction("File with error!!!");
  // }, [displayFiles, notifyFunction]);


  let uploadFile = (file) => {
    const thenCallback = (body) => {
      //console.log("THEEEN CALLBACK needs to be fixed ASAP!!!");

      //I NEED TO AVOID SETTING STATE AND MAKE A STATE RECOVERY FUNCTION
      //WHEN THE UPLOADER GETS MOUNTED!!!!
      // let falsee = false;
      // if (handlers.isMounted(formLocation) && falsee)
      //   console.log("this can bnot happen!!");
      // if (body.error) {
      //   setFilesErrors(prevFilesErrors => [...prevFilesErrors,
      //     getFileObject(file.name, partialFilesPath + file.name, file.size, undefined, body.error.reason, undefined,
      //       file.file_controller, file.file_uncompress, file.folder_structure)]
      //   );
      //   return [];
      // }


      // if (file.file_uncompress) {
      //   let folderPath = body.result.files[0].relative_path.split("/")[0] + "/";
      //   let file_alias = file.name !== body.result.files[0].relative_path.split("/")[0].replace(".unpacked", "") ?
      //     body.result.files[0].relative_path.split("/")[0].replace(".unpacked", "") : undefined;
      //   let filesTree = getFilesTree(body.result.files.map(file=>
      //     ({ "atLocation": file.relative_path.replace(folderPath, ""),
      //       "id": file.file_id
      //     })));

      //   let newFileDraft = getFileObject(
      //     file.name, partialFilesPath + file.name, 0, [], undefined, file_alias,
      //     undefined,
      //     file.file_uncompress, filesTree, undefined);

      //   newFileDraft.file_size = body.result.files ? body.result.files[0].file_size : 0;
      //   newFileDraft.file_id = filesTree.tree.map(file => file.id);
      //   setUploadedFiles(prevUploadedFiles => [...prevUploadedFiles, newFileDraft]);
      //   return newFileDraft;
      // }
      // let newFileObj = body.result.files[0];
      // if (newFileObj.file_name !== undefined && newFileObj.file_name !== file.name) {
      //   newFileObj = getFileObject(
      //     file.name, partialFilesPath + file.name, newFileObj.file_size, [newFileObj.file_id],
      //     undefined, newFileObj.file_name,
      //     undefined,
      //     file.file_uncompress, undefined, undefined);
      // }
      // else {
      //   newFileObj.file_id = [newFileObj.file_id];
      // }
      // console.log("SETTING UPLOADED FILESSSSSS");
      // console.log(newFileObj);
      // setUploadedFiles(prevUploadedFiles => [...prevUploadedFiles, newFileObj]);
      // return newFileObj;

      console.log("ELSEEEEE SET FILES IN RX");
      if (body.error) {
        console.log("SET RX ERRORRRRR!!!!");
        const prevFilesErrors = getFilesErrorsRx();
        setFilesErrorsRx([...prevFilesErrors,
          getFileObject(file.name, partialFilesPath +
            file.name, file.size, undefined, body.error.reason, undefined,
          file.file_controller, file.file_uncompress, file.folder_structure)]
        );
        return [];
      }

      const prevUploadedFiles = getUploadedFilesRx();
      console.log(getUploadedFilesRx());
      if (file.file_uncompress) {
        let folderPath = body.result.files[0].relative_path.split("/")[0] + "/";
        let file_alias = file.name !== body.result.files[0].relative_path.split("/")[0].replace(".unpacked", "") ?
          body.result.files[0].relative_path.split("/")[0].replace(".unpacked", "") : undefined;
        let filesTree = getFilesTree(body.result.files.map(file=>
          ({ "atLocation": file.relative_path.replace(folderPath, ""),
            "id": file.file_id
          })));

        let newFileDraft = getFileObject(
          file.name, partialFilesPath + file.name, 0, [], undefined, file_alias,
          undefined,
          file.file_uncompress, filesTree, undefined);

        newFileDraft.file_size = body.result.files ? body.result.files[0].file_size : 0;
        newFileDraft.file_id = filesTree.tree.map(file => file.id);

        setUploadedFilesRx([...prevUploadedFiles, newFileDraft]);
        return newFileDraft;
      }
      let newFileObj = body.result.files[0];
      if (newFileObj.file_name !== undefined && newFileObj.file_name !== file.name) {
        newFileObj = getFileObject(
          file.name, partialFilesPath + file.name, newFileObj.file_size, [newFileObj.file_id],
          undefined, newFileObj.file_name,
          undefined,
          file.file_uncompress, undefined, undefined);
      }
      else {
        newFileObj.file_id = [newFileObj.file_id];
      }
      console.log("SETTING UPLOADED FILESSSSSS");
      console.log(newFileObj);
      setUploadedFilesRx([...prevUploadedFiles, newFileObj]);
      return newFileObj;

    };

    const onErrorCallback = (error) => {
      if (error.code !== DOMException.ABORT_ERR) {
        const prevFilesErrors = getFilesErrorsRx();
        setFilesErrorsRx([...prevFilesErrors,
          getFileObject(file.name, partialFilesPath + file.name, file.size, undefined, "Error uploading the file",
            undefined, file.file_controller, file.file_uncompress, file.folder_structure, file.file_progress_id)]);
        return [];
      }
    };

    const setController = (monitored_file, controller) => {
      const prevDisplayFiles = getDisplayFilesRx();
      setDisplayFilesRx(prevDisplayFiles
        .map(file => file.file_name === monitored_file.name ?
          getFileObject(
            file.file_name,
            file.file_path,
            file.file_size,
            file.file_id,
            file.file_error,
            file.file_alias,
            controller,
            file.file_uncompress,
            file.folder_structure,
            file.file_progress_id,
            file.file_status
          )
          : file));
    };

    const setFileProgress = async (monitored_file, progress) => {
      // console.log(monitored_file);
      // console.log(progress);
      // console.log(isCancelled);
      // console.log("file progresssss");
      // if (!componentIsMounted.current) {
      //   console.log(handlers.getFormDraftInternalValuesProperty(formLocation, name, "displayFiles"));
      //   console.log("UNMOUNTEDDDDD");
      // }


      const currentFile = getDisplayFilesRx().find(file => file.file_name === monitored_file.name);
      console.log(currentFile);
      if (currentFile) console.log(currentFile.file_progress_id);

      console.log("IS THIS THING MOUNTED ---- " + handlers.isMounted(formLocation));

      if (currentFile) {
        await handlers.addProgress(monitored_file.name, progress)
          .then(progressElement => {
            if (progressElement) {
              console.log("SETTING CURRENT FILES!!!");
              const prevDisplayFiles = getDisplayFilesRx();
              setDisplayFilesRx(prevDisplayFiles
                .map(file => file.file_name === monitored_file.name ?
                  getFileObject(
                    file.file_name,
                    file.file_path,
                    file.file_size,
                    file.file_id,
                    file.file_error,
                    file.file_alias,
                    file.file_controller,
                    file.file_uncompress,
                    file.folder_structure,
                    progressElement.id,
                    progress
                  )
                  : file));
              // setDisplayFiles(prevUploadedFiles => prevUploadedFiles
              //   .map(file => file.file_name === monitored_file.name ?
              //     getFileObject(
              //       file.file_name,
              //       file.file_path,
              //       file.file_size,
              //       file.file_id,
              //       file.file_error,
              //       file.file_alias,
              //       file.file_controller,
              //       file.file_uncompress,
              //       file.folder_structure,
              //       progressElement.id,
              //       progress
              //     )
              //     : file));
            }
            // else if (!componentIsMounted.current && progressElement) {
            //   let newDisplayFiles = displayFiles.map(file => file.file_name === monitored_file.name ?
            //     getFileObject(
            //       file.file_name,
            //       file.file_path,
            //       file.file_size,
            //       file.file_id,
            //       file.file_error,
            //       file.file_alias,
            //       file.file_controller,
            //       file.file_uncompress,
            //       file.folder_structure,
            //       progressElement.id,
            //       progress
            //     )
            //     : file);
            //   handlers.setFormDraftInternalValuesProperty(formLocation, name, "displayFiles", newDisplayFiles);
            // }

          });
      }

      //});


      // return () => {
      //   isCancelled = true;
      // };
    };

    uploadFileFunction(file, file.file_uncompress, setFileProgress,
      thenCallback, onErrorCallback, setController);

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
      setInputsInForm(getUploadedFilesRx());
      nonCompressedFiles.map(file => uploadFile(file, file.file_controller));
      const newDisplayFiles = droppedFiles.map(file=> {
        return file.type === "application/zip" ?
          getFileObject(file.name, partialFilesPath + file.name, file.size, null,
            undefined, undefined, file.file_controller, FILE_COMPRESSED.WAITING)
          :
          getFileObject(file.name, partialFilesPath + file.name, file.size, null,
            undefined, undefined, file.file_controller);
      });

      const displayFilesRx = getDisplayFilesRx();
      filesOnUploader.current = displayFilesRx.filter(file => file.file_status !== FILE_STATUS.ADDED).length
        + newDisplayFiles.length;
      setDisplayFilesRx([...displayFilesRx, ...newDisplayFiles]);
      // setDisplayFiles([...displayFiles, ...newDisplayFiles]);
    }
  };

  const onUrlInputChange = (e) => {
    setUrlInputValue(e.target.value);
  };

  const onUrlInputEnter = (e) => {
    if (!disabled && (e.key === "Enter" || e.target.id === "addFileButton")) {
      e.preventDefault();
      const fileThere = getDisplayFilesRx().find(file => file.file_name === urlInputValue);
      if (fileThere === undefined && isURL(urlInputValue)) {
        const file_url = getFileObject(urlInputValue, urlInputValue, 0, null,
          undefined, undefined, undefined, undefined, undefined, undefined, FILE_STATUS.PENDING);
        setDisplayFilesRx([...getDisplayFilesRx(), file_url ]);
        const prevUploadedFiles = getUploadedFilesRx();
        setUploadedFilesRx([...prevUploadedFiles, file_url]);
        filesOnUploader.current = filesOnUploader.current + 1;
        setUrlInputValue("");
      }
    }
  };

  let deleteFile = (file_name, file_controller) => {
    if (!disabled) {
      console.log("CAN I DELETE THE FILE???");
      console.log(file_name);
      handlers.setFormDraftInternalValuesProperty(
        formLocation, "files", "filesErrors",
        getFilesErrorsRx().filter(file => file.file_name !== file_name));
      handlers.setFormDraftInternalValuesProperty(
        formLocation, "files", "displayFiles",
        getDisplayFilesRx().filter(file => file.file_name !== file_name));
      handlers.setFormDraftInternalValuesProperty(
        formLocation, "files", "uploadedFiles",
        getUploadedFilesRx().filter(file => file.file_name !== file_name));
      //setFilesErrorsRx(getFilesErrorsRx().filter(file => file.file_name !== file_name));
      //setDisplayFilesRx(getDisplayFilesRx().filter(file => file.file_name !== file_name));
      // setUploadedFilesRx(getUploadedFilesRx().filter(file => file.file_name !== file_name));
      const filteredFiles = files.filter(file => file.name !== file_name);
      console.log(filteredFiles);
      setInputsInForm(getUploadedFilesRx());
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
        const displayFilesFiltered = getDisplayFilesRx().map(file => {
          if (file.file_name === file_name) {
            return getFileObject(retryFile.name, partialFilesPath + retryFile.name, retryFile.size, null,
              undefined, retryFile.file_alias, retryFile.file_controller, file.file_uncompress, file.folder_structure, undefined);
          }
          return file;
        });
        setDisplayFilesRx([...displayFilesFiltered]);
        setFilesErrorsRx(getFilesErrorsRx().filter(file => file.file_name !== file_name));
        uploadFile(retryFile);
      }
    }
  };

  let uploadCompressedFile = (file_name, uncompress) => {
    console.log("upload compressed file!!!!");
    console.log(disabled);
    if (!disabled) {
      let compressedFile = files.find(file => file.name === file_name);
      // console.log(files);
      // console.log(compressedFile);
      console.log("UNCOMPRESSING FILES");
      console.log(compressedFile);
      const currentDisplayFiles = getDisplayFilesRx();
      console.log(currentDisplayFiles);
      if (compressedFile !== undefined) {
        const displayFilesFiltered = currentDisplayFiles.map(file => {
          if (file.file_name === file_name) {
            const updatedFile = getFileObject(compressedFile.name, partialFilesPath + compressedFile.name, compressedFile.size,
              null, undefined, compressedFile.file_alias, compressedFile.file_controller, uncompress === true ?
                FILE_COMPRESSED.UNCOMPRESS_YES : FILE_COMPRESSED.UNCOMPRESS_NO );
            console.log(updatedFile);
            return updatedFile;
          }
          return file;
        });
        console.log(displayFilesFiltered);
        setDisplayFilesRx([...displayFilesFiltered]);
        setFilesErrorsRx(getFilesErrorsRx().filter(file => file.file_name !== file_name));
        compressedFile.file_uncompress = uncompress;
        uploadFile(compressedFile);
      }
    }
  };

  let getFilteredFiles = (files) => {
    let dropErrorMessage = "";
    let filteredFiles = files.filter(file => {
      if (getDisplayFilesRx().find(dFile => (dFile.file_name === file.name || dFile.file_alias === file.name)) === undefined)
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

  const getFileStatusComp = (file) => {
    switch (file.file_status) {
      case FILE_STATUS.ADDED:
        return <span> in dataset</span>;
      case FILE_STATUS.UPLOADED:
        return <span><FontAwesomeIcon color="var(--success)" icon={faCheck} /> ready to add</span>;
      case FILE_STATUS.PENDING:
        return <span> File will be uploaded on submit</span>;
      case FILE_STATUS.FAILED:
        return <div>
          <span className="mr-2">
            <FontAwesomeIcon style={{ cursor: "text" }} color="var(--danger)" icon={faTimes} /> {file.file_error}</span>
          <span className="text-primary" style={{ whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => retryUpload(file.file_name)}>
            <FontAwesomeIcon color="var(--primary)" icon={faSyncAlt} /> Retry
          </span>
        </div>;
      default:
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
        return <span><Progress value={handlers.getProgress(file.file_progress_id) || 0}>
          {handlers.getProgress(file.file_progress_id)}%
        </Progress></span>;
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

  return (
    <FormGroup>
      <FormLabel htmlFor={name} label={label} required={required}/>
      {initialFilesTree !== undefined ?
        <Card className="mb-4">
          <CardBody style={{ backgroundColor: "#e9ecef" }}>
            <FileExplorer
              filesTree={initialFilesTree}
              lineageUrl={" "}
              insideProject={false}
            />
          </CardBody>
        </Card>
        : null
      }
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
              <th style={{ width: "5%" }} className="font-weight-light">#</th>
              <th style={{ width: "45%" }} className="font-weight-light">File Name/URL</th>
              <th style={{ width: "10%" }} className="font-weight-light">Size</th>
              <th style={{ width: "30%" }} className="font-weight-light">Status</th>
              <th style={{ width: "10%" }} className="font-weight-light">Delete</th>
            </tr>
          </thead>
          <tbody className={disabled ? "disabled-input" : ""}>
            {getDisplayFilesRx().map((file, index) => (
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
                  {
                    fileWillBeOverwritten(file)
                  }
                  {
                    file.folder_structure ? <div>
                      <Button className="pr-0 pl-0 pt-0 pb-0 mb-1" color="link" id={"filesCollapse" + (index + 1)}>
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
                    </div> : null
                  }
                </td>
                <td>{file.file_size ? formatBytes(file.file_size) : "-"}</td>
                <td>{getFileStatusComp(file)}</td>
                <td>
                  {
                    file.file_status === FILE_STATUS.UPLOADED || file.file_status === FILE_STATUS.FAILED ||
                    file.file_status === FILE_STATUS.PENDING ?
                      <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt}
                        onClick={() => deleteFile(file.file_name)} />
                      : (file.file_status >= FILE_STATUS.UPLOADING && file.file_status < FILE_STATUS.UPLOADED
                          && file.file_controller !== undefined ?
                        (
                          <FontAwesomeIcon color="var(--danger)" icon={faTrashAlt}
                            onClick={() => deleteFile(file.file_name, file.file_controller)} />
                        )
                        : "null")
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
            <tr>
              <td colSpan="5">
                <div className="pb-1">
                  <span className="text-muted"><small>{ "Insert a URL and press enter:" }</small></span>
                </div>
                <InputGroup size="sm">
                  <Input
                    type="text"
                    name="fileUrl"
                    disabled={disabled}
                    id={URL_FILE_ID}
                    placeholder="Upload a file using a URL"
                    onKeyDown={e => onUrlInputEnter(e)}
                    onChange={e => onUrlInputChange(e)}
                    value={urlInputValue}
                  />
                  <InputGroupAddon addonType="append">
                    <Button color="primary" id="addFileButton" onClick={e=>onUrlInputEnter(e)}>
                      Add File from URL
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </td>
            </tr>
          </tbody>
          <tfoot className={disabled ? "disabled-input" : ""} style={{ fontWeight: "normal" }}>
            <tr>
              <td colSpan="5">
                <div onClick={() => { $input.current.click(); }} style={{ marginBottom: 10 }}>
                  <p className="mb-1">
                    Drag and Drop files here to upload, or click <span className="text-primary"
                      style={{ cursor: "pointer" }}>open file dialog</span> to select files for upload.
                  </p>
                  <p className="text-muted font-italic">
                    <FontAwesomeIcon className="pr-1" color="var(--primary)" icon={faFolder} />
                    To upload a folder, zip the folder, upload the zip file, and select {" "}
                    <b style={{ fontWeight: "300" }}>Unzip on upload</b>.
                  </p>
                </div>
                <small className="text-muted">
                  NOTE: Support for uploading large files in RenkuLab is still under development; {" "}
                  consider using the Renku CLI for files larger than 500 MB.
                  <Button className="pr-0 pl-1 pt-0 pb-0 mb-1" color="link" id="fileLimitToggler">
                    <small>More info.</small>
                  </Button>
                  <UncontrolledCollapse key="fileLimitToggler" toggler={"#fileLimitToggler"} className="pt-0 pl-3">
                    In practice, the file-size limitation on uploads in RenkuLab is dependent on the {" "}
                    network connection. Here are some general estimates:<br />
                    <ul>
                      <li>Files under 500MB can be reliably uploaded within a few minutes</li>
                      <li>Files between 500MB and 2GB may be uploadable in RenkuLab, but will take some time</li>
                      <li>For files larger than 2GB, we recommend using the Renku CLI for uploading</li>
                    </ul>
                  </UncontrolledCollapse>
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
export default FileUploaderInput;
export { FILE_STATUS };
