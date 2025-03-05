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

import {
  faCheck,
  faEdit,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { debounce } from "lodash-es";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Container,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { ErrorAlert, InfoAlert, WarnAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import ChevronFlippedIcon from "../../../components/icons/ChevronFlippedIcon";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { LockStatus, User } from "../../../model/renkuModels.types";
import { Docs } from "../../../utils/constants/Docs";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { isFetchBaseQueryError } from "../../../utils/helpers/ApiErrors";
import { Url } from "../../../utils/helpers/url";
import {
  ServerOptionBoolean,
  ServerOptionEnum,
  mergeDefaultUrlOptions,
} from "../../session/components/options/StartNotebookServerOptions";
import { useServerOptionsQuery } from "../../session/sessions.api";
import { ServerOptions } from "../../session/sessions.types";
import { ProjectConfig, StateModelProject } from "../project.types";
import { useGetConfigQuery, useUpdateConfigMutation } from "../projectCoreApi";
import { useCoreSupport } from "../useProjectCoreSupport";

import styles from "./ProjectSettingsSessions.module.scss";

type CoreServiceVersionedApiParams = {
  apiVersion: string | undefined;
  metadataVersion: number | undefined;
};

export default function ProjectSettingsSessions() {
  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const locked_ = useLegacySelector<LockStatus["locked"]>(
    (state) => state.stateModel.project.lockStatus.locked
  );
  const locked = locked_ ?? false;

  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery();

  // Project options
  const {
    defaultBranch,
    externalUrl: projectRepositoryUrl,
    namespace,
    path,
    accessLevel,
  } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );

  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;
  const {
    data: projectConfig,
    isLoading: projectConfigIsLoading,
    isFetching: projectConfigIsFetching,
    error,
  } = useGetConfigQuery(
    coreSupportComputed
      ? {
          apiVersion,
          metadataVersion,
          projectRepositoryUrl,
          branch: defaultBranch,
        }
      : skipToken
  );

  if (locked) {
    return (
      <SessionsDiv>
        <p className="text-muted">
          This project is currently being modified. You will be able to change
          the session settings once the changes to the project are complete.
        </p>
      </SessionsDiv>
    );
  }

  // Handle ongoing operations and errors
  if (
    serverOptionsIsLoading ||
    projectConfigIsLoading ||
    !coreSupportComputed
  ) {
    const message = serverOptionsIsLoading
      ? "Getting RenkuLab settings..."
      : projectConfigIsLoading
      ? "Getting project settings..."
      : !coreSupportComputed
      ? "Checking project version and RenkuLab compatibility..."
      : "Please wait...";

    return (
      <SessionsDiv>
        <p>{message}</p>
        <Loader />
      </SessionsDiv>
    );
  }

  const maintainerAccess = accessLevel >= ACCESS_LEVELS.MAINTAINER;
  if (!backendAvailable) {
    const settingsUrl = Url.get(Url.pages.project.settings, {
      namespace,
      path,
    });
    return (
      <SessionsDiv>
        <p>Session settings not available.</p>
        <WarnAlert dismissible={false}>
          <p>
            <b>Session settings are unavailable</b> because the project is not
            compatible with this RenkuLab instance.
          </p>
          <p className="mb-0">
            It is necessary to update this project.
            {!maintainerAccess && (
              <> Either contact a project maintainer, or fork and update it.</>
            )}
          </p>
          <p className="mb-0">
            The <Link to={settingsUrl}>Project settings</Link> page provides
            further information.
          </p>
        </WarnAlert>
      </SessionsDiv>
    );
  }

  if (
    error &&
    isFetchBaseQueryError(error) &&
    error.status === "CUSTOM_ERROR"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renkuCoreError = error.data as any;

    return (
      <SessionsDiv>
        <CoreErrorAlert
          error={renkuCoreError}
          message={renkuCoreError.reason ?? renkuCoreError.userMessage}
        />
      </SessionsDiv>
    );
  }

  if (!serverOptions || !projectConfig || error) {
    return (
      <SessionsDiv>
        <ErrorAlert dismissible={false}>
          <h3 className={cx("fs-6", "fw-bold")}>
            Error on loading session settings
          </h3>
        </ErrorAlert>
      </SessionsDiv>
    );
  }

  const devAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;
  return (
    <SessionsDiv
      projectConfigIsFetching={projectConfigIsFetching}
      enableSavingBadge
    >
      <UpdateStatus />
      {!devAccess && (
        <InfoAlert dismissible={false} timeout={0}>
          <p className="mb-0">
            Session settings can be changed only by project owners, maintainers
            and developers.
          </p>
          {!logged && (
            <p className={cx("mt-3", "mb-0")}>
              <LoginAlert
                logged={false}
                noWrapper={true}
                textPre="You can"
                textPost="here."
              />
            </p>
          )}
        </InfoAlert>
      )}

      <Card className="mb-4">
        <CardBody>
          <Container className="p-0" fluid>
            <Row>
              <DefaultUrlOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                serverOptions={serverOptions}
                projectConfig={projectConfig}
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
                devAccess={devAccess}
              />

              <ComputeResourceOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                devAccess={devAccess}
                optionInputAddon="CPUs"
                optionLabel="Number of CPUs"
                optionMinValue={0.1}
                optionName="interactive.cpu_request"
                optionStepValue={0.1}
                optionDefaultValue={
                  projectConfig.default.sessions?.legacyConfig?.cpuRequest
                }
                optionValue={
                  projectConfig.config.sessions?.legacyConfig?.cpuRequest
                }
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
              />
              <ComputeResourceOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                devAccess={devAccess}
                optionInputAddon="GB"
                optionInputAddonTooltip="Gigabytes"
                optionLabel="Amount of Memory"
                optionMinValue={1}
                optionName="interactive.mem_request"
                optionStepValue={1}
                optionSuffix="G"
                optionDefaultValue={
                  projectConfig.default.sessions?.legacyConfig?.memoryRequest
                }
                optionValue={
                  projectConfig.config.sessions?.legacyConfig?.memoryRequest
                }
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
              />
              <ComputeResourceOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                devAccess={devAccess}
                optionInputAddon="GB"
                optionInputAddonTooltip="Gigabytes"
                optionLabel="Amount of Storage"
                optionMinValue={1}
                optionName="interactive.disk_request"
                optionStepValue={1}
                optionSuffix="G"
                optionDefaultValue={projectConfig.default.sessions?.storage}
                optionValue={projectConfig.config.sessions?.storage}
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
              />
              <ComputeResourceOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                devAccess={devAccess}
                optionInputAddon="GPUs"
                optionLabel="Number of GPUs"
                optionMinValue={1}
                optionName="interactive.gpu_request"
                optionStepValue={1}
                optionDefaultValue={
                  projectConfig.default.sessions?.legacyConfig?.gpuRequest
                }
                optionValue={
                  projectConfig.config.sessions?.legacyConfig?.gpuRequest
                }
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
              />

              <AutoFetchLfsOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                projectConfig={projectConfig}
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={defaultBranch}
                devAccess={devAccess}
              />
            </Row>
          </Container>
        </CardBody>
      </Card>

      <ProjectSettingsSessionsAdvanced
        apiVersion={apiVersion}
        metadataVersion={metadataVersion}
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        branch={defaultBranch}
        devAccess={devAccess}
      />

      <ProjectSettingsSessionsUnknown
        apiVersion={apiVersion}
        metadataVersion={metadataVersion}
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        branch={defaultBranch}
        devAccess={devAccess}
      />
    </SessionsDiv>
  );
}

interface SessionsDivProps {
  enableSavingBadge?: boolean;
  projectConfigIsFetching?: boolean;
  children?: ReactNode;
}

const SessionsDiv = ({
  enableSavingBadge,
  projectConfigIsFetching,
  children,
}: SessionsDivProps) => (
  <div className="mt-2">
    <h3 className={cx("d-flex", "align-items-center", "gap-1")}>
      Session settings
      {enableSavingBadge && (
        <SavingBadge projectConfigIsFetching={projectConfigIsFetching} />
      )}
    </h3>
    <div className="-row form-rk-green">{children}</div>
  </div>
);

interface SavingBadgeProps {
  projectConfigIsFetching?: boolean;
}

const SavingBadge = ({ projectConfigIsFetching }: SavingBadgeProps) => {
  const [, { isLoading, isSuccess }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });
  const updating = projectConfigIsFetching || isLoading;

  const [saved, setSaved] = useState<boolean>(false);
  useEffect(() => {
    if (isSuccess) {
      setSaved(true);
      const timeout = window.setTimeout(() => setSaved(false), 3_000);
      return () => window.clearTimeout(timeout);
    }
  }, [isSuccess]);

  const [content, setContent] = useState<JSX.Element>(<></>);
  useEffect(() => {
    if (updating) {
      setContent(
        <>
          Saving <Loader inline size={13} />
        </>
      );
    }
    if (!updating && saved) {
      setContent(
        <>
          Saved <FontAwesomeIcon icon={faCheck} size="1x" />
        </>
      );
    }
  }, [saved, updating]);

  return (
    <div
      className={cx("d-flex", "fs-6", "fade", (updating || saved) && "show")}
    >
      <Badge className="btn-outline-rk-green text-white ms-1">{content}</Badge>
    </div>
  );
};

