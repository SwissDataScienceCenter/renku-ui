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
import { CheckLg, Clipboard } from "react-bootstrap-icons";
import { DropdownItem } from "reactstrap";

interface CopyIdentifierMenuItemProps {
  clipboardText: string;
  copied: boolean;
  dataCy: string;
  label: string;
  onCopy: () => void;
}

export default function CopyIdentifierMenuItem({
  clipboardText,
  copied,
  dataCy,
  label,
  onCopy,
}: CopyIdentifierMenuItemProps) {
  return (
    <DropdownItem data-cy={dataCy} onClick={onCopy} toggle={false}>
      <span className={cx("d-flex", "gap-1", "align-items-baseline")}>
        {copied ? (
          <CheckLg aria-hidden="true" className="bi" />
        ) : (
          <Clipboard aria-hidden="true" className="bi" />
        )}
        <span className={cx("d-flex", "flex-column", "min-w-0")}>
          {!copied && <span>{label}</span>}
          <code
            className={cx("d-block", "small", "text-truncate")}
            style={{ maxWidth: "200px" }}
            title={clipboardText}
          >
            {clipboardText}
          </code>
          <span className={cx(!copied && "visually-hidden")} role="status">
            {copied ? "Copied!" : ""}
          </span>
        </span>
      </span>
    </DropdownItem>
  );
}
