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

import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { faPlus, faTrash, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useDispatch } from "react-redux";
import {
  Button,
  Col,
  FormFeedback,
  FormText,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import {
  isCloudStorageBucketValid,
  isCloudStorageEndpointValid,
} from "../../../../notebooks/ObjectStoresConfig.present";
import { useGetNotebooksVersionsQuery } from "../../../versions/versionsApi";
import {
  addCloudStorageMount,
  removeCloudStorageMount,
  updateCloudStorageMount,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";

export default function SessionCloudStorageOption() {
  const { data, isLoading } = useGetNotebooksVersionsQuery();

  if (isLoading) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading session options...
        </div>
      </div>
    );
  }

  const s3CloudStorageEnabled = !!data?.cloudStorageEnabled.s3;

  if (!s3CloudStorageEnabled) {
    return null;
  }

  return <SessionS3CloudStorageOption />;
}

function SessionS3CloudStorageOption() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div className="field-group">
      <div className="form-label">Cloud Storage</div>
      <div className={cx("form-text", "mt-0", "mb-1")}>
        Use data from <S3ExplanationLink /> sources like AWS S3, Google Cloud
        Storage, etc.
      </div>
      <SessionS3CloudStorageDisplay />
      <div>
        <Button className="btn-outline-rk-green" onClick={toggleModal}>
          <FontAwesomeIcon className="me-1" icon={faWrench} />
          Configure Cloud Storage
        </Button>
      </div>
      <SessionS3CloudStorageModal isOpen={isOpen} toggleModal={toggleModal} />
    </div>
  );
}

function SessionS3CloudStorageDisplay() {
  const cloudStorage = useStartSessionOptionsSelector(
    ({ cloudStorage: cloudstorage }) => cloudstorage
  );

  return (
    <>
      {cloudStorage.map(({ bucket, endpoint }, index) => (
        <CloudStorageMountPoint
          key={index}
          bucket={bucket}
          endpoint={endpoint}
        />
      ))}
    </>
  );
}

interface CloudStorageMountPointProps {
  bucket: string;
  endpoint: string;
}

function CloudStorageMountPoint({
  bucket,
  endpoint,
}: CloudStorageMountPointProps) {
  const cloudStorage = useStartSessionOptionsSelector(
    ({ cloudStorage: cloudstorage }) => cloudstorage
  );

  const isEndpointValid = useMemo(
    () => isCloudStorageEndpointValid({ endpoint }),
    [endpoint]
  );

  const hasDuplicate = useMemo(
    () =>
      !!bucket &&
      cloudStorage.filter((mount) => mount.bucket === bucket).length > 1,
    [bucket, cloudStorage]
  );

  const isBucketValid = useMemo(
    () => isCloudStorageBucketValid({ bucket }),
    [bucket]
  );

  if (!isEndpointValid || hasDuplicate || !isBucketValid) {
    return null;
  }

  const url = `${endpoint}/${bucket}`;

  return (
    <div className={cx("form-text", "mb-2")}>
      <ExternalLink role="text" title={url} url={url} /> ⟶{" "}
      <code>/cloudstorage/{bucket}</code>
    </div>
  );
}

interface SessionS3CloudStorageModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

