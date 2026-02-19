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
import { ReactNode } from "react";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
} from "react-bootstrap-icons";
import { CardBody } from "reactstrap";

/** Props for the base Renku toast */
export interface RenkuToastProps {
  /** Header content */
  header?: ReactNode;
  /** Body content, will be used if `textBody` is not provided */
  body?: ReactNode;
  /** Body content, as a single paragraph */
  textBody?: ReactNode;
}

/** Base Renku toast */
export function RenkuToast({ body: body_, header, textBody }: RenkuToastProps) {
  const body = body_ ?? (textBody && <p className="mb-1">{textBody}</p>);
  return (
    <CardBody className="py-2">
      {header && (
        <div className={cx("toast-header", "border-bottom-0")}>{header}</div>
      )}
      {body && <div className={cx("toast-body", "pt-2")}>{body}</div>}
    </CardBody>
  );
}

/** Close button for the Renku toast */
export function CloseButton({ closeToast }: { closeToast: () => void }) {
  return (
    <button
      aria-label="Close"
      className={cx("btn", "btn-close", "me-2", "mt-2")}
      onClick={closeToast}
    />
  );
}

/** Props for the typed Renku toasts */
export interface RenkuTypedToastProps extends Omit<RenkuToastProps, "header"> {
  /** Header content, as a single line of text */
  textHeader?: ReactNode;
}

function RenkuToastWithIcon({
  icon,
  textHeader,
  ...props
}: RenkuTypedToastProps & { icon: ReactNode }) {
  const header = (
    <>
      <div>
        {icon}
        {textHeader && <strong>{textHeader}</strong>}
      </div>
    </>
  );
  return <RenkuToast {...props} header={header} />;
}

/** Success Renku toast, with a check icon */
export function RenkuToastSuccess(props: RenkuTypedToastProps) {
  const icon = <CheckCircleFill className={cx("bi", "me-2", "text-success")} />;
  return <RenkuToastWithIcon icon={icon} {...props} />;
}

/** Danger Renku toast, with a exclamation mark icon */
export function RenkuToastDanger(props: RenkuTypedToastProps) {
  const icon = (
    <ExclamationTriangleFill className={cx("bi", "me-2", "text-danger")} />
  );
  return <RenkuToastWithIcon icon={icon} {...props} />;
}

/** Warning Renku toast, with a exclamation mark icon */
export function RenkuToastWarning(props: RenkuTypedToastProps) {
  const icon = (
    <ExclamationTriangleFill className={cx("bi", "me-2", "text-warning")} />
  );
  return <RenkuToastWithIcon icon={icon} {...props} />;
}

/** Info Renku toast, with a exclamation mark icon */
export function RenkuToastInfo(props: RenkuTypedToastProps) {
  const icon = <InfoCircleFill className={cx("bi", "me-2", "text-info")} />;
  return <RenkuToastWithIcon icon={icon} {...props} />;
}
