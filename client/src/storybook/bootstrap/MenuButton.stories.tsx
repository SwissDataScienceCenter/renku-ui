import { Meta, StoryObj } from "@storybook/react-vite";
import cx from "classnames";
import { Pencil, Trash } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import {
  MenuButton,
  MenuButtonItem,
} from "../../components/buttons/MenuButton";

const componentDescription = `
Split-button dropdown for extra actions next to a main button.
`;

export default {
  args: {
    color: "outline-primary",
  },
  argTypes: {
    color: {
      description: "Color scheme applied to the toggle.",
      type: {
        name: "enum",
        value: [
          "primary",
          "outline-primary",
          "secondary",
          "outline-secondary",
          "success",
          "danger",
          "outline-danger",
        ],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  title: "Bootstrap/MenuButton",
} as Meta<MenuButtonStoryArgs>;

interface MenuButtonStoryArgs {
  color: string;
}

type Story = StoryObj<MenuButtonStoryArgs>;

export const PlainMenu_: Story = {
  render: (args) => (
    <MenuButton color={args.color}>
      <MenuButtonItem>Rename</MenuButtonItem>
      <MenuButtonItem>Duplicate</MenuButtonItem>
      <MenuButtonItem>
        <Trash className={cx("bi", "me-1")} />
        Remove
      </MenuButtonItem>
    </MenuButton>
  ),
};

export const SplitButton_: Story = {
  render: (args) => (
    <MenuButton
      color={args.color}
      default={
        <Button
          className="text-nowrap"
          color={args.color}
          onClick={() => {}}
          size="sm"
        >
          <Pencil className={cx("bi", "me-1")} />
          Edit
        </Button>
      }
    >
      <MenuButtonItem>
        <Trash className={cx("bi", "me-1")} />
        Remove
      </MenuButtonItem>
    </MenuButton>
  ),
};

export const LinkMainAction_: Story = {
  render: (args) => (
    <MenuButton
      color={args.color}
      default={
        <a className={cx("btn", `btn-${args.color}`)} href="#edit">
          Open
        </a>
      }
    >
      <MenuButtonItem>Copy link</MenuButtonItem>
      <MenuButtonItem>Remove</MenuButtonItem>
    </MenuButton>
  ),
};

export const DisabledToggle_: Story = {
  render: (args) => (
    <MenuButton color={args.color} disabled>
      <MenuButtonItem>Rename</MenuButtonItem>
      <MenuButtonItem>Remove</MenuButtonItem>
    </MenuButton>
  ),
};

export const Directions_: Story = {
  render: (args) => (
    <div className={cx("d-flex", "flex-wrap", "gap-3", "p-5")}>
      <MenuButton color={args.color} direction="down">
        <MenuButtonItem>Down item</MenuButtonItem>
      </MenuButton>
      <MenuButton color={args.color} direction="up">
        <MenuButtonItem>Up item</MenuButtonItem>
      </MenuButton>
      <MenuButton color={args.color} direction="end">
        <MenuButtonItem>End item</MenuButtonItem>
      </MenuButton>
      <MenuButton color={args.color} direction="start">
        <MenuButtonItem>Start item</MenuButtonItem>
      </MenuButton>
    </div>
  ),
};

export const LongMenuNearBottom_: Story = {
  render: (args) => (
    <div className={cx("d-flex", "align-items-end", "min-vh-100", "pb-3")}>
      <MenuButton color={args.color}>
        {Array.from({ length: 12 }, (_, index) => (
          <MenuButtonItem key={index}>Action {index + 1}</MenuButtonItem>
        ))}
      </MenuButton>
    </div>
  ),
};
