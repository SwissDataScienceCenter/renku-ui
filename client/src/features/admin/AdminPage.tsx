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
import { useCallback, useContext, useEffect, useState } from "react";
import {
  CheckLg,
  FolderFill,
  PeopleFill,
  PersonFill,
  PersonFillX,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
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

import { ErrorAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import { Loader } from "~/components/Loader";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import { isFetchBaseQueryError } from "~/utils/helpers/ApiErrors";
import { toFullHumanDuration } from "~/utils/helpers/DurationUtils";
import { useGetResourcePoolsByResourcePoolIdLimitsQuery } from "../resourceUsage/api/resourceUsage.api";
import UpdateResourceClassCostButton from "../resourceUsage/UpdateResourceClassCostButton";
import UpdateResourcePoolUsageLimitsButton from "../resourceUsage/UpdateResourcePoolUsageLimitsButton";
import {
  useDeleteResourcePoolsByResourcePoolIdMembersAndMemberTypeMemberIdMutation,
  useDeleteResourcePoolsByResourcePoolIdMutation,
  useGetResourcePoolsByResourcePoolIdMembersQuery,
  useGetResourcePoolsQuery,
  type PoolMemberResponse,
  type ResourceClassWithId,
  type ResourcePoolWithId,
  type ResourcePoolWithIdFiltered,
} from "../sessionsV2/api/computeResources.api";
import { useGetUsersQuery } from "../usersV2/api/users.api";
import AddMemberToResourcePoolButton from "./AddMemberToResourcePoolButton";
import AddResourceClassButton from "./AddResourceClassButton";
import AddResourcePoolButton from "./AddResourcePoolButton";
import { poolRequiresIntegerCpu } from "./adminComputeResources.utils";
import { useGetKeycloakUserQuery } from "./adminKeycloak.api";
import ConnectedServicesSection from "./ConnectedServicesSection";
import DeleteResourceClassButton from "./DeleteResourceClassButton";
import IncidentsAndMaintenanceSection from "./IncidentsAndMaintenanceSection";
import ProjectStorageAllowSection from "./ProjectStorageAllowSection";
import SessionEnvironmentsSection from "./SessionEnvironmentsSection";
import UpdateResourceClassButton from "./UpdateResourceClassButton";
import UpdateResourcePoolQuotaButton from "./UpdateResourcePoolQuotaButton";
import UpdateResourcePoolRemoteButton from "./UpdateResourcePoolRemoteButton";
import UpdateResourcePoolThresholdsButton from "./UpdateResourcePoolThresholdsButton";
import useKeycloakRealm from "./useKeycloakRealm.hook";

export default function AdminPage() {
  return (
    <>
      <h1 className="mb-3">Admin Panel</h1>
      <IncidentsAndMaintenanceSection />
      <ComputeResourcesSection />
      <ConnectedServicesSection />
      <SessionEnvironmentsSection />
      <ProjectStorageAllowSection />
    </>
  );
}

function ComputeResourcesSection() {
  return (
    <section>
      <h2>Compute Resources</h2>
      <AdminComputeResourcesOverview />
    </section>
  );
}
function AdminComputeResourcesOverview() {
  const {
    data: rawUsers,
    error: rawUsersError,
    isLoading: rawUsersIsLoading,
  } = useGetUsersQuery({});
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
      <h3 className="fs-4">Resource Pools</h3>

      <AddResourcePoolButton />

      {resourcePools.map((pool) => (
        <ResourcePoolItem key={pool.id} resourcePool={pool} />
      ))}
    </div>
  );
}

interface ResourcePoolItemProps {
  // TODO: Cluster is not declared as being in the response
  // check if it should be added to the API spec
  resourcePool: ResourcePoolWithIdFiltered &
    Pick<ResourcePoolWithId, "cluster">;
}

function ResourcePoolItem({ resourcePool }: ResourcePoolItemProps) {
  const {
    name,
    default: isDefault,
    public: isPublic,
    quota,
    cluster,
    remote,
  } = resourcePool;
  const clusterId = cluster?.id;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);
  const { data: usageLimits } = useGetResourcePoolsByResourcePoolIdLimitsQuery({
    resourcePoolId: resourcePool.id,
  });

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
            "fw-bold",
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
                  "text-end",
                )}
              >
                <div className={cx("col", "col-sm-12", "col-md", "text-start")}>
                  Resource Quota:
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
            <div
              className={cx(
                "align-items-center",
                "row",
                "row-cols-1",
                "row-cols-sm-4",
                "row-cols-md-5",
                "text-end",
              )}
            >
              <div className={cx("col", "col-sm-12", "col-md", "text-start")}>
                Usage Quota:
              </div>
              {usageLimits != null && (
                <div className="col">
                  {usageLimits.user_limit} credits / user
                </div>
              )}
              {usageLimits != null && (
                <div className="col">
                  {usageLimits.total_limit} credits total
                </div>
              )}
              <div className={cx("col", "ms-auto")}>
                <UpdateResourcePoolUsageLimitsButton
                  resourcePool={resourcePool}
                />
              </div>
            </div>
          </div>
          <div className={cx("border-bottom", "py-2")}>
            {clusterId != null ? (
              <p className="mb-0">
                Remote cluster: <code>{clusterId}</code>
              </p>
            ) : (
              <p className="mb-0">No remote cluster</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {remote != null ? (
              <div
                className={cx(
                  "align-items-center",
                  "row",
                  "row-cols-1",
                  "row-cols-sm-2",
                )}
              >
                <div className={cx("col", "col-sm-10")}>
                  Remote configuration: <code>{JSON.stringify(remote)}</code>
                </div>
                <div className={cx("col", "col-sm-2", "ms-auto", "text-end")}>
                  <UpdateResourcePoolRemoteButton resourcePool={resourcePool} />
                </div>
              </div>
            ) : (
              <div
                className={cx(
                  "align-items-center",
                  "row",
                  "row-cols-1",
                  "row-cols-sm-2",
                )}
              >
                <div className={cx("col", "col-sm-10")}>
                  Local resource pool
                </div>
                <div className={cx("col", "col-sm-2", "ms-auto", "text-end")}>
                  <UpdateResourcePoolRemoteButton resourcePool={resourcePool} />
                </div>
              </div>
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
              <ResourcePoolMembers resourcePool={resourcePool} />
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

  const { params } = useContext(AppContext);
  const cullingThresholds =
    params?.CULLING_THRESHOLDS ?? DEFAULT_APP_PARAMS["CULLING_THRESHOLDS"];

  return (
    <div
      className={cx(
        "align-items-center",
        "row",
        "row-cols-1",
        "row-cols-sm-3",
        "row-cols-lg-4",
        "text-end",
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
            : cullingThresholds.registered.idle
              ? toFullHumanDuration(cullingThresholds.registered.idle)
              : "unknown"}
        </span>
      </div>
      <div className="col">
        Delete after{" "}
        <span className="text-nowrap">
          {hibernationThreshold
            ? toFullHumanDuration(hibernationThreshold)
            : cullingThresholds.registered.hibernation
              ? toFullHumanDuration(cullingThresholds.registered.hibernation)
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
  classes: ResourceClassWithId[];
  resourcePool: ResourcePoolWithId;
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
  resourceClass: ResourceClassWithId;
  resourcePool: ResourcePoolWithId;
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
  const requiresIntegerCpu = poolRequiresIntegerCpu(resourcePool.remote);

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
        {requiresIntegerCpu && (
          <>
            <div className={cx(columnClasses)}>
              system: {resourceClass.remote?.system_name ?? "—"}
            </div>
            <div className={cx(columnClasses)}>
              partition: {resourceClass.remote?.partition ?? "—"}
            </div>
            <div className={cx(columnClasses)}>
              forward resources:{" "}
              {resourceClass.remote?.forward_resource_values ? "yes" : "no"}
            </div>
          </>
        )}
        <div
          className={cx(
            columnClasses,
            "ms-auto",
            "d-flex",
            "flex-column",
            "flex-sm-row",
            "flex-wrap",
            "justify-content-end",
          )}
        >
          <UpdateResourceClassCostButton
            resourceClass={resourceClass}
            resourcePool={resourcePool}
          />
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
            "justify-content-end",
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

function ResourcePoolMembers({ resourcePool }: ResourcePoolItemProps) {
  const { id } = resourcePool;

  const {
    data: resourcePoolMembers,
    error: resourcePoolMembersError,
    isLoading: resourcePoolMembersIsLoading,
  } = useGetResourcePoolsByResourcePoolIdMembersQuery({ resourcePoolId: id });

  const isLoading = resourcePoolMembersIsLoading;
  const error = resourcePoolMembersError;

  if (isLoading) {
    return (
      <div>
        <Loader className="me-1" inline size={16} />
        Loading members...
      </div>
    );
  }

  if (error || !resourcePoolMembers) {
    return <RtkOrDataServicesError error={error} />;
  }

  return (
    <div>
      <p className="mb-0">Members: {resourcePoolMembers.length}</p>
      <div className={cx("d-flex", "flex-column", "flex-sm-row", "flex-wrap")}>
        <AddMemberToResourcePoolButton resourcePool={resourcePool} />
      </div>
      <ResourcePoolMembersList
        resourcePool={resourcePool}
        resourcePoolMembers={resourcePoolMembers}
      />
    </div>
  );
}

interface ResourcePoolMembersListProps {
  resourcePool: ResourcePoolWithId;
  resourcePoolMembers: PoolMemberResponse[];
}

function ResourcePoolMembersList({
  resourcePool,
  resourcePoolMembers,
}: ResourcePoolMembersListProps) {
  return (
    <ul className={cx("mt-2", "mb-0", "vstack", "gap-2")}>
      {resourcePoolMembers.map((member) => (
        <ResourcePoolMemberItem
          key={`${member.member_type}-${member.id}`}
          resourcePool={resourcePool}
          resourcePoolMember={member}
        />
      ))}
    </ul>
  );
}

interface ResourcePoolMemberItemProps {
  resourcePool: ResourcePoolWithId;
  resourcePoolMember: PoolMemberResponse;
}

function ResourcePoolMemberItem({
  resourcePool,
  resourcePoolMember,
}: ResourcePoolMemberItemProps) {
  const resolved = useResolveResourcePoolMember(resourcePoolMember);

  if (resolved.isLoading) {
    return (
      <li>
        <Loader className="me-1" inline size={16} />
        <span className="fst-italic">
          loading member {resourcePoolMember.id}
        </span>
      </li>
    );
  }

  if (resolved.error || resolved.label == null) {
    return <li>Error loading member {resourcePoolMember.id}</li>;
  }

  return (
    <li>
      <div className={cx("hstack", "gap-3")}>
        <div className={cx("d-flex", "align-items-center")}>
          {resourcePoolMember.member_type === "user" ? (
            <PersonFill className={cx("bi", "me-1")} />
          ) : resourcePoolMember.member_type === "group" ? (
            <PeopleFill className={cx("bi", "me-1")} />
          ) : (
            <FolderFill className={cx("bi", "me-1")} />
          )}
          <div>{resolved.label}</div>
        </div>
        <div>
          <RemoveMemberFromResourcePoolButton
            resourcePool={resourcePool}
            resourcePoolMember={resourcePoolMember}
            label={resolved.label}
          />
        </div>
      </div>
    </li>
  );
}

function useResolveResourcePoolMember(member: PoolMemberResponse) {
  const realm = useKeycloakRealm();

  const {
    data: keycloakUser,
    error,
    isLoading,
  } = useGetKeycloakUserQuery(
    {
      realm,
      userId: member.id,
    },
    { skip: member.member_type !== "user" },
  );

  switch (member.member_type) {
    case "user": {
      const label =
        keycloakUser != null
          ? `${keycloakUser.firstName} ${keycloakUser.lastName} <${keycloakUser.email}>`
          : (member.email ?? member.id);

      return {
        isLoading,
        error,
        label,
      };
    }
    case "group": {
      return {
        isLoading: false,
        error: undefined,
        label: `${member.name} (${member.slug})`,
      };
    }
    case "project": {
      return {
        isLoading: false,
        error: undefined,
        label: `${member.name} (${member.namespace})`,
      };
    }
  }
}

interface RemoveMemberFromResourcePoolButtonProps {
  resourcePool: ResourcePoolWithId;
  resourcePoolMember: PoolMemberResponse;
  label: string;
}

function RemoveMemberFromResourcePoolButton({
  resourcePool,
  resourcePoolMember,
  label,
}: RemoveMemberFromResourcePoolButtonProps) {
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
      <RemoveMemberFromResourcePoolModal
        isOpen={isOpen}
        label={label}
        resourcePool={resourcePool}
        resourcePoolMember={resourcePoolMember}
        toggle={toggle}
      />
    </>
  );
}

interface RemoveMemberFromResourcePoolModalProps {
  isOpen: boolean;
  label: string;
  resourcePool: ResourcePoolWithId;
  resourcePoolMember: PoolMemberResponse;
  toggle: () => void;
}

function RemoveMemberFromResourcePoolModal({
  isOpen,
  label,
  resourcePool,
  resourcePoolMember,
  toggle,
}: RemoveMemberFromResourcePoolModalProps) {
  const [removeMemberFromResourcePool, result] =
    useDeleteResourcePoolsByResourcePoolIdMembersAndMemberTypeMemberIdMutation();
  const onRemove = useCallback(() => {
    removeMemberFromResourcePool({
      resourcePoolId: resourcePool.id,
      memberType: resourcePoolMember.member_type,
      memberId: resourcePoolMember.id,
    });
  }, [
    removeMemberFromResourcePool,
    resourcePool.id,
    resourcePoolMember.id,
    resourcePoolMember.member_type,
  ]);

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
          Please confirm that you want to remove <strong>{label}</strong> from
          the <strong>{resourcePool.name}</strong> resource pool.
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
          Yes, remove member
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface DeleteResourcePoolButtonProps {
  resourcePool: ResourcePoolWithId;
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
  resourcePool: ResourcePoolWithId;
  toggle: () => void;
}

function DeleteResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
}: DeleteResourcePoolModalProps) {
  const { id, name } = resourcePool;

  const [deleteResourcePool, result] =
    useDeleteResourcePoolsByResourcePoolIdMutation();
  const onDelete = useCallback(() => {
    deleteResourcePool({ resourcePoolId: id });
  }, [deleteResourcePool, id]);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
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
        <Button className="ms-2" color="outline-danger" onClick={toggle}>
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
