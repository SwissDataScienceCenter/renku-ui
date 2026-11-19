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
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BoxArrowInLeft,
  Check,
  PlusLg,
  SkipForward,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Form,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import { WarnAlert } from "../../components/Alert";
import RtkOrDataServicesError from "../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../components/Loader";
import ScrollableModal from "../../components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import SelectUserSecretField from "../ProjectPageV2/ProjectPageContent/SessionSecrets/fields/SelectUserSecretField";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import { getSecretSlotSessionPath } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.utils";
import {
  usePatchProjectsByProjectIdSessionSecretsMutation,
  type Project,
  type SessionSecretSlot,
} from "../projectsV2/api/projectV2.api";
import {
  useGetUserQueryState,
  useGetUserSecretByIdQuery,
} from "../usersV2/api/users.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface VisibleItem {
  id: string;
  label: string;
}

interface SessionSecretsModalProps {
  embedded?: boolean;
  isOpen: boolean;
  project: Project;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
  onSkip?: () => void;
  onCancel?: () => void;
  title?: string;
  userSecretsReady?: boolean;
  visibleItems?: VisibleItem[];
}

export default function SessionSecretsModal({
  embedded = false,
  isOpen,
  project,
  sessionSecretSlotsWithSecrets,
  onSkip: onSkipProp,
  onCancel: onCancelProp,
  title = "Session secrets",
  userSecretsReady = false,
  visibleItems,
}: SessionSecretsModalProps) {
  const { data: user } = useGetUserQueryState();

  const navigate = useNavigate();
  const defaultOnCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const onCancel = onCancelProp ?? defaultOnCancel;

  const dispatch = useAppDispatch();

  const defaultOnSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setUserSecretsReady(true));
  }, [dispatch]);
  const onSkip = onSkipProp ?? defaultOnSkip;
  const pinnedSecrets = useMemo(() => {
    if (visibleItems == null) {
      return null;
    }
    const byId = new Map(
      sessionSecretSlotsWithSecrets.map((slot) => [slot.secretSlot.id, slot]),
    );
    return visibleItems.map((item) => ({
      item,
      slot: byId.get(item.id),
    }));
  }, [sessionSecretSlotsWithSecrets, visibleItems]);
  const loggedOutSlots =
    pinnedSecrets == null
      ? sessionSecretSlotsWithSecrets
      : pinnedSecrets.flatMap((row) => (row.slot == null ? [] : [row.slot]));

  const loginUrl = useLoginUrl();
  const secretRows = useMemo(() => {
    if (pinnedSecrets != null) {
      return pinnedSecrets;
    }
    return sessionSecretSlotsWithSecrets.map((slot) => ({
      item: { id: slot.secretSlot.id, label: slot.secretSlot.name },
      slot,
    }));
  }, [pinnedSecrets, sessionSecretSlotsWithSecrets]);
  const content = user?.isLoggedIn ? (
    <PinnedSessionSecrets
      rows={secretRows}
      secretsMountDirectory={project.secrets_mount_directory}
      userSecretsReady={userSecretsReady}
    />
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

      <LoggedOutSessionSecrets
        secretsMountDirectory={project.secrets_mount_directory}
        slots={loggedOutSlots}
        userSecretsReady={userSecretsReady && pinnedSecrets != null}
      />
    </>
  );

  const skipButton = (
    <Button
      color="outline-primary"
      data-cy="session-secrets-modal-skip-button"
      onClick={onSkip}
    >
      <SkipForward className={cx("bi", "me-1")} />
      Skip
    </Button>
  );

  if (embedded) {
    return <div data-cy="session-secrets-modal">{content}</div>;
  }

  return (
    <ScrollableModal
      centered
      data-cy="session-secrets-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">{title}</ModalHeader>
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
        {skipButton}
      </ModalFooter>
    </ScrollableModal>
  );
}

