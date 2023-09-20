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
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button, Form, Input, Label } from "reactstrap";
import { Loader } from "../../components/Loader";
import {
  setKeycloakToken,
  useAdminComputeResourcesSelector,
} from "./adminComputeResources.slice";

export default function AdminPage() {
  return (
    <>
      <h1 className={cx("fs-2", "mb-3")}>Renku Admin Panel</h1>
      <ComputeResourcesSection />
    </>
  );
}

function ComputeResourcesSection() {
  const keycloakToken = useAdminComputeResourcesSelector(
    ({ keycloakToken }) => keycloakToken
  );

  return (
    <section>
      <h2 className="fs-5">Compute Resources</h2>
      <KeycloakTokenInput />
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
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
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
  );
}
