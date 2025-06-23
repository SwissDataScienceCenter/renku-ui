import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

// Define your opacity token data
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

// Helper component to visualize opacity
const OpacityExampleCard: React.FC<{
  token: string;
  value: string;
  description: string;
}> = ({ token, value, description }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: 250,
        height: 230,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: "sans-serif",
        backgroundColor: "#fff", // Card background
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        position: "relative", // For background image
      }}
    >
      {/* Background for transparency demo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          borderRadius: "inherit",
          zIndex: 0,
        }}
      ></div>

      {/* The actual opaque layer */}
      <div
        className={token} // Apply Bootstrap's bg-opacity class directly
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#006e58", // Your primary brand color
          borderRadius: "inherit",
          opacity: parseFloat(value), // Direct opacity for storybook render
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: value === "0" ? "#343a40" : "#fff", // Adjust text color for visibility on 0 opacity
          fontWeight: "bold",
          fontSize: "1.2rem",
          textShadow: value === "0" ? "none" : "0 0 5px rgba(0,0,0,0.5)",
        }}
      >
        {`${parseFloat(value) * 100}%`}
      </div>

      {/* Text overlay for token info */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255,255,255,0.8)", // Semi-transparent white background for text
          borderRadius: 4,
          padding: "8px 12px",
          marginTop: "auto", // Push to bottom
          textAlign: "center",
          color: "#343a40",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>{token}</div>
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
        <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
          Value: {value}
        </div>
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
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const OpacityLevels: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: "1200px", margin: "0 auto" }}>
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
          1. Background Opacity (bg-opacity-&lt;value&gt;)
        </h2>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: 14,
            color: "#666",
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          Visualize the effect of different opacity levels on a solid
          background, showcasing how elements can become more or less
          transparent.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {Object.entries(opacityTokens).map(([key, data]) => (
            <OpacityExampleCard
              key={key}
              token={key}
              value={data.value}
              description={data.description}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};