function LoggedOutSessionSecrets({
  secretsMountDirectory,
  slots,
  userSecretsReady,
}: {
  secretsMountDirectory: string;
  slots: SessionSecretSlotWithSecret[];
  userSecretsReady: boolean;
}) {
  const openIds = slots
    .filter((slot) => slot.secretId == null && !userSecretsReady)
    .map((slot) => sessionSecretAccordionId(slot.secretSlot.id));

  return (
    <SessionSecretAccordion openIds={openIds}>
      {slots.map((slot) => {
        const saved = slot.secretId != null;
        const accordionId = sessionSecretAccordionId(slot.secretSlot.id);
        if (saved) {
          return (
            <SavedSessionSecretItem
              key={slot.secretSlot.id}
              accordionId={accordionId}
              description={slot.secretSlot.description}
              filename={slot.secretSlot.filename}
              name={slot.secretSlot.name}
              saved
              secretId={slot.secretId}
              secretsMountDirectory={secretsMountDirectory}
              skipped={false}
            />
          );
        }
        return (
          <AccordionItem
            key={slot.secretSlot.id}
            data-cy={
              userSecretsReady ? "session-wizard-skipped-item" : undefined
            }
          >
            <AccordionHeader targetId={accordionId}>
              <SessionSecretAccordionTitle
                filename={slot.secretSlot.filename}
                name={slot.secretSlot.name}
              />
            </AccordionHeader>
            <AccordionBody accordionId={accordionId}>
              {slot.secretSlot.description && (
                <p>{slot.secretSlot.description}</p>
              )}
              <p className="mb-0">
                Location in sessions:{" "}
                <code>
                  {getSecretSlotSessionPath(
                    secretsMountDirectory,
                    slot.secretSlot.filename,
                  )}
                </code>
              </p>
            </AccordionBody>
          </AccordionItem>
        );
      })}
    </SessionSecretAccordion>
  );
}

function PinnedSessionSecrets({
  rows,
  secretsMountDirectory,
  userSecretsReady,
}: {
  rows: {
    item: VisibleItem;
    slot: SessionSecretSlotWithSecret | undefined;
  }[];
  secretsMountDirectory: string;
  userSecretsReady: boolean;
}) {
  const openIds = rows
    .filter((row) => sessionSecretStartsOpen(row, userSecretsReady))
    .map((row) => sessionSecretAccordionId(row.item.id));

  return (
    <SessionSecretAccordion openIds={openIds}>
      {rows.map((row) => (
        <PinnedSessionSecretItem
          key={row.item.id}
          row={row}
          secretsMountDirectory={secretsMountDirectory}
          userSecretsReady={userSecretsReady}
        />
      ))}
    </SessionSecretAccordion>
  );
}

function PinnedSessionSecretItem({
  row,
  secretsMountDirectory,
  userSecretsReady,
}: {
  row: {
    item: VisibleItem;
    slot: SessionSecretSlotWithSecret | undefined;
  };
  secretsMountDirectory: string;
  userSecretsReady: boolean;
}) {
  const accordionId = sessionSecretAccordionId(row.item.id);
  const saved = row.slot != null && !!row.slot.secretId;
  const skipped = userSecretsReady && !saved;
  if (!saved && row.slot != null) {
    return (
      <UnreadySessionSecretItem
        accordionId={accordionId}
        secretSlot={row.slot.secretSlot}
        skipped={skipped}
      />
    );
  }
  return (
    <SavedSessionSecretItem
      accordionId={accordionId}
      description={row.slot?.secretSlot.description}
      filename={row.slot?.secretSlot.filename}
      name={row.slot?.secretSlot.name ?? row.item.label}
      saved={saved}
      secretId={row.slot?.secretId}
      secretsMountDirectory={secretsMountDirectory}
      skipped={skipped}
    />
  );
}

function sessionSecretStartsOpen(
  row: { slot: SessionSecretSlotWithSecret | undefined },
  userSecretsReady: boolean,
): boolean {
  const saved = row.slot != null && !!row.slot.secretId;
  if (saved || userSecretsReady) {
    return false;
  }
  return row.slot != null;
}