const UpdateStatus = () => {
  const [, { error }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  if (!error) {
    return null;
  }

  if (isFetchBaseQueryError(error) && error.status === "CUSTOM_ERROR") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renkuCoreError = error.data as any;

    const message = `Error occurred while updating project settings${
      renkuCoreError.reason
        ? `: ${renkuCoreError.reason}`
        : renkuCoreError.userMessage
        ? `: ${renkuCoreError.userMessage}`
        : "."
    }`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CoreErrorAlert error={renkuCoreError} message={message as any} />;
  }

  return (
    <ErrorAlert dismissible={false}>
      <h3 className={cx("fs-6", "fw-bold")}>
        Unknown error occurred while updating project settings.
      </h3>
    </ErrorAlert>
  );
};

interface DefaultUrlOptionProps extends CoreServiceVersionedApiParams {
  serverOptions: ServerOptions;
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const DefaultUrlOption = ({
  apiVersion,
  metadataVersion,
  serverOptions,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: DefaultUrlOptionProps) => {
  const defaultUrlOptions = [
    ...mergeDefaultUrlOptions({
      serverOptions,
      projectConfig,
    }),
  ];

  const { defaultUrl } = serverOptions;

  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<string | null>(null);

  const selectedDefaultUrl =
    newValue ??
    projectConfig.config.sessions?.defaultUrl ??
    projectConfig.default.sessions?.defaultUrl;
  const defaultValue = projectConfig.default.sessions?.defaultUrl ?? null;

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  const onChange = useCallback(
    (_event: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
      setNewValue(value);
      updateConfig({
        apiVersion,
        metadataVersion,
        projectRepositoryUrl,
        branch,
        update: {
          "interactive.default_url": value,
        },
      });
    },
    [apiVersion, branch, metadataVersion, projectRepositoryUrl, updateConfig]
  );

  const onReset = useCallback(() => {
    setNewValue(defaultValue);
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        "interactive.default_url": defaultValue,
      },
    });
  }, [
    apiVersion,
    branch,
    defaultValue,
    metadataVersion,
    projectRepositoryUrl,
    updateConfig,
  ]);

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label className="me-2">{defaultUrl.displayName}</Label>
        {defaultUrlOptions.length > 1 && <br />}
        <ServerOptionEnum
          {...defaultUrl}
          options={defaultUrlOptions}
          selected={selectedDefaultUrl}
          onChange={onChange}
          disabled={disabled}
        />
        {devAccess && (
          <ResetOption
            optionId="project-settings-sessions-default-url"
            disabled={disabled}
            onReset={onReset}
          />
        )}
      </FormGroup>
    </Col>
  );
};

