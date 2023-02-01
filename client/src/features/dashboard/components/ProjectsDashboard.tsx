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
import { SearchEntitiesQueryParams, useSearchEntitiesQuery } from "../../kgSearch/KgSearchApi";
import { SortingOptions } from "../../../utils/components/sortingEntities/SortingEntities";
import { InfoAlert } from "../../../utils/components/Alert";
import React, { Fragment } from "react";
import { Docs } from "../../../utils/constants/Docs";
import { ExternalLink } from "../../../utils/components/ExternalLinks";
import { Link, useHistory } from "react-router-dom";
import { urlMap } from "../../../project/list/ProjectList.container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Url } from "../../../utils/helpers/url";
import ListDisplay from "../../../utils/components/List";
import { Loader } from "../../../utils/components/Loader";
import { useDispatch } from "react-redux";
import { setAuthor, setType } from "../../kgSearch/KgSearchSlice";
import { KgAuthor } from "../../kgSearch/KgSearch";
import { Button } from "../../../utils/ts-wrappers";
import useGetRecentlyVisitedProjects from "../../../utils/customHooks/useGetRecentlyVisitedProjects";

interface ProjectAlertProps {
  total?: number;
}
function ProjectAlert({ total }: ProjectAlertProps) {
  if (total === undefined)
    return null;

  return total === 0 ?
    <InfoAlert timeout={0}>
      <div data-cy="project-alert" className="mb-0" style={{ textAlign: "justify" }}>
        <h3><strong>You do not have any projects yet.</strong></h3>
        <p>If you are here for your first time, we recommend you go to through our{" "}
          <ExternalLink role="text" title="tutorial" className="fw-bold"
            url={Docs.READ_THE_DOCS_TUTORIALS_STARTING} />.{" "}
          You can also <ExternalLink role="text" title="create a new project"
            url="/projects/new" className="fw-bold" />,{" "}
          <ExternalLink role="text" title="explore other projects" url="/search" className="fw-bold" /> or {" "}
          <ExternalLink role="text" title="search" url="/search" className="fw-bold" />{" "}
          for a specific project or dataset.</p>
      </div>
    </InfoAlert> : null;
}

interface OtherProjectsButtonProps {
  totalOwnProjects: number;
}
function OtherProjectsButton({ totalOwnProjects }: OtherProjectsButtonProps) {
  const dispatch = useDispatch();
  const history = useHistory();
  const handleOnClick = (e: React.MouseEvent<HTMLElement>, author: KgAuthor) => {
    e.preventDefault();
    dispatch(setType({ project: true, dataset: false }));
    dispatch(setAuthor(author));
    history.push(Url.get(Url.pages.searchEntities));
  };
  return totalOwnProjects > 0 ?
    (
      <div className="d-flex justify-content-center">
        <Button data-cy="view-my-projects-btn" className="btn btn-outline-rk-green"
          onClick={(e: React.MouseEvent<HTMLElement>) => handleOnClick(e, "user")}>
          <div className="d-flex gap-2 text-rk-green">
            <img src="/frame.svg" className="rk-icon rk-icon-md" />View all my Projects</div>
        </Button></div>
    ) :
    (<div className="d-flex justify-content-center">
      <Button data-cy="explore-other-projects-btn" className="btn btn-outline-rk-green"
        onClick={(e: React.MouseEvent<HTMLElement>) => handleOnClick(e, "all")}>
        <div className="d-flex gap-2 text-rk-green">
          <img src="/explore.svg" className="rk-icon rk-icon-md" />Explore other Projects</div>
      </Button></div>);
}

interface ProjectListProps {
  projects: any [];
  gridDisplay: boolean;
}
function ProjectListRows({ projects, gridDisplay }: ProjectListProps) {
  const projectItems = projects.map(project => {
    const namespace = project.namespace ? project.namespace.full_path : "";
    const path = project.path;
    const url = Url.get(Url.pages.project, { namespace, path });
    return {
      id: project.id,
      url: url,
      itemType: "project",
      title: project.name,
      creators: project.owner ? [project.owner] : [project.namespace],
      slug: project.path_with_namespace,
      description: project.description,
      tagList: project.tag_list,
      timeCaption: project.last_activity_at,
      imageUrl: project.avatar_url,
      visibility: project.visibility
    };
  });

  return <Fragment>
    <ListDisplay
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
        500: 1
      }}
    />
  </Fragment>;
}

const TOTAL_RECENTLY_VISITED_PROJECT = 5;
interface ProjectsDashboardProps {
  userName: string;
}
function ProjectsDashboard( { userName }: ProjectsDashboardProps ) {
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
  const { data, isFetching, isLoading, error } = useSearchEntitiesQuery(searchRequest);
  const { projects, isFetchingProjects } = useGetRecentlyVisitedProjects(TOTAL_RECENTLY_VISITED_PROJECT);
  const totalUserProjects = isFetching || isLoading || !data || error ? undefined : data.total;
  let projectsToShow;
  if (isFetchingProjects) {
    projectsToShow = <Loader />;
  }
  else {
    projectsToShow = projects?.length > 0 ?
      <ProjectListRows projects={projects} gridDisplay={false} />
      : <p className="rk-dashboard-section-header">You do not have any recently-visited projects</p>;
  }
  const otherProjectsBtn = totalUserProjects === undefined ? null :
    <OtherProjectsButton totalOwnProjects={totalUserProjects} />;
  return (
    <>
      <ProjectAlert total={totalUserProjects} />
      <div className="rk-dashboard-project" data-cy="projects-container">
        <div className="rk-dashboard-section-header d-flex justify-content-between align-items-center flex-wrap">
          <h3 className="rk-dashboard-title" key="project-header">Projects</h3>
          <Link className="btn btn-secondary btn-icon-text rk-dashboard-link" role="button" to={urlMap.projectNewUrl}>
            <FontAwesomeIcon icon={faPlus} />
            <span className="rk-dashboard-link--text">Create a new project</span>
          </Link>
        </div>
        {projectsToShow}
        {otherProjectsBtn}
      </div>
    </>
  );

}

export { ProjectsDashboard };
