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
import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button, Form, Input, Label } from "reactstrap";
import { Loader } from "../../components/Loader";
import {
  setKeycloakToken,
  setKeycloakTokenIsValid,
  useAdminComputeResourcesSelector,
} from "./adminComputeResources.slice";
import {
  useGetResourcePoolsQuery,
  useGetUsersQuery,
} from "./adminComputeResources.api";
import { ErrorAlert } from "../../components/Alert";
import { isFetchBaseQueryError } from "../../utils/helpers/ApiErrors";
import { useGetKeycloakUsersQuery } from "./adminKeycloak.api";
import { CheckCircleFill } from "react-bootstrap-icons";

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
            {"https://renku-ci-ui-2752.dev.renku.ch/auth/admin/Renku/console/"}
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
    </div>
  );
}
