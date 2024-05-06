/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { Database } from "react-bootstrap-icons";
import { Modal, ModalHeader } from "reactstrap";
import { PlusRoundButton } from "../../../../components/buttons/Button.tsx";

export function DataSourcesDisplay() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);
  return (
    <>
      <div className={cx("p-3", "d-flex", "justify-content-between")}>
        <div className="fw-bold">
          <Database size={20} className={cx("me-2")} />
          Data Sources (0)
        </div>
        <PlusRoundButton handler={toggle} />
      </div>
      <p className="px-3">
        Add published datasets from data repositories, and connect to cloud
        storage to read and write custom data.
      </p>
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalHeader>Add Data source...</ModalHeader>
      </Modal>
    </>
  );
}
