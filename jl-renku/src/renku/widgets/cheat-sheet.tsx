/**
 * cheat-sheet.tsx
 *
 * The cheat sheet component
 */

import { ReactWidget, MainAreaWidget } from "@jupyterlab/apputils";
import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import ReactClipboard from "react-clipboard.js";

import { renkuIcon } from "../icons";


interface IClipboardProps {
  clipboardText: string;
}

/**
 * Clipboard (copied from client/src/utils/UIComponents.js)
 *
 * A component that copies text to the clipboard
 * @param {string} [clipboardText] - Text to copy to the clipboard
 */
const Clipboard: FunctionComponent<IClipboardProps> = ({ clipboardText = null }): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const timeoutDur = 3000;

  // keep track of mounted state
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return (): void => { isMounted.current = false; };
  }, []);

  return (
    <ReactClipboard component="a" data-clipboard-text={clipboardText} onSuccess={
      (): void => { setCopied(true); setTimeout(() => { if (isMounted.current) setCopied(false); }, timeoutDur); }
    }> {
        (copied) ?
          <FontAwesomeIcon icon={faCheck} color="green" /> :
          <FontAwesomeIcon icon={faCopy} />
      }
    </ReactClipboard>
  );
};

interface IDocLinkProps {
  url: string;
  text: string;
}


const DocLink: FunctionComponent<IDocLinkProps> = ( { url = null, text = "" }): JSX.Element => {
  return <a className="doc" href={url} role="button" target="_blank" rel="noreferrer noopener">
    {text}
  </a>;
};

interface ICommandDescProps {
  command: string;
  desc: string|JSX.Element;
  clipboard?: boolean;
}

const CommandDesc: FunctionComponent<ICommandDescProps> =
  ( { command = "", desc = "", clipboard = true }): JSX.Element => {
    return <div>
      <code>{command}</code>
      {
        (clipboard === true) ? <Clipboard clipboardText={command} /> : null
      }
      <p className="renku-info" style={{ paddingTop: "3px" }}>{desc}</p>
    </div>;
  };

const TypicalWorkflow = (): JSX.Element => {
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Typical Workflow</h2>
      </div>
    </div>
    <div className="row">
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
    </div>
  </React.Fragment>;
};

const RunningAndTrackingCommands = (): JSX.Element => {
  const desc = <span>Execute a &lt;command&gt; with Renku tracking inputs and outputs;
    input and output files are automatically detected from the command string.
    To override, With --input and/or --output: Manually specify input or output files to track.</span>;
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Running and Tracking Commands</h2>
      </div>
    </div>
    <div className="row">
      <CommandDesc command="renku run <command> [--input <in_file> …] [--output <out_file> …]"
        desc={desc}/>
    </div>
  </React.Fragment>;
};

const SavingProgress = (): JSX.Element => {
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Saving Progress on a Project</h2>
      </div>
    </div>
    <div className="row">
      <CommandDesc command="git status"
        desc="See what has changed since the last commit." />
      <CommandDesc command="renku save [-m <message>]"
        desc="Save (commit) and push all local changes. With -m, provide a message for the changes made." />
    </div>
  </React.Fragment>;
};

const ManagingContents = (): JSX.Element => {
  const addDesc = <span>Add data from &lt;url&gt; to a dataset.
    &lt;url&gt; can be a local file path, an http(s) address or a Git git+http or git+ssh repository.
    Use --target &lt;path&gt; to retrieve just a subset of the data.</span>;
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Managing Contents</h2>
      </div>
    </div>
    <div className="row">
      <CommandDesc command="renku dataset create <dataset>"
        desc="Create a new dataset called <dataset>." />
      <CommandDesc command="renku dataset ls"
        desc="List all datasets in the project." />
    </div>
    <div className="row">
      <CommandDesc command="renku dataset add <dataset> <url>"
        desc={addDesc} />
    </div>
    <div className="row">
      <CommandDesc command="renku storage pull <path> …"
        desc="Retrieve the contents of the file <path> to make them available locally." />
    </div>
  </React.Fragment>;
};

const Collaboration = (): JSX.Element => {
  const mergeDesc = <span>Incorporate the changes from the &lt;other branch&gt; into your branch.
    See the <DocLink url="https://www.atlassian.com/git/tutorials/using-branches/git-merge"
    text="git merge docs" /> for details.
  </span>;
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Collaboration</h2>
        <p className="renku-info">
          Working with others requires coordination, and branching/merging is a common way to handle this.
        </p>
      </div>
    </div>
    <div className="row">
      <CommandDesc command="git checkout <branch>"
        desc="Switch to the <branch>, replacing the contents of your project with the version in the branch." />
      <CommandDesc command="git merge <other branch>"
        desc={mergeDesc} />
    </div>
  </React.Fragment>;
};

const UndoCommit = (): JSX.Element => {
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Undo Renku Command</h2>
      </div>
    </div>
    <div className="row">
      <CommandDesc command="git reset --hard HEAD^"
        desc="Undo the most recent renku command." />
      <p className="renku-info">This discards the most recent renku command.
      Use it with care, but it can be useful. For more options on reverting work,
      see the <DocLink url="https://git-scm.com/docs/git-reset" text="git reset documentation" />.
      </p>
    </div>
  </React.Fragment>;
};

const LearnMore = (): JSX.Element => {
  return <React.Fragment>
    <div className="row">
      <div>
        <h2>Want to learn more?</h2>
      </div>
    </div>
    <div className="row">
      <div>
        For a brief explanation of the commands, refer to the {" "}
        {/* eslint-disable-next-line max-len */}
        <DocLink url="https://raw.githubusercontent.com/SwissDataScienceCenter/renku/master/docs/_static/cheatsheet/cheatsheet.pdf"
          text="cheat sheet"/>.
      </div>
      <div>
        The <DocLink url="https://renku-python.readthedocs.io/en/latest/commands.html"
          text="Renku documentation" /> covers much more.
      </div>
    </div>
  </React.Fragment>;
};


/**
 * The Renku menu
 */
const CheatSheet = (): JSX.Element => {
  return <div className="container">
    <div className="row">
      <div>
        <h1>Renku Cheat Sheet</h1>
      </div>
    </div>
    <TypicalWorkflow />
    <RunningAndTrackingCommands />
    <SavingProgress />
    <ManagingContents />
    <Collaboration />
    <UndoCommit />
    <LearnMore />
  </div>;
};

/**
 * Wrapper on the Menu
 */
class CheatSheetWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    [
      "jp-RenkuCheatSheet"
    ].forEach(c => this.addClass(c));
  }

  render(): JSX.Element {
    return <CheatSheet />;
  }
}

function CreateCheatSheetWidget(): MainAreaWidget {
  // Create a blank content widget inside of a MainAreaWidget
  const content = new CheatSheetWidget();
  const widget = new MainAreaWidget({ content });
  widget.id = "jl-renku-cheat_sheet";

  widget.title.label = "Cheat Sheet";
  widget.title.closable = true;
  widget.title.caption = "Renku Cheat Sheet";
  widget.title.icon = renkuIcon;

  return widget;
}

export { CreateCheatSheetWidget };
