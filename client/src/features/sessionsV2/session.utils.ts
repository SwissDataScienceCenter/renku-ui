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
export function getFormCustomValuesDesc() {
  return {
    urlPath: `In Renku sessions run on a specific path that is not \`/\`. This path  is unique for every session, generated when the session is launched and therefore cannot be known ahead of time. Renku passes down this path to the session via an environment variable called \`RENKU_SESION_PATH\`. All applications that want to run on Renku need to listen for HTTP connection on this path. However in some cases users may want to open a users sessions on different subpaths of \`RENKU_SESION_PATH\`. This parameter is exactly for this purpose. If this is set to foo then when the session is opened the path will be \`<RENKU_SESION_PATH>/foo\` . By default the session will open at \`RENKU_SESSION_PATH\`.`,
    port: `The network port that your application will use to listen for incoming connections.  
Default: \`8080\`.`,
    workingDirectory: `The directory where your session will open when you connect to it. This can be set in a Docker image at build time and if not specified here Renku will use the setting from the Docker image. Renku will also create the project inside this directory including any data sources and repositories.`,
    uid: `The unique identifier assigned to the user that will run the application. This determines file permissions and ownership.  
Default: \`1000\`.`,
    gid: `The unique identifier assigned to the group that will run the application. This helps manage group-based permissions.  
Default: \`1000\`.`,
    mountDirectory: `The directory within your container or system where external storage will be attached.  
Default: \`${MOUNT_DIRECTORY_DEFAULT}\`.`,
  };
}

export const MOUNT_DIRECTORY_DEFAULT = "/home/jovyan/work"; //eslint-disable-line spellcheck/spell-checker
