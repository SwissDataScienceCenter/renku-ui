/**
 * menu.ts
 *
 * Extensions to the JL menus.
 */

import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";

import { CommandIds } from "./commands";

function CreateRenkuMenu(commands: CommandRegistry): Menu {
  const menu = new Menu({ commands });
  menu.title.label = "Renku";
  const menuCommands = [CommandIds.podInfo, CommandIds.cheatSheet];
  menuCommands.forEach(command => menu.addItem({ command }));
  return menu;
}

export { CreateRenkuMenu };
