/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { type ModalHeaderProps as BaseModalHeaderProps } from "reactstrap";

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  modalTitle: React.ReactNode;
  toggle?: BaseModalHeaderProps["toggle"];
}

export default function ModalHeader({
  children,
  className,
  modalTitle,
  toggle,
  ...props
}: ModalHeaderProps) {
  return (
    <>
      <div
        className={cx(className, "modal-header", children && "border-0")}
        {...props}
      >
        <h2 className={"modal-title"}>{modalTitle}</h2>
        {toggle && (
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={toggle}
          />
        )}
      </div>
      {children && <div className={cx("modal-header", "pt-0")}>{children}</div>}
    </>
  );
}
