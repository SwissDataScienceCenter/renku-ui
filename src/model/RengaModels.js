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
  name: {initial: '', mandatory: false},
  username: {initial: '', mandatory: true},
  avatarUrl: {initial: '', mandatory: false}
});

const metaSchema = new Schema({
  id: {initial: '', mandatory: false},
  // author: {schema: userSchema, mandatory: false},
  createdAt: {initial: () => new Date()},
  updatedAt: {initial: () => new Date()},
  lastActivityAt: {initial: () => new Date()},
  visibility: {initial: 'public', mandatory: true},
});

const displaySchema = new Schema({
  title: {initial:'', mandatory: true},
  description: {initial: '', mandatory: true},
  displayId: {initial: '', mandatory: false},
  slug: {initial: '', mandatory: true},
});

const projectSchema = new Schema({
  meta: {schema: metaSchema, mandatory: true},
  display: {schema: displaySchema, mandatory: true}
});

export { userSchema, metaSchema, displaySchema, projectSchema };
