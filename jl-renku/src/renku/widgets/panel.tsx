/**
 * main.tsx
 *
 * The renku panel.
 */

import { CommandRegistry } from "@lumino/commands";

import { ReactWidget } from "@jupyterlab/apputils";

import React, { FunctionComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faTrophy } from "@fortawesome/free-solid-svg-icons";

import { renkuIcon } from "../icons";
import { CommandIds } from "../commands";

interface IPanelProps {
  commands: CommandRegistry;
}

const RenkuPanel: FunctionComponent<IPanelProps> = ( { commands = null } ): JSX.Element => {
  const executeAction = (name: string): void => {
    commands.execute(name);
  };

  return <div>
    <div>
      <h3>Renku</h3>
    </div>
    <div>
      <table>
        <tbody>
          <tr onClick={(e): void => executeAction(CommandIds.podInfo)}>
            <th scope="row"><FontAwesomeIcon icon={faTachometerAlt} /></th><td>Pod Info</td>
          </tr>
          <tr onClick={(e): void => executeAction(CommandIds.cheatSheet)}>
            <th scope="row"><FontAwesomeIcon icon={faTrophy} /></th><td>Cheat Sheet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>;
};

/**
 * Wrapper on the Panel
 */
class RenkuPanelWidget extends ReactWidget {
  commands: CommandRegistry;

  constructor(commands: CommandRegistry) {
    super();
    [
      "jp-RenkuPanel",
      "jp-Toolbar",
      "jp-scrollbar-tiny",
      "jp-Toolbar-micro"
    ].forEach(c => this.addClass(c));
    this.commands = commands;
  }

  render(): JSX.Element {
    return <RenkuPanel commands={this.commands} />;
  }
}

function CreateRenkuPanelWidget(commands: CommandRegistry): RenkuPanelWidget {
  const widget = new RenkuPanelWidget(commands);
  widget.id = "jl-renku-main";
  // Do not set a label, we just want the icon.
  // widget.title.label = 'Renku';
  widget.title.closable = true;
  widget.title.caption = "Renku";
  widget.title.icon = renkuIcon;

  return widget;
}

export { CreateRenkuPanelWidget, RenkuPanelWidget };
