import { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "reactstrap";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  MenuButton,
  MenuButtonItem,
} from "../../components/buttons/MenuButton";
import useClickableHostHandlers from "../../components/buttons/useClickableHostHandlers.hook";

export default {
  args: {
    onMainAction: fn(),
    onCardClick: fn(),
  },
  parameters: {
    docs: { disable: true },
  },
  tags: ["!autodocs"],
  title: "Bootstrap/MenuButton Tests",
} as Meta<PlayArgs>;

interface PlayArgs {
  onMainAction: ReturnType<typeof fn>;
  onCardClick: ReturnType<typeof fn>;
}

type Story = StoryObj<PlayArgs>;

async function waitForOpen(root: HTMLElement) {
  await waitFor(() => {
    expect(root.querySelector(".dropdown-menu.show")).not.toBeNull();
  });
}

async function waitForClosed(root: HTMLElement) {
  await waitFor(() => {
    expect(root.querySelector(".dropdown-menu.show")).toBeNull();
  });
}

function getToggle(root: HTMLElement) {
  return within(root).getByRole("button", { name: "More actions" });
}

function BasicItems() {
  return (
    <>
      <MenuButtonItem>Edit</MenuButtonItem>
      <MenuButtonItem>Delete</MenuButtonItem>
    </>
  );
}

export const BasicOpenAndClose: Story = {
  render: () => (
    <MenuButton>
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    await userEvent.click(toggle);
    await waitForClosed(canvasElement);
  },
};

export const OutsideClickCloses: Story = {
  render: () => (
    <div>
      <MenuButton>
        <BasicItems />
      </MenuButton>
      <button type="button">outside</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "outside" }));
    await waitForClosed(canvasElement);
  },
};

export const EscapeRestoresFocus: Story = {
  render: () => (
    <MenuButton>
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitForClosed(canvasElement);
    expect(toggle).toHaveFocus();
  },
};

export const ArrowKeyNavigation: Story = {
  render: () => (
    <MenuButton>
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    toggle.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitForOpen(canvasElement);
    const edit = canvas.getByRole("button", { name: "Edit" });
    const remove = canvas.getByRole("button", { name: "Delete" });
    await waitFor(() => expect(edit).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(remove).toHaveFocus());
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(edit).toHaveFocus());
  },
};

export const SplitButtonMainAction: Story = {
  args: { onMainAction: fn() },
  render: (args) => (
    <MenuButton
      default={
        <Button color="primary" onClick={() => args.onMainAction()} size="sm">
          Launch
        </Button>
      }
    >
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole("button", { name: "Launch" });
    main.focus();
    await userEvent.keyboard("{Enter}");
    expect(args.onMainAction).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(args.onMainAction).toHaveBeenCalledTimes(2);
  },
};

export const ToggleDoesNotFireMainAction: Story = {
  args: { onMainAction: fn() },
  render: (args) => (
    <MenuButton
      default={
        <Button color="primary" onClick={() => args.onMainAction()} size="sm">
          Launch
        </Button>
      }
    >
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    const main = canvas.getByRole("button", { name: "Launch" });
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    expect(args.onMainAction).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await waitForClosed(canvasElement);
    await userEvent.click(main);
    expect(args.onMainAction).toHaveBeenCalledTimes(1);
    expect(canvasElement.querySelector(".dropdown-menu.show")).toBeNull();
  },
};

export const FocusRestoredAfterItemSelect: Story = {
  render: () => (
    <MenuButton>
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await waitForClosed(canvasElement);
    expect(toggle).toHaveFocus();
    expect(document.activeElement).not.toBe(document.body);
  },
};

// Cards wrapping these menus have their own onClick; preventPropagation
// stops the toggle from also activating the card.
export const PreventPropagationOnCard: Story = {
  args: { onCardClick: fn() },
  render: (args) => (
    <div onClick={() => args.onCardClick()}>
      <MenuButton preventPropagation>
        <BasicItems />
      </MenuButton>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);

    toggle.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitForOpen(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitForClosed(canvasElement);
    expect(args.onCardClick).not.toHaveBeenCalled();

    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    expect(args.onCardClick).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await waitForClosed(canvasElement);
    expect(args.onCardClick).not.toHaveBeenCalled();
  },
};

export const TabThenClickOpens: Story = {
  render: () => (
    <MenuButton>
      <BasicItems />
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const toggle = getToggle(canvasElement);
    toggle.focus();
    expect(toggle).toHaveFocus();
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
  },
};

export const HostClickIgnoresMenu: Story = {
  args: { onCardClick: fn() },
  render: (args) => <HostCard onCardClick={args.onCardClick} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Card body"));
    expect(args.onCardClick).toHaveBeenCalledTimes(1);

    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    expect(args.onCardClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await waitForClosed(canvasElement);
    expect(args.onCardClick).toHaveBeenCalledTimes(1);
  },
};

export const HrefItemNavigates: Story = {
  render: () => (
    <MenuButton>
      <MenuButtonItem href="#menu-button-link">Open docs</MenuButtonItem>
    </MenuButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    const link = canvas.getByRole("link", { name: "Open docs" });
    expect(link).toHaveAttribute("href", "#menu-button-link");
    await userEvent.click(link);
    await waitForClosed(canvasElement);
  },
};

export const DisabledWhileOpenCloses: Story = {
  render: () => <DisableWhileOpenExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = getToggle(canvasElement);
    await userEvent.click(toggle);
    await waitForOpen(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "disable" }));
    await waitForClosed(canvasElement);
    expect(toggle).toBeDisabled();
  },
};

function HostCard({ onCardClick }: { onCardClick: () => void }) {
  const handlers = useClickableHostHandlers(onCardClick);
  return (
    <div {...handlers}>
      <span>Card body</span>
      <MenuButton>
        <BasicItems />
      </MenuButton>
    </div>
  );
}

function DisableWhileOpenExample() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div>
      <MenuButton disabled={disabled}>
        <BasicItems />
      </MenuButton>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setDisabled(true);
        }}
      >
        disable
      </button>
    </div>
  );
}
