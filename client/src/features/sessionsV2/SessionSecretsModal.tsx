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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BoxArrowInLeft,
  CheckCircleFill,
  PlusLg,
  SkipForward,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Form,
  Input,
  Label,
  ListGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import { WarnAlert } from "../../components/Alert";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import ScrollableModal from "../../components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import SelectUserSecretField from "../ProjectPageV2/ProjectPageContent/SessionSecrets/fields/SelectUserSecretField";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import SessionSecretSlotItem from "../ProjectPageV2/ProjectPageContent/SessionSecrets/SessionSecretSlotItem";
import {
  usePatchProjectsByProjectIdSessionSecretsMutation,
  type Project,
  type SessionSecretSlot,
} from "../projectsV2/api/projectV2.api";
import { useGetUserQueryState } from "../usersV2/api/users.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface SessionSecretsModalProps {
  isOpen: boolean;
  project: Project;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

export default function SessionSecretsModal({
  isOpen,
  project,
  sessionSecretSlotsWithSecrets,
}: SessionSecretsModalProps) {
  const { data: user } = useGetUserQueryState();

  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  const dispatch = useAppDispatch();

  const onSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setUserSecretsReady(true));
  }, [dispatch]);

  const loginUrl = useLoginUrl();
  const content = user?.isLoggedIn ? (
    <>
      <ReadySessionSecrets
        sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
      />
      <UnreadySessionSecrets
        sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
      />
    </>
  ) : (
    <>
      <WarnAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          This session is expecting some secrets.{" "}
          <a
            className={cx("btn", "btn-primary", "btn-sm")}
            href={loginUrl.href}
          >
            Log in
          </a>{" "}
          to provide a value for these secrets.
        </p>
      </WarnAlert>

      <h3>Required secrets</h3>
      <ListGroup>
        {sessionSecretSlotsWithSecrets.map((secretSlot) => (
          <SessionSecretSlotItem
            key={secretSlot.secretSlot.id}
            secretsMountDirectory={project.secrets_mount_directory}
            secretSlot={secretSlot}
            noActions
          />
        ))}
      </ListGroup>
    </>
  );

  return (
    <ScrollableModal
      centered
      data-cy="session-secrets-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">Session secrets</ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          data-cy="session-secrets-modal-cancel-button"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          data-cy="session-secrets-modal-skip-button"
          onClick={onSkip}
        >
          <SkipForward className={cx("bi", "me-1")} />
          Skip
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

interface ReadySessionSecretsProps {
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function ReadySessionSecrets({
  sessionSecretSlotsWithSecrets,
}: ReadySessionSecretsProps) {
  const readySessionSecrets = useMemo(
    () => sessionSecretSlotsWithSecrets.filter(({ secretId }) => secretId),
    [sessionSecretSlotsWithSecrets]
  );

  if (readySessionSecrets.length == 0) {
    return null;
  }

  return (
    <>
      <h3>Ready</h3>
      <div className="mb-3" data-cy="session-secrets-ready">
        {readySessionSecrets.map(({ secretSlot }) => (
          <ReadySessionSecretItem key={secretSlot.id} secretSlot={secretSlot} />
        ))}
      </div>
    </>
  );
}

interface ReadySessionSecretItemProps {
  secretSlot: SessionSecretSlot;
}

function ReadySessionSecretItem({ secretSlot }: ReadySessionSecretItemProps) {
  const { name, filename } = secretSlot;

  return (
    <div>
      <span>
        <CheckCircleFill className={cx("bi", "me-1", "text-success")} />
        <span className="fw-bold">{name}</span>
        {" (filename: "}
        <code>{filename}</code>
        {")"}
      </span>
    </div>
  );
}

interface UnreadySessionSecretsProps {
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function UnreadySessionSecrets({
  sessionSecretSlotsWithSecrets,
}: UnreadySessionSecretsProps) {
  const unreadySessionSecrets = useMemo(
    () => sessionSecretSlotsWithSecrets.filter(({ secretId }) => !secretId),
    [sessionSecretSlotsWithSecrets]
  );

  if (unreadySessionSecrets.length == 0) {
    return null;
  }

  return (
    <>
      <h3>Required secrets</h3>
      <Row className="gy-3">
        {unreadySessionSecrets.map(({ secretSlot }) => (
          <UnreadySessionSecretItem
            key={secretSlot.id}
            secretSlot={secretSlot}
          />
        ))}
      </Row>
    </>
  );
}

interface UnreadySessionSecretItemProps {
  secretSlot: SessionSecretSlot;
}

function UnreadySessionSecretItem({
  secretSlot,
}: UnreadySessionSecretItemProps) {
  const { id: slotId, name, description, filename } = secretSlot;

  const [mode, setMode] = useState<"new-value" | "existing">("new-value");

  const newValueId = `provide-session-secret-mode-new-value-${slotId}`;
  const existingId = `provide-session-secret-mode-existing-${slotId}`;

  return (
    <Col xs={12}>
      <Card data-cy="session-secrets-unready-item">
        <CardBody className="pb-0">
          <div className="fw-bold">
            {name}
            {" (filename: "}
            <code>{filename}</code>
            {")"}
          </div>
          {description && <p className="mb-0">{description}</p>}
        </CardBody>
        <CardBody>
          <ButtonGroup>
            <Input
              type="radio"
              className="btn-check"
              id={newValueId}
              value="new-value"
              checked={mode == "new-value"}
              onChange={() => setMode("new-value")}
            />
            <Label
              for={newValueId}
              className={cx("btn", "btn-outline-primary")}
              data-cy="session-secrets-unready-new-value-tab"
            >
              <PlusLg className={cx("bi", "me-1")} />
              Provide a new secret value
            </Label>
            <Input
              type="radio"
              className="btn-check"
              id={existingId}
              value="existing"
              checked={mode == "existing"}
              onChange={() => setMode("existing")}
            />
            <Label
              for={existingId}
              className={cx("btn", "btn-outline-primary")}
              data-cy="session-secrets-unready-existing-tab"
            >
              <BoxArrowInLeft className={cx("bi", "me-1")} />
              Use an existing secret value
            </Label>
          </ButtonGroup>
        </CardBody>
        {mode === "new-value" ? (
          <ProvideNewValueContent secretSlot={secretSlot} />
        ) : (
          <ProvideExistingContent secretSlot={secretSlot} />
        )}
      </Card>
    </Col>
  );
}

interface ProvideNewValueContentProps {
  secretSlot: SessionSecretSlot;
}
function ProvideNewValueContent({ secretSlot }: ProvideNewValueContentProps) {
  const { id: slotId, project_id: projectId } = secretSlot;

  const [patchSessionSecrets, result] =
    usePatchProjectsByProjectIdSessionSecretsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProvideNewSecretValueForm>({
    defaultValues: { value: "" },
  });

  const submitHandler = useCallback(
    (data: ProvideNewSecretValueForm) => {
      patchSessionSecrets({
        projectId,
        sessionSecretPatchList: [{ secret_slot_id: slotId, value: data.value }],
      });
    },
    [patchSessionSecrets, projectId, slotId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({ value: "" });
  }, [reset, secretSlot]);

  if (result.isSuccess) {
    return null;
  }

  const newValueFieldId = `provide-session-secret-new-value-${slotId}`;

  return (
    <Form noValidate onSubmit={onSubmit}>
      <CardBody className="py-0">
        {result.error && (
          <RtkOrNotebooksError error={result.error} dismissible={false} />
        )}

        <div className="mb-3">
          <Label for={newValueFieldId}>Secret value</Label>
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <textarea
                id={newValueFieldId}
                className={cx("form-control", errors.value && "is-invalid")}
                placeholder="Your secret value..."
                rows={6}
                data-cy="session-secrets-unready-new-value-input"
                {...field}
              />
            )}
            rules={{ required: "Please provide a value" }}
          />
          <div className="invalid-feedback">
            {errors.value?.message ? (
              <>{errors.value?.message}</>
            ) : (
              <>Invalid secret value</>
            )}
          </div>
        </div>
      </CardBody>
      <CardBody className={cx("d-flex", "flex-row", "justify-content-end")}>
        <Button
          color="primary"
          disabled={result.isLoading}
          type="submit"
          data-cy="session-secrets-unready-save-button"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Save new secret
        </Button>
      </CardBody>
    </Form>
  );
}

interface ProvideNewSecretValueForm {
  value: string;
}

interface ProvideExistingContentProps {
  secretSlot: SessionSecretSlot;
}

function ProvideExistingContent({ secretSlot }: ProvideExistingContentProps) {
  const { id: slotId, project_id: projectId } = secretSlot;

  const [patchSessionSecrets, result] =
    usePatchProjectsByProjectIdSessionSecretsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProvideExistingSecretForm>({
    defaultValues: { secretId: "" },
  });

  const submitHandler = useCallback(
    (data: ProvideExistingSecretForm) => {
      patchSessionSecrets({
        projectId,
        sessionSecretPatchList: [
          { secret_slot_id: slotId, secret_id: data.secretId },
        ],
      });
    },
    [patchSessionSecrets, projectId, slotId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({ secretId: "" });
  }, [reset, secretSlot]);

  if (result.isSuccess) {
    return null;
  }

  const formId = `existing-${slotId}`;

  return (
    <Form noValidate onSubmit={onSubmit}>
      <CardBody className="py-0">
        {result.error && (
          <RtkOrNotebooksError error={result.error} dismissible={false} />
        )}

        <SelectUserSecretField
          control={control}
          errors={errors}
          formId={formId}
          name="secretId"
        />
      </CardBody>
      <CardBody className={cx("d-flex", "flex-row", "justify-content-end")}>
        <Button color="primary" disabled={result.isLoading} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <BoxArrowInLeft className={cx("bi", "me-1")} />
          )}
          Use secret
        </Button>
      </CardBody>
    </Form>
  );
}

interface ProvideExistingSecretForm {
  secretId: string;
}
