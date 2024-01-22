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
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  UncontrolledDropdown,
} from "reactstrap";
import { ErrorAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { ProjectConfig } from "../../../project/Project";
import { Url } from "../../../../utils/helpers/url";
import { useCoreSupport } from "../../../project/useProjectCoreSupport";
import {
  canUpdateProjectAutomatically,
  getRenkuLevel,
} from "../../../project/utils/migrations";
import useDefaultAutoFetchLfsOption from "../../hooks/options/useDefaultAutoFetchLfsOption.hook";
import useDefaultUrlOption from "../../hooks/options/useDefaultUrlOption.hook";
import usePatchedProjectConfig from "../../hooks/usePatchedProjectConfig.hook";
import { useServerOptionsQuery } from "../../sessions.api";
import { ServerOptions } from "../../sessions.types";
import {
  setDefaultUrl,
  setLfsAutoFetch,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";
import { SessionClassOption } from "./SessionClassOption";
import { SessionStorageOption } from "./SessionStorageOption";
import styles from "./StartNotebookServerOptions.module.scss";

type CoreSupport = ReturnType<typeof useCoreSupport>["coreSupport"];
type GetMigrationStatusQuery = ReturnType<
  typeof useCoreSupport
>["getMigrationStatusQuery"];

type BackendNotAvailableProps = {
  coreSupport: CoreSupport;
  getMigrationStatusQuery: GetMigrationStatusQuery;
  projectNamespace: string;
  projectName: string;
};
function BackendNotAvailableMessage({
  coreSupport,
  getMigrationStatusQuery,
  projectNamespace,
  projectName,
}: BackendNotAvailableProps) {
  if (coreSupport.backendAvailable) return null;
  const {
    backendAvailable,
    backendErrorMessage,
    computed: coreSupportComputed,
  } = coreSupport;
  const isSupported = coreSupportComputed && backendAvailable;
  const checkingSupport = !coreSupportComputed;
  const { data: migrationStatus } = getMigrationStatusQuery;

  if (checkingSupport || isSupported) return null;

  const renkuMigrationLevel = getRenkuLevel(migrationStatus, isSupported);
  const automatedUpdatePossible = canUpdateProjectAutomatically(
    renkuMigrationLevel,
    null
  );

  const settingsPageUrl = Url.get(Url.pages.project.settings, {
    namespace: projectNamespace,
    path: projectName,
  });
  if (backendErrorMessage)
    return (
      <>
        <h3 className={cx("fs-6", "fw-bold")}>
          A session cannot be started on this project.
        </h3>
        <div>{backendErrorMessage}</div>
      </>
    );

  if (automatedUpdatePossible)
    return (
      <>
        <h3 className={cx("fs-6", "fw-bold")}>
          Update the project to start a session.
        </h3>
        <div>
          Follow the instructions on the{" "}
          <Link className="btn btn-danger btn-sm" to={settingsPageUrl}>
            Settings
          </Link>{" "}
          page to update the project. Once that is done, you can start a
          session.
        </div>
      </>
    );

  return (
    <>
      <h3 className={cx("fs-6", "fw-bold")}>
        Changes are necessary to start a session.
      </h3>
      <div>
        Details are provided on the{" "}
        <Link className="btn btn-danger btn-sm" to={settingsPageUrl}>
          Settings
        </Link>{" "}
        page.
      </div>
    </>
  );
}

export const StartNotebookServerOptions = () => {
  // Wait for options to load

  // Global options
  const { isLoading: serverOptionsIsLoading } = useServerOptionsQuery();

  // Project options
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const projectNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const projectName = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );
  const { coreSupport, getMigrationStatusQuery } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;
  const commit = useStartSessionOptionsSelector(({ commit }) => commit);
  const { isLoading: projectConfigIsLoading, error: errorProjectConfig } =
    usePatchedProjectConfig({
      apiVersion,
      commit,
      gitLabProjectId: gitLabProjectId ?? 0,
      metadataVersion,
      projectRepositoryUrl,
      skip: !backendAvailable || !coreSupportComputed || !commit,
    });

  if (
    serverOptionsIsLoading ||
    projectConfigIsLoading ||
    !coreSupportComputed ||
    !commit
  ) {
    const message = serverOptionsIsLoading
      ? "Getting RenkuLab settings..."
      : projectConfigIsLoading
      ? "Getting project settings..."
      : !coreSupportComputed
      ? "Checking project version and RenkuLab compatibility..."
      : "Please wait...";
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          {message}
        </div>
        <Loader />
      </div>
    );
  }

  if (!backendAvailable || errorProjectConfig) {
    return (
      <ErrorAlert dismissible={false}>
        {!backendAvailable ? (
          <BackendNotAvailableMessage
            coreSupport={coreSupport}
            getMigrationStatusQuery={getMigrationStatusQuery}
            projectName={projectName}
            projectNamespace={projectNamespace}
          />
        ) : (
          <h3 className={cx("fs-6", "fw-bold")}>
            Error while loading project configuration
          </h3>
        )}
      </ErrorAlert>
    );
  }

  return (
    <>
      <DefaultUrlOption />
      <SessionClassOption />
      <SessionStorageOption />
      <AutoFetchLfsOption />
    </>
  );
};

