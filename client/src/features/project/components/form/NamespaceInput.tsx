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

import { Control, Controller, UseFormRegisterReturn } from "react-hook-form";
import Namespaces from "../../../../project/new/components/Namespaces";
import useGetNamespaces from "../../../../utils/customHooks/UseGetNamespaces";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { NewProjectFormFields } from "../../projectKg.types";
import { Namespace } from "../../../projects/projects.api";

interface NamespaceInputProps {
  register: UseFormRegisterReturn;
  namespaceValue?: Namespace;
  isAutomated: boolean;
  control: Control<NewProjectFormFields>;
}

export default function NamespaceInput({
  namespaceValue,
  isAutomated,
  control,
}: NamespaceInputProps) {
  const namespaces = useGetNamespaces(true);
  const user = useLegacySelector((state) => state.stateModel.user);

  return (
    <Controller
      control={control}
      name="namespace"
      render={({ field }) => (
        <Namespaces
          namespaces={namespaces}
          namespaceValue={namespaceValue}
          setNamespace={field.onChange}
          user={user}
          automated={isAutomated}
          control={control}
        />
      )}
      rules={{ required: true }}
    />
  );
}
