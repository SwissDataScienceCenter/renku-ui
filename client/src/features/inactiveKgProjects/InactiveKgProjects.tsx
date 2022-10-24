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

import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useGetInactiveKgProjectsQuery } from "./InactiveKgProjectsApi";
import { Loader } from "../../utils/components/Loader";
import { Balloon, Briefcase, Table } from "../../utils/ts-wrappers";
import "./inactiveKgProjects.css";
import {
  addFullList,
  updateProgress,
  useInactiveProjectSelector
} from "./inactiveKgProjectsSlice";
import AppContext from "../../utils/context/appContext";
import { WsMessage } from "../../websocket/WsMessages";
import KgActivationHeader from "./components/KgActivationHeader";
import ActivationProgress from "./components/ActivationProgress";

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
  socket: any;
}

function InactiveKGProjectsPage({ socket }: InactiveKGProjectsPageProps) {
  const [activating, setActivating] = useState(false);
  const user = useSelector((state: any) => state.stateModel.user);
  const websocket = useSelector((state: any) => state.stateModel.webSocket);
  const kgActivation = useSelector((state: any) => state.stateModel.kgActivation?.status);
  const { data, isFetching, isLoading } = useGetInactiveKgProjectsQuery(user?.data?.id);
  const projectList = useInactiveProjectSelector(
    (state) => state.kgInactiveProjects
  );
  // @ts-ignore
  const { client } = useContext(AppContext);
  const dispatch = useDispatch();

  // hook to update project list when projects pending to activate change
  useEffect(() => {
    if (!projectList.length)
      dispatch(addFullList(data ?? []));
  }, [data]); // eslint-disable-line

  // hook to modify progress when activation status change
  useEffect(() => {
    if (kgActivation) {
      Object.keys(kgActivation).forEach( (projectId: string) => {
        const id = parseInt(projectId);
        if (id > 0) {
          const status = kgActivation[projectId] ?? null;
          dispatch(updateProgress({ id, progress: status }));
          if (status >= 0 || status < 100)
            setActivating(true);
        }
      });
    }
  }, [kgActivation]); // eslint-disable-line

  // hook to calculate if still activating a project of the list
  useEffect(() => {
    const totalCompleted = projectList.filter(p => p.progressActivation === 100 || p.progressActivation === -2).length;
    const totalSelected = projectList.filter(p => p.selected).length;
    if (totalCompleted === totalSelected)
      setActivating(false);
  }, [projectList]);


  const onMasterCheck = (isChecked: boolean) => {
    let tempList = projectList.map((project) => {
      return { ...project, selected: isChecked };
    });
    dispatch(addFullList(tempList));
  };

  const onItemCheck = (isChecked: boolean, item: InactiveKgProjects) => {
    let tempList = projectList.map((project) => {
      if (project.id === item.id)
        return { ...project, selected: isChecked };
      return project;
    });
    dispatch(addFullList(tempList));
  };

  const activateProjects = () => {
    setActivating(true);
    if (client) {
      const projectSelected = projectList.filter( p => p.selected && p.progressActivation !== 100);
      for (let i = 0 ; i < projectSelected.length; i++) {
        client.createGraphWebhook(projectSelected[i].id);
        dispatch(updateProgress({ id: projectSelected[i].id, progress: 0 }));
      }
      const projectIds = projectSelected.map( p => p.id);
      if (websocket.open && socket) {
        const message = JSON.stringify(new WsMessage({ projects: projectIds }, "pullKgActivationStatus"));
        socket.send(message);
      }
      else {
        setActivating(false);
      }
    }
  };

  const totalSelected = (projectList.filter((p) => p.selected && p.progressActivation !== 100))?.length ?? 0;
  const totalPending = (projectList.filter((p) => p.progressActivation !== 100))?.length ?? 0;
  const activationButton = <button
    className="btn btn-rk-green"
    disabled={activating}
    onClick={() => activateProjects()}>
    { activating ? "Activating..." : `Activate ${totalSelected} ${totalSelected > 1 ? "projects" : "project"}` }
  </button>;


  if (isFetching || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 flex-column fst-italic">
        <Loader />Loading projects.
      </div>);
  }
  const totalActive = (projectList.filter((p) => p.progressActivation === 100))?.length ?? 0;

  const content = projectList.length !== totalActive ?
    (
      <div className="col-md-12 p-4 border-radius-8 bg-white">
        <div className="pb-4">
          {activationButton}
        </div>
        <Table hover borderless responsive className="table inactive-kg-projects-table">
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
              <th scope="col" className="text-rk-text small">Name</th>
              <th scope="col" className="text-rk-text small">Namespace</th>
              <th scope="col" className="text-rk-text small">Visibility</th>
              <th scope="col" className="text-rk-text small">Status</th>
            </tr>
          </thead>
          <tbody>
            {projectList.map((project) => (
              <tr key={project.id} className={project.selected ? "selected" : ""}>
                <th scope="row">
                  {project.progressActivation !== 100 ?
                    <input
                      type="checkbox"
                      checked={project.selected}
                      className="form-check-input"
                      disabled={activating}
                      id={`rowCheck${project.id}`}
                      onChange={(e) => onItemCheck(e.target.checked, project)}
                    /> : null
                  }
                </th>
                <td>
                  <Link to={`/projects/${project.namespaceWithPath}`}
                    className="d-flex align-items-center text-rk-green gap-1 text-decoration-none text-truncate">
                    <Briefcase title="project" />{project.title}</Link>
                </td>
                <td>{project.namespaceWithPath}</td>
                <td className="text-capitalize">{project.visibility}</td>
                <td><ActivationProgress project={project} /></td>
              </tr>
            ))}
          </tbody>
        </Table>

      </div>
    ) :
    (
      <div className="col-md-12 p-4 border-radius-8 bg-white">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <Balloon size="30" /> All projects are in the Knowledge Graph.</div></div>
    );

  return (
    <div className="container form-rk-green">
      <div className="row">
        <KgActivationHeader />
      </div>
      <div className="row">
        {content}
      </div>
    </div>
  );
}

export default InactiveKGProjectsPage;
