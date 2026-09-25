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
import { useEffect, useMemo } from "react";
import { ShieldLock } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
import { Form } from "reactstrap";

import { getSecretSlotSessionPath } from "~/features/ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.utils";
import type { SessionSecretSlot } from "../../projectsV2/api/projectV2.api";
import type {
  SecretAccessPolicyName,
  SessionLauncher,
} from "../api/sessionLaunchersV2.api";
import LauncherResourceModal, {
  AccessPolicySelect,
  LauncherResourceTable,
} from "./LauncherResourceModal";
import {
  DEFAULT_SECRET_ACCESS_POLICY,
  SECRET_ACCESS_OPTIONS,
} from "./launcherResources.constants";

interface SessionSecretAccessField {
  filename: string;
  name: string;
  policy: SecretAccessPolicyName;
  secretSlotId: string;
}

interface SessionSecretsForm {
  secrets: SessionSecretAccessField[];
}

function getDefaultValues(
  sessionSecretSlots: SessionSecretSlot[],
): SessionSecretsForm {
  return {
    secrets: sessionSecretSlots.map((secretSlot) => ({
      filename: secretSlot.filename,
      name: secretSlot.name,
      policy: DEFAULT_SECRET_ACCESS_POLICY,
      secretSlotId: secretSlot.id,
    })),
  };
}

interface SessionSecretRowProps {
  control: Control<SessionSecretsForm>;
  filename: string;
  index: number;
  name: string;
  secretsMountDirectory: string;
}

function SessionSecretRow({
  control,
  filename,
  index,
  name,
  secretsMountDirectory,
}: SessionSecretRowProps) {
  const sessionPath = getSecretSlotSessionPath(secretsMountDirectory, filename);

  return (
    <tr data-cy="launcher-session-secret-row">
      <td className="align-middle">{name}</td>
      <td className={cx("align-middle", "text-break")}>
        <code>{sessionPath}</code>
      </td>
      <td className="align-middle">
        <Controller
          control={control}
          name={`secrets.${index}.policy`}
          render={({ field }) => {
            const { ref, ...fieldProps } = field;
            return (
              <AccessPolicySelect
                ariaLabel={`Access for ${name}`}
                data-cy={`launcher-session-secret-access_${index}`}
                innerRef={ref}
                options={SECRET_ACCESS_OPTIONS}
                {...fieldProps}
              />
            );
          }}
        />
      </td>
    </tr>
  );
}

interface CustomizeSessionSecretsModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  secretsMountDirectory: string;
  sessionSecretSlots: SessionSecretSlot[];
  toggle: () => void;
}

export default function CustomizeSessionSecretsModal({
  isOpen,
  launcher,
  secretsMountDirectory,
  sessionSecretSlots,
  toggle,
}: CustomizeSessionSecretsModalProps) {
  const defaultValues = useMemo(
    () => getDefaultValues(sessionSecretSlots),
    [sessionSecretSlots],
  );

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<SessionSecretsForm>({ defaultValues });
  const { fields } = useFieldArray({ control, name: "secrets" });
  const onSave = handleSubmit(() => {});

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  return (
    <LauncherResourceModal
      dataCy="customize-session-secrets-modal"
      description="Limit access to session secrets in this launcher."
      icon={<ShieldLock className={cx("bi", "me-1")} />}
      isDirty={isDirty}
      isOpen={isOpen}
      onSave={onSave}
      title={`Customize Session Secrets in ${launcher.name}`}
      toggle={toggle}
    >
      {fields.length < 1 ? (
        <p className={cx("fst-italic", "mb-0")}>No session secrets included</p>
      ) : (
        <Form noValidate onSubmit={onSave}>
          <LauncherResourceTable
            dataCy="launcher-session-secrets-table"
            headers={["Secret name", "Location in session", "Access"]}
          >
            {fields.map((field, index) => (
              <SessionSecretRow
                key={field.id}
                control={control}
                filename={field.filename}
                index={index}
                name={field.name}
                secretsMountDirectory={secretsMountDirectory}
              />
            ))}
          </LauncherResourceTable>
        </Form>
      )}
    </LauncherResourceModal>
  );
}