interface ResetOptionProps {
  optionId: string;
  disabled: boolean;
  onReset: () => void;
}

const ResetOption = ({ optionId, disabled, onReset }: ResetOptionProps) => {
  return (
    <>
      <Button
        disabled={disabled}
        id={`${optionId}-reset`}
        color=""
        size="sm"
        className="border-0"
        onClick={onReset}
      >
        <FontAwesomeIcon icon={faTimesCircle} />
      </Button>
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target={`${optionId}-reset`}
      >
        Reset value
      </UncontrolledTooltip>
    </>
  );
};

interface ComputeResourceOptionProps extends CoreServiceVersionedApiParams {
  devAccess: boolean;
  optionInputAddon?: string;
  optionInputAddonTooltip?: ReactNode;
  optionLabel: string;
  optionMinValue?: number;
  optionMaxValue?: number;
  optionName: string;
  optionStepValue?: number;
  optionSuffix?: string;
  optionDefaultValue: number | undefined;
  optionValue: number | undefined;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
}

function ComputeResourceOption({
  apiVersion,
  metadataVersion,
  devAccess,
  optionInputAddon,
  optionInputAddonTooltip,
  optionLabel,
  optionMinValue,
  optionMaxValue,
  optionName,
  optionStepValue,
  optionSuffix = "",
  optionDefaultValue,
  optionValue,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
}: ComputeResourceOptionProps) {
  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<number | null>(null);

  const currentValue = newValue ?? optionValue ?? optionDefaultValue ?? "";

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });
  const debouncedUpdateConfig = useMemo(
    () => debounce(updateConfig, /*wait=*/ INPUT_NUMBER_DEBOUNCE_MS),
    [updateConfig]
  );

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.valueAsNumber;
      setNewValue(value);
      debouncedUpdateConfig({
        apiVersion,
        metadataVersion,
        projectRepositoryUrl,
        branch,
        update: {
          [optionName]: `${value}${optionSuffix}`,
        },
      });
    },
    [
      apiVersion,
      branch,
      debouncedUpdateConfig,
      metadataVersion,
      optionName,
      optionSuffix,
      projectRepositoryUrl,
    ]
  );

  const onReset = useCallback(() => {
    setNewValue(optionDefaultValue ?? null);
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        [optionName]: null,
      },
    });
  }, [
    apiVersion,
    branch,
    metadataVersion,
    optionDefaultValue,
    optionName,
    projectRepositoryUrl,
    updateConfig,
  ]);

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  const optionId = `project-settings-sessions-${optionName.replace(
    /[^0-9A-Z]/gi,
    "-"
  )}`;

  return (
    <Col xs={6}>
      <FormGroup className="field-group">
        <Label>{optionLabel}</Label>
        {devAccess && (
          <ResetOption
            optionId={optionId}
            disabled={disabled}
            onReset={onReset}
          />
        )}
        <InputGroup className={styles.inputNumberGroup}>
          <Input
            type="number"
            className={cx(styles.inputNumber, "rounded-start")}
            min={optionMinValue}
            max={optionMaxValue}
            step={optionStepValue}
            value={currentValue}
            onChange={onChange}
            disabled={disabled}
          />
          {optionInputAddon && (
            <InputGroupText id={`${optionId}-addon`} className={"rounded-end"}>
              {optionInputAddon}
            </InputGroupText>
          )}
          {optionInputAddon && optionInputAddonTooltip && (
            <UncontrolledTooltip target={`${optionId}-addon`}>
              {optionInputAddonTooltip}
            </UncontrolledTooltip>
          )}
        </InputGroup>
      </FormGroup>
    </Col>
  );
}

