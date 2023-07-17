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

import React, { useCallback, useEffect } from "react";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import {
  ProjectConfig,
  StateModelProject,
} from "../../features/project/Project";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { useCoreSupport } from "../../features/project/useProjectCoreSupport";
import { useServerOptionsQuery } from "../../features/session/sessions.api";
import { ServerOptions } from "../../features/session/sessions.types";
import {
  setDefaultUrl,
  setLfsAutoFetch,
  useStartSessionOptionsSelector,
} from "../../features/session/startSessionOptionsSlice";
import styles from "./StartNotebookServerOptions.module.scss";
import { SessionClassOption } from "./options/SessionClassOption";
import { SessionStorageOption } from "./options/SessionStorageOption";

export const StartNotebookServerOptions = () => {
  // Wait for options to load

  // Global options
  const { isLoading: serverOptionsIsLoading } = useServerOptionsQuery();

  // Project options
  const { defaultBranch, externalUrl: projectRepositoryUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const { isLoading: projectConfigIsLoading } = useGetConfigQuery(
    {
      projectRepositoryUrl,
      versionUrl,
    },
    { skip: !coreSupportComputed }
  );

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
      <Row>
        <p>{message}</p>
        <Loader />
      </Row>
    );
  }

  return (
    <Row>
      <DefaultUrlOption />
      <SessionClassOption />
      <SessionStorageOption />
      <AutoFetchLfsOption />
    </Row>
  );
};

const DefaultUrlOption = () => {
  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery();

  // Project options
  const { defaultBranch, externalUrl: projectRepositoryUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const { data: projectConfig, isLoading: projectConfigIsLoading } =
    useGetConfigQuery(
      {
        projectRepositoryUrl,
        versionUrl,
        // ...(branchName ? { branch: branchName } : {}),
      },
      { skip: !coreSupportComputed }
    );

  const defaultUrlOptions = mergeDefaultUrlOptions({
    serverOptions,
    projectConfig,
  });

  const selectedDefaultUrl = useStartSessionOptionsSelector(
    (state) => state.defaultUrl
  );
  const dispatch = useDispatch();

  // Set initial default URL
  useEffect(() => {
    if (projectConfig != null) {
      dispatch(
        setDefaultUrl(
          projectConfig.config.sessions?.defaultUrl ??
            projectConfig.default.sessions?.defaultUrl ??
            ""
        )
      );
    }
  }, [dispatch, projectConfig]);

  const onChange = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
      if (value) {
        dispatch(setDefaultUrl(value));
      }
    },
    [dispatch]
  );

  if (
    serverOptionsIsLoading ||
    projectConfigIsLoading ||
    !serverOptions ||
    !projectConfig
  ) {
    return <Loader />;
  }

  const { defaultUrl } = serverOptions;

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
        />
      </FormGroup>
    </Col>
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
  const { defaultBranch, externalUrl: projectRepositoryUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const { data: projectConfig } = useGetConfigQuery(
    {
      projectRepositoryUrl,
      versionUrl,
    },
    { skip: !coreSupportComputed }
  );

  const lfsAutoFetch = useStartSessionOptionsSelector(
    (state) => state.lfsAutoFetch
  );
  const dispatch = useDispatch();

  // Set initial value
  useEffect(() => {
    if (projectConfig != null) {
      dispatch(
        setLfsAutoFetch(projectConfig.config.sessions?.lfsAutoFetch ?? false)
      );
    }
  }, [dispatch, projectConfig]);

  const onChange = useCallback(() => {
    dispatch(setLfsAutoFetch(!lfsAutoFetch));
  }, [dispatch, lfsAutoFetch]);

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <ServerOptionBoolean
          id="option-lfs-auto-fetch"
          displayName="Automatically fetch LFS data"
          onChange={onChange}
          selected={lfsAutoFetch}
        />
      </FormGroup>
    </Col>
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
