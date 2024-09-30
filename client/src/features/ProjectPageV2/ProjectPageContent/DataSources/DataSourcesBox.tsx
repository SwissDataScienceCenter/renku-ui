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
import { Database, PlusLg } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import AddCloudStorageModal from "../../../project/components/cloudStorage/CloudStorageModal";
import type { Project } from "../../../projectsV2/api/projectsV2.api";
import { useGetStoragesV2Query } from "../../../storagesV2/api/storagesV2.api";
import AccessGuard from "../../utils/AccessGuard";
import useProjectAccess from "../../utils/useProjectAccess.hook";
import { DataSourceDisplay } from "./DataSourceDisplay";

export function DataSourcesDisplay({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useProjectAccess({ projectId: project.id });

  const { data, isFetching, isLoading } = useGetStoragesV2Query({
    storageV2Params: {
      project_id: project.id,
    },
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
    <Card data-cy="data-source-box">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("mb-0", "me-2")}>
              <Database className={cx("me-1", "bi")} />
              Data Sources
            </h4>
            <Badge>{totalStorages}</Badge>
          </div>
          <div className="my-auto">
            <AccessGuard
              disabled={null}
              enabled={
                <Button
                  data-cy="add-data-source"
                  color="outline-primary"
                  onClick={toggle}
                  size="sm"
                >
                  <PlusLg className="icon-text" />
                </Button>
              }
              minimumRole="editor"
              role={userRole}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading || isFetching || totalStorages === 0 ? (
          <>
            {isLoading || isFetching ? (
              <Loader />
            ) : (
              <p className="m-0">
                Add published datasets from data repositories, and connect to
                cloud storage to read and write custom data.
              </p>
            )}
          </>
        ) : (
          <ListGroup flush>
            {data?.map((storage, index) => (
              <DataSourceDisplay
                key={index}
                storage={storage}
                projectId={project.id}
              />
            ))}
            {contentLoading}
          </ListGroup>
        )}
      </CardBody>
      <AddCloudStorageModal
        currentStorage={null}
        isOpen={isOpen}
        toggle={toggle}
        projectId={project.id}
        isV2
      />
    </Card>
  );
}