function SessionS3CloudStorageModal({
  isOpen,
  toggleModal,
}: SessionS3CloudStorageModalProps) {
  const cloudStorage = useStartSessionOptionsSelector(
    ({ cloudStorage: cloudstorage }) => cloudstorage
  );

  const dispatch = useDispatch();
  const onAddCloudStorageMount = useCallback(() => {
    dispatch(addCloudStorageMount());
  }, [dispatch]);

  return (
    <Modal fullscreen="lg" isOpen={isOpen} size="xl" toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>
        Cloud Storage Configuration
      </ModalHeader>
      <ModalBody>
        <p>
          Provide credentials to use <S3ExplanationLink /> like AWS S3, Google
          Cloud Storage, etc.
        </p>
        {cloudStorage.length > 0 && <Header />}
        {cloudStorage.map(
          ({ bucket, endpoint, accessKey, secretKey }, index) => (
            <CloudStorageMountPointInput
              key={`${index}`}
              accessKey={accessKey}
              bucket={bucket}
              endpoint={endpoint}
              index={index}
              secretKey={secretKey}
            />
          )
        )}
        <div>
          <Button
            className="btn-outline-rk-green"
            onClick={onAddCloudStorageMount}
          >
            <FontAwesomeIcon className="me-1" icon={faPlus} />
            Add Bucket
          </Button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggleModal}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function Header() {
  return (
    <Row className="my-1">
      <Col>
        <div className={cx("form-label", "small", "text-rk-text")}>
          Endpoint
        </div>
      </Col>
      <Col>
        <div className={cx("form-label", "small", "text-rk-text")}>Bucket</div>
      </Col>
      <Col>
        <div className={cx("form-label", "small", "text-rk-text")}>
          Access Key
        </div>
      </Col>
      <Col>
        <div className={cx("form-label", "small", "text-rk-text")}>
          Secret Key
        </div>
      </Col>
      <Col xs={1} />
    </Row>
  );
}

interface CloudStorageMountPointInputProps {
  accessKey: string | undefined;
  bucket: string;
  endpoint: string;
  index: number;
  secretKey: string | undefined;
}

function CloudStorageMountPointInput({
  accessKey,
  bucket,
  endpoint,
  index,
  secretKey,
}: CloudStorageMountPointInputProps) {
  const cloudStorage = useStartSessionOptionsSelector(
    ({ cloudStorage: cloudstorage }) => cloudstorage
  );

  const isEndpointValid = useMemo(
    () => isCloudStorageEndpointValid({ endpoint }),
    [endpoint]
  );

  const hasDuplicate = useMemo(
    () =>
      !!bucket &&
      cloudStorage.filter((mount) => mount.bucket === bucket).length > 1,
    [bucket, cloudStorage]
  );

  const isBucketValid = useMemo(
    () => isCloudStorageBucketValid({ bucket }),
    [bucket]
  );

  const dispatch = useDispatch();
  const onRemove = useCallback(() => {
    dispatch(removeCloudStorageMount({ index }));
  }, [dispatch, index]);
  const onUpdateEndpoint = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateCloudStorageMount({
          index,
          mount: {
            accessKey,
            bucket,
            endpoint: event.target.value,
            secretKey,
          },
        })
      );
    },
    [accessKey, bucket, dispatch, index, secretKey]
  );
  const onUpdateBucket = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateCloudStorageMount({
          index,
          mount: {
            accessKey,
            bucket: event.target.value,
            endpoint,
            secretKey,
          },
        })
      );
    },
    [accessKey, dispatch, endpoint, index, secretKey]
  );
  const onUpdateAccessKey = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateCloudStorageMount({
          index,
          mount: {
            accessKey: event.target.value || undefined,
            bucket,
            endpoint,
            secretKey,
          },
        })
      );
    },
    [bucket, dispatch, endpoint, index, secretKey]
  );
  const onUpdateSecretKey = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateCloudStorageMount({
          index,
          mount: {
            accessKey,
            bucket,
            endpoint,
            secretKey: event.target.value || undefined,
          },
        })
      );
    },
    [accessKey, bucket, dispatch, endpoint, index]
  );

  return (
    <Row
      className={cx({
        "mb-3": !isEndpointValid || hasDuplicate || !isBucketValid,
      })}
    >
      <Col>
        <Input
          autoComplete="endpoint"
          bsSize="sm"
          invalid={!isEndpointValid}
          name="endpoint"
          onChange={onUpdateEndpoint}
          placeholder="Endpoint"
          type="text"
          value={endpoint}
        />
        {!isEndpointValid && (
          <FormFeedback>Please enter a valid URL for the endpoint</FormFeedback>
        )}
      </Col>
      <Col>
        <Input
          autoComplete="bucket"
          bsSize="sm"
          invalid={hasDuplicate || !isBucketValid}
          name="bucket"
          onChange={onUpdateBucket}
          placeholder="Bucket"
          type="text"
          value={bucket}
        />
        {!isBucketValid && (
          <FormFeedback>
            Please enter a{" "}
            <ExternalLink
              role="text"
              title="valid bucket name"
              url="https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html"
            />
          </FormFeedback>
        )}
        {isBucketValid && hasDuplicate && (
          <FormFeedback>Bucket names must be unique</FormFeedback>
        )}
      </Col>
      <Col>
        <Input
          autoComplete="accessKey"
          bsSize="sm"
          name="accessKey"
          onChange={onUpdateAccessKey}
          placeholder="Access Key"
          type="text"
          value={accessKey ?? ""}
        />
      </Col>
      <Col>
        <Input
          autoComplete="secretKey"
          bsSize="sm"
          name="secretKey"
          onChange={onUpdateSecretKey}
          placeholder="Secret Key"
          type="password"
          value={secretKey ?? ""}
        />
      </Col>
      <Col xs={1}>
        <Button
          size="sm"
          className={cx("border-0", "text-danger", "bg-transparent")}
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </Col>
      {isEndpointValid && !hasDuplicate && isBucketValid && (
        <Col className="mb-2" xs={12}>
          <FormText>
            Mount point: <code>/cloudstorage/{bucket}</code>
          </FormText>
        </Col>
      )}
    </Row>
  );
}

function S3ExplanationLink() {
  return (
    <ExternalLink
      role="text"
      title="S3-compatible storage"
      url="https://en.wikipedia.org/wiki/Amazon_S3#S3_API_and_competing_services"
    />
  );
}
