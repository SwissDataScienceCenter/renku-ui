/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  model/GlobalSchema.js
 *  Schema for all Components.
 */

import { PropertyName as Prop, Schema } from "./Model";
import {
  datasetSchema,
  environmentSchema,
  formGeneratorSchema,
  newProjectSchema,
  notificationsSchema,
  projectSchema,
  projectsSchema,
  statuspageSchema,
  userSchema,
  webSocketSchema,
} from "./RenkuModels";

const globalSchema = new Schema({
  environment: { [Prop.SCHEMA]: environmentSchema },
  formGenerator: { [Prop.SCHEMA]: formGeneratorSchema },
  newProject: { [Prop.SCHEMA]: newProjectSchema },
  notifications: { [Prop.SCHEMA]: notificationsSchema },
  project: { [Prop.SCHEMA]: projectSchema },
  projects: { [Prop.SCHEMA]: projectsSchema },
  dataset: { [Prop.SCHEMA]: datasetSchema },
  statuspage: { [Prop.SCHEMA]: statuspageSchema },
  user: { [Prop.SCHEMA]: userSchema },
  webSocket: { [Prop.SCHEMA]: webSocketSchema },
});

export { globalSchema };
