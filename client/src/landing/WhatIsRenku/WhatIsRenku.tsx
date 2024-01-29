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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { BookmarksFill, Send, TerminalFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

import { ExternalLink } from "../../components/ExternalLinks";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import EntityCardSkeleton from "../../components/list/EntityCardSkeleton";
import ListCard from "../../components/list/ListCard";
import { stateToSearchString } from "../../features/kgSearch";
import { useGetDatasetKgQuery } from "../../features/project/projectKg.api";
import { Docs, RenkuContactEmail } from "../../utils/constants/Docs";
import { mapDatasetKgResultToEntity } from "../../utils/helpers/KgSearchFunctions";
import { Url } from "../../utils/helpers/url";
import { SearchInput } from "../AnonymousHome";
import compute_Graphic from "../Graphics/computoOptions.svg";
import Jupyter_Graphic from "../Graphics/jupyter-terminal.png";
import workflow_Graphic from "../Graphics/my-workflow-yaml.png";
import puzzleGraphic from "../Graphics/puzzlePieces.svg";
import searchGraphic from "../Graphics/search.png";
import SSH_Graphic from "../Graphics/terminal-ssh-renku.gif";
import TemplateSlider from "../TemplateSlider/TemplateSlider";

import styles from "./WhatIsRenku.module.scss";

interface TryOutSessionBtnProps {
  projectPath: string;
  btnTitle: string;
  type: "autostart" | "new";
}
const TryOutSessionBtn = ({
  projectPath,
  btnTitle,
  type = "autostart",
}: TryOutSessionBtnProps) => {
  const sessionNewUrl = Url.get(Url.pages.project.session.new, {
    namespace: "",
    path: projectPath,
  });

  const url = {
    pathname: sessionNewUrl,
    search:
      type === "autostart" ? "autostart=1&fromLanding=1" : "fromLanding=1",
  };

  if (!projectPath) return null;

  return (
    <Link
      className={cx(
        "btn",
        "btn-rk-green",
        styles.btnContactUs,
        "align-self-start",
        "align-self-lg-center",
        "gap-2"
      )}
      to={url}
      target="_blank"
    >
      {btnTitle}
    </Link>
  );
};
const ShareFeatSection = ({ projectPath }: WhatIsRenkuProps) => {
  return (
    <div id={styles.shareFeatContainer}>
      <div className={styles.shareFeatGraph}>
        <img src={puzzleGraphic} alt="Puzzle Renku graphic" loading="lazy" />
      </div>
      <div className={styles.shareFeatText}>
        <h3>Share your whole project, not just your code</h3>
        <p>
          A Renku project brings together your code, data, environment, and
          workflows.
        </p>
      </div>
      <div className={styles.shareFeatBtn}>
        {projectPath && (
          <Link
            className={cx(
              "btn",
              "btn-rk-green",
              styles.btnContactUs,
              "align-self-start",
              "align-self-lg-center",
              "gap-2"
            )}
            to={Url.get(Url.pages.project.base, {
              namespace: "",
              path: projectPath,
            })}
            target="_blank"
          >
            Explore a project
          </Link>
        )}
      </div>
    </div>
  );
};

const EnvFeatSection = ({ projectPath }: WhatIsRenkuProps) => {
  return (
    <div id={styles.environmentFeatContainer}>
      <div className={styles.envFeatGraph}>
        <TemplateSlider />
      </div>
      <div className={styles.envFeatTitle}>
        <h3>
          Start a compute session in your favorite environment with one click
        </h3>
      </div>
      <div className={styles.envFeatContain}>
        <p>
          All you need to run a RenkuLab project is a browser! Choose from our
          curated compute environments to get started quickly. We take care of
          containerization for you.
        </p>
        <TryOutSessionBtn
          projectPath={projectPath}
          type="autostart"
          btnTitle="Try out a session"
        />
      </div>
    </div>
  );
};

const ComputeFeatSection = ({ projectPath }: WhatIsRenkuProps) => {
  return (
    <div id={styles.computeFeatContainer}>
      <div className={styles.computeFeatGraph}>
        <img src={compute_Graphic} alt="Compute Options Graph" loading="lazy" />
      </div>
      <div className={styles.computeFeatTitle}>
        <h3>One project, many compute options</h3>
        <p>
          Scaling up your project is as simple as switching your session
          resource class- everything else about your project stays the same. No
          need to keep multiple compute environments in sync to scale up.
        </p>
      </div>
      <div className={styles.computeFeatContain}>
        <TryOutSessionBtn
          projectPath={projectPath}
          type="new"
          btnTitle="Try out a session"
        />
      </div>
      <div className={cx("d-flex", "gap-3", styles.computeFeatOtherLink)}>
        <div className="mt-1">
          <Send size={30} />
        </div>
        <div className={styles.computeFeatSubtext}>
          <span className="fw-bold d-block">
            Want to take your Renku project to the next level?
          </span>
          <ExternalLink
            className="text-black"
            role="link"
            id="computeFeatLink"
            url={`mailto:${RenkuContactEmail}?subject=RenkuLab%20compute%20resources`}
            title="Contact us about larger compute resources on RenkuLab"
          />
        </div>
      </div>
    </div>
  );
};

const ConnectFeatSection = () => {
  return (
    <div id={styles.connectFeatContainer}>
      <div className={styles.connectFeatGraph}>
        <img
          src={Jupyter_Graphic}
          loading="lazy"
          alt="Jupyter connect graphic"
          className={styles.connectImgJupyter}
        />
        <img
          src={SSH_Graphic}
          loading="lazy"
          alt="SSH connect graphic"
          className={styles.connectImgTerminal}
        />
      </div>
      <div className={styles.connectFeatTitle}>
        <h3>Connect from anywhere</h3>
      </div>
      <div className={styles.connectFeatContain}>
        <p>
          Connect to RenkuLab sessions from the comfort of your local terminal
          or favorite IDE. Or, run your Renku project locally without RenkuLab
          at all.
        </p>
        <div className={cx(styles.featDocLinks, "flex-wrap")}>
          <TerminalFill size={25} />
          <div>
            Try out the{" "}
            <ExternalLink
              color=""
              role="link"
              id="connectFeatBtn"
              url={Docs.rtdHowToGuide(
                "own_machine/cli-installation.html#cli-installation.html"
              )}
              title="Renku CLI"
            />
          </div>
          <div>
            {/* eslint-disable-next-line spellcheck/spell-checker */}
            <CommandCopy command="pipx install renku" />
          </div>
        </div>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={25} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="connectSSHFeatBtn"
              url={Docs.rtdHowToGuide("renkulab/ssh-into-sessions.html")}
              title="SSH Sessions"
            />{" "}
            on RenkuLab
          </div>
        </div>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={25} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="connectCLIBtn"
              url={Docs.rtdHowToGuide(
                "own_machine/session-running-locally.html"
              )}
              title="running Renku sessions locally"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DatasetsFeatSection {
  datasetSlug: string;
}
const DatasetsFeatSection = ({ datasetSlug }: DatasetsFeatSection) => {
  const paramsUrlStrExploreDatasets = stateToSearchString({
    type: { project: false, dataset: true },
  });
  const {
    data: kgDataset,
    error: kgFetchError,
    isFetching: isKgFetching,
    isLoading: isKgLoading,
  } = useGetDatasetKgQuery(!!datasetSlug ? { id: datasetSlug } : skipToken);

  const isLoading = isKgLoading || isKgFetching;

  const entityProps =
    !isLoading && kgDataset ? mapDatasetKgResultToEntity(kgDataset) : undefined;

  const datasetCard = entityProps ? <ListCard {...entityProps} /> : undefined;

  return (
    <div id={styles.datasetFeatContainer}>
      <div className={styles.datasetFeatGraph}>
        {isLoading || !datasetSlug || kgFetchError ? (
          <div className={styles.emptyDatasetFeat}>
            <EntityCardSkeleton />
          </div>
        ) : (
          datasetCard
        )}
      </div>
      <div className={styles.datasetFeatTitle}>
        <h3>Plug and play datasets</h3>
        <p>
          Give your dataset a home. Package it with metadata and import it in to
          other projects. Share it with collaborators, and trace how your
          dataset gets used down the line.
        </p>
      </div>
      <div className={styles.datasetFeatContain}>
        <Link
          className={cx(
            "btn",
            "btn-rk-green",
            styles.btnContactUs,
            "align-self-start",
            "align-self-lg-center",
            "gap-2"
          )}
          to={`${Url.get(
            Url.pages.searchEntities
          )}?${paramsUrlStrExploreDatasets}`}
          target="_blank"
        >
          Explore datasets
        </Link>
      </div>
      <div className={cx("d-flex", "gap-3", styles.datasetFeatOtherLink)}>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={30} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="datasetFeatBtn"
              url={Docs.rtdPythonReferencePage(
                "commands/dataset.html#examples"
              )}
              title="Renku Datasets"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowFeatSection = ({ projectPath }: WhatIsRenkuProps) => {
  return (
    <div id={styles.workflowFeatContainer}>
      <div className={styles.workflowFeatGraph}>
        <img src={workflow_Graphic} loading="lazy" alt="yaml workflow file" />
      </div>
      <div className={styles.workflowFeatTitle}>
        <h3>Keep track of how code and data connect</h3>
      </div>
      <div className={styles.workflowFeatContain}>
        <p>
          Use the simple Renku workflow file to organize your data processing
          pipeline. Easily rerun your whole workflow, or just specific steps.
        </p>
        <div>
          {projectPath && (
            <Link
              className={cx(
                "btn",
                "btn-rk-green",
                styles.btnContactUs,
                "align-self-start",
                "align-self-lg-center",
                "gap-2"
              )}
              to={Url.get(Url.pages.project.workflows, {
                namespace: "",
                path: projectPath,
              })}
              target="_blank"
            >
              Check out workflows
            </Link>
          )}
        </div>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={30} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="workflowsFeatBtn"
              url={Docs.rtdTopicGuide("workflows/index.html")}
              title="Renku Workflows"
            />{" "}
            on RenkuLab
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreFeatSection = () => {
  return (
    <div id={styles.exploreFeatContainer}>
      <div className={styles.exploreFeatGraph}>
        <img src={searchGraphic} alt="Entity search Graphic" loading="lazy" />
      </div>
      <div className={styles.exploreFeatText}>
        <h3>Explore and Connect</h3>
      </div>
      <div className={styles.exploreFeatInput}>
        <p>
          Our Renku search page allows researchers and project managers to find
          resources through projects and datasets.
        </p>
        <SearchInput />
      </div>
    </div>
  );
};

interface WhatIsRenkuProps {
  projectPath: string;
  datasetSlug?: string;
}
export default function WhatIsRenku({
  projectPath,
  datasetSlug = "",
}: WhatIsRenkuProps) {
  return (
    <div id="rk-anon-home-what-is-renku">
      <div id={styles.featContainer} className="rk-anon-home-section-content">
        <ShareFeatSection projectPath={projectPath} />
        <EnvFeatSection projectPath={projectPath} />
        <ComputeFeatSection projectPath={projectPath} />
        <ConnectFeatSection />
        <DatasetsFeatSection datasetSlug={datasetSlug} />
        <WorkflowFeatSection projectPath={projectPath} />
        <ExploreFeatSection />
      </div>
    </div>
  );
}
