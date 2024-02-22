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
import { useContext } from "react";
import { PlayFill, SlashCircle } from "react-bootstrap-icons";
import { Button } from "reactstrap";
import { Loader } from "../../components/Loader";
import ProjectSessionConfigContext from "./ProjectSessionConfig.context";

// interface StartSessionButtonProps {}

export default function StartSessionButton() {
  const { isLoading, supportsSessions } = useContext(
    ProjectSessionConfigContext
  );

  return (
    <Button type="button" role="button" disabled={!supportsSessions}>
      {isLoading ? (
        <Loader className="me-1" inline size={16} />
      ) : !supportsSessions ? (
        <SlashCircle className={cx("bi", "me-1")} />
      ) : (
        <PlayFill className={cx("bi", "me-1")} />
      )}
      Start
    </Button>
  );
}
