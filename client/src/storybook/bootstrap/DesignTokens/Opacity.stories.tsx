import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import { useState } from "react";

import { Copy, CopyIcon } from "~/storybook/bootstrap/utils";

const opacityTokens = {
  "bg-opacity-0": "Fully transparent (0% opacity)",
  "bg-opacity-25": "25% opaque",
  "bg-opacity-50": "50% opaque",
  "bg-opacity-75": "75% opaque",
  "bg-opacity-100": "Fully opaque (100% opacity)",
};
interface OpacityExampleCardProps {
  token: string;
  description: string;
  backgroundColor: string;
}
function OpacityExampleCard({
  token,
  backgroundColor,
}: OpacityExampleCardProps) {
  const [copied, setCopied] = useState("");
  return (
    <div
      className={cx(
        "card",
        "shadow-sm",
        "overflow-hidden",
        "font-sans",
        "d-flex",
        "flex-column",
        "justify-content-between",
        "align-items-center",
        "p-3",
        "position-relative"
      )}
      style={{
        width: 250,
        height: 250,
        backgroundColor: "#fff",
      }}
    >
      <div
        className={cx(
          "position-absolute",
          "top-0",
          "start-0",
          "w-100",
          "h-100"
        )}
        style={{
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          borderRadius: "inherit",
          zIndex: 0,
        }}
      ></div>
      <div
        className={cx(
          "position-absolute",
          "top-0",
          "start-0",
          "w-100",
          "h-100",
          token,
          backgroundColor,
          "d-flex",
          "align-items-center",
          "justify-content-center",
          "text-white",
          "fw-bold",
          "fs-5"
        )}
        style={{
          borderRadius: "inherit",
          zIndex: 1,
          textShadow:
            token === "bg-opacity-0" ? "none" : "0 0 5px rgba(0,0,0,0.5)",
        }}
      >
        {token}
      </div>

      <div
        className={cx(
          "position-relative",
          "z-2",
          "bg-white",
          "rounded",
          "p-2",
          "mt-auto",
          "text-center",
          "text-dark"
        )}
      >
        <div
          className={cx("mt-2", "small")}
          onClick={() => token && Copy(token, setCopied)}
        >
          <strong>Token:</strong> <code>{token}</code>
          {copied === token && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== token && <CopyIcon />}
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design Tokens/Opacity",
  component: () => <div />, // Dummy component as we're rendering complex structure
  parameters: {
    docs: {
      description: {
        component:
          "This section defines our **opacity scale** for controlling the transparency of elements. These tokens are designed to integrate seamlessly with **Bootstrap's `bg-opacity-*` utility classes**, providing a standardized approach to creating subtle visual effects, overlays, and layered designs. They ensure consistency in visual depth and interaction states across the user interface.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    backgroundColor: {
      options: [
        "bg-primary",
        "bg-secondary",
        "bg-navy",
        "bg-success",
        "bg-info",
        "bg-warning",
        "bg-danger",
        "bg-primary-subtle",
        "bg-secondary-subtle",
        "bg-success-subtle",
        "bg-info-subtle",
        "bg-warning-subtle",
        "bg-danger-subtle",
        "bg-light-subtle",
        "bg-dark-subtle",
      ],
      control: {
        type: "select",
      },
      description: "Sets the base background color for the opaque layer.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const OpacityLevels: Story = {
  args: {
    backgroundColor: "bg-primary",
  },
  render: (args) => (
    <div className={cx("p-4", "mx-auto")} style={{ maxWidth: "1200px" }}>
      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          Background Opacity (bg-opacity-*)
        </h2>
        <p
          className={cx("font-sans", "small", "text-muted", "mb-4")}
          style={{ maxWidth: 800 }}
        >
          Visualize the effect of different opacity levels on a solid
          background, showcasing how elements can become more or less
          transparent.
        </p>
        <div
          className={cx(
            "d-flex",
            "flex-wrap",
            "gap-4",
            "justify-content-center"
          )}
        >
          {Object.entries(opacityTokens).map(([key, data]) => (
            <OpacityExampleCard
              key={key}
              token={key}
              description={data}
              backgroundColor={args.backgroundColor}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};