const INPUT_NUMBER_DEBOUNCE_MS = 1_000;

interface AutoFetchLfsOptionProps extends CoreServiceVersionedApiParams {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const AutoFetchLfsOption = ({
  apiVersion,
  metadataVersion,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: AutoFetchLfsOptionProps) => {
  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<boolean | null>(null);

  const selectedAutoFetchLfs =
    newValue ?? projectConfig.config.sessions?.lfsAutoFetch ?? false;

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  const onChange = useCallback(() => {
    setNewValue(!selectedAutoFetchLfs);
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        "interactive.lfs_auto_fetch": `${!selectedAutoFetchLfs}`,
      },
    });
  }, [
    apiVersion,
    branch,
    metadataVersion,
    projectRepositoryUrl,
    selectedAutoFetchLfs,
    updateConfig,
  ]);

  const onReset = useCallback(() => {
    setNewValue(false);
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        "interactive.lfs_auto_fetch": null,
      },
    });
  }, [apiVersion, branch, metadataVersion, projectRepositoryUrl, updateConfig]);

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  return (
    <Col xs={12}>
      <FormGroup className={cx("mb-0")} noMargin>
        <ServerOptionBoolean
          id="option-lfs-auto-fetch"
          displayName="Automatically fetch LFS data"
          onChange={onChange}
          selected={selectedAutoFetchLfs}
          disabled={disabled}
        />
        {devAccess && (
          <ResetOption
            optionId="project-settings-sessions-lfs-auto-fetch"
            disabled={disabled}
            onReset={onReset}
          />
        )}
      </FormGroup>
    </Col>
  );
};

