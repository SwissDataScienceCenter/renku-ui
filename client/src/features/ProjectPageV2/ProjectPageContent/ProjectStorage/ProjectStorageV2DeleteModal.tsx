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

import { Modal, ModalBody, ModalHeader } from "reactstrap";

interface ProjectStorageV2DeleteModalProps {
  isOpen: boolean;
  storageId: string;
  toggle: () => void;
  executeOnSuccess: () => void;
}

export default function ProjectStorageV2DeleteModal({
  isOpen,
  // storageId,
  toggle,
  // executeOnSuccess,
}: ProjectStorageV2DeleteModalProps) {
  // const [deleteStorage, result] = useDeleteStorageByStorageIdMutation();
  // const onDelete = useCallback(() => {
  //   deleteStorage({ storageId });
  // }, [deleteStorage, storageId]);

  // useEffect(() => {
  //   if (result.isSuccess) {
  //     executeOnSuccess();
  //   }
  // }, [result.isSuccess, executeOnSuccess]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Remove project storage permanently
      </ModalHeader>
      <ModalBody>TODO: cannot delete project storage yet</ModalBody>
      {/* <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}

        <p className="mb-0">
          Please confirm that you want to remove this project storage.
        </p>
        <WarnAlert className={cx("mt-3")} dismissible={false} color="danger">
          <p className="mb-0">
            This action cannot be undone. All data stored in this project
            storage will be permanently deleted.
          </p>
        </WarnAlert>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          data-cy="project-storage-delete-confirm-button"
          color="danger"
          disabled={result.isLoading}
          onClick={onDelete}
          type="button"
          role="button"
        >
          <TrashFill className={cx("bi", "me-1")} />
          Remove project storage
        </Button>
      </ModalFooter> */}
    </Modal>
  );
}
