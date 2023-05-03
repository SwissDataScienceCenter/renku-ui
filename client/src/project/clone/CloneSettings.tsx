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

import React, { useCallback, useState } from "react";
import { Button } from "reactstrap";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";

interface CloneSettingsProps {
  externalUrl: string;
  projectPath: string;
  sshUrl: string;
  httpUrl: string;
}

export const CloneSettings = ({
  externalUrl,
  projectPath,
  sshUrl,
  httpUrl,
}: CloneSettingsProps) => (
  <>
    <CloneCommands externalUrl={externalUrl} projectPath={projectPath} />
    <RepositoryUrls sshUrl={sshUrl} httpUrl={httpUrl} />
  </>
);

interface CloneCommandsProps {
  externalUrl: string;
  projectPath: string;
}

const CloneCommands = ({ externalUrl, projectPath }: CloneCommandsProps) => {
  const renkuClone = `renku clone ${externalUrl}.git`;
  return (
    <>
      <h3 className="fs-6 lh-sm fw-bold mt-1">Clone with Renku</h3>
      <CommandCopy command={renkuClone} />
      <GitClone externalUrl={externalUrl} projectPath={projectPath} />
    </>
  );
};

interface RepositoryUrlsProps {
  sshUrl: string;
  httpUrl: string;
}

const RepositoryUrls = ({ sshUrl, httpUrl }: RepositoryUrlsProps) => {
  const httpStr = httpUrl.startsWith("https") ? "HTTPS" : "HTTP";
  return (
    <>
      <h3 className="fs-6 lh-sm fw-bold mt-2">Repository SSH URL</h3>
      <CommandCopy command={sshUrl} />
      <h3 className="fs-6 lh-sm fw-bold mt-1">Repository {httpStr} URL</h3>
      <CommandCopy command={httpUrl} />
    </>
  );
};

interface GitCloneProps {
  externalUrl: string;
  projectPath: string;
}

const GitClone = ({ externalUrl, projectPath }: GitCloneProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onToggle = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  const gitClone = `git clone ${externalUrl}.git && cd ${projectPath} && git lfs install --local --force`;
  // eslint-disable-next-line spellcheck/spell-checker
  const gitHooksInstall = "renku githooks install";

  return (
    <div className="" style={{ fontSize: "smaller" }}>
      {isOpen && (
        <>
          <p>
            If the <strong>renku</strong> command is not available, you can
            clone a project using Git.
          </p>

          <h3 className="fs-6 lh-sm fw-bold mt-1">Clone with Git</h3>
          <CommandCopy command={gitClone} />

          <p>
            If you want to work with the repo using renku, you need to run the
            following after the <code>git clone</code> completes:
          </p>
          <CommandCopy command={gitHooksInstall} />
        </>
      )}

      <div>
        <Button
          className="m-0 p-0"
          style={{ fontSize: "unset" }}
          color="link"
          onClick={onToggle}
        >
          {isOpen ? "Hide git command" : "Do not have renku?"}
        </Button>
      </div>
    </div>
  );
};
