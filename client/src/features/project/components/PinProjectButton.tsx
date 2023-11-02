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

import { RootStateOrAny, useSelector } from "react-redux";
import type { User } from "../../../model/RenkuModels";
import { PinAngle } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";
import cx from "classnames";
import { useRef } from "react";

export default function PinProjectButton() {
  const userLogged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const ref = useRef<HTMLButtonElement>(null);

  if (!userLogged) {
    return null;
  }

  return (
    <>
      <Button
        className={cx("btn-outline-rk-green", "rounded-pill")}
        innerRef={ref}
        type="button"
      >
        <PinAngle className="bi" />
        <span className="visually-hidden">Pin project to the dashboard</span>
      </Button>
      <UncontrolledTooltip placement="top" target={ref}>
        Pin project to the dashboard
      </UncontrolledTooltip>
    </>
  );
}
