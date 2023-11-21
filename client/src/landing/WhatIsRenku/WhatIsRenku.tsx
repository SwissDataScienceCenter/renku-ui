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

import cx from "classnames";
import { BookmarksFill, Send, TerminalFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { ExternalLink } from "../../components/ExternalLinks";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import EntityCardSkeleton from "../../components/list/EntityCardSkeleton";
import ListCard from "../../components/list/ListCard";
import { stateToSearchString } from "../../features/kgSearch";
import { KgAuthor } from "../../features/kgSearch/KgSearch";
import { useGetDatasetKgQuery } from "../../features/project/projectKg.api";
import { Docs, RenkuContactEmail } from "../../utils/constants/Docs";
import { mapDatasetKgResultToEntity } from "../../utils/helpers/KgSearchFunctions";
import { Url } from "../../utils/helpers/url";
import SSH_Graphic from "../Graphics/SSH_Graphic.png";
import compute_Graphic from "../Graphics/computoOptions.svg";
import workflow_Graphic from "../Graphics/my-workflow.svg";
import puzzleGraphic from "../Graphics/puzzlePieces.svg";
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
    state: { fromLanding: true },
    search: type === "autostart" ? "autostart=1" : "",
  };
  return (
    <Link
      className={cx([
        "btn",
        "btn-rk-green",
        styles.btnContactUs,
        "align-self-start",
        "align-self-lg-center",
        "gap-2",
      ])}
      to={url}
    >
      {btnTitle}
    </Link>
  );
};
const ShareFeatSection = ({ projectPath }: WhatIsRenkuProps) => {
  return (
    <div id={styles.shareFeatContainer}>
      <div className={styles.shareFeatGraph}>
        <img src={puzzleGraphic} alt="Puzzle Graph" loading={"lazy"} />
      </div>
      <div className={styles.shareFeatText}>
        <h3>Share your whole project, not just your code.</h3>
        <p>
          A Renku project brings together your code, data, environment, and
          workflows.
        </p>
      </div>
      <div className={styles.shareFeatBtn}>
        <TryOutSessionBtn
          projectPath={projectPath}
          type="autostart"
          btnTitle="Explore a RenkuLab Project"
        />
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
        <img
          src={compute_Graphic}
          alt="Compute Options Graph"
          loading={"lazy"}
        />
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
      <div className={cx(["d-flex", "gap-3", styles.computeFeatOtherLink])}>
        <div className="mt-1">
          <Send size={30} />
        </div>
        <div className={styles.computeFeatSubtext}>
          <span className="fw-bold d-block">
            Want to take your Renku project to the next level?
          </span>
          <ExternalLink
            className={"text-black"}
            role="link"
            id="computeFeat_link"
            url={`mailto:${RenkuContactEmail}?subject=Renkulab%20compute%20resources`}
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
        <img src={SSH_Graphic} loading="lazy" />
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
        <p>
          No need to keep collaborator’s environments in sync- collaborators can
          open the same environment.
        </p>
        <div className={cx([styles.featDocLinks, "flex-wrap"])}>
          <TerminalFill size={25} />
          <div>
            Try out the{" "}
            <ExternalLink
              color=""
              role="link"
              id="shareFeat_btn"
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
              id="shareFeat_btn"
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
              id="shareFeat_btn"
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
    author: "all" as KgAuthor,
  });
  const {
    data: kgDataset,
    error: kgFetchError,
    isFetching: isKgFetching,
    isLoading: isKgLoading,
  } = useGetDatasetKgQuery({ id: datasetSlug ?? "" }, { skip: !datasetSlug });

  const isLoading = isKgLoading || isKgFetching;

  const entityProps =
    !isLoading && kgDataset ? mapDatasetKgResultToEntity(kgDataset) : undefined;

  const datasetCard = entityProps ? <ListCard {...entityProps} /> : undefined;

  return (
    <div id={styles.datasetFeatContainer}>
      <div className={styles.datasetFeatGraph}>
        {isLoading ? (
          <EntityCardSkeleton />
        ) : !datasetSlug ? (
          <>
            <span className={cx(["fst-italic", "fs-small", "text-danger"])}>
              No dataset to load, set datasetSlug in renku-ui values
            </span>
            <EntityCardSkeleton />
          </>
        ) : kgFetchError ? (
          <>
            <span className={cx(["fst-italic", "fs-small", "text-danger"])}>
              Error loading dataset {datasetSlug}{" "}
            </span>
            <EntityCardSkeleton />
          </>
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
          className={cx([
            "btn",
            "btn-rk-green",
            styles.btnContactUs,
            "align-self-start",
            "align-self-lg-center",
            "gap-2",
          ])}
          to={`${Url.get(
            Url.pages.searchEntities
          )}?${paramsUrlStrExploreDatasets}`}
        >
          Try out datasets
        </Link>
      </div>
      <div className={cx(["d-flex", "gap-3", styles.datasetFeatOtherLink])}>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={30} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="shareFeat_btn"
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
        <img src={workflow_Graphic} loading="lazy" />
      </div>
      <div className={styles.workflowFeatTitle}>
        <h3>Keep track of how code and data connect with workflows</h3>
      </div>
      <div className={styles.workflowFeatContain}>
        <p>
          Use the simple Renku workflow file to organize your data processing
          pipeline. Easily rerun your whole workflow, or just a few steps.
        </p>
        <div>
          <Link
            className={cx([
              "btn",
              "btn-rk-green",
              styles.btnContactUs,
              "align-self-start",
              "align-self-lg-center",
              "gap-2",
            ])}
            to={Url.get(Url.pages.project.workflows, {
              namespace: "",
              path: projectPath,
            })}
          >
            Checkout workflows
          </Link>
        </div>
        <div className={styles.featDocLinks}>
          <BookmarksFill size={30} />
          <div>
            Learn more about{" "}
            <ExternalLink
              color=""
              role="link"
              id="shareFeat_btn"
              url={Docs.rtdHowToGuide("workflows/index.html")}
              title="Renku Workflows"
            />{" "}
            on RenkuLab
          </div>
        </div>
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
      </div>
    </div>
  );
}
