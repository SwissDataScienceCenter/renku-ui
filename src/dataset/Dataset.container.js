/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React from "react";
import DatasetView from "./Dataset.present";

export default function ShowDataset(props) {
  return <DatasetView
    fetchGraphStatus={props.fetchGraphStatus}
    maintainer={props.maintainer}
    createGraphWebhook={props.createGraphWebhook}
    forked={props.forked}
    insideProject={props.insideProject}
    identifier={props.identifier}
    progress={props.progress}
    lineagesUrl={props.lineagesUrl}
    fileContentUrl={props.fileContentUrl}
    projectsUrl={props.projectsUrl}
    client={props.client}
    datasets={props.datasets}
    selectedDataset={props.selectedDataset}
    history={props.history}
    logged={props.logged}
  />;
}
