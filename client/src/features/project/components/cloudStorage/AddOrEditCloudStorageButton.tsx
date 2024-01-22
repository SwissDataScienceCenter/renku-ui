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

import cx from "classnames";
import { useCallback, useState } from "react";
import { PencilSquare, PlusLg } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

import { CloudStorage } from "./projectCloudStorage.types";
import AddCloudStorageModal from "./CloudStorageModal";

interface AddOrEditCloudStorageButtonProps {
  currentStorage?: CloudStorage | null;
  devAccess: boolean;
}
export default function AddOrEditCloudStorageButton({
  currentStorage,
  devAccess,
}: AddOrEditCloudStorageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const isEdit = !!currentStorage?.storage.storage_id;
  const localId = isEdit
    ? `edit-cloud-storage-${currentStorage.storage.storage_id}`
    : "add-cloud-storage";
  const buttonContent = isEdit ? (
    <>
      <PencilSquare className={cx("bi", "me-1")} />
      Edit
    </>
  ) : (
    <>
      <PlusLg className={cx("bi", "me-1")} />
      Add Cloud Storage
    </>
  );
  const content = devAccess ? (
    <>
      <Button
        id={`${localId}-button`}
        className={cx("btn-outline-rk-green")}
        onClick={toggle}
      >
        {buttonContent}
      </Button>
      <div id={`${localId}-modal`} key={`${localId}-key`}>
        <AddCloudStorageModal
          currentStorage={currentStorage}
          isOpen={isOpen}
          toggle={toggle}
        />
      </div>
    </>
  ) : (
    <>
      <div className="d-inline-block" tabIndex={0}>
        <Button
          id={`${localId}-button`}
          color="outline-secondary"
          disabled={true}
        >
          {buttonContent}
        </Button>
      </div>
      <UncontrolledTooltip target={localId}>
        Only owners, maintainers and developers can edit cloud storage settings.
      </UncontrolledTooltip>
    </>
  );

  return (
    <div className="d-inline-block" id={localId}>
      {content}
    </div>
  );
}
