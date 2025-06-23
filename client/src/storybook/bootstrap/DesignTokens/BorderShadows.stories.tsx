import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

// Define your border and shadow token data
const tokenData = {
  border: {
    "border-width": { value: "1px" },
    "border-style": { value: "solid" },
  },
  borderRadius: {
    "rounded-0": {
      value: "0rem",
      type: "borderRadius",
      description: "No border radius",
      extensions: {
        px: "0px",
      },
    },
    "rounded-1": {
      value: "0.2rem",
      type: "borderRadius",
      description: "Extra small border radius",
      extensions: {
        px: "3.2px",
      },
    },
    "rounded-2": {
      value: "0.25rem",
      type: "borderRadius",
      description: "Small border radius",
      extensions: {
        px: "4px",
      },
    },
    "rounded-3": {
      value: "0.3rem",
      type: "borderRadius",
      description: "Medium border radius",
      extensions: {
        px: "4.8px",
      },
    },
    "rounded-circle": {
      value: "50%",
      type: "borderRadius",
      description: "Perfect circle border radius",
    },
    "rounded-pill": {
      value: "50rem",
      type: "borderRadius",
      description: "Fully rounded pill shape",
      extensions: {
        px: "800px",
      },
    },
  },
  shadow: {
    shadow: {
      value: "0 .5rem 1rem rgba(0, 0, 0, .15)",
      description: "Default box shadow",
    },
    "shadow-sm": {
      value: "0 .125rem .25rem rgba(0, 0, 0, .075)",
      description: "Small box shadow",
    },
    "shadow-lg": {
      value: "0 1rem 3rem rgba(0, 0, 0, .175)",
      description: "Large box shadow",
    },
    "shadow-inset": {
      value: "inset 0 1px 2px rgba(0, 0, 0, .075)",
      description: "Inset box shadow",
    },
  },
};

// Helper component for generic property display
const PropertyCard: React.FC<{
  token: string;
  value: string;
  px?: string;
  notes?: string;
}> = ({ token, value, px, notes }) => (
  <div
    style={{
      width: 200,
      minHeight: 120,
      borderRadius: 8,
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      overflow: "hidden",
      fontFamily: "sans-serif",
      backgroundColor: "#fff",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 4,
          color: "#006e58",
        }}
      >
        {token}
      </div>
      <div style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
        Value: <strong>{value}</strong>
      </div>
      {px && <div style={{ fontSize: 13, color: "#666" }}>PX: {px}</div>}
    </div>
    {notes && (
      <div style={{ fontSize: 11, color: "#999", marginTop: "auto" }}>
        {notes}
      </div>
    )}
  </div>
);

// Helper component to visualize border radius
const BorderRadiusExampleCard: React.FC<{
  token: string;
  value: string;
  px: string;
}> = ({ token, value, px }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: 200,
        height: token === "rounded-circle" ? 200 : 150,
        border: "2px solid #006e58", // Primary brand color border
        backgroundColor: "#f8f9fa", // Light background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        fontSize: "0.8rem",
        color: "#343a40",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        flexDirection: "column",
        textAlign: "center",
      }}
      className={token}
    >
      <div style={{ fontWeight: 600 }}>{token}</div>
      <div>
        {value} ({px})
      </div>
      <div
        style={{ fontSize: 13, marginBottom: 4, cursor: "pointer" }}
        className="mt-3"
        onClick={() => token && Copy(token, setCopied)}
      >
        <code>{token}</code>
        {copied === token && (
          <span style={{ marginLeft: 4, color: "green" }}>✓</span>
        )}
        {copied !== token && <CopyIcon />}
      </div>
    </div>
  );
};

// Helper component to visualize shadows
const ShadowExampleCard: React.FC<{
  token: string;
  value: string;
  description: string;
  cssClass?: string; // For Bootstrap shadow classes
}> = ({ token, value, description, cssClass }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: 250,
        height: 150,
        borderRadius: 8,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        fontSize: "0.9rem",
        color: "#343a40",
        boxShadow: value, // Apply the actual shadow value
        border: "1px solid #dee2e6", // Subtle border to define the card
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 5 }}>{token}</div>
      <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>{description}</div>
      <div
        style={{ fontSize: "0.75rem", color: "#999", marginTop: 10 }}
        onClick={() => token && Copy(token, setCopied)}
      >
        <code>{token || `Custom Shadow`}</code>
        {copied === token && (
          <span style={{ marginLeft: 4, color: "green" }}>✓</span>
        )}
        {copied !== token && <CopyIcon />}
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "Design Tokens/Borders & Shadows",
  component: () => <div />, // Dummy component as we're rendering complex structure
  parameters: {
    docs: {
      description: {
        component:
          "This section defines our visual treatments for **borders** and **shadows**, crucial for defining element boundaries and conveying depth in our UI. These tokens are designed to align with **Bootstrap's border and shadow utilities** (e.g., `.border-radius-*`, `.shadow-*`), ensuring consistent visual presentation and seamless integration across all components. They empower designers and developers to create clear, layered, and modern interfaces.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const BordersAndShadows: Story = {
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
          1. Core Borders
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
          Fundamental properties defining the default appearance of borders.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {Object.entries(tokenData.border).map(([key, data]) => (
            <PropertyCard
              key={key}
              token={key}
              value={data.value}
              notes={
                key === "border-width"
                  ? "Default border thickness"
                  : key === "border-style"
                  ? "Default border line style"
                  : ""
              }
            />
          ))}
        </div>
      </section>

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
          2. Border Radius
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
          Defines the roundness of element corners, aligning with Bootstrap's
          `.rounded-*` classes for consistent visual softness.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {Object.entries(tokenData.borderRadius).map(([key, data]) => (
            <BorderRadiusExampleCard
              key={key}
              token={key}
              value={data.value}
              px={data.extensions?.px || ""}
            />
          ))}
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
          3. Box Shadows
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
          Adds depth and visual hierarchy using predefined shadow values,
          directly corresponding to Bootstrap's `.shadow-*` classes.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {/* Manually mapping to ensure correct Bootstrap classes are mentioned */}
          <ShadowExampleCard
            token="shadow-sm"
            value={tokenData.shadow["shadow-sm"].value}
            description={tokenData.shadow["shadow-sm"].description}
            cssClass="shadow-sm"
          />
          <ShadowExampleCard
            token="shadow"
            value={tokenData.shadow["shadow"].value}
            description={tokenData.shadow["shadow"].description}
            cssClass="shadow"
          />
          <ShadowExampleCard
            token="shadow-lg"
            value={tokenData.shadow["shadow-lg"].value}
            description={tokenData.shadow["shadow-lg"].description}
            cssClass="shadow-lg"
          />
          <ShadowExampleCard
            token="shadow-inset"
            value={tokenData.shadow["shadow-inset"].value}
            description={tokenData.shadow["shadow-inset"].description}
            cssClass="shadow-inset " // Inset isn't a direct Bootstrap class
          />
        </div>
      </section>
    </div>
  ),
};
