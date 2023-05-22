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
import debounce from "lodash/debounce";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import {
  IMigration,
  ProjectConfig,
  StateModelProject,
} from "../../features/project/Project";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { useServerOptionsQuery } from "../../features/session/sessionApi";
import { LockStatus, User } from "../../model/RenkuModels";
import { ACCESS_LEVELS } from "../../api-client";
import { Url } from "../../utils/helpers/url";
import { ErrorAlert, WarnAlert } from "../../components/Alert";
import { Link, useLocation } from "react-router-dom";
import { CoreErrorAlert } from "../../components/errors/CoreErrorAlert";
import { ServerOptions } from "../../features/session/session";
import {
  ServerOptionEnum,
  mergeDefaultUrlOptions,
} from "../../notebooks/components/StartNotebookServerOptions";
import { Col, FormGroup, Label } from "reactstrap";
import cx from "classnames";
import { useUpdateConfigMutation } from "../../features/project/projectCoreApi";
import { SingleValue } from "react-select";
import { ResourceClass } from "../../features/dataServices/dataServices";
import {
  SessionClassSelector,
  fakeResourcePools,
} from "../../notebooks/components/options/SessionClassOption";
import { useGetResourcePoolsQuery } from "../../features/dataServices/dataServicesApi";
import { StorageSelector } from "../../notebooks/components/options/SessionStorageOption";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { SerializedError } from "@reduxjs/toolkit";
import { isFetchBaseQueryError } from "../../utils/helpers/ApiErrors";

interface ProjectSettingsSessionsProps {
  // lockStatus?: LockStatus;
  // user: User;
  [key: string]: unknown;
}

export const ProjectSettingsSessions = ({
  // lockStatus,
  // user,
  ...rest
}: ProjectSettingsSessionsProps) => {
  useEffect(() => {
    console.log({ rest });
  }, [rest]);

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const locked_ = useSelector<RootStateOrAny, LockStatus["locked"]>(
    (state) => state.stateModel.project.lockStatus.locked
  );
  const locked = locked_ ?? false;

  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery({});

  // Project options
  const projectMigrationCore = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.project.migration.core
  );
  const {
    externalUrl: projectRepositoryUrl,
    namespace,
    path,
    accessLevel,
  } = useSelector<RootStateOrAny, StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );
  const fetchedVersion = !!projectMigrationCore.fetched;
  const versionUrl = projectMigrationCore.versionUrl ?? "";
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
    { skip: !fetchedVersion }
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
    projectMigrationCore.fetching ||
    !projectMigrationCore.fetched
  ) {
    const message = serverOptionsIsLoading
      ? "Getting RenkuLab settings..."
      : projectConfigIsLoading
      ? "Getting project settings..."
      : "Checking project version and RenkuLab compatibility...";

    return (
      <SessionsDiv>
        <p>{message}</p>
        <Loader />
      </SessionsDiv>
    );
  }

  const devAccess = accessLevel > ACCESS_LEVELS.DEVELOPER ? true : false;
  if (!projectMigrationCore.backendAvailable) {
    const overviewStatusUrl = Url.get(Url.pages.project.overview.status, {
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
            The <Link to={overviewStatusUrl}>Project status</Link> page provides
            further information.
          </p>
        </WarnAlert>
      </SessionsDiv>
    );
  }

  if (error) {
    return (
      <SessionsDiv>
        <CoreErrorAlert error={error} />
      </SessionsDiv>
    );
  }

  if (!serverOptions || !projectConfig) {
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
    <SessionsDiv>
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
      <SessionClassOption
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />
      <StorageOption
        projectConfig={projectConfig}
        projectConfigIsFetching={projectConfigIsFetching}
        projectRepositoryUrl={projectRepositoryUrl}
        versionUrl={versionUrl}
        devAccess={devAccess}
      />

      <pre>{JSON.stringify(projectConfig, null, 2)}</pre>

      {/* <DefaultUrlOption
          projectRepositoryUrl={projectRepositoryUrl}
          branchName={branch?.name}
        />
        <SessionClassOption />
      <SessionStorageOption /> */}
      {/* <AutoFetchLfsOption /> */}
    </SessionsDiv>
  );
};

interface SessionsDivProps {
  children?: ReactNode;
}

const SessionsDiv = ({ children }: SessionsDivProps) => (
  <div className="mt-2">
    <h3>Session settings</h3>
    <div className="form-rk-green">{children}</div>
  </div>
);

const UpdateStatus = () => {
  const [, { error }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  if (!error) {
    return null;
  }

  // TODO: Should handle this?
  if (!isFetchBaseQueryError(error) || error.status !== "CUSTOM_ERROR") {
    return null;
  }

  const renkuCoreError = error.data as any;

  // TODO: support for `Error occurred while updating "${keyName}"`?
  const message = `Error occurred while updating project settings${
    renkuCoreError.reason
      ? `: ${renkuCoreError.reason}`
      : renkuCoreError.userMessage
      ? `: ${renkuCoreError.userMessage}`
      : "."
  }`;

  return <CoreErrorAlert error={renkuCoreError} message={message as any} />;
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
      serverOptions: {
        ...serverOptions,
        defaultUrl: {
          ...serverOptions.defaultUrl,
          options: [...serverOptions.defaultUrl.options, "/foo", "/bar"],
        },
      },
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
      </FormGroup>
    </Col>
  );
};

