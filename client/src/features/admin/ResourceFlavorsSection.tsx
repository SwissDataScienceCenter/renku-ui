/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { Tags } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, Collapse } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import { Loader } from "~/components/Loader";
import {
  useGetResourceFlavorsQuery,
  type ResourceFlavor,
} from "../sessionsV2/api/computeResources.api";
import AddResourceFlavorButton from "./AddResourceFlavorButton";
import DeleteResourceFlavorButton from "./DeleteResourceFlavorButton";
import { LinkedResourceClassesSummary } from "./LinkedResourceClasses";
import ResourceFlavorValues from "./ResourceFlavorValues";
import UpdateResourceFlavorButton from "./UpdateResourceFlavorButton";

export default function ResourceFlavorsSection() {
  return (
    <div className="mt-4">
      <h3 className="fs-4">Resource Flavors</h3>
      <p className="mb-2">
        A resource flavor is a named shape that resource classes across pools
        can link to. A linked class reports the flavor&apos;s CPU, memory, GPU
        and disk values, and keeps its own name.
      </p>
      <ResourceFlavors />
    </div>
  );
}

function ResourceFlavors() {
  const {
    data: resourceFlavors,
    error,
    isLoading,
  } = useGetResourceFlavorsQuery({});

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError error={error} />;
  }

  return (
    <div>
      <AddResourceFlavorButton />

      <div className="mt-2">
        {!resourceFlavors || resourceFlavors.length === 0 ? (
          <p className="mb-0">No resource flavor has been defined yet.</p>
        ) : (
          resourceFlavors.map((resourceFlavor) => (
            <ResourceFlavorItem
              key={resourceFlavor.id}
              resourceFlavor={resourceFlavor}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ResourceFlavorItemProps {
  resourceFlavor: ResourceFlavor;
}

function ResourceFlavorItem({ resourceFlavor }: ResourceFlavorItemProps) {
  const { description, name } = resourceFlavor;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card className="mt-2">
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h4"
      >
        <button
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "w-100",
            "p-3",
            "bg-transparent",
            "border-0",
            "fw-bold",
          )}
          onClick={toggle}
          type="button"
        >
          <Tags className={cx("bi", "flex-shrink-0")} />
          {name}
          <div
            className={cx("align-items-center", "d-flex", "gap-3", "ms-auto")}
          >
            <ResourceFlavorValues
              className={cx(
                "d-none",
                "d-lg-inline-flex",
                "fw-normal",
                "small",
                "text-muted",
              )}
              compact
              resourceFlavor={resourceFlavor}
            />
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div className={cx("border-bottom", "border-top", "py-2")}>
            <p className={cx("mb-0", !description && "text-muted")}>
              {description ? description : "No description"}
            </p>
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <ResourceFlavorValues resourceFlavor={resourceFlavor} />
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <LinkedResourceClassesSummary
              emptyMessage="No resource class links to this flavor."
              intro="Linked resource classes:"
              resourceFlavorId={resourceFlavor.id}
              skip={!isOpen}
            />
          </div>
        </CardBody>
        <CardBody
          className={cx(
            "d-flex",
            "flex-row",
            "gap-2",
            "justify-content-end",
            "pt-0",
          )}
        >
          <UpdateResourceFlavorButton resourceFlavor={resourceFlavor} />
          <DeleteResourceFlavorButton resourceFlavor={resourceFlavor} />
        </CardBody>
      </Collapse>
    </Card>
  );
}