function sessionSecretAccordionId(slotId: string): string {
  return `session-secret-${encodeURIComponent(slotId)}`;
}

function SessionSecretAccordion({
  children,
  openIds,
}: {
  children: ReactNode;
  openIds: string[];
}) {
  const openIdsKey = openIds.join("|");
  const [openState, setOpenState] = useState({
    key: openIdsKey,
    open: openIds,
  });
  if (openState.key !== openIdsKey) {
    setOpenState({ key: openIdsKey, open: openIds });
  }
  const open = openState.key === openIdsKey ? openState.open : openIds;
  const toggle = useCallback((targetId: string) => {
    setOpenState((current) => ({
      key: current.key,
      open: current.open.includes(targetId)
        ? current.open.filter((id) => id !== targetId)
        : [...current.open, targetId],
    }));
  }, []);

  return (
    <Accordion open={open} toggle={toggle}>
      {children}
    </Accordion>
  );
}

function SessionSecretAccordionTitle({
  filename,
  name,
}: {
  filename?: string;
  name: string;
}) {
  return (
    <span className="fw-bold">
      {name}
      {filename != null && filename !== "" && (
        <>
          {" (filename: "}
          <code>{filename}</code>
          {")"}
        </>
      )}
    </span>
  );
}

function SecretStatusBadge() {
  return (
    <span
      className={cx(
        "ms-2",
        "border",
        "badge",
        "fw-normal",
        "border-success",
        "bg-success-subtle",
        "text-success-emphasis",
      )}
    >
      <Check className="me-1" />
      Added secret value
    </span>
  );
}

function SavedSessionSecretItem({
  accordionId,
  description,
  filename,
  name,
  saved,
  secretId,
  secretsMountDirectory,
  skipped,
}: {
  accordionId: string;
  description?: string;
  filename?: string;
  name: string;
  saved: boolean;
  secretId?: string | null;
  secretsMountDirectory: string;
  skipped: boolean;
}) {
  const dataCy = skipped
    ? "session-wizard-skipped-item"
    : "session-wizard-resolved-item";
  return (
    <AccordionItem data-cy={dataCy}>
      <AccordionHeader targetId={accordionId}>
        <SessionSecretAccordionTitle filename={filename} name={name} />
        {saved && <SecretStatusBadge />}
      </AccordionHeader>
      <AccordionBody accordionId={accordionId}>
        {saved && secretId != null && (
          <SavedSessionSecretDetails
            description={description}
            filename={filename}
            secretId={secretId}
            secretsMountDirectory={secretsMountDirectory}
          />
        )}
      </AccordionBody>
    </AccordionItem>
  );
}

function SavedSessionSecretDetails({
  description,
  filename,
  secretId,
  secretsMountDirectory,
}: {
  description?: string;
  filename?: string;
  secretId: string;
  secretsMountDirectory: string;
}) {
  const location =
    filename != null && filename !== ""
      ? getSecretSlotSessionPath(secretsMountDirectory, filename)
      : undefined;
  return (
    <>
      <p className="mb-2">
        Secret name:{" "}
        <span className="fw-bold">
          <SessionSecretName secretId={secretId} />
        </span>
      </p>
      {description && <p className="mb-2">{description}</p>}
      {location != null && (
        <p className="mb-0">
          Location in sessions: <code>{location}</code>
        </p>
      )}
    </>
  );
}

function SessionSecretName({ secretId }: { secretId: string }) {
  const { data: userSecret, error } = useGetUserSecretByIdQuery({ secretId });
  if (error != null || userSecret == null) {
    return null;
  }
  return <>{userSecret.name}</>;
}

interface UnreadySessionSecretItemProps {
  accordionId?: string;
  secretSlot: SessionSecretSlot;
  skipped?: boolean;
}

