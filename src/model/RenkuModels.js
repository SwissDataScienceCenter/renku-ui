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
 *  renku-ui
 *
 *  RenkuModels.js
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

const newProjectSchema = new Schema({
  meta: {schema: metaSchema, mandatory: true},
  display: {schema: displaySchema, mandatory: true}
});

const projectSchema = new Schema({
  core: {
    schema: {
      created_at: {initial: null,},
      last_activity_at: {initial: null,},
      id: {initial: null,},
      description: {initial: 'no description', mandatory: true},
      displayId: {initial: '',},
      title: {initial: 'no title', mandatory: true},
      external_url: {initial: '',},
      path_with_namespace: {initial: null},
    }
  },
  visibility: {
    schema: {
      level: {initial: 'private', mandatory: true},
      accessLevel: {initial: 0, mandatory: true}
    }
  },
  data: {
    schema: {
      reference: {
        schema: {
          url_or_doi: {initial:''},
          author: {initial: ''}
        },
      },
      upload: {
        schema: {
          files: {schema: []}
        }
      },
      readme: {
        schema: {
          text: {initial: '', mandatory: false}
        }
      }
    },
  },
  system: {
    schema: {
      tag_list: {schema: []},
      star_count: {initial: 0, mandatory: true},
      forks_count: {initial: 0, mandatory: true},
      ssh_url: {initial: '',},
      http_url: {initial: '',}
    }
  },
  files: {
    schema: {
      notebooks: {schema: []},
      data: {schema: []},
    }
  }
});

export { userSchema, metaSchema, displaySchema, newProjectSchema, projectSchema };
