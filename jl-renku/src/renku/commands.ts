/**
 * commands.ts
 *
 * Commands for the Renku JL Plugin.
 */

import { CommandRegistry } from "@lumino/commands";
import { Widget } from "@lumino/widgets";
import { JupyterFrontEnd } from "@jupyterlab/application";

import { RenkuPanelWidget, CreatePodInfoWidget, CreateCheatSheetWidget } from "./widgets";

namespace CommandIds {
  export const renkuMain = "renku:main";
  export const podInfo = "renku:pod-info";
  export const cheatSheet = "renku:cheat-sheet";
}

/**
 * Keep track of widgets so there is only one open at a time.
 */
class WidgetRegistry {
  registry = new Map<string, Widget>();

  getWidget(key: string, creator: () => Widget): Widget {
    // Create the widget if none is there or if it has been disposed
    if ((!this.registry.has(key)) || (this.registry.get(key).isDisposed))
      this.registry.set(key, creator());
    return this.registry.get(key);
  }

}

/** Add the widget if necessary and activate it. */
function showWidget(shell: JupyterFrontEnd.IShell, widget: Widget): void {
  if (!widget.isAttached)
    shell.add(widget, "main");
  shell.activateById(widget.id);
}


const widgetRegistry = new WidgetRegistry();

function RegisterRenkuCommands(
  commands: CommandRegistry,
  shell: JupyterFrontEnd.IShell,
  renkuMain: RenkuPanelWidget
): void {
  // Command to open the Renku Main widget
  commands.addCommand(CommandIds.renkuMain, {
    label: "Renku",
    execute: () => {
      showWidget(shell, renkuMain);
    }
  });

  // Command to show the pod info
  commands.addCommand(CommandIds.podInfo, {
    label: "Pod Info",
    execute: () => {
      const widget = widgetRegistry.getWidget(CommandIds.podInfo, () => CreatePodInfoWidget());
      showWidget(shell, widget);
    }
  });

  // Command to show the cheat sheet
  commands.addCommand(CommandIds.cheatSheet, {
    label: "Renku Cheat Sheet",
    execute: () => {
      const widget = widgetRegistry.getWidget(CommandIds.cheatSheet, () => CreateCheatSheetWidget());
      showWidget(shell, widget);
    }
  });
}

export { CommandIds, RegisterRenkuCommands };
