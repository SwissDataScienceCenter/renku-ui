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

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  faCheck,
  faEdit,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import debounce from "lodash/debounce";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  AccordionProps,
  Badge,
  Button,
  Col,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  UncontrolledTooltip,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import { ErrorAlert, WarnAlert } from "../../components/Alert";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import { ThrottledTooltip } from "../../components/Tooltip";
import { CoreErrorAlert } from "../../components/errors/CoreErrorAlert";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import {
  ProjectConfig,
  StateModelProject,
} from "../../features/project/Project";
import {
  useGetConfigQuery,
  useUpdateConfigMutation,
} from "../../features/project/projectCoreApi";
import { useCoreSupport } from "../../features/project/useProjectCoreSupport";
import {
  ServerOptionBoolean,
  ServerOptionEnum,
  mergeDefaultUrlOptions,
} from "../../features/session/components/options/StartNotebookServerOptions";
import { useServerOptionsQuery } from "../../features/session/sessions.api";
import { ServerOptions } from "../../features/session/sessions.types";
import { LockStatus, User } from "../../model/RenkuModels";
import { Docs } from "../../utils/constants/Docs";
import { isFetchBaseQueryError } from "../../utils/helpers/ApiErrors";
import { Url } from "../../utils/helpers/url";
import styles from "./ProjectSettingsSessions.module.scss";

export const ProjectSettingsSessions = () => {
  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const locked_ = useSelector<RootStateOrAny, LockStatus["locked"]>(
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
  } = useSelector<RootStateOrAny, StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );

  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    backendAvailable,
    computed: coreSupportComputed,
    versionUrl,
  } = coreSupport;
  const {
    data: projectConfig,
    isLoading: projectConfigIsLoading,
    isFetching: projectConfigIsFetching,
    error,
  } = useGetConfigQuery(
    {
      projectRepositoryUrl,
      versionUrl,
    },
    { skip: !coreSupportComputed }
  );

  // ? Anonymous users may have problem with notebook options, depending on the deployment
  if (!logged) {
    const textIntro = "Only authenticated users can access sessions setting.";
    const textPost = "to visualize sessions settings.";
    return (
      <SessionsDiv>
        <LoginAlert logged={logged} textIntro={textIntro} textPost={textPost} />
      </SessionsDiv>
    );
  }

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

  const devAccess = accessLevel > ACCESS_LEVELS.DEVELOPER;
  if (!backendAvailable) {
    const settingsUrl = Url.get(Url.pages.project.settings, {
      namespace,
      path,
    });
    const updateInfo = devAccess
      ? "It is necessary to update this project"
      : "It is necessary to update this project. Either contact a project maintainer, or fork and update it";
    return (
      <SessionsDiv>
        <p>Session settings not available.</p>
        <WarnAlert dismissible={false}>
          <p>
            <b>Session settings are unavailable</b> because the project is not
            compatible with this RenkuLab instance.
          </p>
          <p>
            {updateInfo}.
            <br />
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

  return (
    <SessionsDiv
      projectConfigIsFetching={projectConfigIsFetching}
      enableSavingBadge
    >
      <UpdateStatus />
      {!devAccess && (
        <p>Settings can be changed only by developers and maintainers.</p>
      )}
      <DefaultUrlOption
        serverOptions={serverOptions}
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />

      <ComputeResourceOption
        devAccess={devAccess}
        optionInputAddon="CPUs"
        optionLabel="Number of CPUs"
        optionMinValue={0.1}
        optionName="interactive.cpu_request"
        optionStepValue={0.1}
        optionDefaultValue={
          projectConfig.default.sessions?.legacyConfig?.cpuRequest
        }
        optionValue={projectConfig.config.sessions?.legacyConfig?.cpuRequest}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
      />
      <ComputeResourceOption
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
        optionValue={projectConfig.config.sessions?.legacyConfig?.memoryRequest}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
      />
      <ComputeResourceOption
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
        versionUrl={versionUrl}
      />
      <ComputeResourceOption
        devAccess={devAccess}
        optionInputAddon="GPUs"
        optionLabel="Number of GPUs"
        optionMinValue={1}
        optionName="interactive.gpu_request"
        optionStepValue={1}
        optionDefaultValue={
          projectConfig.default.sessions?.legacyConfig?.gpuRequest
        }
        optionValue={projectConfig.config.sessions?.legacyConfig?.gpuRequest}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
      />

      <AutoFetchLfsOption
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />

      <ProjectSettingsSessionsAdvanced
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />

      <ProjectSettingsSessionsUnknown
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />
    </SessionsDiv>
  );
};

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
    <h3 className="d-flex align-items-center">
      Session settings
      {enableSavingBadge && (
        <SavingBadge projectConfigIsFetching={projectConfigIsFetching} />
      )}
    </h3>
    <div className="row form-rk-green">{children}</div>
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
    <div className={cx("d-flex", "fade", (updating || saved) && "show")}>
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

interface DefaultUrlOptionProps {
  serverOptions: ServerOptions;
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const DefaultUrlOption = ({
  serverOptions,
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
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
        projectRepositoryUrl,
        versionUrl,
        update: {
          "interactive.default_url": value,
        },
      });
    },
    [projectRepositoryUrl, updateConfig, versionUrl]
  );

  const onReset = useCallback(() => {
    setNewValue(defaultValue);
    updateConfig({
      projectRepositoryUrl,
      versionUrl,
      update: {
        "interactive.default_url": defaultValue,
      },
    });
  }, [defaultValue, projectRepositoryUrl, updateConfig, versionUrl]);

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

