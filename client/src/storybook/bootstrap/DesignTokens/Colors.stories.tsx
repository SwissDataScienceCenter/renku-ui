import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx"; // Assuming this path is correct

// Updated color JSON design token content
const allColorTokens = {
  "brand colors": {
    primary: { value: "#006e58", notes: "Main brand color" },
    secondary: { value: "#6c757d", notes: "Secondary UI color" },
    navy: { value: "#01192d", notes: "Custom dark navy" },
  },
  "feedback colors": {
    success: { value: "#65a30d", notes: "Success color" },
    info: { value: "#17a2b8", notes: "Info color" },
    warning: { value: "#ffc107", notes: "Warning color" },
    danger: { value: "#dc3545", notes: "Danger color" },
  },
  "body colors": {
    "body-color": { value: "#212529", notes: "Default text color" },
    "body-bg": { value: "#ffffff", notes: "Default background color" },
  },
  grayscale: {
    white: { value: "#ffffff" },
    light: { value: "#f8f9fa", notes: "Light grayscale" },
    dark: { value: "#212529", notes: "Dark grayscale" },
    gray: { value: "#6c757d", notes: "Gray base" },
    "gray-dark": { value: "#343a40", notes: "Dark gray" },
    "gray-100": { value: "#f8f9fa", notes: "Lightest gray" },
    "gray-200": { value: "#e9ecef" },
    "gray-300": { value: "#dee2e6" },
    "gray-400": { value: "#ced4da" },
    "gray-500": { value: "#adb5bd" },
    "gray-600": { value: "#6c757d" },
    "gray-700": { value: "#495057" },
    "gray-800": { value: "#343a40" },
    "gray-900": { value: "#212529", notes: "Darkest gray" },
    black: { value: "#000000" },
  },
  text: {
    "text-primary": { value: "#006e58" },
    "text-secondary": { value: "#6c757d" },
    "text-success": { value: "#65a30d" },
    "text-info": { value: "#17a2b8" },
    "text-warning": { value: "#ffc107" },
    "text-danger": { value: "#dc3545" },
    "text-light": { value: "#f8f9fa" },
    "text-dark": { value: "#212529" },
    "text-body": { value: "#212529" },
    "text-muted": { value: "#6c757d" },
    "text-white": { value: "#ffffff" },
    "text-black-50": { value: "rgba(0, 0, 0, 0.5)" },
    "text-white-50": { value: "rgba(255, 255, 255, 0.5)" },
    "text-primary-emphasis": { value: "#002c23" },
    "text-secondary-emphasis": { value: "#2b2f32" },
    "text-success-emphasis": { value: "#284105" },
    "text-info-emphasis": { value: "#09414a" },
    "text-warning-emphasis": { value: "#664d03" },
    "text-danger-emphasis": { value: "#58151c" },
    "text-light-emphasis": { value: "#495057" },
    "text-dark-emphasis": { value: "#495057" },
  },
  background: {
    "bg-primary-subtle": { value: "#cce2de" },
    "bg-secondary-subtle": { value: "#e2e3e5" },
    "bg-success-subtle": { value: "#e0edcf" },
    "bg-info-subtle": { value: "#d1ecf1" },
    "bg-warning-subtle": { value: "#fff3cd" },
    "bg-danger-subtle": { value: "#f8d7da" },
    "bg-light-subtle": { value: "#fcfcfd" },
    "bg-dark-subtle": { value: "#ced4da" },
  },
  border: {
    "border-primary-subtle": { value: "#99c5bc" },
    "border-secondary-subtle": { value: "#c4c8cb" },
    "border-success-subtle": { value: "#c1da9e" },
    "border-info-subtle": { value: "#a2dae3" },
    "border-warning-subtle": { value: "#ffe69c" },
    "border-danger-subtle": { value: "#f1aeb5" },
    "border-light-subtle": { value: "#e9ecef" },
    "border-dark-subtle": { value: "#adb5bd" },
  },
  "link colors": {
    "link-color": { value: "#006e58", notes: "Link color" },
    "link-decoration": { value: "underline", notes: "Default link decoration" },
    "link-hover-color": { value: "#005846", notes: "Link hover color" },
  },
  "border colors": {
    "border-color": { value: "#dee2e6", notes: "Default border color" },
    "border-color-translucent": {
      value: "rgba(0, 0, 0, 0.175)",
      notes: "Translucent border for shadows/dividers",
    },
  },
  "form colors": {
    "valid-color": { value: "#65a30d", notes: "Valid state color" },
    "valid-border-color": { value: "#65a30d", notes: "Valid border color" },
    "invalid-color": { value: "#dc3545", notes: "Invalid state color" },
    "invalid-border-color": { value: "#dc3545", notes: "Invalid border color" },
  },
  "other colors": {
    "code-color": { value: "#d63384", notes: "Code syntax color" },
    "highlight-color": { value: "#16192c", notes: "Highlight text color" },
    "highlight-bg": { value: "#fff3cd", notes: "Highlight background" },
  },
};

