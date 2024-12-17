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

import { useCallback } from "react";
import { Button } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { projectCreationHash } from "./createProjectV2.constants";

export interface CreateProjectV2ButtonProps {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  dataCy?: string;
}
export default function CreateProjectV2Button({
  children,
  className,
  color,
  dataCy,
}: CreateProjectV2ButtonProps) {
  const [, setHash] = useLocationHash();
  const openModal = useCallback(() => {
    setHash(projectCreationHash);
  }, [setHash]);

  return (
    <Button
      className={className}
      color={color || "primary"}
      data-cy={dataCy || "button-project-new"}
      onClick={openModal}
    >
      {children || "Create Project"}
    </Button>
  );
}