function UnreadySessionSecretItem({
  accordionId,
  secretSlot,
  skipped = false,
}: UnreadySessionSecretItemProps) {
  const { name, description, filename } = secretSlot;
  const editor = (
    <SessionSecretValueEditor
      plain={accordionId != null}
      secretSlot={secretSlot}
    />
  );

  if (accordionId != null) {
    return (
      <AccordionItem
        data-cy={
          skipped
            ? "session-wizard-skipped-item"
            : "session-secrets-unready-item"
        }
      >
        <AccordionHeader targetId={accordionId}>
          <SessionSecretAccordionTitle filename={filename} name={name} />
        </AccordionHeader>
        <AccordionBody accordionId={accordionId}>
          <div data-cy={skipped ? "session-secrets-unready-item" : undefined}>
            {description && <p>{description}</p>}
            {editor}
          </div>
        </AccordionBody>
      </AccordionItem>
    );
  }

  return (
    <Col xs={12} data-cy={skipped ? "session-wizard-skipped-item" : undefined}>
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
        {editor}
      </Card>
    </Col>
  );
}

function SessionSecretValueEditor({
  plain,
  secretSlot,
}: {
  plain: boolean;
  secretSlot: SessionSecretSlot;
}) {
  const { id: slotId } = secretSlot;
  const [mode, setMode] = useState<"new-value" | "existing">("new-value");
  const newValueId = `provide-session-secret-mode-new-value-${slotId}`;
  const existingId = `provide-session-secret-mode-existing-${slotId}`;

  return (
    <>
      <SecretItemSurface plain={plain}>
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
      </SecretItemSurface>
      {mode === "new-value" ? (
        <ProvideNewValueContent plain={plain} secretSlot={secretSlot} />
      ) : (
        <ProvideExistingContent plain={plain} secretSlot={secretSlot} />
      )}
    </>
  );
}

function SecretItemSurface({
  children,
  className,
  plain,
}: {
  children: ReactNode;
  className?: string;
  plain: boolean;
}) {
  if (plain) {
    return <div className={cx("mb-3", className)}>{children}</div>;
  }
  return <CardBody className={className}>{children}</CardBody>;
}

interface ProvideNewValueContentProps {
  plain?: boolean;
  secretSlot: SessionSecretSlot;
}
function ProvideNewValueContent({
  plain = false,
  secretSlot,
}: ProvideNewValueContentProps) {
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
    [patchSessionSecrets, projectId, slotId],
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler],
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
      <SecretItemSurface className="py-0" plain={plain}>
        {result.error && (
          <RtkOrDataServicesError error={result.error} dismissible={false} />
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
      </SecretItemSurface>
      <SecretItemSurface
        className={cx("d-flex", "flex-row", "justify-content-end")}
        plain={plain}
      >
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
      </SecretItemSurface>
    </Form>
  );
}

interface ProvideNewSecretValueForm {
  value: string;
}

interface ProvideExistingContentProps {
  plain?: boolean;
  secretSlot: SessionSecretSlot;
}

function ProvideExistingContent({
  plain = false,
  secretSlot,
}: ProvideExistingContentProps) {
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
    [patchSessionSecrets, projectId, slotId],
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler],
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
      <SecretItemSurface className="py-0" plain={plain}>
        {result.error && (
          <RtkOrDataServicesError error={result.error} dismissible={false} />
        )}

        <SelectUserSecretField
          control={control}
          errors={errors}
          formId={formId}
          name="secretId"
        />
      </SecretItemSurface>
      <SecretItemSurface
        className={cx("d-flex", "flex-row", "justify-content-end")}
        plain={plain}
      >
        <Button color="primary" disabled={result.isLoading} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <BoxArrowInLeft className={cx("bi", "me-1")} />
          )}
          Use secret
        </Button>
      </SecretItemSurface>
    </Form>
  );
}

interface ProvideExistingSecretForm {
  secretId: string;
}
