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

import React, { ReactNode, useEffect } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { IMigration } from "../../features/project/Project";
import { LockStatus, User } from "../../model/RenkuModels";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { Loader } from "../../components/Loader";
import { useServerOptionsQuery } from "../../features/session/sessionApi";

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

  // const projectConfig = useSelector(
  //   (state: RootStateOrAny) => state.stateModel.project.config as ProjectConfig
  // );
  // useEffect(() => {
  //   console.log({ projectConfig });
  // }, [projectConfig]);

  // Global options
  const { data: serverOptions, isLoading: serverOptionsIsLoading } =
    useServerOptionsQuery({});
  useEffect(() => {
    console.log({ serverOptions, serverOptionsIsLoading });
  }, [serverOptions, serverOptionsIsLoading]);

  // Project options
  const projectMigrationCore = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.project.migration.core
  );
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const fetchedVersion = !!projectMigrationCore.fetched;
  const versionUrl = projectMigrationCore.versionUrl ?? "";
  const { data: projectConfig, isLoading: projectConfigIsLoading } =
    useGetConfigQuery(
      {
        projectRepositoryUrl,
        versionUrl,
      },
      { skip: !fetchedVersion }
    );
  useEffect(() => {
    console.log({ projectConfig, projectConfigIsLoading });
  }, [projectConfig, projectConfigIsLoading]);

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
    projectConfigIsLoading ||
    projectMigrationCore.fetching ||
    !projectMigrationCore.fetched
  ) {
    const message = projectConfigIsLoading
      ? "Getting project settings..."
      : "Checking project version and RenkuLab compatibility...";

    return (
      <SessionsDiv>
        <p>{message}</p>
        <Loader />
      </SessionsDiv>
    );
  }
  // if (
  //   config.fetching ||
  //   options.fetching ||
  //   backend.fetching ||
  //   !backend.fetched
  // ) {
  //   let message;
  //   if (config.fetching) message = "Getting project settings...";
  //   else if (options.fetching) message = "Getting RenkuLab settings...";
  //   else if (backend.fetching || !backend.fetched)
  //     message = "Checking project version and RenkuLab compatibility...";
  //   else message = "Please wait...";

  //   return (
  //     <SessionsDiv>
  //       <p>{message}</p>
  //       <Loader />
  //     </SessionsDiv>
  //   );
  // }

  return (
    <>
      <h2>Session Settingzzzzzzzzzzz</h2>
    </>
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
