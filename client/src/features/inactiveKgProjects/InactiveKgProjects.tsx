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

import { useCallback, useContext, useEffect, useState } from "react";
import { Balloon, Briefcase } from "react-bootstrap-icons";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Table } from "reactstrap";

import { Loader } from "../../components/Loader";
import AppContext from "../../utils/context/appContext";
import useGetInactiveProjects from "../../utils/customHooks/UseGetInactiveProjects";
import { sendPullKgActivationStatus } from "../../websocket/WsMessages";
import { useActivateIndexingMutation } from "../project/projectKg.api";
import ActivationProgress from "./components/ActivationProgress";
import KgActivationHeader from "./components/KgActivationHeader";
import "./inactiveKgProjects.css";
import {
  ActivationStatusProgressSpecial,
  addFullList,
  updateList,
  updateAllSelected,
  updateProgress,
  useInactiveProjectSelector,
} from "./inactiveKgProjectsSlice";
import { InactiveKgProjects } from "./inactiveKgProjects.types";
import {
  filterProgressingProjects,
  hasActivationTerminated,
} from "./inactiveKgProjects.utils";

function ActivatingInfo({ activating }: { activating: boolean }) {
  if (!activating) return null;
  return (
    <div className="small py-2 fst-italic">
      Indexing may take several minutes, you can continue interacting with the
      application and receive a notification when it is finished. Or restart the
      process at any time.
    </div>
  );
}

type ActivationButtonProps = {
  activating: boolean;
  activateProjects: () => void;
  totalSelected: number;
};
function ActivationButton({
  activating,
  activateProjects,
  totalSelected,
}: ActivationButtonProps) {
  return (
    <Button
      className="btn-rk-green"
      disabled={activating || totalSelected < 1}
      onClick={activateProjects}
    >
      {activating ? (
        <>
          <Loader className="me-1" inline size={16} />
          Activating...
        </>
      ) : (
        `Activate indexing on ${totalSelected} ${
          totalSelected === 1 ? "project" : "projects"
        }`
      )}
    </Button>
  );
}

function AllProjectsIndexed() {
  return (
    <div className="container form-rk-green">
      <div className="row">
        <KgActivationHeader />
      </div>
      <div className="row">
        <div className="col-md-12 p-4 border-radius-8 bg-white">
          <div className="d-flex justify-content-center align-items-center gap-2">
            <Balloon size="30" /> Indexing has been activated for all projects.
          </div>
        </div>
      </div>
    </div>
  );
}

type InactiveProjectRowProps = {
  activating: boolean;
  onItemCheck: (isChecked: boolean, item: InactiveKgProjects) => void;
  project: InactiveKgProjects;
};
function InactiveProjectRow({
  project,
  activating,
  onItemCheck,
}: InactiveProjectRowProps) {
  return (
    <tr className={project.selected ? "selected" : ""}>
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
  );
}

type InactiveProjectsTableProps = {
  activating: boolean;
  onAllItemsCheck: (isChecked: boolean) => void;
  onItemCheck: (isChecked: boolean, item: InactiveKgProjects) => void;
  projectList: InactiveKgProjects[];
  totalSelected: number;
  totalPending: number;
};
function InactiveProjectsTable({
  activating,
  onAllItemsCheck,
  onItemCheck,
  projectList,
  totalSelected,
  totalPending,
}: InactiveProjectsTableProps) {
  return (
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
              id="allItemsCheck"
              onChange={(e) => onAllItemsCheck(e.target.checked)}
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
          <InactiveProjectRow
            key={project.id}
            activating={activating}
            onItemCheck={onItemCheck}
            project={project}
          />
        ))}
      </tbody>
    </Table>
  );
}

