import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { Loader } from "../../components/Loader";

const componentDescription = `
We use loaders through the application to indicate that a process is ongoing.

On whole pages, we show a bigger bouncer. Use that to prevent showing a page when more content is necessary.
On smaller components, like buttons, modals, and others, we show a spinning wheel to prevent user interactions while the process is ongoing. You can consider using the new "placeholder" class from Bootstrap to show a skeleton of the content instead of a loader.
`;

export default {
  args: {
    color: "none",
    inline: false,
    size: 16,
  },
  argTypes: {
    color: {
      description:
        "Color scheme to apply to the loader. It takes effect only on the inline loader.",
      type: {
        name: "enum",
        value: [
          "none",
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "danger",
        ],
      },
    },
    inline: {
      description: "Use the inline prop to show a smaller loader.",
      type: {
        name: "boolean",
      },
    },
    size: {
      description:
        "Size of the loader. Use this only in combination with the inline modifier.",
      type: {
        name: "number",
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
  title: "Bootstrap/Loader",
} as Meta;

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  inline: boolean;
  size: number;
}
type Story = StoryObj<TooltipProps>;

export const Loader_: Story = {
  render: function TooltipStory({ color, inline, size }) {
    return (
      <>
        <div className={cx(color !== "none" ? `text-${color}` : undefined)}>
          <Loader inline={inline} size={inline ? size : undefined} />
        </div>
      </>
    );
  },
};
