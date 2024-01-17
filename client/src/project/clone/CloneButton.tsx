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
import { ChevronDown } from "react-bootstrap-icons";
import {
  Col,
  Container,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap";

import BootstrapCopyIcon from "../../components/icons/BootstrapCopyIcon";
import { CloneSettings } from "./CloneSettings";

interface CloneButtonProps {
  size?: string;
  externalUrl?: string;
  projectPath?: string;
  sshUrl?: string;
  httpUrl?: string;
}

export const CloneButton = ({
  size: size_,
  externalUrl,
  projectPath,
  sshUrl,
  httpUrl,
}: CloneButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const onToggle = useCallback(() => setOpen((isOpen) => !isOpen), []);

  if (!externalUrl || !projectPath || !sshUrl || !httpUrl) return null;

  const size = size_ ?? "md";

  return (
    <Dropdown
      className="-btn-outline-rk-green btn-with-menu rounded-pill"
      color="rk-green"
      size={size}
      isOpen={open}
      toggle={onToggle}
      direction="down"
    >
      <DropdownToggle className="btn-outline-rk-green rounded-pill">
        <BootstrapCopyIcon className={cx("bi", "me-1")} />
        Clone
        <ChevronDown size="20" className={cx("ms-1", "btn-with-menu-icon")} />
      </DropdownToggle>
      <DropdownMenu className="btn-with-menu-options" end>
        <Container
          className="px-3"
          // eslint-disable-next-line spellcheck/spell-checker
          style={{ width: "420px", maxWidth: "90vw" }}
        >
          <Row xs={12}>
            <Col xs={12}>
              <CloneSettings
                externalUrl={externalUrl}
                projectPath={projectPath}
                sshUrl={sshUrl}
                httpUrl={httpUrl}
              />
            </Col>
          </Row>
        </Container>
      </DropdownMenu>
    </Dropdown>
  );
};
