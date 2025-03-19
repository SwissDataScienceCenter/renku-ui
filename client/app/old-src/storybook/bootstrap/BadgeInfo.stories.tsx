import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { Badge } from "reactstrap";
import { CircleFill } from "react-bootstrap-icons";

import { Loader } from "../../components/Loader";

export default {
  args: {
    children: "Info",
    loader: false,
    status: "bg-light border-dark-subtle text-dark-emphasis",
  },
  argTypes: {
    children: {
      description: "Content to display inside the badge.",
    },
    loader: {
      description: "Show a loading spinner inside the badge.",
      type: {
        name: "boolean",
      },
    },
    status: {
      description: "Color scheme to apply.",
      type: {
        name: "enum",
        value: [
          "bg-light border-dark-subtle text-dark-emphasis",
          "bg-success-subtle border-success text-success-emphasis",
          "bg-danger-subtle border-danger text-danger-emphasis",
          "bg-warning-subtle border-warning text-warning-emphasis",
        ],
      },
      control: {
        type: "select",
        labels: {
          "bg-light border-dark-subtle text-dark-emphasis": "Neutral",
          "bg-success-subtle border-success text-success-emphasis": "Success",
          "bg-danger-subtle border-danger text-danger-emphasis": "Error",
          "bg-warning-subtle border-warning text-warning-emphasis": "Warning",
        },
      },
      mapping: {
        Neutral: "bg-light border-dark-subtle text-dark-emphasis",
        Success: "bg-success-subtle border-success text-success-emphasis",
        Error: "bg-danger-subtle border-danger text-danger-emphasis",
        Warning: "bg-warning-subtle border-warning text-warning-emphasis",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Info Badges are a variation of the standard Badges, used in many places in the UI to convey readable information about the current status of a resource.",
      },
    },
  },
  title: "Bootstrap/Badge/Info Badge",
} as Meta;

interface BadgeInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  loader: boolean;
  status: string;
}
type Story = StoryObj<BadgeInfoProps>;

CircleFill.displayName = "CircleFill";

export const BadgeInfo_: Story = {
  render: (_args) => {
    return (
      <Badge color="info" className={cx("border", _args.status)}>
        {_args.loader ? (
          <Loader size={12} className="me-1" inline />
        ) : (
          <CircleFill className={cx("me-1", "bi")} />
        )}
        {_args.children}
      </Badge>
    );
  },
};
