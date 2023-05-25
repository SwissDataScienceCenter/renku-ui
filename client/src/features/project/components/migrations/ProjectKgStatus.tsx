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

import React, { useEffect, useState } from "react";
import { Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import {
  faArrowAltCircleUp,
  faCheckCircle,
  faExclamationCircle,
  faPlusCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

import { ProjectIndexingStatusResponse } from "../../Project";
import { ProjectIndexingStatuses } from "../../projectEnums";
import { projectKgApi } from "../../projectKgApi";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Docs } from "../../../../utils/constants/Docs";
import {
  CompositeTitle,
  DetailsSection,
  MoreInfoLink,
} from "./MigrationHelpers";

interface ProjectKnowledgeGraphProps {
  isMaintainer: boolean;
  projectId: number;
}
export function ProjectKnowledgeGraph({
  isMaintainer,
  projectId,
}: ProjectKnowledgeGraphProps) {
  const LONG_POLLING = 2 * 2.6 * 1000;
  const NO_POLLING = 0;
  const SHORT_POLLING = 5 * 1000;

  const [showDetails, setShowDetails] = useState(false);
  const [justChanged, setJustChanged] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(0);
  const toggleShowDetails = () => setShowDetails(!showDetails);

  const skip = !projectId;
  const { data, isFetching, isLoading, isUninitialized, error } =
    projectKgApi.useGetProjectIndexingStatusQuery(projectId, {
      refetchOnMountOrArgChange: 20,
      skip,
      pollingInterval,
    });
  const [activateIndexing, activateIndexingStatus] =
    projectKgApi.useActivateIndexingMutation();

  // Add polling for non-activated projects
  useEffect(() => {
    if (!isUninitialized && !isLoading) {
      if (!data?.activated) setPollingInterval(LONG_POLLING);
      else if (data?.details?.status === ProjectIndexingStatuses.InProgress)
        setPollingInterval(SHORT_POLLING);
      else setPollingInterval(NO_POLLING);
    }
  }, [
    data,
    isLoading,
    isUninitialized,
    LONG_POLLING,
    NO_POLLING,
    SHORT_POLLING,
  ]);

  const sectionCyId = "kg-status";
  if (isLoading || skip || (isFetching && justChanged)) {
    const fetchingTitle =
      isLoading || skip
        ? "Fetching project metadata..."
        : "Refreshing project metadata...";
    return (
      <CompositeTitle
        icon={faTimesCircle}
        loading={true}
        sectionId={sectionCyId}
        showDetails={showDetails}
        title={fetchingTitle}
        toggleShowDetails={toggleShowDetails}
      />
    );
  }

  if (error) {
    return (
      <>
        <CompositeTitle
          icon={faExclamationCircle}
          level="danger"
          loading={false}
          sectionId={sectionCyId}
          showDetails={showDetails}
          title="Error on project metadata"
          toggleShowDetails={toggleShowDetails}
        />
        <Collapse isOpen={showDetails}>
          <RtkErrorAlert error={{ ...error }} />
        </Collapse>
      </>
    );
  }

  let icon = faCheckCircle;
  let level = "success";
  let title = "Knowledge Graph metadata";
  if (!data?.activated) {
    title = "Activate Knowledge Graph integration";
    level = "danger";
    icon = faExclamationCircle;
  } else if (data?.progress?.done !== data?.progress?.total) {
    title = "Knowledge Graph metadata (processing)";
    level = "info";
  } else if (data.details?.status === ProjectIndexingStatuses.Failure) {
    level = "info";
  }

  const canUpdate = !data?.activated ? true : false;
  const buttonIcon = canUpdate ? faPlusCircle : faArrowAltCircleUp;
  let buttonDisabled = isMaintainer ? false : true;
  const buttonDisabledTooltip = isMaintainer
    ? "Operation ongoing..."
    : "Only maintainers can do this.";
  const buttonId = "button-update-projectKnowledgeGraph";
  let buttonText = canUpdate ? "Activate" : undefined;
  if (activateIndexingStatus.isLoading) {
    buttonDisabled = true;
    buttonText = "Activating";
  }
  const buttonAction = () => {
    buttonText = "Activating";
    buttonDisabled = true;
    setJustChanged(true);
    // ? even tho we rely on tags to refresh, we reset `justChanged` after re-fetching to prevent
    // ? showing unnecessary spinning wheels
    activateIndexing(projectId).then(() => {
      setTimeout(() => {
        setJustChanged(false);
      }, SHORT_POLLING * 0.75);
    });
  };

  return (
    <>
      <CompositeTitle
        buttonAction={buttonAction}
        buttonDisabled={buttonDisabled}
        buttonDisabledTooltip={buttonDisabledTooltip}
        buttonIcon={buttonIcon}
        buttonId={buttonId}
        buttonText={buttonText}
        icon={icon}
        level={level}
        loading={isLoading}
        sectionId={sectionCyId}
        showDetails={showDetails}
        title={title}
        toggleShowDetails={toggleShowDetails}
      />
      <KnowledgeGraphDetails
        data={data}
        isMaintainer={isMaintainer}
        showDetails={showDetails}
      />
    </>
  );
}

interface KnowledgeGraphDetailsProps {
  data: ProjectIndexingStatusResponse | undefined;
  isMaintainer: boolean;
  showDetails: boolean;
}
function KnowledgeGraphDetails({
  data,
  isMaintainer,
  showDetails,
}: KnowledgeGraphDetailsProps) {
  let content: React.ReactNode;
  if (!data) {
    content = <p>No details available</p>;
  } else {
    const titleId = "settings-kg-indexing";
    const titleInfo =
      "Service that processes project's metadata. RenkuLab requires it for most functionalities.";
    const titleDocsUrl = Docs.rtdTopicGuide(
      "miscellaneous/knowledge-graph.html"
    );
    if (data.activated) {
      const level =
        data.details?.status === ProjectIndexingStatuses.Success
          ? "success"
          : "info";
      let text = "Knowledge Graph integration"; // ? should overwrite this with something more specific
      let detailsElement: React.ReactNode = undefined;
      if (data.progress?.done === data.progress?.total) {
        if (data.details?.status === ProjectIndexingStatuses.Success) {
          text = "Everything processed";
        } else if (data.details?.status === ProjectIndexingStatuses.Failure) {
          text = "Everything processed*";
          if (data.details?.message) {
            const maintainerDetails = isMaintainer ? (
              <span>
                If you notice something wrong, please{" "}
                <Link to="/help">reach us</Link> reporting the link to your
                project and the error message.
                <br />
                <code>Error details: {data.details.message}</code>
              </span>
            ) : null;
            detailsElement = (
              <span>
                An error was raised while processing the metadata, which should
                not have consequences. {maintainerDetails}
              </span>
            );
          }
        }
      } else {
        text = "Processing data";
      }
      if (data.details?.status === ProjectIndexingStatuses.InProgress) {
        const detailsFirstPart = (
          <span>
            The Knowledge Graph is processing the project&apos;s events. Some
            information about the local entities might be unavailable or
            outdated until this process has finished.
          </span>
        );
        if (data.progress?.done === data.progress?.total) {
          detailsElement = detailsFirstPart;
        } else {
          detailsElement = (
            <>
              {detailsFirstPart}
              <br />
              <span className="d-block mt-2">
                Processing status: {data.progress?.percentage}%
              </span>
            </>
          );
        }
      }

      content = (
        <DetailsSection
          details={detailsElement}
          icon={faCheckCircle}
          level={level}
          text={text}
          title="Metadata"
          titleId={titleId}
          titleInfo={titleInfo}
          titleDocsUrl={titleDocsUrl}
        />
      );
    } else {
      const detailsText = (
        <span>
          The Knowledge Graph integration must be activated to use this project
          from the RenkuLab web interfaces. Otherwise, the functionalities will
          be limited, and the project will not be discoverable from the search
          page. <MoreInfoLink url={titleDocsUrl} />
        </span>
      );
      content = (
        <DetailsSection
          details={detailsText}
          icon={faExclamationCircle}
          level="danger"
          text="Not processed"
          title="Metadata"
          titleId={titleId}
          titleInfo={titleInfo}
          titleDocsUrl={titleDocsUrl}
        />
      );
    }
  }
  return <Collapse isOpen={showDetails}>{content}</Collapse>;
}
