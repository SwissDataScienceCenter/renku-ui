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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, PersonFillX, TrashFill, XLg } from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { ErrorAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { useGetNotebooksVersionQuery } from "../../features/versions/versions.api";
import { isFetchBaseQueryError } from "../../utils/helpers/ApiErrors";
import { toFullHumanDuration } from "../../utils/helpers/DurationUtils";
import {
  useDeleteResourcePoolMutation,
  useGetResourcePoolUsersQuery,
  useGetResourcePoolsQuery,
  useGetUsersQuery,
  useRemoveUserFromResourcePoolMutation,
} from "../dataServices/computeResources.api";
import {
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";
import AddManyUsersToResourcePoolButton from "./AddManyUsersToResourcePoolButton";
import AddResourceClassButton from "./AddResourceClassButton";
import AddResourcePoolButton from "./AddResourcePoolButton";
import AddUserToResourcePoolButton from "./AddUserToResourcePoolButton";
import DeleteResourceClassButton from "./DeleteResourceClassButton";
import IncidentsAndMaintenanceSection from "./IncidentsAndMaintenanceSection";
import SessionEnvironmentsSection from "./SessionEnvironmentsSection";
import UpdateResourceClassButton from "./UpdateResourceClassButton";
import UpdateResourcePoolQuotaButton from "./UpdateResourcePoolQuotaButton";
import UpdateResourcePoolThresholdsButton from "./UpdateResourcePoolThresholdsButton";
import { ResourcePoolUser } from "./adminComputeResources.types";
import { useGetKeycloakUserQuery } from "./adminKeycloak.api";
import { KeycloakUser } from "./adminKeycloak.types";
import useKeycloakRealm from "./useKeycloakRealm.hook";

export default function AdminPage() {
  return (
    <>
      <h1 className={cx("fs-2", "mb-3")}>Admin Panel</h1>
      <IncidentsAndMaintenanceSection />
      <ComputeResourcesSection />
      <SessionEnvironmentsSection />
    </>
  );
}

function ComputeResourcesSection() {
  return (
    <section>
      <h2 className="fs-5">Compute Resources</h2>
      <AdminComputeResourcesOverview />
    </section>
  );
}
function AdminComputeResourcesOverview() {
  const {
    data: rawUsers,
    error: rawUsersError,
    isLoading: rawUsersIsLoading,
  } = useGetUsersQuery();
  const {
    data: resourcePools,
    error: resourcePoolsError,
    isLoading: resourcePoolsIsLoading,
  } = useGetResourcePoolsQuery({});

  const error = rawUsersError || resourcePoolsError;
  const isLoading = rawUsersIsLoading || resourcePoolsIsLoading;

  if (isLoading) {
    return <Loader />;
  }

  if (error && isFetchBaseQueryError(error) && error.status === 401) {
    return (
      <ErrorAlert dismissible={false}>
        <h3>
          Oops! It looks like you do not have the required permissions to
          administer compute resources.
        </h3>
      </ErrorAlert>
    );
  }

  if (error || !rawUsers || !resourcePools) {
    return (
      <ErrorAlert>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </ErrorAlert>
    );
  }

  return (
    <div>
      <div className={cx("hstack", "gap-2")}>
        <div>Users with special access: {rawUsers.length}</div>
        <div className="vr"></div>
        <div>Resource pools: {resourcePools.length}</div>
      </div>

      <ResourcePoolsList />
    </div>
  );
}

function ResourcePoolsList() {
  const { data: resourcePools } = useGetResourcePoolsQuery({});

  if (!resourcePools) {
    return null;
  }

  return (
    <div className="mt-2">
      <h3 className="fs-6">Resource Pools</h3>

      <AddResourcePoolButton />

      {resourcePools.map((pool) => (
        <ResourcePoolItem key={pool.id} resourcePool={pool} />
      ))}
    </div>
  );
}

interface ResourcePoolItemProps {
  resourcePool: ResourcePool;
}

function ResourcePoolItem({ resourcePool }: ResourcePoolItemProps) {
  const { name, default: isDefault, public: isPublic, quota } = resourcePool;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card className="mt-2">
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h5"
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
            "fw-bold"
          )}
          onClick={toggle}
          type="button"
        >
          {name}
          {isDefault && <>{" (This is the default pool)"}</>}
          <div className="ms-auto">
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div className={cx("border-bottom", "border-top", "py-2")}>
            <p className="mb-0">
              {isPublic
                ? "Public pool (everyone can use it)"
                : "Private pool (requires special access)"}
            </p>
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <ResourcePoolThresholds resourcePool={resourcePool} />
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {quota != null ? (
              <div
                className={cx(
                  "align-items-center",
                  "row",
                  "row-cols-1",
                  "row-cols-sm-4",
                  "row-cols-md-5",
                  "text-end"
                )}
              >
                <div className={cx("col", "col-sm-12", "col-md", "text-start")}>
                  Quota:
                </div>
                <div className="col">{quota.cpu}&nbsp;CPUs</div>
                <div className="col">{quota.memory}&nbsp;GB RAM</div>
                <div className="col">{quota.gpu}&nbsp;GPUs</div>
                <div className={cx("col", "ms-auto")}>
                  <UpdateResourcePoolQuotaButton resourcePool={resourcePool} />
                </div>
              </div>
            ) : (
              <p className="mb-0">No quota</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <ResourceClassList
              classes={resourcePool.classes}
              resourcePool={resourcePool}
            />
          </div>

          {!isPublic && (
            <div className={cx("border-bottom", "py-2")}>
              <ResourcePoolUsers resourcePool={resourcePool} />
            </div>
          )}
        </CardBody>
        <CardBody
          className={cx("d-flex", "flex-row", "justify-content-end", "pt-0")}
        >
          <DeleteResourcePoolButton resourcePool={resourcePool} />
        </CardBody>
      </Collapse>
    </Card>
  );
}

function ResourcePoolThresholds({ resourcePool }: ResourcePoolItemProps) {
  const {
    idle_threshold: idleThreshold,
    hibernation_threshold: hibernationThreshold,
  } = resourcePool;

  const { data, isError, isLoading } = useGetNotebooksVersionQuery();

  return (
    <div
      className={cx(
        "align-items-center",
        "row",
        "row-cols-1",
        "row-cols-sm-3",
        "row-cols-lg-4",
        "text-end"
      )}
    >
      <div className={cx("col", "col-sm-12", "text-start")}>
        Session thresholds:
      </div>
      <div className="col">
        Hibernate after{" "}
        <span className="text-nowrap">
          {idleThreshold
            ? toFullHumanDuration(idleThreshold)
            : isLoading
            ? "(Loading...)"
            : isError
            ? "unavailable"
            : data?.defaultCullingThresholds?.registered.idle
            ? toFullHumanDuration(data.defaultCullingThresholds.registered.idle)
            : "unknown"}
        </span>
      </div>
      <div className="col">
        Delete after{" "}
        <span className="text-nowrap">
          {hibernationThreshold
            ? toFullHumanDuration(hibernationThreshold)
            : isLoading
            ? "(Loading...)"
            : isError
            ? "unavailable"
            : data?.defaultCullingThresholds?.registered.hibernation
            ? toFullHumanDuration(
                data.defaultCullingThresholds.registered.hibernation
              )
            : "unknown"}
        </span>
      </div>
      <div className={cx("col", "ms-auto")}>
        <UpdateResourcePoolThresholdsButton resourcePool={resourcePool} />
      </div>
    </div>
  );
}

interface ResourceClassListProps {
  classes: ResourceClass[];
  resourcePool: ResourcePool;
}

function ResourceClassList({ classes, resourcePool }: ResourceClassListProps) {
  return (
    <>
      <p className="mb-0">Classes:</p>
      <div>
        <AddResourceClassButton resourcePool={resourcePool} />
      </div>
      <ul className={cx("mt-2", "mb-0", "vstack", "gap-3")}>
        {classes.map((resourceClass) => (
          <ResourceClassItem
            key={resourceClass.id}
            resourceClass={resourceClass}
            resourcePool={resourcePool}
          />
        ))}
      </ul>
    </>
  );
}

interface ResourceClassItemProps {
  resourceClass: ResourceClass;
  resourcePool: ResourcePool;
}

function ResourceClassItem({
  resourceClass,
  resourcePool,
}: ResourceClassItemProps) {
  const {
    cpu,
    default: isDefault,
    default_storage,
    gpu,
    max_storage,
    memory,
    name,
    node_affinities,
    tolerations,
  } = resourceClass;

  const columnClasses = ["col-12", "col-sm-4", "col-md-3", "col-xl-2"];

  return (
    <li>
      <div className={cx("align-items-center", "row", "text-end")}>
        <div className={cx(columnClasses, "text-start")}>
          <strong>{name}</strong>
          {isDefault && " (default)"}:
        </div>
        <div className={cx(columnClasses)}>{cpu}&nbsp;CPUs</div>
        <div className={cx(columnClasses)}>{memory}&nbsp;GB RAM</div>
        <div className={cx(columnClasses)}>{gpu}&nbsp;GPUs</div>
        <div className={cx(columnClasses)}>
          {default_storage}&nbsp;GB default disk
        </div>
        <div className={cx(columnClasses)}>{max_storage}&nbsp;GB max disk</div>
        <div className={cx(columnClasses)}>
          tolerations: {tolerations?.length ?? 0}
        </div>
        <div className={cx(columnClasses)}>
          node affinities: {node_affinities?.length ?? 0}
        </div>
        <div
          className={cx(
            "col-12",
            "col-sm-8",
            "col-md-6",
            "col-xl-4",
            "ms-auto",
            "d-flex",
            "flex-column",
            "flex-sm-row",
            "flex-wrap",
            "justify-content-end"
          )}
        >
          {isDefault ? (
            <UpdateResourceClassButton
              resourceClass={resourceClass}
              resourcePool={resourcePool}
            />
          ) : (
            <>
              <UpdateResourceClassButton
                resourceClass={resourceClass}
                resourcePool={resourcePool}
              />
              <span className={cx("me-2", "py-1")} />
              <DeleteResourceClassButton
                resourceClass={resourceClass}
                resourcePool={resourcePool}
              />
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function ResourcePoolUsers({ resourcePool }: ResourcePoolItemProps) {
  const { id } = resourcePool;

  const {
    data: resourcePoolUsers,
    error: resourcePoolUsersError,
    isLoading: resourcePoolUsersIsLoading,
  } = useGetResourcePoolUsersQuery({ resourcePoolId: id });

  const isLoading = resourcePoolUsersIsLoading;
  const error = resourcePoolUsersError;

  if (isLoading) {
    return (
      <div>
        <Loader className="me-1" inline size={16} />
        Loading users...
      </div>
    );
  }

  if (error || !resourcePoolUsers) {
    return <RtkErrorAlert error={error} />;
  }

  return (
    <div>
      <p className="mb-0">Users: {resourcePoolUsers.length}</p>
      <div className={cx("d-flex", "flex-column", "flex-sm-row", "flex-wrap")}>
        <AddUserToResourcePoolButton resourcePool={resourcePool} />
        <span className={cx("me-2", "py-1")} />
        <AddManyUsersToResourcePoolButton resourcePool={resourcePool} />
      </div>
      <ResourcePoolUsersList
        resourcePool={resourcePool}
        resourcePoolUsers={resourcePoolUsers}
      />
    </div>
  );
}

interface ResourcePoolUsersListProps {
  resourcePool: ResourcePool;
  resourcePoolUsers: ResourcePoolUser[];
}

function ResourcePoolUsersList({
  resourcePool,
  resourcePoolUsers,
}: ResourcePoolUsersListProps) {
  return (
    <ul className={cx("mt-2", "mb-0", "vstack", "gap-2")}>
      {resourcePoolUsers.map((user) => (
        <ResourcePoolUserItem
          key={user.id}
          resourcePool={resourcePool}
          resourcePoolUser={user}
        />
      ))}
    </ul>
  );
}

interface ResourcePoolUserItemProps {
  resourcePool: ResourcePool;
  resourcePoolUser: ResourcePoolUser;
}

function ResourcePoolUserItem({
  resourcePool,
  resourcePoolUser,
}: ResourcePoolUserItemProps) {
  const realm = useKeycloakRealm();
  const {
    data: user,
    error,
    isLoading,
  } = useGetKeycloakUserQuery({
    realm,
    userId: resourcePoolUser.id,
  });

  if (isLoading) {
    return (
      <li>
        <Loader className="me-1" inline size={16} />
        <span className="fst-italic">loading user {resourcePoolUser.id}</span>
      </li>
    );
  }

  if (error || !user) {
    return <li>Error loading user {resourcePoolUser.id}</li>;
  }

  return (
    <li>
      <div className={cx("hstack", "gap-2")}>
        <div>{`${user.firstName} ${user.lastName} <${user.email}>`}</div>
        <div className="ms-3">
          <RemoveUserFromResourcePoolButton
            resourcePool={resourcePool}
            user={user}
          />
        </div>
      </div>
    </li>
  );
}

interface RemoveUserFromResourcePoolButtonProps {
  resourcePool: ResourcePool;
  user: KeycloakUser;
}

function RemoveUserFromResourcePoolButton({
  resourcePool,
  user,
}: RemoveUserFromResourcePoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-sm" color="outline-danger" onClick={toggle}>
        <PersonFillX className={cx("bi", "me-1")} />
        Remove
      </Button>
      <RemoveUserFromResourcePoolModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
        user={user}
      />
    </>
  );
}

interface RemoveUserFromResourcePoolModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
  user: KeycloakUser;
}

function RemoveUserFromResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
  user,
}: RemoveUserFromResourcePoolModalProps) {
  const [removeUserFromResourcePool, result] =
    useRemoveUserFromResourcePoolMutation();
  const onRemove = useCallback(() => {
    removeUserFromResourcePool({
      resourcePoolId: resourcePool.id,
      userId: user.id,
    });
  }, [removeUserFromResourcePool, resourcePool.id, user.id]);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalBody>
        <h3 className={cx("fs-6", "lh-base", "text-danger", "fw-bold")}>
          Are you sure?
        </h3>
        <p className="mb-0">
          Please confirm that you want to remove{" "}
          <strong>{`${user.firstName} ${user.lastName} <${user.email}>`}</strong>{" "}
          from the <strong>{resourcePool.name}</strong> resource pool.
        </p>
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2" color="outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button className="ms-2" color="danger" onClick={onRemove}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, remove user
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface DeleteResourcePoolButtonProps {
  resourcePool: ResourcePool;
}

function DeleteResourcePoolButton({
  resourcePool,
}: DeleteResourcePoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button
        className="ms-2"
        color="outline-danger"
        disabled={resourcePool.default}
        onClick={toggle}
      >
        <TrashFill className={cx("bi", "me-1")} />
        Delete resource pool
        {resourcePool.default && " (The default pool cannot be deleted)"}
      </Button>
      <DeleteResourcePoolModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteResourcePoolModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function DeleteResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
}: DeleteResourcePoolModalProps) {
  const { id, name } = resourcePool;

  const [deleteResourcePool, result] = useDeleteResourcePoolMutation();
  const onDelete = useCallback(() => {
    deleteResourcePool({ resourcePoolId: id });
  }, [deleteResourcePool, id]);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalBody>
        <h3 className={cx("fs-6", "lh-base", "text-danger", "fw-bold")}>
          Are you sure?
        </h3>
        <p className="mb-0">
          Please confirm that you want to delete the <strong>{name}</strong>{" "}
          resource pool.
        </p>
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2" color="outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep resource pool
        </Button>
        <Button className="ms-2" color="danger" onClick={onDelete}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this resource pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}
