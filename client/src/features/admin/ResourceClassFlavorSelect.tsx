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

import { Controller, type Control } from "react-hook-form";
import { Input, Label } from "reactstrap";

import {
  useGetResourceFlavorsQuery,
  type ResourceFlavor,
} from "../sessionsV2/api/computeResources.api";
import type { ResourceClassForm } from "./adminComputeResources.types";

export const NO_RESOURCE_FLAVOR = "";

export function describeResourceFlavor(flavor: ResourceFlavor) {
  const { cpu, default_storage, gpu, max_storage, memory, name } = flavor;
  return `${name}: ${cpu} CPUs, ${memory} GB RAM, ${gpu} GPUs, ${default_storage}/${max_storage} GB disk`;
}

interface ResourceClassFlavorSelectProps {
  control: Control<ResourceClassForm>;
  idPrefix: string;
}

export default function ResourceClassFlavorSelect({
  control,
  idPrefix,
}: ResourceClassFlavorSelectProps) {
  const { data: flavors } = useGetResourceFlavorsQuery({});

  if (!flavors || flavors.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <Label className="form-label" for={`${idPrefix}ResourceFlavor`}>
        Resource flavor
      </Label>
      <Controller
        control={control}
        name="resource_flavor_id"
        render={({ field }) => (
          <Input
            className="form-select"
            id={`${idPrefix}ResourceFlavor`}
            type="select"
            {...field}
          >
            <option value={NO_RESOURCE_FLAVOR}>None</option>
            {flavors.map((flavor) => (
              <option key={flavor.id} value={flavor.id}>
                {describeResourceFlavor(flavor)}
              </option>
            ))}
          </Input>
        )}
      />
      <div className="form-text">
        A linked class takes its CPU, memory, GPU and disk values from the
        flavor, and keeps its own name.
      </div>
    </div>
  );
}