const DefaultUrlOption = () => {
  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery();

  // Project options
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
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
  const { commit, defaultUrl: selectedDefaultUrl } =
    useStartSessionOptionsSelector();
  const { data: projectConfig, isFetching: projectConfigIsFetching } =
    usePatchedProjectConfig({
      apiVersion,
      commit,
      gitLabProjectId: gitLabProjectId ?? 0,
      metadataVersion,
      projectRepositoryUrl,
      skip: !backendAvailable || !coreSupportComputed || !commit,
    });

  const defaultUrlOptions = mergeDefaultUrlOptions({
    serverOptions,
    projectConfig,
  });

  const dispatch = useDispatch();

  const onChange = useCallback(
    (_event: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
      if (value) {
        dispatch(setDefaultUrl(value));
      }
    },
    [dispatch]
  );

  useDefaultUrlOption({ projectConfig });

  if (
    serverOptionsIsLoading ||
    projectConfigIsFetching ||
    !serverOptions ||
    !projectConfig
  ) {
    return <Loader />;
  }

  const { defaultUrl } = serverOptions;
  const safeOptions =
    selectedDefaultUrl &&
    defaultUrlOptions &&
    defaultUrlOptions.length &&
    !defaultUrlOptions.includes(selectedDefaultUrl)
      ? [...defaultUrlOptions, selectedDefaultUrl]
      : defaultUrlOptions;

  if (safeOptions.length === 1) {
    return (
      <div className="field-group">
        <div className="form-label">
          {defaultUrl.displayName}{" "}
          <ServerOptionEnum
            {...defaultUrl}
            options={defaultUrlOptions}
            selected={selectedDefaultUrl}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="field-group">
      <div className="form-label">{defaultUrl.displayName}</div>
      <ServerOptionEnum
        {...defaultUrl}
        options={defaultUrlOptions}
        selected={selectedDefaultUrl}
        onChange={onChange}
      />
    </div>
  );
};

export const mergeDefaultUrlOptions = ({
  serverOptions,
  projectConfig,
}: {
  serverOptions: ServerOptions | undefined;
  projectConfig: ProjectConfig | undefined;
}) => {
  const globalDefaultUrls = serverOptions?.defaultUrl.options ?? [];
  const projectDefaultUrl = projectConfig?.config.sessions?.defaultUrl;
  return [
    ...globalDefaultUrls,
    ...(globalDefaultUrls.find((url) => url === projectDefaultUrl) ||
    projectDefaultUrl == null
      ? []
      : [projectDefaultUrl]),
  ];
};

const AutoFetchLfsOption = () => {
  // Project options
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;
  const commit = useStartSessionOptionsSelector(({ commit }) => commit);
  const { data: projectConfig } = usePatchedProjectConfig({
    apiVersion,
    commit,
    gitLabProjectId: gitLabProjectId ?? 0,
    metadataVersion,
    projectRepositoryUrl,
    skip: !coreSupportComputed || !commit,
  });

  const lfsAutoFetch = useStartSessionOptionsSelector(
    (state) => state.lfsAutoFetch
  );

  const dispatch = useDispatch();

  const onChange = useCallback(() => {
    dispatch(setLfsAutoFetch(!lfsAutoFetch));
  }, [dispatch, lfsAutoFetch]);

  useDefaultAutoFetchLfsOption({ projectConfig });

  return (
    <div className="field-group">
      <ServerOptionBoolean
        id="option-lfs-auto-fetch"
        displayName="Automatically fetch LFS data"
        onChange={onChange}
        selected={lfsAutoFetch}
      />
    </div>
  );
};

const FORM_MAX_WIDTH = 250; // pixels;

interface ServerOptionEnumProps<T extends string | number> {
  disabled?: boolean;
  onChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    value: T
  ) => void;
  options: T[];
  selected?: T | null | undefined;
  size?: string | null | undefined;
  warning?: T | null | undefined;
}

