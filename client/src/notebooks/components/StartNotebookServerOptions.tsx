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
import { IMigration, ProjectConfig } from "../../features/project/Project";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { ServerOptions } from "../../features/session/session";
import { useServerOptionsQuery } from "../../features/session/sessionApi";
import {
  setDefaultUrl,
  setLfsAutoFetch,
  useStartSessionOptionsSelector,
} from "../../features/session/startSessionOptionsSlice";
import { SessionClassOption } from "./SessionClassOption";
import { SessionStorageOption } from "./SessionStorageOption";
import styles from "./StartNotebookServerOptions.module.scss";

interface StartNotebookServerOptionsProps {
  projectRepositoryUrl: string;
  branch?: {
    name: string;
  };
}

export const StartNotebookServerOptions = ({
  projectRepositoryUrl,
  branch,
}: StartNotebookServerOptionsProps) => {
  return (
    <>
      <Row>
        <DefaultUrlOption
          projectRepositoryUrl={projectRepositoryUrl}
          branchName={branch?.name}
        />
        <SessionClassOption />
        <SessionStorageOption />
        <AutoFetchLfsOption />
      </Row>
    </>
  );
};

interface DefaultUrlOptionProps {
  projectRepositoryUrl: string;
  branchName?: string;
}

const DefaultUrlOption = ({ projectRepositoryUrl }: DefaultUrlOptionProps) => {
  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery({});

  // Project options
  const projectMigrationCore = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.project.migration.core
  );
  const fetchedVersion = !!projectMigrationCore.fetched;
  const versionUrl = projectMigrationCore.versionUrl ?? "";
  const { data: projectConfig, isLoading: projectConfigIsLoading } =
    useGetConfigQuery(
      {
        projectRepositoryUrl,
        versionUrl,
        // ...(branchName ? { branch: branchName } : {}),
      },
      { skip: !fetchedVersion }
    );

  const defaultUrlOptions = mergeDefaultUrlOptions({
    serverOptions,
    projectConfig,
  });

  const selectedDefaultUrl = useStartSessionOptionsSelector(
    (state) => state.defaultUrl
  );
  const dispatch = useDispatch();

  // const [updateFn] = useUpdateConfigMutation();
  // useEffect(() => {
  //   // console.log({ updateFn });
  //   const fn = (update: { [key: string]: string }) =>
  //     updateFn({
  //       projectRepositoryUrl,
  //       versionUrl,
  //       // ...(branchName ? { branch: branchName } : {}),
  //       update,
  //     });
  //   // console.log({ updateFn: fn });
  // }, [updateFn, projectRepositoryUrl, versionUrl]);

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

const mergeDefaultUrlOptions = ({
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
  const lfsAutoFetch = useStartSessionOptionsSelector(
    (state) => state.lfsAutoFetch
  );
  const dispatch = useDispatch();

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
      <UncontrolledDropdown direction="down" className={styles.dropdown}>
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
      className="form-check-input rounded-pill"
    />
    <Label check htmlFor={id}>
      {displayName}
    </Label>
  </div>
);
