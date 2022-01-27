
/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import React, { Fragment, useEffect, useState } from "react";
import {
  Button, FormFeedback, FormGroup, FormText, Input, Label,
  Modal, ModalBody, ModalFooter, ModalHeader, Table
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash }
from "@fortawesome/free-solid-svg-icons";
import { Map, List } from "immutable";


function ObjectStoreSummary({ objectStoreConfiguration }) {
  return <Fragment>
    <FormText color="body">
      <b>{objectStoreConfiguration["endpoint"]}</b>/{objectStoreConfiguration["bucket"]}
    </FormText><br />
  </Fragment>;
}

function ObjectStoresConfigurationButton({ objectStoresConfiguration, toggleShowObjectStoresConfigModal }) {

  return <FormGroup>
    <Label>
      Cloud Storage
    </Label> &nbsp; &nbsp;
    <FormText color="muted">
      Use data from sources like AWS S3, Google Cloud Storage, or Azure Blob Storage.
    </FormText> {"  "}
    <br />
    {
      objectStoresConfiguration.map((cs, i) => <ObjectStoreSummary key={i} objectStoreConfiguration={cs} />)
    }
    <FormText color="body"></FormText> {"  "}
    <Button color="primary" size="sm"
      id="s3-configure-button"
      onClick={toggleShowObjectStoresConfigModal}>
      Configure Cloud Storage
    </Button>

  </FormGroup>;
}

/**
 * Check if the endpoint is valid.
 * @param {object} cloudStoreConfig
 */
function isCloudStorageEndpointValid(cloudStoreConfig) {
  return (cloudStoreConfig["endpoint"].length > 0);
}

/**
 * Check if the bucket is valid.
 * @param {object} cloudStoreConfig
 */
function isCloudStorageBucketValid(cloudStoreConfig) {
  return (cloudStoreConfig["bucket"].length > 0);
}

function ObjectStoreRow({ credentials, index, onChangeValue, onDeleteValue }) {

  function changeHandler(field) {
    return (e) => onChangeValue(index, field, e.target.value);
  }
  const validationState = {
    endpoint: isCloudStorageEndpointValid(credentials),
    bucket: isCloudStorageBucketValid(credentials),
  };

  return <tr className="pb-2">
    <td>
      <FormGroup>
        <Input placeholder="endpoint" type="text" autoComplete="text"
          id={`s3-endpoint-${index}`} name="endpoint"
          bsSize="sm" value={credentials.endpoint}
          onChange={changeHandler("endpoint")} invalid={!validationState.endpoint} />
        {
          (validationState.endpoint) ?
            null :
            <FormFeedback>Please enter an endpoint</FormFeedback>
        }
      </FormGroup>
    </td>
    <td>
      <FormGroup>
        <Input
          placeholder="bucket name" type="text" autoComplete="text"
          id={`s3-bucket-${index}`} name="bucket"
          bsSize="sm" value={credentials.bucket}
          onChange={changeHandler("bucket")} invalid={!validationState.bucket} />
        {
          (validationState.bucket) ?
            null :
            <FormFeedback>Please enter a bucket</FormFeedback>
        }
      </FormGroup>
    </td>
    <td>
      <Input placeholder="access key" type="text" autoComplete="text"
        id={`s3-access_key-${index}`} name="access_key"
        bsSize="sm" value={credentials.access_key}
        onChange={changeHandler("access_key")} />
    </td>
    <td>
      <Input placeholder="secret key" type="password" autoComplete="text"
        id={`s3-secret_key-${index}`} name="secret_key"
        bsSize="sm" value={credentials.secret_key}
        onChange={changeHandler("secret_key")} />
    </td>
    <td>
      <Button color="link" size="sm"
        onClick={() => onDeleteValue(index)}>
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </td>
  </tr>;
}

function emptyObjectStoreCredentials() {
  return { bucket: "", endpoint: "", access_key: "", secret_key: "" };
}

function ObjectStoresTable({ objectStoresConfiguration, onChangeValue, onDeleteValue }) {

  return <Table>
    <thead>
      <tr>
        <th>Endpoint</th>
        <th>Bucket Name</th>
        <th>Access Key</th>
        <th>Secret Key</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {
        objectStoresConfiguration.map((cl, i) => {
          return <ObjectStoreRow
            key={i}
            credentials={cl} index={i} onChangeValue={onChangeValue} onDeleteValue={onDeleteValue} />;
        })
      }
    </tbody>
  </Table>;
}

/**
 * Check if the storesConfig are valid. Return true if so, false if not.
 * @param {array} storesConfig
 */
function validateStoresConfig(storesConfig) {
  for (const cs of storesConfig) {
    if (!isCloudStorageEndpointValid(cs)) return false;
    if (!isCloudStorageBucketValid(cs)) return false;
  }
  return true;
}

