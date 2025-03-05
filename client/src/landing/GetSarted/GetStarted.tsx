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
import { useContext } from "react";

import { ExternalDocsLink, ExternalLink } from "../../components/ExternalLinks";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import EntityCardSkeleton from "../../components/list/EntityCardSkeleton";
import ListCard from "../../components/list/ListCard";
import { useProjectMetadataQuery } from "../../features/project/projectKg.api";
import { Docs, RenkuContactEmail } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import { mapMetadataKgResultToEntity } from "../../utils/helpers/KgSearchFunctions";
import { AnonymousHomeConfig } from "../anonymousHome.types";

import styles from "./GetStarted.module.scss";

interface GetStartedProps extends AnonymousHomeConfig {
  sectionRef: React.MutableRefObject<HTMLDivElement | null>;
}
export default function GetStarted(props: GetStartedProps) {
  const projectPath = props.homeCustomized.projectPath;
  const { sectionRef } = props;
  const projectMetadataQuery = useProjectMetadataQuery(
    projectPath ? { projectPath } : skipToken
  );

  const isLoading =
    projectMetadataQuery.isLoading || projectMetadataQuery.isFetching;

  const entityProps =
    !isLoading && projectMetadataQuery?.data
      ? mapMetadataKgResultToEntity(projectMetadataQuery?.data)
      : undefined;

  const projectCard = entityProps ? (
    <ListCard {...entityProps} animated={true} fromLanding={true} />
  ) : undefined;

  // eslint-disable-next-line spellcheck/spell-checker
  const installRenku = "pipx install renku";
  return (
    <div id="rk-anon-home-get-started" ref={sectionRef}>
      <div className="rk-anon-home-section-content">
        <div id={styles.getStartedContainer}>
          <div className={styles.getStartedTitle}>
            <h2 className="text-rk-green">
              Renku is open source and free to use!
            </h2>
          </div>
          <div className={styles.getStartedProject}>
            {isLoading || !projectPath || projectMetadataQuery.isError ? (
              <EntityCardSkeleton />
            ) : (
              projectCard
            )}
          </div>
          <div className={styles.getStartedSubtitle}>
            <h3>
              <span className="fw-bold">Get started on RenkuLab</span> now with
              our free tier. Run compute sessions with up to 2 CPU and 8 GB RAM.
            </h3>
          </div>
          <div className={styles.getStartedDescription}>
            <div
              className={cx(
                "d-flex",
                "align-items-center",
                "gap-3",
                "flex-column",
                "flex-lg-row"
              )}
            >
              <p>
                <span className="fw-bold">Want more?</span> We offer more
                resources for researchers and instructors. Contact us to learn
                more.
              </p>
              <ContactUsLink />
            </div>
            <div>
              <p>
                Prefer to work from the comfort of your local environment?
                <span className={cx("d-lg-block", "d-sm-inline", "fw-bold")}>
                  {" "}
                  Try out the Renku CLI.
                </span>
              </p>
              <div
                className={cx(
                  "d-flex",
                  "flex-column",
                  "flex-md-row",
                  "align-content-start",
                  "align-items-md-center",
                  "gap-4",
                  "mt-2"
                )}
              >
                <div>
                  <CommandCopy command={installRenku} />
                </div>
                <ExternalDocsLink
                  url={Docs.rtdHowToGuide(
                    "own_machine/cli-installation.html#cli-installation.html"
                  )}
                  title="Read the documentation"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactUsLink() {
  const { params } = useContext(AppContext);
  const SESSION_CLASS_EMAIL_US =
    params?.SESSION_CLASS_EMAIL_US ??
    DEFAULT_APP_PARAMS["SESSION_CLASS_EMAIL_US"];

  const emailTo = SESSION_CLASS_EMAIL_US.enabled
    ? SESSION_CLASS_EMAIL_US.email.to
    : RenkuContactEmail;
  const url = new URL(`mailto:${emailTo}`);

  if (SESSION_CLASS_EMAIL_US.enabled && SESSION_CLASS_EMAIL_US.email.subject) {
    url.searchParams.set("subject", SESSION_CLASS_EMAIL_US.email.subject);
  }
  if (SESSION_CLASS_EMAIL_US.enabled && SESSION_CLASS_EMAIL_US.email.body) {
    const renderedBody = SESSION_CLASS_EMAIL_US.email.body.replace(
      /[{][{]full_name[}][}]/g,
      "<signature>"
    );
    url.searchParams.set("body", renderedBody);
  }
  const urlStr = url.toString().replace(/[+]/g, "%20");

  return (
    <ExternalLink
      className={cx(
        styles.btnContactUs,
        "align-self-start",
        "align-self-lg-center"
      )}
      color="outline-rk-green"
      role="button"
      id="Contact Us"
      url={urlStr}
    >
      Contact Us
    </ExternalLink>
  );
}
