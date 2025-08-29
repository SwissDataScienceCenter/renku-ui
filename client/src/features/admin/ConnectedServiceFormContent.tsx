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
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { Input, Label } from "reactstrap";

import type { ProviderForm } from "../connectedServices/api/connectedServices.types";

export interface ConnectedServiceFormContentProps {
  control: Control<ProviderForm, unknown>;
  errors: FieldErrors<ProviderForm>;
}
export default function ConnectedServiceFormContent({
  errors,
  control,
}: ConnectedServiceFormContentProps) {
  const watchKind = useWatch({ control, name: "kind" });

  return (
    <>
      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceKind">
          Kind
        </Label>
        <Controller
          control={control}
          name="kind"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx("form-control", error && "is-invalid")}
                id="addConnectedServiceKind"
                type="select"
                {...field}
              >
                <option value="gitlab">GitLab</option>
                <option value="github">GitHub</option>
                <option value="generic_oidc">Generic OIDC</option>
              </Input>
            </>
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a kind</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceApplicationSlug">
          Application slug
        </Label>
        <Controller
          control={control}
          name="app_slug"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceApplicationSlug"
              placeholder="Application slug"
              type="text"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">
          Please provide an application slug
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceDisplayName">
          Display Name
        </Label>
        <Controller
          control={control}
          name="display_name"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceDisplayName"
              placeholder="Display name"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a display name</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceUrl">
          URL
        </Label>
        <Controller
          control={control}
          name="url"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceUrl"
              placeholder="URL"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a URL</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceImageRegistryUrl">
          Image Registry URL (optional)
        </Label>
        <Controller
          control={control}
          name="image_registry_url"
          render={({ field }) => (
            <Input
              className={cx(
                "form-control",
                errors.image_registry_url && "is-invalid"
              )}
              id="addConnectedServiceImageRegistryUrl"
              placeholder="URL"
              type="text"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">
          Please provide a valid image registry URL
        </div>
      </div>

      <div className="mb-3">
        <Controller
          control={control}
          name="use_pkce"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-check-input", error && "is-invalid")}
              id="addConnectedServiceUsePkce"
              type="checkbox"
              checked={field.value}
              innerRef={field.ref}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
        <Label
          className={cx("form-check-label", "ms-2")}
          for="addConnectedServiceUsePkce"
        >
          Use PKCE
        </Label>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceClientId">
          Client ID
        </Label>
        <Controller
          control={control}
          name="client_id"
          render={({ field, fieldState: { error } }) => (
            <Input
              autoComplete="section-connected-service username"
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceClientId"
              placeholder="Client ID"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a client id</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceClientSecret">
          Client Secret (optional)
        </Label>
        <Controller
          control={control}
          name="client_secret"
          render={({ field, fieldState: { error } }) => (
            <Input
              autoComplete="section-connected-service current-password"
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceClientSecret"
              placeholder="Client Secret"
              type="password"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">
          Please provide a valid client secret or leave it empty
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceScope">
          Scope (optional)
        </Label>
        <Controller
          control={control}
          name="scope"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceScope"
              placeholder="Scope"
              type="text"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">
          Please provide a valid scope or leave it empty
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceImageRegistryUrl">
          Image registry URL (optional, for GitLab integrations)
        </Label>
        <Controller
          control={control}
          name="image_registry_url"
          render={({ field, fieldState: { error } }) => (
            <Input
              className={cx("form-control", error && "is-invalid")}
              id="addConnectedServiceImageRegistryUrl"
              placeholder="Image registry URL"
              type="text"
              {...field}
            />
          )}
        />
        <div className="invalid-feedback">
          Please provide a valid URL or leave it empty
        </div>
      </div>

      {watchKind === "generic_oidc" && (
        <div className="mb-3">
          <Label className="form-label" for="addConnectedServiceOidcIssuerUrl">
            OpenID Connect Issuer URL (optional, for OIDC integrations)
          </Label>
          <Controller
            control={control}
            name="oidc_issuer_url"
            render={({ field, fieldState: { error } }) => (
              <Input
                className={cx("form-control", error && "is-invalid")}
                id="addConnectedServiceOidcIssuerUrl"
                placeholder="OIDC Issuer URL"
                type="text"
                {...field}
              />
            )}
          />
          <div className="invalid-feedback">
            Please provide a valid URL or leave it empty
          </div>
        </div>
      )}
    </>
  );
}
