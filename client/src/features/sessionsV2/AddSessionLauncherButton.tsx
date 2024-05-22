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
import { PlusLg } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import { PlusRoundButton } from "../../components/buttons/Button.tsx";
import { Step1AddSessionModal } from "./components/SessionModals/AddSession.tsx";

export default function AddSessionLauncherButton({
  styleBtn,
}: {
  styleBtn: "iconBtn" | "iconTextBtn";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      {styleBtn === "iconTextBtn" ? (
        <Button className="btn-rk-green" onClick={() => toggle()}>
          <PlusLg className={cx("bi", "me-1")} />
          Add session
        </Button>
      ) : (
        <PlusRoundButton handler={toggle} />
      )}
      <Step1AddSessionModal isOpen={isOpen} toggleModal={toggle} />
    </>
  );
}
