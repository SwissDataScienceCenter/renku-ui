import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

// This is a simple helper component to visualize the spacing
const SpacingBox: React.FC<{
  token: string;
  spacingClass: string;
  type: "padding" | "margin";
  value: string; // Add value to display
}> = ({ token, spacingClass, type, value }) => {
  const [copied, setCopied] = useState("");
  const commonStyles: React.CSSProperties = {
    width: 180,
    minHeight: 220, // Adjusted minHeight to accommodate larger descriptions
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    overflow: "hidden",
    fontFamily: "sans-serif",
    display: "flex",
    flexDirection: "column",
    margin: "10px", // Spacing between individual boxes
    backgroundColor: "#fff", // White background for the card
  };

  const innerContentStyles: React.CSSProperties = {
    backgroundColor: "#6c757d", // Grey for content area
    color: "white",
    flexGrow: 1, // Allows content area to fill available space
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    minHeight: "50px", // Ensure content area has a minimum height
  };

  const marginVisual: React.CSSProperties = {
    // Margin is external to the main box, visualize it as a translucent blue area
    // The actual margin applies to the SpacingBox component in the story itself.
  };

  const paddingVisual: React.CSSProperties = {
    backgroundColor: "rgba(40, 167, 69, 0.2)", // Green for padding
    border: "1px dashed rgba(40, 167, 69, 0.5)", // Dashed border around padding
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  };

  const borderVisual: React.CSSProperties = {
    border: "2px solid #006e58", // Solid brand-primary border
  };

  return (
    <div
      style={{ ...commonStyles, ...(type === "margin" ? marginVisual : {}) }}
    >
      {type === "margin" && (
        <div
          style={{
            backgroundColor: "rgba(0, 123, 255, 0.1)", // Light blue for margin visualization
            border: "1px dashed rgba(0, 123, 255, 0.5)",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: type === "margin" ? value : "0", // Apply margin value as padding here for visual effect
          }}
        >
          <div
            className={spacingClass}
            style={{ ...borderVisual, flexGrow: 1, width: "calc(100% - 2px)" }}
          >
            {" "}
            {/* Content box with border */}
            <div style={innerContentStyles}>{token.split("(")[0].trim()}</div>
          </div>
        </div>
      )}

      {type === "padding" && (
        <div
          className={spacingClass}
          style={{ ...paddingVisual, ...borderVisual }}
        >
          {" "}
          {/* Padding area with border */}
          <div style={innerContentStyles}>{token.split("(")[0].trim()}</div>
        </div>
      )}

      <div
        style={{ padding: 12, textAlign: "center", backgroundColor: "#fff" }}
      >
        <div
          className={cx("mt-2", "small")}
          onClick={() => token && Copy(token, setCopied)}
        >
          <strong>Token:</strong> <code>{token}</code>
          {copied === token && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== token && <CopyIcon />}
        </div>
        <div className={cx("mt-2", "small")}>Value: {value}</div>
        <div className={cx("mt-2", "small", "text-muted")}>
          Bootstrap class: <code>{spacingClass}</code>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "Design Tokens/Spacing",
  component: SpacingBox,
  parameters: {
    docs: {
      description: {
        component:
          "Defines a  spacing system using design tokens, integrated with Bootstrap's utility classes. This system ensures consistent layouts and responsive designs across all components. Each example demonstrates **padding** (`p-*`) and **margin** (`m-*`) ",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    spacingClass: { control: false },
    label: { control: false },
    type: { control: false },
    value: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof SpacingBox>;

export const SpacingExamples: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: "1200px", margin: "0 auto" }}>
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 16,
            borderBottom: "2px solid #006e58",
            paddingBottom: 6,
            color: "#006e58",
          }}
        >
          1. Padding (p-*)
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <SpacingBox
            spacingClass="p-0"
            token="spacing-0"
            type="padding"
            value="0px"
          />
          <SpacingBox
            spacingClass="p-1"
            token="spacing-1"
            type="padding"
            value="4px"
          />
          <SpacingBox
            spacingClass="p-2"
            token="spacing-2"
            type="padding"
            value="8px"
          />
          <SpacingBox
            spacingClass="p-3"
            token="spacing-3"
            type="padding"
            value="16px"
          />
          <SpacingBox
            spacingClass="p-4"
            token="spacing-4"
            type="padding"
            value="24px"
          />
          <SpacingBox
            spacingClass="p-5"
            token="spacing-5"
            type="padding"
            value="48px"
          />
        </div>
      </section>

      <section>
        <h2
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 16,
            borderBottom: "2px solid #006e58",
            paddingBottom: 6,
            color: "#006e58",
          }}
        >
          2. Margin (m-*)
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <SpacingBox
            spacingClass="m-0"
            token="spacing-0"
            type="margin"
            value="0px"
          />
          <SpacingBox
            spacingClass="m-1"
            token="spacing-1"
            type="margin"
            value="4px"
          />
          <SpacingBox
            spacingClass="m-2"
            token="spacing-2"
            type="margin"
            value="8px"
          />
          <SpacingBox
            spacingClass="m-3"
            token="spacing-3"
            type="margin"
            value="16px"
          />
          <SpacingBox
            spacingClass="m-4"
            token="spacing-4"
            type="margin"
            value="24px"
          />
          <SpacingBox
            spacingClass="m-5"
            token="spacing-5"
            type="margin"
            value="48px"
          />
        </div>
      </section>
    </div>
  ),
};
