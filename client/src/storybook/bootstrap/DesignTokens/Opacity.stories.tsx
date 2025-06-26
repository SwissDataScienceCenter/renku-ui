import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

const opacityTokens = {
  "bg-opacity-0": {
    value: "0",
    type: "opacity",
    description: "Fully transparent (0% opacity)",
  },
  "bg-opacity-25": {
    value: "0.25",
    type: "opacity",
    description: "25% opaque",
  },
  "bg-opacity-50": {
    value: "0.5",
    type: "opacity",
    description: "50% opaque",
  },
  "bg-opacity-75": {
    value: "0.75",
    type: "opacity",
    description: "75% opaque",
  },
  "bg-opacity-100": {
    value: "1",
    type: "opacity",
    description: "Fully opaque (100% opacity)",
  },
};

const OpacityExampleCard: React.FC<{
  token: string;
  value: string;
  description: string;
  backgroundColor: string;
}> = ({ token, value, backgroundColor }) => {
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
        backgroundColor: "#fff", // Card background
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
          token, // Apply Bootstrap's bg-opacity class directly
          backgroundColor, // Apply the selected background color class here
          "d-flex",
          "align-items-center",
          "justify-content-center",
          value === "0" ? "text-dark" : "text-white", // Adjust text color for visibility on 0 opacity
          "fw-bold",
          "fs-5"
        )}
        style={{
          backgroundColor: "#006e58", // Your primary brand color
          borderRadius: "inherit",
          opacity: parseFloat(value), // Direct opacity for storybook render
          zIndex: 1,
          textShadow: value === "0" ? "none" : "0 0 5px rgba(0,0,0,0.5)",
        }}
      >
        {`${parseFloat(value) * 100}%`}
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
        style={{
          backgroundColor: "rgba(255,255,255,0.8)", // Semi-transparent white background for text
        }}
      >
        <div className={cx("fw-semibold", "fs-6")}>{token}</div>
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
        <div className={cx("fs-6", "text-muted", "mt-1")}>Value: {value}</div>
      </div>
    </div>
  );
};

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
              value={data.value}
              description={data.description}
              backgroundColor={args.backgroundColor}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};