export const ServerOptionEnum = <T extends string | number>({
  disabled,
  onChange,
  options,
  selected,
  size,
  warning,
}: ServerOptionEnumProps<T>) => {
  const safeOptions =
    selected && options && options.length && !options.includes(selected)
      ? [...options, selected]
      : options;

  if (safeOptions.length === 1) {
    return (
      <Badge className="btn-outline-rk-green text-white">
        {safeOptions[0]}
      </Badge>
    );
  }

  const approxSize = approximateButtonGroupSizeInPixels(safeOptions);
  const useDropdown = approxSize > FORM_MAX_WIDTH;

  if (useDropdown) {
    const picked = selected ? selected : options[0];

    let color: string | undefined = "rk-white";
    if (picked === selected)
      color = warning != null && warning === picked ? "danger" : undefined;

    return (
      <UncontrolledDropdown
        direction="down"
        className={cx(styles.dropdown, "d-inline-block")}
      >
        <DropdownToggle
          caret
          className="btn-outline-rk-green"
          size={size ?? undefined}
          color={color}
        >
          <span>{picked}</span>
        </DropdownToggle>
        <DropdownMenu>
          <ButtonGroup vertical className="w-100">
            {safeOptions.map((optionName) => {
              let color: string | undefined = "rk-white";
              if (optionName === selected) {
                color =
                  warning != null && warning === optionName
                    ? "danger"
                    : undefined;
              }
              return (
                <DropdownItem
                  key={optionName}
                  color={color}
                  className="btn-outline-rk-green btn"
                  size={size ?? undefined}
                  disabled={disabled}
                  active={optionName === selected}
                  onClick={(event) => onChange(event, optionName)}
                  style={{ border: "unset !important" }}
                >
                  {optionName}
                </DropdownItem>
              );
            })}
          </ButtonGroup>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  return (
    <ButtonGroup>
      {safeOptions.map((optionName) => {
        let color: string | undefined = "rk-white";
        if (optionName === selected) {
          color =
            warning != null && warning === optionName ? "danger" : undefined;
        }
        return (
          <Button
            key={optionName}
            color={color}
            className="btn-outline-rk-green"
            size={size ?? undefined}
            disabled={disabled}
            active={optionName === selected}
            onClick={(event) => onChange(event, optionName)}
          >
            {optionName}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

const approximateButtonGroupSizeInPixels = <T extends string | number>(
  options: T[]
): number =>
  // padding in x direction
  options.length * 2 * 10 +
  // safe approximate character size
  options.map((opt) => `${opt}`).reduce((len, opt) => len + opt.length, 0) * 12;

interface ServerOptionBooleanProps {
  id: string;
  disabled?: boolean;
  displayName: string;
  onChange: (event: React.ChangeEvent<HTMLElement>) => void;
  selected?: boolean | null | undefined;
}

export const ServerOptionBoolean = ({
  id,
  disabled,
  displayName,
  onChange,
  selected,
}: ServerOptionBooleanProps) => (
  <div className="form-check form-switch d-inline-block">
    <Input
      type="switch"
      id={id}
      label={displayName}
      disabled={disabled}
      checked={!!selected}
      onChange={onChange}
      className="form-check-input rounded-pill cursor-pointer"
    />
    <Label check htmlFor={id} className="cursor-pointer">
      {displayName}
    </Label>
  </div>
);
