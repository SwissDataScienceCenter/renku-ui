/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useCallback, useState } from "react";
import { Database } from "react-bootstrap-icons";
import { Loader } from "../../../../components/Loader.tsx";
import { PlusRoundButton } from "../../../../components/buttons/Button.tsx";
import AddCloudStorageModal from "../../../project/components/cloudStorage/CloudStorageModal.tsx";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { useGetStoragesV2Query } from "../../../projectsV2/api/storagesV2.api.ts";
import AccessGuard from "../../utils/AccessGuard.tsx";
import useProjectAccess from "../../utils/useProjectAccess.hook.ts";
import { DataSourceDisplay } from "./DataSourceDisplay.tsx";

export function DataSourcesDisplay({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useProjectAccess({ projectId: project.id });

  const { data, isFetching, isLoading } = useGetStoragesV2Query({
    projectId: project.id,
  });
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const totalStorages = !isLoading && !isFetching ? data?.length : 0;

  const contentLoading = (isLoading || isFetching) && (
    <div className="text-center">
      <Loader className={cx("me-3", "mt-3")} inline size={16} />
      <span className="fst-italic">Loading data sources</span>
    </div>
  );

  return (
    <>
      <div
        className={cx("p-3", "d-flex", "justify-content-between")}
        data-cy="data-source-box"
      >
        <div className="fw-bold">
          <Database size={20} className={cx("me-2")} />
          Data Sources ({totalStorages})
        </div>
        <AccessGuard
          disabled={null}
          enabled={
            <PlusRoundButton data-cy="add-data-source" handler={toggle} />
          }
          minimumRole="editor"
          role={userRole}
        />
      </div>
      {!isLoading && !isFetching && totalStorages === 0 ? (
        <p className="px-3">
          Add published datasets from data repositories, and connect to cloud
          storage to read and write custom data.
        </p>
      ) : (
        <div className={cx("p-0", "pb-0", "m-0")}>
          {data?.map((storage, index) => (
            <DataSourceDisplay
              key={index}
              storage={storage}
              projectId={project.id}
            />
          ))}
          {contentLoading}
        </div>
      )}
      <AddCloudStorageModal
        currentStorage={null}
        isOpen={isOpen}
        toggle={toggle}
        projectId={project.id}
        isV2
      />
    </>
  );
}
