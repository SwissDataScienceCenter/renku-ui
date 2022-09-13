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
import { Briefcase, Progress, Table } from "../../utils/ts-wrappers";
import "./inactiveKgProjects.css";
import { addFullList, updateList, useInactiveProjectSelector } from "../inactiveKgProjects/inactiveKgProjectsSlice";
import AppContext from "../../utils/context/appContext";

export interface InactiveKgProjects {
  id: string;
  title: string;
  namespaceWithPath: string;
  description: string;
  visibility: "Public" | "Private" | "Intern";
  selected: boolean;
  progressActivation: number;
}

function InactiveKGProjectsPage() {
  const [masterChecked, setMasterChecked] = useState(true);
  const [activating, setActivating] = useState(false);
  const user = useSelector((state: any) => state.stateModel.user);
  const { data, isFetching, isLoading } = useGetInactiveKgProjectsQuery(user?.data?.id);
  const projectList = useInactiveProjectSelector(
    (state) => state.kgInactiveProjects
  );
  // @ts-ignore
  const { client } = useContext(AppContext);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addFullList(data ?? []));
  }, [data]); // eslint-disable-line

  useEffect(() => {
    const totalCompleted = projectList.filter(p => p.progressActivation === 100 || p.progressActivation === -2).length;
    const totalSelected = projectList.filter(p => p.selected).length;
    if (totalCompleted === totalSelected)
      setActivating(false);
  }, [projectList]);


  const onMasterCheck = (isChecked: boolean) => {
    // Check/ UnCheck All Items
    let tempList = projectList.map((project) => {
      return { ...project, selected: isChecked };
    });
    setMasterChecked(isChecked);
    dispatch(addFullList(tempList));
  };

  const onItemCheck = (isChecked: boolean, item: InactiveKgProjects) => {
    let tempList = projectList.map((project) => {
      if (project.id === item.id)
        return { ...project, selected: isChecked };
      return project;
    });

    //To Control Master Checkbox State
    const totalItems = projectList.length;
    const totalCheckedItems = tempList.filter((project) => project.selected).length;

    // Update State
    setMasterChecked(totalItems === totalCheckedItems);
    dispatch(addFullList(tempList));
  };

  const activateProjects = () => {
    setActivating(true);
    if (client) {
      projectList.forEach(project => {
        if (project.selected) {
          client.createGraphWebhook(project.id)
            .then((resp: any) => {
              dispatch(updateList({ ...project, progressActivation: 0 }));
            })
            .catch((err: any) => {
              dispatch(updateList({ ...project, progressActivation: -2 }));
            });
        }
      });
    }
  };

  const totalSelected = (projectList.filter((p) => p.selected))?.length ?? 0;
  const activationButton = <button
    className="btn btn-rk-green"
    disabled={activating}
    onClick={() => activateProjects()}>
    { activating ? "Activating..." : `Activate ${totalSelected} ${totalSelected > 1 ? "projects" : "project"}` }
  </button>;


  if (isFetching || isLoading)
    return <Loader size="19" inline="true" />;

  return (
    <div className="container form-rk-green">
      <div className="row">
        <div className="col-md-12 p-4 border-radius-8 bg-white">
          <div className="d-flex justify-content-between align-items-center pb-4">
            <div>
              {activationButton}
            </div>
            <div className="small">
              Selected Projects {totalSelected}
            </div>
          </div>
          <Table hover borderless responsive className="table inactive-kg-projects-table">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={masterChecked}
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
                    <input
                      type="checkbox"
                      checked={project.selected}
                      className="form-check-input"
                      disabled={activating}
                      id={`rowCheck${project.id}`}
                      onChange={(e) => onItemCheck(e.target.checked, project)}
                    />
                  </th>
                  <td>
                    <Link to={`/projects/${project.namespaceWithPath}`}
                      className="d-flex align-items-center text-rk-green gap-1 text-decoration-none">
                      <Briefcase title="project" />{project.title}</Link>
                  </td>
                  <td>{project.namespaceWithPath}</td>
                  <td className="text-capitalize">{project.visibility}</td>
                  <td>
                    <ActivationProgress project={project} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        </div>
      </div>
    </div>
  );
}

interface ActivationProgressProps {
  project: InactiveKgProjects;
}
function ActivationProgress({ project }: ActivationProgressProps) {
  if (project.progressActivation === -1)
    return <small>Pending to activate</small>;

  if (project.progressActivation === -2)
    return <small className="text-danger">There was an error in activating the KG. Please contact us for help. </small>;

  return <Progress
    className="my-3"
    style={{
      height: "4px"
    }}
    value={project.progressActivation}
  />;
}

export default InactiveKGProjectsPage;
