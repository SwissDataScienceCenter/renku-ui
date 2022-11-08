/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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


import React, { useEffect, useState } from "react";

import "./SessionCheatSheet.css";
import * as cheatsheetJson from "./cheatsheet.json";
import { ExternalDocsLink } from "../../utils/components/ExternalLinks";
import { RenkuPythonDocs } from "../../utils/constants/Docs";
import { Clipboard } from "../../utils/components/Clipboard";
import { Col } from "../../utils/ts-wrappers";

interface CommandDescProps {
  command: string;
  desc: string | React.ReactNode;
  clipboard?: boolean;
}
function CommandDesc({ command = "", desc = "", clipboard = true }: CommandDescProps) {
  return <div>
    <code>{command}</code>
    {
      clipboard ? <Clipboard clipboardText={command} /> : null
    }
    <div className="renku-info" style={{ paddingTop: "3px" }}>{desc}</div>
  </div>;
}


interface CommandsRowProps {
  children: React.ReactNode;
}
function CommandsRow({ children }: CommandsRowProps) {
  return <div className="d-flex justify-content-between flex-column flex-md-row commands-row flex-wrap">
    {children}
  </div>;
}


function Collaboration() {
  const mergeDesc = <span>Incorporate the changes from the &lt;other branch&gt; into your branch.
    See the <ExternalDocsLink url="https://www.atlassian.com/git/tutorials/using-branches/git-merge"
    title="git merge docs" /> for details.
  </span>;
  return <div className="mb-3">
    <CommandsRow>
      <div>
        <h2>Collaboration</h2>
        <p className="renku-info">
          Working with others requires coordination, and branching/merging is a common way to handle this.
        </p>
      </div>
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="git checkout <branch>"
        desc="Switch to the <branch>, replacing the contents of your project with the version in the branch." />
      <CommandDesc command="git merge <other branch>"
        desc={mergeDesc} />
    </CommandsRow>
  </div>;
}


function LearnMore() {
  return <div className="mb-3">
    <CommandsRow>
      <div>
        <h2>Want to learn more?</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <div>
        For a more detailed overview of common commands, see the {" "}
        {/* eslint-disable-next-line max-len */}
        <ExternalDocsLink url={`${RenkuPythonDocs.READ_THE_DOCS_ROOT}/_static/cheatsheet/cheatsheet.pdf`}
          title="renku python cheat sheet"/>.
      </div>
      <div>
        The <ExternalDocsLink url={`${RenkuPythonDocs.READ_THE_DOCS_ROOT}/reference/commands.html`}
          title="Renku documentation" /> covers much more.
      </div>
    </CommandsRow>
  </div>;
}

interface CommandsGroupProps {
  group: GroupCommand;
}
function CommandsGroup({ group }: CommandsGroupProps) {
  const commands = group.commands.map((command) => {
    if (command.target.includes("ui")) {
      return (<Col xs={12} md={6} lg={4} className="command" key={command.command}>
        <CommandDesc command={command.command} desc={command.description}/></Col>);
    }
    return null;
  });
  return <div className="mb-3">
    <CommandsRow>
      <div><h2>{group.name}</h2></div>
    </CommandsRow>
    <CommandsRow>
      {commands}
    </CommandsRow>
  </div>;
}

interface CheatSheetFile {
  default: {
    groups: GroupCommand[];
  }
}
interface Command {
  command: string;
  description: string;
  target: string[];
}
interface GroupCommand {
  name: string;
  commands: Command[];
}
interface SessionCheatSheetGeneratedProps {
  version?: string;
}
function SessionCheatSheetGenerated({ version }: SessionCheatSheetGeneratedProps) {
  const [groups, setGroups] = useState<GroupCommand[]>([]);
  useEffect(() => {
    const cheatSheet: CheatSheetFile = getCheatSheetByVersion(version);
    const uiGroups = cheatsheetJsonToUIGroups(cheatSheet);
    setGroups(uiGroups);
  }, [version]);

  return <div className="commands">
    <h1 className="mb-5">Renku Cheat Sheet</h1>
    { groups.map((group) => <CommandsGroup key={group.name} group={group} /> )}
    <Collaboration />
    <LearnMore />
  </div>;
}

function getCheatSheetByVersion(version?: string): CheatSheetFile {
  return cheatsheetJson as unknown as CheatSheetFile;
}

function cheatsheetJsonToUIGroups(cheatSheet: CheatSheetFile) {
  const allGroups: GroupCommand[] = cheatSheet?.default?.groups;
  return allGroups.filter((group: GroupCommand) => {
    const uiCommands = group?.commands?.filter( (command: Command) => {
      return command.target?.includes("ui");
    });
    return uiCommands.length;
  });
}

export default SessionCheatSheetGenerated;
