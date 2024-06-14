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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { Globe2, LockFill } from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useSearchParams,
} from "react-router-dom-v5-compat";
import { Card, CardBody, Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type { Project } from "../api/projectV2.api";
import { useGetProjectsQuery } from "../api/projectV2.enhanced-api";

const DEFAULT_PER_PAGE = 10;
const DEFAULT_PAGE_PARAM = "page";

interface ProjectListDisplayProps {
  namespace?: string;
  pageParam?: string;
  perPage?: number;
}

export default function ProjectListDisplay({
  namespace: ns,
  pageParam: pageParam_,
  perPage: perPage_,
}: ProjectListDisplayProps) {
  const pageParam = useMemo(
    () => (pageParam_ ? pageParam_ : DEFAULT_PAGE_PARAM),
    [pageParam_]
  );
  const perPage = useMemo(
    () => (perPage_ ? perPage_ : DEFAULT_PER_PAGE),
    [perPage_]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const onPageChange = useCallback(
    (pageNumber: number) => {
      setSearchParams((prevParams) => {
        if (pageNumber == 1) {
          prevParams.delete(pageParam);
        } else {
          prevParams.set(pageParam, `${pageNumber}`);
        }
        return prevParams;
      });
    },
    [pageParam, setSearchParams]
  );

  const page = useMemo(() => {
    const pageRaw = searchParams.get(pageParam);
    if (!pageRaw) {
      return 1;
    }
    try {
      const page = parseInt(pageRaw, 10);
      return page > 0 ? page : 1;
    } catch {
      return 1;
    }
  }, [pageParam, searchParams]);

  const { data, error, isLoading } = useGetProjectsQuery({
    namespace: ns,
    page,
    perPage,
  });

  useEffect(() => {
    if (data?.totalPages && page > data.totalPages) {
      setSearchParams(
        (prevParams) => {
          if (data.totalPages == 1) {
            prevParams.delete(pageParam);
          } else {
            prevParams.set(pageParam, `${data.totalPages}`);
          }
          return prevParams;
        },
        { replace: true }
      );
    }
  }, [data?.totalPages, page, pageParam, setSearchParams]);

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving projects...</div>
        </div>
      </div>
    );

  if (error) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (data == null) return <div>No V2 projects.</div>;

  return (
    <>
      <Row className={cx("row-cols-1", "row-cols-sm-2", "g-3")}>
        {data.projects?.map((project) => (
          <ProjectV2ListProject key={project.id} project={project} />
        ))}
      </Row>
      <Pagination
        currentPage={data.page}
        perPage={perPage}
        totalItems={data.total}
        onPageChange={onPageChange}
        className={cx(
          "d-flex",
          "justify-content-center",
          "rk-search-pagination"
        )}
      />
    </>
  );
}

interface ProjectV2ListProjectProps {
  project: Project;
}
function ProjectV2ListProject({ project }: ProjectV2ListProjectProps) {
  const {
    name,
    namespace,
    description,
    visibility,
    creation_date: creationDate,
  } = project;

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace,
    slug: project.slug,
  });
  const namespaceUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show, {
    username: project.namespace,
  });

  return (
    <Col>
      <Card className="h-100">
        <CardBody className={cx("d-flex", "flex-column")}>
          <h3 className="card-title">
            <Link className={cx("link-offset-1")} to={projectUrl}>
              {name}
            </Link>
          </h3>
          <p className={cx("mb-2", "card-text")}>
            <Link to={namespaceUrl}>
              {"@"}
              {namespace}
            </Link>
          </p>
          {description && (
            <p className={cx("mb-2", "card-text")}>{description}</p>
          )}
          <div
            className={cx(
              "mt-auto",
              "mb-0",
              "card-text",
              "d-flex",
              "flex-wrap"
            )}
          >
            <div className={cx("flex-grow-1", "me-2")}>
              {visibility === "private" ? (
                <>
                  <LockFill className={cx("bi", "me-1")} />
                  Private
                </>
              ) : (
                <>
                  <Globe2 className={cx("bi", "me-1")} />
                  Public
                </>
              )}
            </div>
            <div>
              <TimeCaption
                datetime={creationDate}
                prefix="Created"
                enableTooltip
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
}