interface SessionClassOptionProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const SessionClassOption = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
  devAccess,
}: SessionClassOptionProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const enableFakeResourcePools = !!searchParams.get("useFakeResourcePools");

  const {
    data: realResourcePools,
    isLoading: resourcePoolsIsLoading,
    isError: resourcePoolsIsError,
  } = useGetResourcePoolsQuery({}, { skip: enableFakeResourcePools });

  const resourcePools = enableFakeResourcePools
    ? fakeResourcePools
    : realResourcePools;

  const defaultSessionClassId =
    projectConfig.config.sessions?.sessionClass ??
    projectConfig.default.sessions?.sessionClass;
  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClassId) ??
      resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [defaultSessionClassId, resourcePools]
  );

  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<number | null>(null);

  const currentSessionClassId =
    newValue ??
    projectConfig.config.sessions?.sessionClass ??
    projectConfig.default.sessions?.sessionClass;
  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == currentSessionClassId),
    [currentSessionClassId, resourcePools]
  );

  // const selectedSessionClass =
  //   newValue ??
  //   projectConfig.config.sessions?.sessionClass ??
  //   projectConfig.default.sessions?.sessionClass;

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });

  const onChange = useCallback(
    (newValue: SingleValue<ResourceClass>) => {
      if (newValue?.id) {
        setNewValue(newValue.id);
        updateConfig({
          projectRepositoryUrl,
          versionUrl,
          update: {
            "interactive.session_class": `${newValue.id}`,
          },
        });
      }
    },
    [projectRepositoryUrl, updateConfig, versionUrl]
  );

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  if (resourcePoolsIsLoading) {
    return (
      <Col xs={12}>
        Fetching available resource pools... <Loader size="16" inline="true" />
      </Col>
    );
  }

  if (!resourcePools || resourcePools.length == 0 || resourcePoolsIsError) {
    return (
      <Col xs={12}>
        <ErrorAlert dismissible={false}>
          <h3 className={cx("fs-6", "fw-bold")}>
            Error on loading available session resource pools
          </h3>
        </ErrorAlert>
      </Col>
    );
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Session class</Label>
        <SessionClassSelector
          resourcePools={resourcePools}
          currentSessionClass={currentSessionClass}
          defaultSessionClass={defaultSessionClass}
          onChange={onChange}
          disabled={disabled}
        />
      </FormGroup>
    </Col>
  );
};

interface StorageOptionProps {
  projectConfig: ProjectConfig;
  projectConfigIsFetching: boolean;
  projectRepositoryUrl: string;
  versionUrl: string;
  devAccess: boolean;
}

const StorageOption = ({
  projectConfig,
  projectConfigIsFetching,
  projectRepositoryUrl,
  versionUrl,
  devAccess,
}: StorageOptionProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const enableFakeResourcePools = !!searchParams.get("useFakeResourcePools");

  const {
    data: realResourcePools,
    isLoading: resourcePoolsIsLoading,
    isError: resourcePoolsIsError,
  } = useGetResourcePoolsQuery({}, { skip: enableFakeResourcePools });

  const resourcePools = enableFakeResourcePools
    ? fakeResourcePools
    : realResourcePools;

  // const defaultSessionClassId =
  //   projectConfig.config.sessions?.sessionClass ??
  //   projectConfig.default.sessions?.sessionClass;
  // const defaultSessionClass = useMemo(
  //   () =>
  //     resourcePools
  //       ?.flatMap((pool) => pool.classes)
  //       .find((c) => c.id == defaultSessionClassId) ??
  //     resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
  //     resourcePools?.find(() => true)?.classes[0] ??
  //     undefined,
  //   [defaultSessionClassId, resourcePools]
  // );

  // Temporary value for optimistic UI update
  const [newValue, setNewValue] = useState<number | null>(null);

  const currentSessionClassId =
    projectConfig.config.sessions?.sessionClass ??
    projectConfig.default.sessions?.sessionClass;
  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == currentSessionClassId),
    [currentSessionClassId, resourcePools]
  );

  const currentStorage =
    newValue ??
    projectConfig.config.sessions?.storage ??
    currentSessionClass?.default_storage ??
    projectConfig.default.sessions?.storage;

  const [updateConfig, { isLoading, isError }] = useUpdateConfigMutation({
    fixedCacheKey: "project-settings",
  });
  const debouncedUpdateConfig = useMemo(
    () => debounce(updateConfig, /*wait=*/ 1_000),
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
          "interactive.disk_request": `${value}GB`,
        },
      });
    },
    [debouncedUpdateConfig, projectRepositoryUrl, versionUrl]
  );

  // Reset the temporary value when the API responds with an error
  useEffect(() => {
    if (isError) {
      setNewValue(null);
    }
  }, [isError]);

  const disabled = !devAccess || isLoading || projectConfigIsFetching;

  if (
    resourcePoolsIsLoading ||
    !resourcePools ||
    resourcePools.length == 0 ||
    resourcePoolsIsError
  ) {
    return null;
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Amount of Storage</Label>
        <StorageSelector
          // resourcePools={resourcePools}
          currentSessionClass={currentSessionClass}
          currentStorage={currentStorage}
          onChange={onChange}
          disabled={disabled}
        />
      </FormGroup>
    </Col>
  );
};

// const AutoFetchLfsOption = () => {
//   const lfsAutoFetch = useStartSessionOptionsSelector(
//     (state) => state.lfsAutoFetch
//   );
//   const dispatch = useDispatch();

//   const onChange = useCallback(() => {
//     dispatch(setLfsAutoFetch(!lfsAutoFetch));
//   }, [dispatch, lfsAutoFetch]);

//   return (
//     <Col xs={12}>
//       <FormGroup className="field-group">
//         <ServerOptionBoolean
//           id="option-lfs-auto-fetch"
//           displayName="Automatically fetch LFS data"
//           onChange={onChange}
//           selected={lfsAutoFetch}
//         />
//       </FormGroup>
//     </Col>
//   );
// };
