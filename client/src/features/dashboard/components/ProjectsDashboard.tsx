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
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { InfoAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import ListDisplay from "../../../components/List";
import { Loader } from "../../../components/Loader";
import { EnvironmentLogs } from "../../../components/Logs";
import ListBarSession from "../../../components/list/ListBarSessions";
import { SortingOptions } from "../../../components/sortingEntities/SortingEntities";
import { Notebook } from "../../../notebooks/components/session.types";
import { urlMap } from "../../../project/list/ProjectList.container";
import { Docs } from "../../../utils/constants/Docs";
import AppContext from "../../../utils/context/appContext";
import useGetRecentlyVisitedProjects from "../../../utils/customHooks/useGetRecentlyVisitedProjects";
import {
  cleanGitUrl,
  formatProjectMetadata,
} from "../../../utils/helpers/ProjectFunctions";
import { getFormattedSessionsAnnotations } from "../../../utils/helpers/SessionFunctions";
import { Url } from "../../../utils/helpers/url";
import { displaySlice, useDisplaySelector } from "../../display";
import { EntityType } from "../../kgSearch";
import { KgAuthor } from "../../kgSearch/KgSearch";
import {
  SearchEntitiesQueryParams,
  useSearchEntitiesQuery,
} from "../../kgSearch/KgSearchApi";
import { stateToSearchString } from "../../kgSearch/KgSearchState";
import { useGetSessionsQuery } from "../../session/sessions.api";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProjectAlertProps {
  total?: number;
}
function ProjectAlert({ total }: ProjectAlertProps) {
  if (total === undefined) return null;

  return total === 0 ? (
    <InfoAlert timeout={0}>
      <div
        data-cy="project-alert"
        className="mb-0"
        style={{ textAlign: "justify" }}
      >
        <h3>
          <strong>You do not have any projects yet.</strong>
        </h3>
        <p>
          If you are here for your first time, we recommend you go to through
          our{" "}
          <ExternalLink
            role="text"
            title="tutorial"
            className="fw-bold"
            url={Docs.READ_THE_DOCS_TUTORIALS_STARTING}
          />
          . You can also{" "}
          <ExternalLink
            role="text"
            title="create a new project"
            url="/projects/new"
            className="fw-bold"
          />
          ,{" "}
          <ExternalLink
            role="text"
            title="explore other projects"
            url="/search"
            className="fw-bold"
          />{" "}
          or{" "}
          <ExternalLink
            role="text"
            title="search"
            url="/search"
            className="fw-bold"
          />{" "}
          for a specific project or dataset.
        </p>
      </div>
    </InfoAlert>
  ) : null;
}

interface OtherProjectsButtonProps {
  totalOwnProjects: number;
}
function OtherProjectsButton({ totalOwnProjects }: OtherProjectsButtonProps) {
  const projectFilters = { type: { project: true, dataset: false } };
  const paramsUrlStrMyProjects = stateToSearchString({
    ...projectFilters,
    author: "user" as KgAuthor,
  });
  const paramsUrlStrExploreProjects = stateToSearchString({
    ...projectFilters,
    author: "all" as KgAuthor,
  });
  return totalOwnProjects > 0 ? (
    <div className="d-flex justify-content-center mt-2">
      <Link
        to={`${Url.get(Url.pages.searchEntities)}?${paramsUrlStrMyProjects}`}
        data-cy="view-my-projects-btn"
        className="btn btn-outline-rk-green"
      >
        <div className="d-flex gap-2 text-rk-green">
          <img src="/frame.svg" className="rk-icon rk-icon-md" />
          View all my Projects
        </div>
      </Link>
    </div>
  ) : (
    <div className="d-flex justify-content-center mt-4">
      <Link
        to={`${Url.get(
          Url.pages.searchEntities
        )}?${paramsUrlStrExploreProjects}`}
        data-cy="explore-other-projects-btn"
        className="btn btn-outline-rk-green"
      >
        <div className="d-flex gap-2 text-rk-green">
          <img src="/explore.svg" className="rk-icon rk-icon-md" />
          Explore other Projects
        </div>
      </Link>
    </div>
  );
}

function getProjectFormatted(project: Record<string, any>) {
  const namespace = project.namespace ? project.namespace.full_path : "";
  const path = project.path;
  const url = Url.get(Url.pages.project, { namespace, path });
  // We use the externalUrl property, which typically doesn't include ".git".
  // However, in this context, the externalUrl is missing, so we remove ".git".
  const gitUrl = cleanGitUrl(project.http_url_to_repo);
  return {
    creators: project.owner ? [project.owner] : [project.namespace],
    description: project.description,
    gitUrl,
    id: project.id,
    imageUrl: project.avatar_url,
    itemType: "project",
    slug: project.path_with_namespace,
    tagList: project.tag_list,
    timeCaption: project.last_activity_at,
    title: project.name,
    url: url,
    visibility: project.visibility,
  };
}

interface ProjectListProps {
  projects: Record<string, any>[];
  gridDisplay: boolean;
}
function ProjectListRows({ projects, gridDisplay }: ProjectListProps) {
  const projectItems = projects?.map((project) => getProjectFormatted(project));

  return (
    <Fragment>
      <ListDisplay
        key="list-projects"
        itemsType="project"
        search={null}
        currentPage={null}
        gridDisplay={gridDisplay}
        totalItems={projectItems.length}
        perPage={projectItems.length}
        items={projectItems}
        gridColumnsBreakPoint={{
          default: 2,
          1100: 2,
          700: 2,
          500: 1,
        }}
      />
    </Fragment>
  );
}

const TOTAL_RECENTLY_VISITED_PROJECT = 5;
interface ProjectsDashboardProps {
  userName: string;
}
function ProjectsDashboard({ userName }: ProjectsDashboardProps) {
  const searchRequest: SearchEntitiesQueryParams = {
    phrase: "",
    sort: SortingOptions.DescMatchingScore,
    page: 1,
    perPage: 50,
    author: "user",
    type: {
      project: true,
      dataset: false,
    },
    userName,
  };
  const { data, isFetching, isLoading, error } =
    useSearchEntitiesQuery(searchRequest);

  const { data: sessions, isLoading: isLoadingSessions } =
    useGetSessionsQuery();

  const sessionsFormatted = getFormattedSessionsAnnotations(sessions ?? {});

  const { projects, isFetchingProjects } = useGetRecentlyVisitedProjects(
    TOTAL_RECENTLY_VISITED_PROJECT,
    sessionsFormatted
  );
  const totalUserProjects =
    isFetching || isLoading || !data || error ? undefined : data.total;
  let projectsToShow;
  if (isLoadingSessions || isFetchingProjects) {
    projectsToShow = <Loader />;
  } else {
    projectsToShow =
      projects?.length > 0 ? (
        <ProjectListRows projects={projects} gridDisplay={false} />
      ) : sessionsFormatted.length === 0 ? (
        <p className="rk-dashboard-section-header">
          You do not have any recently-visited projects
        </p>
      ) : null;
  }
  const otherProjectsBtn =
    totalUserProjects === undefined ? null : (
      <OtherProjectsButton totalOwnProjects={totalUserProjects} />
    );
  return (
    <>
      <ProjectAlert total={totalUserProjects} />
      <div className="rk-dashboard-project" data-cy="projects-container">
        <div className="rk-dashboard-section-header d-flex justify-content-between align-items-center flex-wrap">
          <h3 className="rk-dashboard-title" key="project-header">
            Projects
          </h3>
          <Link
            className="btn btn-secondary btn-icon-text rk-dashboard-link"
            role="button"
            to={urlMap.projectNewUrl}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="rk-dashboard-link--text">
              Create a new project
            </span>
          </Link>
        </div>
        <SessionsToShow currentSessions={sessionsFormatted} />
        {projectsToShow}
        {otherProjectsBtn}
      </div>
    </>
  );
}

interface SessionProject extends Record<string, any> {
  notebook: Notebook["data"];
}
interface SessionsToShowProps {
  currentSessions: Notebook["data"][];
}
function SessionsToShow({ currentSessions }: SessionsToShowProps) {
  const displayModal = useDisplaySelector((state) => state.modals.sessionLogs);
  const [items, setItems] = useState<any[]>([]);
  const { client } = useContext(AppContext);

  const dispatch = useDispatch();
  const showLogs = (target: string) => {
    dispatch(
      displaySlice.actions.showSessionLogsModal({ targetServer: target })
    );
  };

  useEffect(() => {
    // ? Using `async` inside `useEffect()` requires keeping track of the latest
    // ? promise and only letting that one commit to the component state.
    let ignoreUpdate = false;

    const getProjectCurrentSessions = async () => {
      const sessionProject: SessionProject[] = [];
      for (const session of currentSessions) {
        const fetchProject = await client.getProject(
          `${session.annotations["namespace"]}/${session.annotations["projectName"]}`
        );
        const project = getProjectFormatted(
          formatProjectMetadata(fetchProject?.data?.all)
        );
        sessionProject.push({ ...project, notebook: session });
      }
      // Commit the update only if this is the latest `useEffect()` call
      if (!ignoreUpdate) {
        setItems(sessionProject);
      }
    };
    getProjectCurrentSessions();

    return () => {
      ignoreUpdate = true;
    };
  }, [client, currentSessions]);

  if (items?.length) {
    const element = items.map((item: SessionProject) => {
      return (
        <Fragment key={item.id}>
          <EnvironmentLogs
            name={displayModal.targetServer}
            annotations={item.notebook?.annotations ?? {}}
          />
          <ListBarSession
            notebook={item.notebook}
            fullPath={item.slug}
            gitUrl={item.gitUrl}
            key={`session-${item.id}`}
            labelCaption=""
            tagList={item.tagList}
            visibility={item.visibility}
            slug={item.slug}
            creators={item.creators}
            timeCaption={item.timeCaption}
            description={item.description}
            id={item.id}
            url={item.url}
            title={item.title}
            itemType={EntityType.Project}
            imageUrl={item.imageUrl}
            showLogs={showLogs}
          />
        </Fragment>
      );
    });
    return <div className="session-list">{element}</div>;
  }
  return null;
}

export { ProjectsDashboard };
