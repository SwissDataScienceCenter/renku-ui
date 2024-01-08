/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useContext } from "react";
import { Col, Row } from "reactstrap";

import { ExternalLink } from "../components/ExternalLinks";
import { Loader } from "../components/Loader";
import {
  useGetCoreVersionsQuery,
  useGetDataServicesVersionQuery,
  useGetKgVersionQuery,
  useGetNotebooksVersionQuery,
} from "../features/versions/versions.api";
import { RenkuRepositories } from "../utils/constants/Repositories";
import AppContext from "../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../utils/context/appParams.constants";
import { parseChartVersion } from "./release.utils";

function componentDocsUrl(
  componentUrl: string,
  taggedVersion: string | undefined,
  devHash: string | undefined | null
) {
  const releasesUrl = `${componentUrl}/releases/`;
  return taggedVersion == null
    ? releasesUrl
    : devHash == null
    ? `${componentUrl}/releases/tag/${taggedVersion}`
    : releasesUrl;
}

type ComponentAndDevVersionProps = {
  componentUrl: string /* URL of the component's repository, without a trailing slash */;
  devHash: string | undefined | null;
  taggedVersion: string | undefined;
};
function ComponentAndDevVersion({
  componentUrl,
  devHash,
  taggedVersion,
}: ComponentAndDevVersionProps) {
  const releaseUrl = componentDocsUrl(componentUrl, taggedVersion, devHash);
  return (
    <>
      <ExternalLink role="text" title={taggedVersion} url={releaseUrl} />
      {devHash != null && (
        <>
          {" "}
          <span>
            (dev version <code className="user-select-all">{devHash}</code>)
          </span>
        </>
      )}
    </>
  );
}

function CoreRelease() {
  const { data, isFetching } = useGetCoreVersionsQuery();
  if (isFetching) {
    return <Loader inline size={16} />;
  }
  const coreVersion = data?.coreVersions[0];
  const { taggedVersion, devHash } = parseChartVersion(coreVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.Python}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function DataServicesRelease() {
  const { data, isFetching } = useGetDataServicesVersionQuery();
  if (isFetching) {
    return <Loader inline size={16} />;
  }
  const dataServicesVersion = data?.version;
  const { taggedVersion, devHash } = parseChartVersion(dataServicesVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.DataServices}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function KgRelease() {
  const { data, isFetching } = useGetKgVersionQuery();
  if (isFetching) {
    return <Loader inline size={16} />;
  }
  const kgVersion = data?.version;
  const { taggedVersion, devHash } = parseChartVersion(kgVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.KnowledgeGraph}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function NotebookRelease() {
  const { data, isFetching } = useGetNotebooksVersionQuery();
  if (isFetching) {
    return <Loader inline size={16} />;
  }
  const notebooksVersion = data?.version;
  const { taggedVersion, devHash } = parseChartVersion(notebooksVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.Notebooks}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function RenkuRelease() {
  const { params } = useContext(AppContext);
  const chartVersion =
    params?.RENKU_CHART_VERSION ?? DEFAULT_APP_PARAMS.RENKU_CHART_VERSION;

  const { taggedVersion, devHash } = parseChartVersion(chartVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.Renku}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function UiRelease() {
  const { params } = useContext(AppContext);
  const uiVersion = params?.UI_VERSION ?? DEFAULT_APP_PARAMS.UI_VERSION;

  const { taggedVersion, devHash } = parseChartVersion(uiVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.UI}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function ComponentDetails() {
  return (
    <>
      <div className="fw-bold">Renku component versions</div>
      <ul>
        <li>
          UI: <UiRelease />
        </li>
        <li>
          Core: <CoreRelease />
        </li>
        <li>
          Data Services: <DataServicesRelease />
        </li>
        <li>
          Knowledge Graph: <KgRelease />
        </li>
        <li>
          Notebooks: <NotebookRelease />
        </li>
      </ul>
    </>
  );
}

export default function HelpRelease() {
  return (
    <>
      <Row>
        <Col md={6}>
          <p>
            For detailed information about new Renku features and the latest
            improvements to individual components, please refer to the following
            links.
          </p>
          <p>
            <span className="fw-bold">Renku version</span> <RenkuRelease />
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ComponentDetails />
        </Col>
      </Row>
    </>
  );
}
