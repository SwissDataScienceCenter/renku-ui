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


import React, { Fragment } from "react";

import { Clipboard, ExternalDocsLink } from "../utils/UIComponents";
import "./SessionCheatSheet.css";

function CommandDesc({ command = "", desc = "", clipboard = true }) {
  return <div>
    <code>{command}</code>
    {
      (clipboard === true) ? <Clipboard clipboardText={command} /> : null
    }
    <p className="renku-info" style={{ paddingTop: "3px" }}>{desc}</p>
  </div>;
}

function CommandsRow({ children }) {
  return <div className="d-flex justify-content-between flex-column flex-md-row commands-row">
    {children}
  </div>;
}

function TypicalWorkflow() {
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Typical Workflow</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <div className="renku-info">
        <p><b>Work as you normally would</b></p>
        <p style={{ paddingTop: "3px" }}>Develop your model, write analysis code, etc.</p>
      </div>
      <CommandDesc command="git status" desc="Take a look at what you have done since the last save." />
      <CommandDesc
        command="renku save -m <msg>"
        desc={<span>Save your latest work, providing a <i>message</i> explaining what you have done.</span>} />
      <CommandDesc
        command="renku run &#8230;"
        desc="Run your code, capturing lineage of the inputs and outputs using Renku." />
    </CommandsRow>
  </Fragment>;
}

function RunningAndTrackingCommands() {
  const desc = <Fragment>
    Execute a &lt;command&gt;, creating a workflow template plan called
    &lt;name&gt;, with Renku tracking inputs and outputs.
    <ul>
      <li>Input and output files are automatically detected from the command string.
        With --input/--output flags, you can manually specify input or output files to track.</li>
      <li>A name for the workflow template will be generated if none is provided, but
        we recommend specifying one explicitly.</li>
    </ul>
  </Fragment>;
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Running and Tracking Commands</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="renku run [--name <name>] <command> [--input <in_file> …] [--output <out_file> …]"
        desc={desc}/>
    </CommandsRow>
  </Fragment>;
}

function SavingProgress() {
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Saving Progress on a Project</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="git status"
        desc="See what has changed since the last commit." />
      <CommandDesc command="renku save [-m <message>]"
        desc="Save (commit) and push all local changes. With -m, provide a message for the changes made." />
    </CommandsRow>
  </Fragment>;
}

function ManagingContents() {
  const addDesc = <span>Add data from &lt;url&gt; to a dataset.
    &lt;url&gt; can be a local file path, an http(s) address or a Git git+http or git+ssh repository.
    Use --target &lt;path&gt; to retrieve just a subset of the data.</span>;
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Managing Contents</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="renku dataset create <dataset>"
        desc="Create a new dataset called <dataset>." />
      <CommandDesc command="renku dataset ls"
        desc="List all datasets in the project." />
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="renku dataset add <dataset> <url>"
        desc={addDesc} />
    </CommandsRow>
    <CommandsRow>
      <CommandDesc command="renku storage pull <path> …"
        desc="Retrieve the contents of the file <path> to make them available locally." />
    </CommandsRow>
  </Fragment>;
}

function Collaboration() {
  const mergeDesc = <span>Incorporate the changes from the &lt;other branch&gt; into your branch.
    See the <ExternalDocsLink url="https://www.atlassian.com/git/tutorials/using-branches/git-merge"
    title="git merge docs" /> for details.
  </span>;
  return <Fragment>
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
  </Fragment>;
}

function UndoCommit() {
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Undo Renku Command</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <div>
        <CommandDesc command="git reset --hard HEAD^"
          desc="Undo the most recent renku command." />
        <p className="renku-info">This discards the most recent renku command.
          Use it with care, but it can be useful. For more options on reverting work,
          see the <ExternalDocsLink url="https://git-scm.com/docs/git-reset" title="git reset documentation" />.
        </p>
      </div>
    </CommandsRow>
  </Fragment>;
}

function LearnMore() {
  return <Fragment>
    <CommandsRow>
      <div>
        <h2>Want to learn more?</h2>
      </div>
    </CommandsRow>
    <CommandsRow>
      <div>
        For a brief explanation of the commands, refer to the {" "}
        {/* eslint-disable-next-line max-len */}
        <ExternalDocsLink url="https://raw.githubusercontent.com/SwissDataScienceCenter/renku/master/docs/_static/cheatsheet/cheatsheet.pdf"
          title="cheat sheet"/>.
      </div>
      <div>
        The <ExternalDocsLink url="https://renku-python.readthedocs.io/en/latest/commands.html"
          title="Renku documentation" /> covers much more.
      </div>
    </CommandsRow>
  </Fragment>;
}


function SessionCheatSheet() {
  return <div className="commands">
    <h1 className="mb-5">Renku Cheat Sheet</h1>
    <TypicalWorkflow />
    <RunningAndTrackingCommands />
    <SavingProgress />
    <ManagingContents />
    <Collaboration />
    <UndoCommit />
    <LearnMore />
  </div>;
}

export default SessionCheatSheet;
