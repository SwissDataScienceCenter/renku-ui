/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Trash, XLg } from "react-bootstrap-icons";
import {
  Button,
  Col,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { TimeCaption } from "~/components/TimeCaption";
import {
  useDeleteUserSshKeyMutation,
  type SshKey,
} from "~/features/usersV2/api/users.api";

interface SshKeyNameProps {
  name?: string | null;
}
function SshKeyName({ name }: SshKeyNameProps) {
  return name ? (
    <span>{name}</span>
  ) : (
    <span className="fst-italic">Unnamed key</span>
  );
}

interface SshKeyItemProps {
  sshKey: SshKey;
}
export default function SshKeyItem({ sshKey }: SshKeyItemProps) {
  const { name, key_type, fingerprint, created_at, public_key } = sshKey;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(
    () => setIsDeleteOpen((isOpen) => !isOpen),
    [],
  );

  return (
    <ListGroupItem>
      <Row className={cx("gx-4", "gy-2")}>
        <Col
          className={cx("d-flex", "flex-column", "gap-1", "min-w-0")}
          xs={12}
          sm
        >
          <div
            className={cx("align-items-center", "d-flex", "flex-wrap", "gap-2")}
          >
            <span className="fw-bold">
              <SshKeyName name={name} />
            </span>
            <RenkuBadge color="light">{key_type}</RenkuBadge>
          </div>
          <div>
            Fingerprint: <code>{fingerprint}</code>
          </div>
          <div className="text-truncate">
            Public key: <code>{public_key}</code>
          </div>
          <div>
            <TimeCaption datetime={created_at} enableTooltip prefix="Added " />
          </div>
        </Col>
        <Col className="align-self-center" xs={12} sm="auto">
          <Button color="outline-danger" size="sm" onClick={toggleDelete}>
            <Trash className={cx("bi", "me-1")} />
            Delete
          </Button>
        </Col>
      </Row>
      <DeleteSshKeyModal
        isOpen={isDeleteOpen}
        sshKey={sshKey}
        toggle={toggleDelete}
      />
    </ListGroupItem>
  );
}

interface DeleteSshKeyModalProps {
  isOpen: boolean;
  sshKey: SshKey;
  toggle: () => void;
}
function DeleteSshKeyModal({ isOpen, sshKey, toggle }: DeleteSshKeyModalProps) {
  const { id: keyId, name } = sshKey;

  const [deleteUserSshKey, result] = useDeleteUserSshKeyMutation();

  const onDelete = useCallback(() => {
    deleteUserSshKey({ keyId });
  }, [deleteUserSshKey, keyId]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className="text-danger" tag="h2" toggle={toggle}>
        <Trash className={cx("bi", "me-1")} />
        Delete SSH key
      </ModalHeader>
      <ModalBody>
        {result.error && (
          <RtkOrDataServicesError error={result.error} dismissible={false} />
        )}

        <p>
          Are you sure about removing the SSH key{" "}
          <span className="fw-bold">
            <SshKeyName name={name} />
          </span>
          ?
        </p>
        <p className="mb-0">
          You will no longer be able to use it to connect to your sessions.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button color="danger" onClick={onDelete} type="button">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Trash className={cx("bi", "me-1")} />
          )}
          Delete key
        </Button>
      </ModalFooter>
    </Modal>
  );
}
