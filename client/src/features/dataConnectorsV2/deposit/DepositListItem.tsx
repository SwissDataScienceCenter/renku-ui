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
import { useCallback, useMemo } from "react";
import { Cloud, Folder } from "react-bootstrap-icons";
import { Link, To, useLocation } from "react-router";
import { Button, Col, ListGroupItem, Row } from "reactstrap";

import useLocationHash from "~/utils/customHooks/useLocationHash.hook";
import type { Deposit } from "../api/data-connectors.api";
import DepositView from "./Deposit";
import DepositStatusBadge from "./DepositStatusBadge";

interface DepositListItemProps {
  deposit: Deposit;
}
export default function DepositListItem({ deposit }: DepositListItemProps) {
  // Handle hash
  const [hash, setHash] = useLocationHash();
  const dcHash = useMemo(() => `deposit-${deposit.id}`, [deposit.id]);
  const showOffCanvas = useMemo(() => hash === dcHash, [dcHash, hash]);
  const toggleOffCanvas = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === dcHash;
      return isOpen ? "" : dcHash;
    });
  }, [dcHash, setHash]);

  // Handle url with Hash
  const location = useLocation();
  const targetOffcanvasLocation: To = {
    pathname: location.pathname,
    search: location.search,
    hash: `#${dcHash}`,
  };

  return (
    <>
      <ListGroupItem
        action
        className={cx("position-relative", "p-0")}
        data-cy="deposit-item"
      >
        <Link
          className={cx(
            "d-block",
            "text-body",
            "text-decoration-none",
            "link-primary",
            "py-3"
          )}
          to={targetOffcanvasLocation}
        >
          <Row className={cx("align-items-center", "g-3", "mx-0")}>
            <Col className="px-0">
              <Row>
                <Col>
                  <span className="fw-bold" data-cy="deposit-name">
                    {deposit.name}
                  </span>
                </Col>
              </Row>
              <Row className="gx-5">
                <Col xs={12} md="auto">
                  <Cloud className={cx("bi", "me-1")} />
                  {deposit.provider}
                </Col>
                <Col
                  className={cx("text-truncate", "text-wrap")}
                  xs={12}
                  md="auto"
                >
                  {deposit.external_url}
                </Col>
              </Row>

              <Row>
                <Col
                  className={cx("text-truncate", "text-wrap")}
                  xs={12}
                  md="auto"
                >
                  <Folder className={cx("bi", "me-1")} />
                  {deposit.path}
                </Col>
                <Col xs={12} md="auto">
                  <DepositStatusBadge status={deposit.status} />
                </Col>
              </Row>
            </Col>
            {/* This column is a placeholder to reserve the space for the action button */}
            <Col xs="auto">
              <div
                aria-hidden="true"
                className={cx("btn", "btn-sm", "opacity-0", "text-nowrap")}
              >
                ActionText
              </div>
            </Col>
          </Row>
        </Link>
        {/* The action button is visually positioned over the previous placeholder column */}
        <div
          className={cx("end-0", "mt-3", "position-absolute", "top-0", "z-5")}
        >
          <Button color="outline-primary" disabled size="sm">
            To be defined
          </Button>
          {/* // ! TODO: <DepositActions /> */}
        </div>
      </ListGroupItem>
      <DepositView
        deposit={deposit}
        isOpen={showOffCanvas}
        toggle={toggleOffCanvas}
      />
    </>
  );
}
