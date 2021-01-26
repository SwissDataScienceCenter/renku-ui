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

import { Schema, PropertyName as Prop } from "./index";
import {
  notebooksSchema, userSchema, projectsSchema, projectGlobalSchema, newProjectSchema,
  statuspageSchema, notificationsSchema, formGeneratorSchema
} from "./RenkuModels";

const globalSchema = new Schema({
  notebooks: { [Prop.SCHEMA]: notebooksSchema },
  user: { [Prop.SCHEMA]: userSchema },
  projects: { [Prop.SCHEMA]: projectsSchema },
  project: { [Prop.SCHEMA]: projectGlobalSchema },
  newProject: { [Prop.SCHEMA]: newProjectSchema },
  statuspage: { [Prop.SCHEMA]: statuspageSchema },
  notifications: { [Prop.SCHEMA]: notificationsSchema },
  formGenerator: { [Prop.SCHEMA]: formGeneratorSchema }
});

export { globalSchema };
