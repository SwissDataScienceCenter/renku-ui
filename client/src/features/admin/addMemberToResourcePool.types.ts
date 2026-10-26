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

export type MemberType = "user" | "group" | "project";

export type InputMode = "search" | "batch";

export interface PickedUser {
  type: "user";
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PickedGroup {
  type: "group";
  id: string;
  name: string;
  slug: string;
}

export interface PickedProject {
  type: "project";
  id: string;
  name: string;
  namespace: string;
  slug: string;
}

export type PickedMember = PickedUser | PickedGroup | PickedProject;

export interface BatchItemForm {
  input: string;
  isFetching: boolean;
  found: boolean;
  addToResourcePool: boolean;
  id?: string;
  name?: string;
}

export interface AddMemberToResourcePoolForm {
  pickedMember?: PickedMember;
  batchInput: string;
  batchItems: BatchItemForm[];
}