interface InactiveKGProjectsPageProps {
  socket: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface ProjectsNotIndexedPageProps extends InactiveKGProjectsPageProps {
  projectList: InactiveKgProjects[];
}

function ProjectsNotIndexedPage({
  projectList,
  socket,
}: ProjectsNotIndexedPageProps) {
  const [activating, setActivating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activateIndexing, _] = useActivateIndexingMutation();
  const websocket = useSelector(
    (state: RootStateOrAny) => state.stateModel.webSocket
  );
  const { client } = useContext(AppContext);
  const dispatch = useDispatch();

  // hook to calculate if still activating a project of the list
  useEffect(() => {
    const totalProgressing = filterProgressingProjects(projectList).length;
    const totalCompleted = projectList.filter(hasActivationTerminated).length;
    const totalSelected = projectList.filter((p) => p.selected).length;
    if (totalProgressing > 0) setActivating(true);
    if (totalCompleted === totalSelected) setActivating(false);
  }, [projectList]);

  const onAllItemsCheck = useCallback(
    (isChecked: boolean) => {
      dispatch(updateAllSelected(isChecked));
    },
    [dispatch]
  );

  const onItemCheck = useCallback(
    (isChecked: boolean, item: InactiveKgProjects) => {
      const project = projectList.find((project) => project.id === item.id);
      if (project == null) return;
      dispatch(
        updateList({
          ...project,
          progressActivation: null,
          selected: isChecked,
        })
      );
    },
    [dispatch, projectList]
  );

  const activateProjects = () => {
    setActivating(true);
    if (client && websocket.open && socket) {
      const projectSelected = projectList.filter(
        (p) => p.selected && p.progressActivation !== 100
      );
      for (let i = 0; i < projectSelected.length; i++) {
        const projectId = projectSelected[i].id;
        dispatch(
          updateProgress({
            id: projectId,
            progress: ActivationStatusProgressSpecial.QUEUED,
          })
        );
        activateIndexing(projectId);
        sendPullKgActivationStatus([projectId], socket);
      }
    } else {
      setActivating(false);
    }
  };

  const nonTerminatedProjects = projectList.filter(
    (p) => !hasActivationTerminated(p)
  );
  const totalNonTerminated = nonTerminatedProjects.length;
  const totalSelected = nonTerminatedProjects.filter((p) => p.selected).length;
  useEffect(() => {
    if (activating && totalSelected === 0) setActivating(false);
  }, [activating, totalSelected]);

  return (
    <div className="container form-rk-green">
      <div className="row">
        <KgActivationHeader />
      </div>
      <div className="row">
        <div className="col-md-12 p-4 border-radius-8 bg-white">
          <div className="pb-4">
            <ActivationButton
              activating={activating}
              activateProjects={activateProjects}
              totalSelected={totalSelected}
            />
            <ActivatingInfo activating={activating} />
          </div>
          <InactiveProjectsTable
            activating={activating}
            onAllItemsCheck={onAllItemsCheck}
            onItemCheck={onItemCheck}
            projectList={projectList}
            totalSelected={totalSelected}
            totalPending={totalNonTerminated}
          />
        </div>
      </div>
    </div>
  );
}

function InactiveKGProjectsPage({ socket }: InactiveKGProjectsPageProps) {
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const { data, isFetching, isLoading, error } = useGetInactiveProjects(
    user?.data?.id
  );
  const projectList = useInactiveProjectSelector();
  const dispatch = useDispatch();

  // hook to update project list when projects pending to activate change
  useEffect(() => {
    if (!isFetching && !error && !projectList.length)
      dispatch(addFullList(data ?? []));
  }, [data, isFetching, error]); // eslint-disable-line

  if (isFetching || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 flex-column fst-italic">
        <Loader />
        Loading projects...
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
  const totalCompleted =
    projectList.filter((p) => p.progressActivation === 100)?.length ?? 0;
  if (projectList.length === 0 || projectList.length === totalCompleted)
    return <AllProjectsIndexed />;

  return <ProjectsNotIndexedPage projectList={projectList} socket={socket} />;
}

export default InactiveKGProjectsPage;
