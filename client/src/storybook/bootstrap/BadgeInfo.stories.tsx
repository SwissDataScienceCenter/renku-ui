import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { CircleFill } from "react-bootstrap-icons";

import { Loader } from "../../components/Loader";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";

export default {
  args: {
    color: "light",
    content: "Some text",
    loader: false,
  },
  argTypes: {
    content: {
      description: "Content to display inside the badge.",
    },
    loader: {
      description: "Show a loading spinner inside the badge.",
      type: {
        name: "boolean",
      },
    },
    color: {
      description: "Color scheme to apply.",
      type: {
        name: "enum",
        value: ["light", "success", "warning", "danger"],
      },
      control: {
        type: "select",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Renku Badges are a variation of the standard Badges, used in many places in the UI to convey readable information about the current status of a resource.",
      },
    },
  },
  title: "Bootstrap/Badge/Renku Badge",
} as Meta;

interface RenkuBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  color: "light" | "success" | "warning" | "danger";
  content?: string;
  loader: boolean;
}
type Story = StoryObj<RenkuBadgeProps>;

CircleFill.displayName = "CircleFill";

export const RenkuBadge_: Story = {
  render: (_args) => {
    return (
      <RenkuBadge color={_args.color}>
        {_args.loader ? (
          <Loader size={12} className="me-1" inline />
        ) : (
          <CircleFill className={cx("me-1", "bi")} />
        )}
        {_args.content}
      </RenkuBadge>
    );
  },
};