interface ProjectSettingsSessionsAdvancedProps
  extends CoreServiceVersionedApiParams {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const ProjectSettingsSessionsAdvanced = ({
  apiVersion,
  metadataVersion,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: ProjectSettingsSessionsAdvancedProps) => {
  const imageIsSet = !!projectConfig.config.sessions?.dockerImage;

  // Collapse unknown values by default when none are already assigned
  const [showImage, setShowImage] = useState<boolean>(imageIsSet);

  const toggleShowImage = useCallback(() => {
    setShowImage((showImage) => !showImage);
  }, []);

  return (
    <div className="mb-4">
      <Col xs={12}>
        <Card>
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
              onClick={toggleShowImage}
              type="button"
            >
              Advanced settings
              <div className="ms-auto">
                <ChevronFlippedIcon flipped={showImage} />
              </div>
            </button>
          </CardHeader>

          <Collapse isOpen={showImage}>
            <CardBody>
              {devAccess && (
                <WarnAlert dismissible={false}>
                  Fixing an image can yield improvements, but it can also lead
                  to sessions not working in the expected way.{" "}
                  <ExternalLink
                    role="text"
                    title="Please consult the documentation"
                    url={Docs.rtdTopicGuide(
                      "sessions/customizing-sessions.html"
                    )}
                  />{" "}
                  before changing this setting.
                </WarnAlert>
              )}
              <PinnedImageOption
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                projectConfig={projectConfig}
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                branch={branch}
                devAccess={devAccess}
              />
            </CardBody>
          </Collapse>
        </Card>
      </Col>
    </div>
  );
};

interface PinnedImageOptionProps extends CoreServiceVersionedApiParams {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const PinnedImageOption = ({
  apiVersion,
  metadataVersion,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: PinnedImageOptionProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleIsEditing = useCallback(() => {
    setIsEditing((isEditing) => !isEditing);
  }, []);

  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<string | null>(null);

  const selectedPinnedImage =
    newValue ?? projectConfig.config.sessions?.dockerImage;

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  const onChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewValue(event.target.value);
    },
    []
  );

  const onSave = useCallback(() => {
    setIsEditing(false);
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        "interactive.image": newValue,
      },
    });
  }, [
    apiVersion,
    branch,
    metadataVersion,
    newValue,
    projectRepositoryUrl,
    updateConfig,
  ]);

  const onResetValue = useCallback(() => {
    setNewValue("");
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        "interactive.image": null,
      },
    });
  }, [apiVersion, branch, metadataVersion, projectRepositoryUrl, updateConfig]);

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  return (
    <FormGroup>
      <Label className="me-2">Docker image:</Label>
      {!selectedPinnedImage && !isEditing ? (
        <>
          <code className="me-2">none</code>
          {devAccess && (
            <>
              <Button
                id="project-settings-sessions-advanced-image-add"
                color=""
                size="sm"
                className="border-0"
                disabled={disabled}
                onClick={toggleIsEditing}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <UncontrolledTooltip
                placement="top"
                target="project-settings-sessions-advanced-image-add"
              >
                Set image
              </UncontrolledTooltip>
            </>
          )}
        </>
      ) : (
        <InputGroup className={cx((isEditing || devAccess) && "input-left")}>
          <Input
            value={selectedPinnedImage}
            onChange={onChangeInput}
            disabled={disabled || !isEditing}
          />
          {isEditing && (
            <>
              <Button
                id="project-settings-sessions-advanced-image-confirm"
                className={cx(
                  styles.pinnedImageButton,
                  "btn btn-outline-rk-green m-0"
                )}
                disabled={disabled}
                onClick={onSave}
              >
                <FontAwesomeIcon icon={faCheck} fixedWidth />
              </Button>
              <UncontrolledTooltip
                placement="top"
                target="project-settings-sessions-advanced-image-confirm"
              >
                Save changes
              </UncontrolledTooltip>
              <Button
                id="project-settings-sessions-advanced-image-back"
                className={cx(
                  styles.pinnedImageButton,
                  "btn btn-outline-rk-green m-0"
                )}
                disabled={disabled}
                onClick={toggleIsEditing}
              >
                <FontAwesomeIcon icon={faTrash} fixedWidth />
              </Button>
              <UncontrolledTooltip
                placement="top"
                target="project-settings-sessions-advanced-image-back"
              >
                Discard changes
              </UncontrolledTooltip>
            </>
          )}
          {!isEditing && devAccess && (
            <>
              <Button
                id="project-settings-sessions-advanced-image-edit"
                className={cx(
                  styles.pinnedImageButton,
                  "btn btn-outline-rk-green m-0"
                )}
                disabled={disabled}
                onClick={toggleIsEditing}
              >
                <FontAwesomeIcon icon={faEdit} fixedWidth />
              </Button>
              <UncontrolledTooltip
                placement="top"
                target="project-settings-sessions-advanced-image-edit"
              >
                Edit value
              </UncontrolledTooltip>
              <Button
                id="project-settings-sessions-advanced-image-reset"
                className={cx(
                  styles.pinnedImageButton,
                  "btn btn-outline-rk-green m-0"
                )}
                disabled={disabled}
                onClick={onResetValue}
              >
                <FontAwesomeIcon icon={faTimesCircle} fixedWidth />
              </Button>
              <UncontrolledTooltip
                placement="top"
                target="project-settings-sessions-advanced-image-reset"
              >
                Reset value
              </UncontrolledTooltip>
            </>
          )}
        </InputGroup>
      )}
      <div>
        <FormText>
          A URL of a RenkuLab-compatible Docker image. For an image from this
          project, consult{" "}
          <ExternalLink
            role="link"
            title="the list of images for this project"
            url={`${projectRepositoryUrl}/container_registry`}
          />
          .
        </FormText>
      </div>
    </FormGroup>
  );
};

