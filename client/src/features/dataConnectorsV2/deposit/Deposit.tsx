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
 * limitations under the License
 */

import cx from "classnames";
import { Cloud, Folder } from "react-bootstrap-icons";
import { Offcanvas, OffcanvasBody } from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import type { Deposit } from "../api/data-connectors.api";
import DepositActions from "./DepositActions";
import DepositStatusBadge from "./DepositStatusBadge";

interface DepositProps {
  deposit: Deposit;
  isOpen: boolean;
  toggle: () => void;
}
export default function Deposit({ deposit, isOpen, toggle }: DepositProps) {
  return (
    <Offcanvas toggle={toggle} isOpen={isOpen} direction="end" backdrop={true}>
      <OffcanvasBody data-cy="deposit-view">
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="deposit-view-back-button"
            data-bs-dismiss="offcanvas"
            onClick={toggle}
          ></button>
        </div>

        <div className={cx("d-flex", "flex-column", "gap-4")}>
          <section>
            <span className={cx("small", "text-muted", "me-3")}>
              Deposit - dataset creation job
            </span>
            <div>
              <div className={cx("float-end", "mt-1", "ms-1")}>
                <DepositActions deposit={deposit} toggleDepositView={toggle} />
              </div>
              <h2
                className={cx("m-0", "text-break")}
                data-cy="data-connector-title"
              >
                {deposit.name}
              </h2>
            </div>
          </section>

          <section className={cx("d-flex", "flex-column", "gap-4")}>
            <DepositProperty title="Provider">
              <p className="mb-0">
                <Cloud className={cx("bi", "me-1")} />
                {deposit.provider}
              </p>
            </DepositProperty>

            <DepositProperty title="External URL">
              <ExternalLink href={deposit.external_url ?? ""}>
                {deposit.external_url}
              </ExternalLink>
            </DepositProperty>

            <DepositProperty title="Path">
              <p className="mb-0">
                <Folder className={cx("bi", "me-1")} />
                {deposit.path}
              </p>
            </DepositProperty>

            <DepositProperty title="Status">
              <DepositStatusBadge status={deposit.status} />
            </DepositProperty>
          </section>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}

interface DepositPropertyProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
}
function DepositProperty({ title, children }: DepositPropertyProps) {
  return (
    <div>
      <p className={cx("fw-bold", "mb-1")}>{title}</p>
      {children}
    </div>
  );
}
