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
import {
  CheckCircleFill,
  CheckLg,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { ErrorAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import { isFetchBaseQueryError } from "../../utils/helpers/ApiErrors";
import { ResourcePool } from "../dataServices/dataServices";
import AddResourcePoolButton from "./AddResourcePoolButton";
import UpdateResourcePoolQuotaButton from "./UpdateResourcePoolQuotaButton";
import {
  useDeleteResourcePoolMutation,
  useGetResourcePoolUsersQuery,
  useGetResourcePoolsQuery,
  useGetUsersQuery,
} from "./adminComputeResources.api";
import {
  setKeycloakToken,
  setKeycloakTokenIsValid,
  useAdminComputeResourcesSelector,
} from "./adminComputeResources.slice";
import { useGetKeycloakUsersQuery } from "./adminKeycloak.api";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { NavLink } from "react-router-dom";
import { ExternalLink } from "../../components/ExternalLinks";

export default function AdminPage() {
  return (
    <>
      <h1 className={cx("fs-2", "mb-3")}>Renku Admin Panel</h1>
      <ComputeResourcesSection />
    </>
  );
}

function ComputeResourcesSection() {
  return (
    <section>
      <h2 className="fs-5">Compute Resources</h2>
      <KeycloakTokenInput />
      <AdminComputeResourcesOverview />
    </section>
  );
}

function KeycloakTokenInput() {
  const keycloakToken = useAdminComputeResourcesSelector(
    ({ keycloakToken }) => keycloakToken
  );

  const dispatch = useDispatch();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<{ keycloakToken: string }>({ defaultValues: { keycloakToken } });
  const onSubmit = useCallback(
    (data: { keycloakToken: string }) => {
      dispatch(setKeycloakToken(data.keycloakToken));
    },
    [dispatch]
  );

  return (
    <div>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3">
          <p>
            Go to{" "}
            <ExternalLink url="/auth/admin/Renku/console/">
              Keycloak
            </ExternalLink>{" "}
            for the token.
          </p>
        </div>

        <div>
          <Label className="form-label" for="adminKeycloakToken">
            Keycloak Token
          </Label>
          <Controller
            control={control}
            name="keycloakToken"
            render={({ field }) => (
              <Input
                className={cx(
                  "form-control",
                  errors.keycloakToken && "is-invalid"
                )}
                id="adminKeycloakToken"
                placeholder="token"
                type="text"
                {...field}
              />
            )}
            rules={{ required: true }}
          />
          <div className="invalid-feedback">Please provide a token</div>
        </div>
        <div>
          <Button
            className="btn-outline-rk-green"
            disabled={!isDirty}
            type="submit"
          >
            Set Token
          </Button>
        </div>
      </Form>

      <div className="mt-2">
        <KeycloakTokenCheck />
      </div>
    </div>
  );
}

function KeycloakTokenCheck() {
  const keycloakToken = useAdminComputeResourcesSelector(
    ({ keycloakToken }) => keycloakToken
  );

  const {
    data: users,
    error,
    isLoading,
    isFetching,
  } = useGetKeycloakUsersQuery({ keycloakToken }, { skip: !keycloakToken });

  const dispatch = useDispatch();

  useEffect(() => {
    const isValid = error == null && users != null;
    dispatch(setKeycloakTokenIsValid(isValid));
  }, [dispatch, error, users]);

  if (!keycloakToken) {
    return null;
  }

  if (isLoading || isFetching) {
    return (
      <p>
        <Loader className="me-2" inline size={16} />
        Checking keycloak token...
      </p>
    );
  }

  if (error && isFetchBaseQueryError(error) && error.status === 401) {
    return (
      <ErrorAlert dismissible={false}>
        <h3>
          Oops! It looks like you do not have the required permissions to view
          Keycloak users.
        </h3>
      </ErrorAlert>
    );
  }

  if (error || !users) {
    return (
      <ErrorAlert>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </ErrorAlert>
    );
  }

  return (
    <p>
      <CheckCircleFill className="me-1" />
      Your Keycloak token is valid.
    </p>
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
  } = useGetResourcePoolsQuery();

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
  const { data: resourcePools } = useGetResourcePoolsQuery();

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

  return (
    <Card className="mt-2">
      <CardHeader
        className={cx(
          "bg-white",
          "border-0",
          "fs-6",
          "fw-bold",
          "pt-3",
          "pb-0"
        )}
        tag="h5"
      >
        {name}
        {isDefault && <>{" (This is the default pool)"}</>}
      </CardHeader>
      <CardBody>
        <p>
          {isPublic
            ? "Public pool (everyone can use it)"
            : "Private pool (requires special access)"}
        </p>
        {quota != null ? (
          <div className={cx("hstack", "gap-2")}>
            <div>Quota:</div>
            <div>{quota.cpu} CPUs</div>
            <div className="vr"></div>
            <div>{quota.memory}&nbsp;GB RAM</div>
            <div className="vr"></div>
            <div>{quota.gpu} GPUs</div>
            <div className="ms-2">
              <UpdateResourcePoolQuotaButton resourcePool={resourcePool} />
            </div>
          </div>
        ) : (
          <p>No quota</p>
        )}
        <div>
          <pre>{JSON.stringify(resourcePool.classes, null, 2)}</pre>
        </div>

        <ResourcePoolUsers resourcePool={resourcePool} />
      </CardBody>
      <CardBody className={cx("d-flex", "flex-row", "justify-content-end")}>
        <DeleteResourcePoolButton resourcePool={resourcePool} />
      </CardBody>
    </Card>
  );
}

function ResourcePoolUsers({ resourcePool }: ResourcePoolItemProps) {
  const { id } = resourcePool;

  const keycloakTokenIsValid = useAdminComputeResourcesSelector(
    ({ keycloakTokenIsValid }) => keycloakTokenIsValid
  );

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
        <Loader className="me-2" inline size={16} />
        Loading users...
      </div>
    );
  }

  if (error || !resourcePoolUsers) {
    return <RtkErrorAlert error={error} />;
  }

  return (
    <div>
      <p>Users: {resourcePoolUsers.length}</p>
      {keycloakTokenIsValid ? null : (
        <p>Please set a valid Keycloak token to view and edit users.</p>
      )}
    </div>
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
        Delete
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