interface ProjectSettingsSessionsUnknownProps
  extends CoreServiceVersionedApiParams {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const ProjectSettingsSessionsUnknown = ({
  apiVersion,
  metadataVersion,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: ProjectSettingsSessionsUnknownProps) => {
  const unknownConfig = projectConfig.config.sessions?.unknownConfig ?? {};
  const unknownConfigKeys = Object.keys(unknownConfig).sort();

  const [showSection, setShowSection] = useState<boolean>(false);

  const toggleShowSection = useCallback(() => {
    setShowSection((showSection) => !showSection);
  }, []);

  if (unknownConfigKeys.length == 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Col xs={12}>
        <Card>
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
              onClick={toggleShowSection}
              type="button"
            >
              Unknown settings
              <div className="ms-auto">
                <ChevronFlippedIcon flipped={showSection} />
              </div>
            </button>
          </CardHeader>

          <Collapse isOpen={showSection}>
            <CardBody>
              <p>
                The following settings are stored in the project configuration
                but they are not supported in this RenkuLab deployment.
              </p>
              {unknownConfigKeys.map((optionKey) => (
                <UnknownOption
                  apiVersion={apiVersion}
                  metadataVersion={metadataVersion}
                  key={optionKey}
                  optionKey={optionKey}
                  optionValue={unknownConfig[optionKey]}
                  projectConfigIsFetching={projectConfigIsFetching}
                  projectRepositoryUrl={projectRepositoryUrl}
                  branch={branch}
                  devAccess={devAccess}
                />
              ))}
            </CardBody>
          </Collapse>
        </Card>
      </Col>
    </div>
  );
};

interface UnknownOptionProps extends CoreServiceVersionedApiParams {
  optionKey: string;
  optionLabel?: string;
  optionValue: string;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  branch: string;
  devAccess: boolean;
}

const UnknownOption = ({
  apiVersion,
  metadataVersion,
  optionKey,
  optionLabel,
  optionValue,
  projectConfigIsFetching,
  projectRepositoryUrl,
  branch,
  devAccess,
}: UnknownOptionProps) => {
  const shortKey = optionKey.toLocaleLowerCase().startsWith("interactive")
    ? optionKey.slice("interactive.".length)
    : optionKey;
  const safeShortKey = shortKey.toLowerCase().replaceAll(/[^0-9A-Za-z]/g, "-");

  const [updateConfig, { isLoading }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  const onResetValue = useCallback(() => {
    updateConfig({
      apiVersion,
      metadataVersion,
      projectRepositoryUrl,
      branch,
      update: {
        [optionKey]: null,
      },
    });
  }, [
    apiVersion,
    branch,
    metadataVersion,
    optionKey,
    projectRepositoryUrl,
    updateConfig,
  ]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  return (
    <FormGroup>
      <InputGroup className={styles.unknownOptionGroup}>
        <InputGroupText className="rounded-start">
          {optionLabel || shortKey}
        </InputGroupText>
        <Input
          className={cx(!devAccess && "rounded-end")}
          value={optionValue || "<empty>"}
          disabled
        />
        {devAccess && (
          <>
            <Button
              id={`project-settings-unknown-${safeShortKey}-reset`}
              className="btn btn-outline-rk-green m-0 rounded-end"
              disabled={disabled}
              onClick={onResetValue}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </Button>
            <UncontrolledTooltip
              placement="top"
              target={`project-settings-unknown-${safeShortKey}-reset`}
            >
              Reset value
            </UncontrolledTooltip>
          </>
        )}
      </InputGroup>
    </FormGroup>
  );
};
