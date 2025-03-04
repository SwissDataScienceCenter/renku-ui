/*!
 * Copyright 2015 - Swiss Data Science Center (SDSC)
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

export const MIGRATION_PORT = 8888;
export const MIGRATION_WORKING_DIRECTORY = "/home/jovyan/work"; //eslint-disable-line
export const MIGRATION_MOUNT_DIRECTORY = "/home/jovyan/work"; //eslint-disable-line
export const MIGRATION_ARGS =
  '["jupyter server --ServerApp.ip=$RENKU_SESSION_IP --ServerApp.port=$RENKU_SESSION_PORT --ServerApp.allow_origin=* --ServerApp.base_url=$RENKU_BASE_URL_PATH --ServerApp.root_dir=$RENKU_WORKING_DIR --ServerApp.allow_remote_access=True --ContentsManager.allow_hidden=True --ServerApp.token=\\"\\" --ServerApp.password=\\"\\" "]';
export const MIGRATION_COMMAND = '["sh","-c"]';
