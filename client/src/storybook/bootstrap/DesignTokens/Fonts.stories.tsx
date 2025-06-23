import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

// Define your font token data
const fontTokens = {
  typography: {
    "body-font-family": { value: '"Inter", sans-serif' },
    "body-font-size": { value: "1rem", px: "16px" },
    "body-font-weight": { value: "400" },
    "body-line-height": { value: "1.5" },
  },
  fontSizes: {
    "fs-1": { value: "2.5rem", px: "40px", type: "fontSizes" },
    "fs-2": { value: "2rem", px: "32px", type: "fontSizes" },
    "fs-3": { value: "1.75rem", px: "28px", type: "fontSizes" },
    "fs-4": { value: "1.5rem", px: "24px", type: "fontSizes" },
    "fs-5": { value: "1.25rem", px: "20px", type: "fontSizes" },
    "fs-6": { value: "1rem", px: "16px", type: "fontSizes" },
  },
  lineHeight: {
    "1": {
      value: 1,
      type: "lineHeight",
      description: "Tight line height",
      extensions: {
        px: "16px",
        rem: "1rem",
      },
    },
    sm: {
      value: 1.25,
      type: "lineHeight",
      description: "Small line height",
      extensions: {
        px: "20px",
        rem: "1.25rem",
      },
    },
    base: {
      value: 1.5,
      type: "lineHeight",
      description: "Base/default line height",
      extensions: {
        px: "24px",
        rem: "1.5rem",
      },
    },
    lg: {
      value: 2,
      type: "lineHeight",
      description: "Large line height",
      extensions: {
        px: "32px",
        rem: "2rem",
      },
    },
  },
};

// Helper component to display font properties
const FontPropertyCard: React.FC<{
  token: string;
  value: string | number;
  px?: string;
  notes?: string;
}> = ({ token, value, px, notes }) => (
  <div
    style={{
      width: 200, // Slightly wider for font details
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

// Helper component to display font size examples
const FontSizeExampleCard: React.FC<{
  token: string;
  value: string;
  px: string;
}> = ({ token, value, px }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: "100%", // Take full width for better readability of large text
        minHeight: 120,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: fontTokens.typography["body-font-family"].value, // Apply the body font family
        backgroundColor: "#fff",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: value,
          lineHeight: fontTokens.typography["body-line-height"].value,
          fontWeight: fontTokens.typography["body-font-weight"].value,
          color: "#212529",
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </div>
      <div style={{ marginTop: 16, fontSize: "0.9rem", color: "#666" }}>
        <strong>Token:</strong>
        <span
          className={cx("cursor-pointer", "ms-2")}
          onClick={() => Copy(token, setCopied)}
        >
          <code>{token}</code>
          {copied === token && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value} (
          {px})
        </span>
      </div>
      <div style={{ fontSize: "0.8rem", color: "#999", marginTop: 4 }}>
        Bootstrap class: <code>.fs-{token.split("-")[1]}</code>
      </div>
    </div>
  );
};

// Helper component to display line height examples
const LineHeightExampleCard: React.FC<{
  token: string;
  value: number;
  description: string;
  px?: string;
  rem: string;
}> = ({ token, value, description, px, rem }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: "100%",
        minHeight: 150, // Increased height to show line spacing clearly
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: fontTokens.typography["body-font-family"].value,
        backgroundColor: "#fff",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: fontTokens.typography["body-font-size"].value,
          lineHeight: value,
          fontWeight: fontTokens.typography["body-font-weight"].value,
          color: "#212529",
        }}
      >
        This is an example of text with **line height {value}**. <br />
        It demonstrates how spacing between lines changes. <br />
        Readability is key to a great user experience.
      </div>
      <div style={{ marginTop: 16, fontSize: "0.9rem", color: "#666" }}>
        <strong>Token:</strong>
        <span
          className={cx("cursor-pointer", "ms-2")}
          onClick={() => Copy(token, setCopied)}
        >
          <code>lh-{token}</code>
          {copied === token && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value} (
          {px})
        </span>{" "}
        | <strong>PX:</strong> {px} | <strong>REM:</strong> {rem}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#999", marginTop: 4 }}>
        {description} (Bootstrap class: <code>.lh-{token}</code>)
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "Design Tokens/Fonts",
  component: () => <div />, // Dummy component as we're rendering complex structure
  parameters: {
    docs: {
      description: {
        component:
          "This section defines our core **typographic system**, including font families, sizes, weights, and line heights. These tokens are seamlessly integrated with **Bootstrap's native font and line-height utilities** (e.g., `.fs-1` to `.fs-6`, and `.lh-1` to `.lh-lg`), ensuring a consistent and responsive typographic hierarchy across all applications. Designers and developers can leverage these tokens to maintain visual harmony and readability.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const FontSystem: Story = {
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
          1. Core Typography
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {Object.entries(fontTokens.typography).map(([key, data]) => (
            <FontPropertyCard
              key={key}
              token={key}
              value={data.value}
              px={data.px ?? ""}
              notes={
                key === "body-font-family"
                  ? "The primary typeface for body text"
                  : key === "body-font-size"
                  ? "Base font size for body copy"
                  : key === "body-font-weight"
                  ? "Default font weight"
                  : key === "body-line-height"
                  ? "Default line height for readability"
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
          2. Font Sizes (Headings & Display)
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
          These tokens define our scalable font sizes, directly mapping to
          Bootstrap's `.fs-` classes for easy application.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {" "}
          {/* Use column for distinct blocks */}
          {Object.entries(fontTokens.fontSizes)
            .sort(([, a], [, b]) => parseFloat(b.px) - parseFloat(a.px))
            .map(
              (
                [key, data] // Sort to show largest first
              ) => (
                <FontSizeExampleCard
                  key={key}
                  token={key}
                  value={data.value}
                  px={data.px}
                />
              )
            )}
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
          3. Line Heights
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
          These tokens map directly to Bootstrap's `.lh-` classes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(fontTokens.lineHeight).map(([key, data]) => (
            <LineHeightExampleCard
              key={key}
              token={key}
              value={data.value}
              description={data.description}
              px={data.extensions.px}
              rem={data.extensions.rem}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};
