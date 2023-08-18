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

import { Row, Col } from "reactstrap";

import type { Params } from "../App.types";
import { Loader } from "../components/Loader";
import { ExternalLink } from "../components/ExternalLinks";
import {
  useGetCoreVersionsQuery,
  useGetNotebooksVersionsQuery,
} from "../features/versions/versionsApi";
import { RenkuRepositories } from "../utils/constants/Repositories";

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

/**
 * Parse the chart version into components according to https://github.com/jupyterhub/chartpress/tree/1.3.0
 * NB This may need to change if chartpress is updated.
 * @param version the chart version
 * @returns the version components
 */
function parseChartVersion(version: string | undefined) {
  if (version == null) {
    return {
      taggedVersion: "unknown",
      devHash: "unknown",
    };
  }
  const versionComponents = version.split("-");
  if (versionComponents.length === 1) {
    return {
      taggedVersion: version,
      devHash: null,
    };
  }
  const taggedVersion = versionComponents[0];
  const versionMetadata = versionComponents[1];
  const metadataComponents = versionMetadata.split(".");
  const lastComponent = metadataComponents[metadataComponents.length - 1];
  if (lastComponent.match(/^h.+$/)) {
    // This is non-tagged version, e.g. [tag].n[number of commits].h[commit hash]
    const devHash = lastComponent.slice(1);
    return {
      taggedVersion,
      devHash,
    };
  }
  // This is a tagged dev version, e.g. [tag]-[build info]
  const devHash = lastComponent;
  return {
    taggedVersion,
    devHash,
  };
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

function NotebookRelease() {
  const { data, isFetching } = useGetNotebooksVersionsQuery();
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

function RenkuRelease({ chartVersion }: { chartVersion: string }) {
  const { taggedVersion, devHash } = parseChartVersion(chartVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.Renku}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function UiRelease({ uiVersion }: { uiVersion: string }) {
  const { taggedVersion, devHash } = parseChartVersion(uiVersion);
  return (
    <ComponentAndDevVersion
      componentUrl={RenkuRepositories.UI}
      devHash={devHash}
      taggedVersion={taggedVersion}
    />
  );
}

function ComponentDetails({ uiVersion }: { uiVersion: string }) {
  return (
    <>
      <div className="fw-bold">Renku component versions</div>
      <ul>
        <li>
          UI: <UiRelease uiVersion={uiVersion} />
        </li>
        <li>
          Core: <CoreRelease />
        </li>
        <li>
          Notebooks: <NotebookRelease />
        </li>
      </ul>
    </>
  );
}

type HelpProps = {
  params: Params;
};
function HelpRelease({ params }: HelpProps) {
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
            <span className="fw-bold">Renku version</span>{" "}
            <RenkuRelease chartVersion={params.RENKU_CHART_VERSION} />
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ComponentDetails uiVersion={params.UI_VERSION} />
        </Col>
      </Row>
    </>
  );
}

export default HelpRelease;

// For testing
export { parseChartVersion };
