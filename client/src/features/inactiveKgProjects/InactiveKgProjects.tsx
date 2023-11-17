/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { useContext, useEffect, useState } from "react";
import { Balloon, Briefcase } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Table } from "reactstrap";

import { Loader } from "../../components/Loader";
import AppContext from "../../utils/context/appContext";
import useGetInactiveProjects from "../../utils/customHooks/UseGetInactiveProjects";
import type { AppDispatch, RootState } from "../../utils/helpers/EnhancedState";
import { WsMessage } from "../../websocket/WsMessages";
import { projectKgApi } from "../project/projectKg.api";
import ActivationProgress from "./components/ActivationProgress";
import KgActivationHeader from "./components/KgActivationHeader";
import {
  addFullList,
  updateProgress,
  useInactiveProjectSelector,
} from "./inactiveKgProjectsSlice";

import "./inactiveKgProjects.css";

export interface InactiveKgProjects {
  id: number;
  title: string;
  namespaceWithPath: string;
  description: string;
  visibility: "Public" | "Private" | "Intern";
  selected: boolean;
  progressActivation: number;
}

interface InactiveKGProjectsPageProps {
  socket: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function InactiveKGProjectsPage({ socket }: InactiveKGProjectsPageProps) {
  const [activating, setActivating] = useState(false);
  const user = useSelector((state: RootState) => state.stateModel.user);
  const websocket = useSelector(
    (state: RootState) => state.stateModel.webSocket
  );
  const { data, isFetching, isLoading, error } = useGetInactiveProjects(
    user?.data?.id
  );
  const projectList = useInactiveProjectSelector();
  const { client } = useContext(AppContext);
  const dispatch = useDispatch();

  // hook to update project list when projects pending to activate change
  useEffect(() => {
    if (!isFetching && !error && !projectList.length)
      dispatch(addFullList(data ?? []));
  }, [data, isFetching, error]); // eslint-disable-line

  // hook to calculate if still activating a project of the list
  useEffect(() => {
    const inProgress = projectList.find(
      (p) => p.progressActivation !== 100 && p.progressActivation !== null
    );
    const totalCompleted = projectList.filter(
      (p) => p.progressActivation === 100 || p.progressActivation === -2
    ).length;
    const totalSelected = projectList.filter((p) => p.selected).length;
    if (inProgress) setActivating(true);
    if (totalCompleted === totalSelected) setActivating(false);
  }, [projectList]);

  const onMasterCheck = (isChecked: boolean) => {
    const tempList = projectList.map((project) => {
      return { ...project, selected: isChecked };
    });
    dispatch(addFullList(tempList));
  };

  const onItemCheck = (isChecked: boolean, item: InactiveKgProjects) => {
    const tempList = projectList.map((project) => {
      if (project.id === item.id) return { ...project, selected: isChecked };
      return project;
    });
    dispatch(addFullList(tempList));
  };

  // ? The logic here is wrong, this should be fixed or re-worked
  const activateProjects = () => {
    setActivating(true);
    if (client && websocket.open && socket) {
      const projectSelected = projectList.filter(
        (p) => p.selected && p.progressActivation !== 100
      );
      for (let i = 0; i < projectSelected.length; i++) {
        const projectId = projectSelected[i].id;
        (dispatch as AppDispatch)(
          projectKgApi.endpoints.activateIndexing.initiate(projectId)
        );
        dispatch(updateProgress({ id: projectId, progress: 0 }));
        const message = JSON.stringify(
          new WsMessage({ projects: [projectId] }, "pullKgActivationStatus")
        );
        socket.send(message);
      }
    } else {
      setActivating(false);
    }
  };

  const totalSelected =
    projectList.filter((p) => p.selected && p.progressActivation !== 100)
      ?.length ?? 0;
  const totalPending =
    projectList.filter((p) => p.progressActivation !== 100)?.length ?? 0;
  const activationButton = (
    <button
      className="btn btn-rk-green"
      disabled={activating}
      onClick={() => activateProjects()}
    >
      {activating
        ? "Activating..."
        : `Activate indexing on ${totalSelected} ${
            totalSelected > 1 ? "projects" : "project"
          }`}
    </button>
  );
  const activatingPlaceholder = activating ? (
    <div className="small py-2 fst-italic">
      Indexing may take several minutes, you can continue interacting with the
      application and receive a notification when it is finished. Or restart the
      process at any time.
    </div>
  ) : null;

  if (isFetching || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 flex-column fst-italic">
        <Loader />
        Loading projects.
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 flex-column fst-italic">
        Error loading projects, please refresh page to try again.
      </div>
    );
  }
  const totalActive =
    projectList.filter((p) => p.progressActivation === 100)?.length ?? 0;
  const content =
    projectList.length !== totalActive ? (
      <div className="col-md-12 p-4 border-radius-8 bg-white">
        <div className="pb-4">
          {activationButton}
          {activatingPlaceholder}
        </div>
        <Table
          hover
          borderless
          responsive
          className="table inactive-kg-projects-table"
        >
          <thead>
            <tr>
              <th scope="col" className="align-middle">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={totalSelected === totalPending}
                  disabled={activating}
                  id="masterCheck"
                  onChange={(e) => onMasterCheck(e.target.checked)}
                />
              </th>
              <th scope="col" className="text-rk-text small">
                Name
              </th>
              <th scope="col" className="text-rk-text small">
                Namespace
              </th>
              <th scope="col" className="text-rk-text small">
                Visibility
              </th>
              <th scope="col" className="text-rk-text small">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {projectList.map((project) => (
              <tr
                key={project.id}
                className={project.selected ? "selected" : ""}
              >
                <th scope="row">
                  {project.progressActivation !== 100 ? (
                    <input
                      type="checkbox"
                      checked={project.selected}
                      className="form-check-input"
                      disabled={activating}
                      id={`rowCheck${project.id}`}
                      onChange={(e) => onItemCheck(e.target.checked, project)}
                    />
                  ) : null}
                </th>
                <td className="project-title-table">
                  <Link
                    to={`/projects/${project.namespaceWithPath}`}
                    className="d-flex text-rk-green gap-1 text-decoration-none text-truncate align-items-center"
                  >
                    <Briefcase title="project" />
                    <span className="text-rk-green text-decoration-none text-truncate">
                      {project.title}
                    </span>
                  </Link>
                </td>
                <td className="project-title-table text-truncate">
                  {project.namespaceWithPath}
                </td>
                <td className="text-capitalize">{project.visibility}</td>
                <td>
                  <ActivationProgress project={project} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ) : (
      <div className="col-md-12 p-4 border-radius-8 bg-white">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <Balloon size="30" /> Indexing has been activated for all projects.
        </div>
      </div>
    );

  return (
    <div className="container form-rk-green">
      <div className="row">
        <KgActivationHeader />
      </div>
      <div className="row">{content}</div>
    </div>
  );
}

export default InactiveKGProjectsPage;