// Helper function to convert hex to RGB (simplified, for common hex formats)
const hexToRgb = (hex: string): string | undefined => {
  const bigint = parseInt(hex.slice(1), 16);
  if (isNaN(bigint)) return undefined; // Handle invalid hex
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

type ColorTokenData = {
  value: string;
  notes?: string;
  rgb?: string; // Add rgb here for direct use if available
};

type ColorSection = {
  title: string;
  tokens: { token: string; hex: string; rgb?: string; notes?: string }[];
};

const transformedSections: ColorSection[] = [
  {
    title: "1. Core Brand Colors",
    tokens: Object.entries(allColorTokens["brand colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
  {
    title: "2. Feedback Colors",
    tokens: Object.entries(allColorTokens["feedback colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
  {
    title: "3. Body Colors",
    tokens: Object.entries(allColorTokens["body colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
  {
    title: "4. Grayscale",
    tokens: Object.entries(allColorTokens.grayscale).map(([token, data]) => ({
      token,
      hex: data.value,
      rgb: hexToRgb(data.value),
      notes: data.notes,
    })),
  },
  {
    title: "5. Text Colors",
    tokens: Object.entries(allColorTokens.text).map(([token, data]) => ({
      token,
      hex: data.value,
    })),
  },
  {
    title: "6. Subtle Background Colors", // Renaming from original to match new structure
    tokens: Object.entries(allColorTokens.background).map(([token, data]) => ({
      token,
      hex: data.value,
      rgb: hexToRgb(data.value),
      notes: data.notes,
    })),
  },
  {
    title: "7. Subtle Border Colors", // Renaming from original to match new structure
    tokens: Object.entries(allColorTokens.border).map(([token, data]) => ({
      token,
      hex: data.value,
      rgb: hexToRgb(data.value),
      notes: data.notes,
    })),
  },
  {
    title: "8. Link Colors", // Reordered based on new JSON
    tokens: Object.entries(allColorTokens["link colors"])
      .filter(([key]) => key !== "link-decoration")
      .map(([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })),
  },
  {
    title: "9. Border Colors", // Reordered based on new JSON
    tokens: Object.entries(allColorTokens["border colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
  {
    title: "10. Form Validation Colors", // Reordered based on new JSON
    tokens: Object.entries(allColorTokens["form colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
  {
    title: "11. Other Colors", // Reordered based on new JSON
    tokens: Object.entries(allColorTokens["other colors"]).map(
      ([token, data]) => ({
        token,
        hex: data.value,
        rgb: hexToRgb(data.value),
        notes: data.notes,
      })
    ),
  },
];

const ColorCard: React.FC<{
  token: string;
  hex: string;
  rgb?: string;
  notes?: string;
}> = ({ token, hex, rgb, notes }) => {
  const [copied, setCopied] = useState("");
  const bg = hex || rgb || "#fff";
  return (
    <div
      style={{
        width: 180,
        height: 240,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          height: 120,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          padding: "10px",
        }}
        title={hex || rgb}
      ></div>
      <div
        style={{
          padding: 12,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          height: 120,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => token && Copy(token, setCopied)}
        >
          {token}
          {copied === token && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== token && <CopyIcon />}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#666",
            marginBottom: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => hex && Copy(hex, setCopied)}
        >
          {hex}
          {copied === hex && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== hex && <CopyIcon />}
        </div>
        {rgb && (
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => Copy(rgb, setCopied)}
          >
            {rgb}
            {copied === rgb && (
              <span style={{ marginLeft: 4, color: "green" }}>✓</span>
            )}
            {copied !== rgb && <CopyIcon />}
          </div>
        )}
        {notes && (
          <div style={{ fontSize: 11, color: "#999", marginTop: "auto" }}>
            {notes}
          </div>
        )}
      </div>
    </div>
  );
};

const TextColorExampleCard: React.FC<{
  token: string;
  color: string;
  bgColor: string;
  notes?: string;
}> = ({ token, color, bgColor, notes }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      style={{
        width: 250,
        minHeight: 120,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: `1px solid ${
          bgColor === "#ffffff" ? "#dee2e6" : "transparent"
        }`, // Add border for white background
      }}
    >
      <div
        style={{ backgroundColor: bgColor, padding: 16 }}
        className="border-bottom"
      >
        <p
          style={{
            color: color,
            fontSize: 16,
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>
      <div style={{ padding: 16 }}>
        <div
          className="small"
          style={{ marginTop: "auto", display: "flex", alignItems: "center" }}
        >
          <strong className="me-1">Token:</strong>
          {token}
          <span
            className={cx("cursor-pointer")}
            onClick={() => token && Copy(token, setCopied)}
          >
            {copied === token && <span style={{ color: "green" }}>✓</span>}
            {copied !== token && <CopyIcon />}
          </span>
        </div>
        <div
          className="text-muted small"
          style={{ marginBottom: 4 }}
          onClick={() => token && Copy(color, setCopied)}
        >
          {color}{" "}
          {copied === color && (
            <span style={{ marginLeft: 4, color: "green" }}>✓</span>
          )}
          {copied !== color && <CopyIcon />}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  tokens: { token: string; hex: string; rgb?: string; notes?: string }[];
}> = ({ title, tokens }) => (
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
      {title}
    </h2>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {tokens.map((c) => (
        <ColorCard key={c.token} {...c} />
      ))}
    </div>
  </section>
);

const SectionText: React.FC<{ title: string; tokens: { token: string }[] }> = ({
  title,
}) => (
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
      {title}
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
      They directly correspond to Bootstrap's `.text-*` utility classes.
    </p>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Example: Regular text colors */}
      <TextColorExampleCard
        token="text-primary"
        color={allColorTokens.text["text-primary"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-secondary"
        color={allColorTokens.text["text-secondary"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-success"
        color={allColorTokens.text["text-success"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-info"
        color={allColorTokens.text["text-info"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-warning"
        color={allColorTokens.text["text-warning"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-danger"
        color={allColorTokens.text["text-danger"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-body"
        color={allColorTokens.text["text-body"].value}
        bgColor="#fff"
      />
      <TextColorExampleCard
        token="text-muted"
        color={allColorTokens.text["text-muted"].value}
        bgColor="#fff"
      />

      {/* Example: Light/Dark text colors with contrasting backgrounds */}
      <TextColorExampleCard
        token="text-light"
        color={allColorTokens.text["text-light"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />
      <TextColorExampleCard
        token="text-dark"
        color={allColorTokens.text["text-dark"].value}
        bgColor={allColorTokens.grayscale.light.value}
      />
      <TextColorExampleCard
        token="text-white"
        color={allColorTokens.text["text-white"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />
      <TextColorExampleCard
        token="text-black-50"
        color={allColorTokens.text["text-black-50"].value}
        bgColor={allColorTokens.grayscale.light.value}
      />
      <TextColorExampleCard
        token="text-white-50"
        color={allColorTokens.text["text-white-50"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />

      {/* Example: Emphasis text colors */}
      <TextColorExampleCard
        token="text-primary-emphasis"
        color={allColorTokens.text["text-primary-emphasis"].value}
        bgColor="#cce2de"
        notes="On primary subtle background"
      />
      <TextColorExampleCard
        token="text-secondary-emphasis"
        color={allColorTokens.text["text-secondary-emphasis"].value}
        bgColor="#e2e3e5"
        notes="On secondary subtle background"
      />
      <TextColorExampleCard
        token="text-success-emphasis"
        color={allColorTokens.text["text-success-emphasis"].value}
        bgColor="#e0edcf"
        notes="On success subtle background"
      />
      <TextColorExampleCard
        token="text-info-emphasis"
        color={allColorTokens.text["text-info-emphasis"].value}
        bgColor="#d1ecf1"
        notes="On info subtle background"
      />
      <TextColorExampleCard
        token="text-warning-emphasis"
        color={allColorTokens.text["text-warning-emphasis"].value}
        bgColor="#fff3cd"
        notes="On warning subtle background"
      />
      <TextColorExampleCard
        token="text-danger-emphasis"
        color={allColorTokens.text["text-danger-emphasis"].value}
        bgColor="#f8d7da"
        notes="On danger subtle background"
      />
      <TextColorExampleCard
        token="text-light-emphasis"
        color={allColorTokens.text["text-light-emphasis"].value}
        bgColor={allColorTokens.grayscale.dark.value}
        notes="On dark background"
      />
      <TextColorExampleCard
        token="text-dark-emphasis"
        color={allColorTokens.text["text-dark-emphasis"].value}
        bgColor={allColorTokens.grayscale.light.value}
        notes="On light background"
      />
    </div>
  </section>
);

const meta: Meta = {
  title: "Design Tokens/Colors",
  parameters: {
    docs: {
      description: {
        component:
          "Each color shows hex and RGB (if available), with copy-to-clipboard functionality This palette is designed to work seamlessly with **Bootstrap's extensive color utility classes**.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ColorPalette: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: "1200px", margin: "0 auto" }}>
      {transformedSections.map((s) =>
        s.title !== "5. Text Colors" ? (
          <Section key={s.title} title={s.title} tokens={s.tokens} />
        ) : (
          <SectionText key={s.title} title={s.title} tokens={s.tokens} />
        )
      )}
    </div>
  ),
};