function filterConfig(storesConfig) {
  const keys = ["bucket", "endpoint", "access_key", "secret_key"];
  // remove any rows that contain only empty values
  const filteredConfig = storesConfig.toJS().filter((cs) => {
    const nonEmpty = keys.map((k) => cs[k].length > 0);
    return nonEmpty.some((e) => e);
  }).map((cs) => {
    // remove tailing spaces
    keys.map((k) => cs[k] = cs[k].trim());
    return cs;
  });
  return filteredConfig;
}

function saveValidStoresConfig(storesConfig, setObjectStoresConfiguration,
  setSaveStatusMessage, toggleShowObjectStoresConfigModal) {
  const filteredConfig = filterConfig(storesConfig).filter((cs) => {
    // remove invalid rows that contain only empty values
    if (!isCloudStorageEndpointValid(cs)) return false;
    if (!isCloudStorageBucketValid(cs)) return false;
    return true;
  });

  setObjectStoresConfiguration(filteredConfig);
  setSaveStatusMessage("");
  toggleShowObjectStoresConfigModal();
}


function saveStoresConfig(storesConfig, setObjectStoresConfiguration,
  setSaveStatusMessage, toggleShowObjectStoresConfigModal) {
  // const keys = ["bucket", "endpoint", "access_key", "secret_key"];
  // remove any rows that contain only empty values
  const filteredConfig = filterConfig(storesConfig);
  if (!validateStoresConfig(filteredConfig)) {
    setSaveStatusMessage("Please fix all credentials before saving.");
    return;
  }

  // TODO check that the credentials work on save: this needs ui-server support because of CORS
  // if (filteredConfig.length > 0) {
  //   const cs = filteredConfig[0];
  //   const s3Params = {
  //     apiVersion: "2006-03-01",
  //     endpoint: cs["endpoint"]
  //   };
  //   if (cs["access_key"] != null) {
  //     s3Params["accessKeyId"] = cs["access_key"];
  //     s3Params["secretAccessKey"] = cs["secret_key"];
  //   }
  //   const s3 = new S3(s3Params);
  //   s3.listObjects({ Bucket: cs["bucket"] }, (err, data) => {
  //     if (err) console.log(err, err.stack);
  //     else console.log(data);
  //   });
  // }

  setObjectStoresConfiguration(filteredConfig);
  setSaveStatusMessage("");
  toggleShowObjectStoresConfigModal();
}

function ObjectStoresConfigurationModal({ objectStoresConfiguration, showObjectStoreModal,
  toggleShowObjectStoresConfigModal, setObjectStoresConfiguration }) {
  const [storesConfig, setStoresConfig] = useState([]);
  useEffect(() => {
    const initialCredentials = (objectStoresConfiguration.length > 0) ?
      List(objectStoresConfiguration) :
      List([emptyObjectStoreCredentials()]);
    setStoresConfig(initialCredentials);
  }, [objectStoresConfiguration]);
  const onChangeValue = (index, field, value) => {
    const old = Map(storesConfig.get(index));
    const newElt = old.set(field, value).toJS();
    setStoresConfig(storesConfig.set(index, newElt));
  };
  const onDeleteValue = (index) => {
    let c = storesConfig.remove(index);
    if (c.size < 1) c = List([emptyObjectStoreCredentials()]);
    setStoresConfig(c);
  };
  const onAddValue = () => {
    setStoresConfig(storesConfig.push(emptyObjectStoreCredentials()));
  };

  const onClose = () => {
    saveValidStoresConfig(storesConfig, setObjectStoresConfiguration,
      setSaveStatusMessage, toggleShowObjectStoresConfigModal);
  };

  const [saveStatusMessage, setSaveStatusMessage] = useState("");
  const onSave = () => {
    saveStoresConfig(storesConfig, setObjectStoresConfiguration,
      setSaveStatusMessage, toggleShowObjectStoresConfigModal);
  };

  return <div>
    <Modal
      size="xl"
      isOpen={showObjectStoreModal}
      toggle={onClose}>
      <ModalHeader toggle={onClose}>Object Store Configuration</ModalHeader>
      <ModalBody>
        <p>
          Provide credentials to use cloud storage like {" "}
          AWS S3, Google Cloud Storage, or Azure Blob Storage.
        </p>
        <ObjectStoresTable
          objectStoresConfiguration={storesConfig}
          onChangeValue={onChangeValue} onDeleteValue={onDeleteValue}
          setCredentials={setStoresConfig} />
      </ModalBody>
      <ModalFooter>
        <FormText>{saveStatusMessage}</FormText>
        <Button color="primary" onClick={onAddValue}>Add Bucket</Button>
        <Button color="secondary"
          onClick={onSave}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  </div>;
}


export { ObjectStoresConfigurationButton, ObjectStoresConfigurationModal };
