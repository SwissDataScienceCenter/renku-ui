/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  renga-ui
 *
 *  RengaModels.js
 *
 */

import { Schema } from './Model'

const userSchema = new Schema({
  name: {initial: '', mandatory: true}
});
const User = userSchema.toModel();

const metaSchema = new Schema({
  author: {schema: userSchema, mandatory: true},
  description: {initial: '', mandatory: true},
  displayId: {initial: '', mandatory: true},
  createdAt: {initial: () => new Date()}
});
const Meta = metaSchema.toModel();

const displaySchema = new Schema({
  title: {initial:'', mandatory: true},
  description: {initial: '', mandatory: true},
  slug: {initial: '', mandatory: true},
});
const Display = displaySchema.toModel();

const projectSchema = new Schema({
  meta: {schema: metaSchema, mandatory: true},
  display: {schema: displaySchema, mandatory: true}
});
const Project = projectSchema.toModel();

export { User, userSchema, Meta, metaSchema, Display, displaySchema, Project, projectSchema };