interface ComputeResourceOptionProps {
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
  versionUrl: string;
}

function ComputeResourceOption({
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
  versionUrl,
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
        projectRepositoryUrl,
        versionUrl,
        update: {
          [optionName]: `${value}${optionSuffix}`,
        },
      });
    },
    [
      debouncedUpdateConfig,
      optionName,
      optionSuffix,
      projectRepositoryUrl,
      versionUrl,
    ]
  );

  const onReset = useCallback(() => {
    setNewValue(optionDefaultValue ?? null);
    updateConfig({
      projectRepositoryUrl,
      versionUrl,
      update: {
        [optionName]: null,
      },
    });
  }, [
    optionDefaultValue,
    optionName,
    projectRepositoryUrl,
    updateConfig,
    versionUrl,
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
            // eslint-disable-next-line spellcheck/spell-checker
            // TODO(@leafty): remove `|| currentValue === ""` once https://github.com/SwissDataScienceCenter/renku-python/issues/3544 is fixed
            disabled={disabled || currentValue === ""}
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
            <ThrottledTooltip
              target={`${optionId}-addon`}
              tooltip={optionInputAddonTooltip}
            />
          )}
        </InputGroup>
      </FormGroup>
    </Col>
  );
}

const INPUT_NUMBER_DEBOUNCE_MS = 1_000;

interface AutoFetchLfsOptionProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const AutoFetchLfsOption = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
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
      projectRepositoryUrl,
      versionUrl,
      update: {
        "interactive.lfs_auto_fetch": `${!selectedAutoFetchLfs}`,
      },
    });
  }, [projectRepositoryUrl, selectedAutoFetchLfs, updateConfig, versionUrl]);

  const onReset = useCallback(() => {
    setNewValue(false);
    updateConfig({
      projectRepositoryUrl,
      versionUrl,
      update: {
        "interactive.lfs_auto_fetch": null,
      },
    });
  }, [projectRepositoryUrl, updateConfig, versionUrl]);

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

interface ProjectSettingsSessionsAdvancedProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const ProjectSettingsSessionsAdvanced = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
  devAccess,
}: ProjectSettingsSessionsAdvancedProps) => {
  const imageIsSet = !!projectConfig.config.sessions?.dockerImage;

  // Collapse unknown values by default when none are already assigned
  const [showImage, setShowImage] = useState<boolean>(imageIsSet);

  const toggleShowImage = useCallback(() => {
    setShowImage((showImage) => !showImage);
  }, []);

  return (
    <div className="mb-2">
      <Col xs={12}>
        <AccordionFixed
          className={styles.accordion}
          open={showImage ? "advanced-settings" : ""}
          toggle={toggleShowImage}
          flush
        >
          <AccordionItem>
            <AccordionHeader targetId="advanced-settings">
              Advanced settings
            </AccordionHeader>
            <AccordionBody accordionId="advanced-settings">
              {devAccess && (
                <WarnAlert>
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
                projectConfig={projectConfig}
                projectConfigIsFetching={projectConfigIsFetching}
                projectRepositoryUrl={projectRepositoryUrl}
                versionUrl={versionUrl}
                devAccess={devAccess}
              />
            </AccordionBody>
          </AccordionItem>
        </AccordionFixed>
      </Col>
    </div>
  );
};

const AccordionFixed = (
  props: AccordionProps & {
    toggle?: (id: string) => void;
  }
) => <Accordion {...props} />;

interface PinnedImageOptionProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const PinnedImageOption = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
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
      projectRepositoryUrl,
      versionUrl,
      update: {
        "interactive.image": newValue,
      },
    });
  }, [newValue, projectRepositoryUrl, updateConfig, versionUrl]);

  const onResetValue = useCallback(() => {
    setNewValue("");
    updateConfig({
      projectRepositoryUrl,
      versionUrl,
      update: {
        "interactive.image": null,
      },
    });
  }, [projectRepositoryUrl, updateConfig, versionUrl]);

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

interface ProjectSettingsSessionsUnknownProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const ProjectSettingsSessionsUnknown = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
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
    <div className="mb-2">
      <Col xs={12}>
        <AccordionFixed
          className={styles.accordion}
          open={showSection ? "unknown-settings" : ""}
          toggle={toggleShowSection}
          flush
        >
          <AccordionItem>
            <AccordionHeader targetId="unknown-settings">
              Unknown settings
            </AccordionHeader>
            <AccordionBody accordionId="unknown-settings">
              <p>
                The following settings are stored in the project configuration
                but they are not supported in this RenkuLab deployment.
              </p>
              {unknownConfigKeys.map((optionKey) => (
                <UnknownOption
                  key={optionKey}
                  optionKey={optionKey}
                  optionValue={unknownConfig[optionKey]}
                  projectConfigIsFetching={projectConfigIsFetching}
                  projectRepositoryUrl={projectRepositoryUrl}
                  versionUrl={versionUrl}
                  devAccess={devAccess}
                />
              ))}
            </AccordionBody>
          </AccordionItem>
        </AccordionFixed>
      </Col>
    </div>
  );
};

interface UnknownOptionProps {
  optionKey: string;
  optionLabel?: string;
  optionValue: string;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const UnknownOption = ({
  optionKey,
  optionLabel,
  optionValue,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
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
      projectRepositoryUrl,
      versionUrl,
      update: {
        [optionKey]: null,
      },
    });
  }, [optionKey, projectRepositoryUrl, updateConfig, versionUrl]);

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
