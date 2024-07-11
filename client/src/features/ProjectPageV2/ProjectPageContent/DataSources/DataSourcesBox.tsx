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
import { DatabaseFill, PlusLg } from "react-bootstrap-icons";
import { Loader } from "../../../../components/Loader.tsx";
import AddCloudStorageModal from "../../../project/components/cloudStorage/CloudStorageModal.tsx";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { useGetStoragesV2Query } from "../../../projectsV2/api/storagesV2.api.ts";
import AccessGuard from "../../utils/AccessGuard.tsx";
import useProjectAccess from "../../utils/useProjectAccess.hook.ts";
import { DataSourceDisplay } from "./DataSourceDisplay.tsx";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
} from "reactstrap";

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
    <Card className="border-primary-subtle" data-cy="data-source-box">
      <CardHeader
        className={cx("bg-primary", "bg-opacity-10", "border-primary-subtle")}
      >
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
              <DatabaseFill className={cx("me-2", "small", "text-icon")} />
              Data Sources
            </h4>
            <Badge>{totalStorages}</Badge>
          </div>
          <div className="my-auto">
            <AccessGuard
              disabled={null}
              enabled={
                <Button color="primary" onClick={toggle} size="sm">
                  <PlusLg className="icon-text" />
                </Button>
              }
              minimumRole="editor"
              role={userRole}
            />
          </div>
        </div>
      </CardHeader>
      {isLoading || isFetching || totalStorages === 0 ? (
        <CardBody>
          {isLoading || isFetching ? (
            <Loader />
          ) : (
            <p className="m-0">
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
        </CardBody>
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
