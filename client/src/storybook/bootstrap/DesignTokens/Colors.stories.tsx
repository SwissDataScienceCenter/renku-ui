import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx"; // Assuming this path is correct

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
    white: { value: "#ffffff", notes: "" },
    light: { value: "#f8f9fa", notes: "Light grayscale" },
    dark: { value: "#212529", notes: "Dark grayscale" },
    gray: { value: "#6c757d", notes: "Gray base" },
    "gray-dark": { value: "#343a40", notes: "Dark gray" },
    "gray-100": { value: "#f8f9fa", notes: "Lightest gray" },
    "gray-200": { value: "#e9ecef", notes: "" },
    "gray-300": { value: "#dee2e6", notes: "" },
    "gray-400": { value: "#ced4da", notes: "" },
    "gray-500": { value: "#adb5bd", notes: "" },
    "gray-600": { value: "#6c757d", notes: "" },
    "gray-700": { value: "#495057", notes: "" },
    "gray-800": { value: "#343a40", notes: "" },
    "gray-900": { value: "#212529", notes: "Darkest gray" },
    black: { value: "#000000", notes: "" },
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
    "bg-primary-subtle": { value: "#cce2de", notes: "" },
    "bg-secondary-subtle": { value: "#e2e3e5", notes: "" },
    "bg-success-subtle": { value: "#e0edcf", notes: "" },
    "bg-info-subtle": { value: "#d1ecf1", notes: "" },
    "bg-warning-subtle": { value: "#fff3cd", notes: "" },
    "bg-danger-subtle": { value: "#f8d7da", notes: "" },
    "bg-light-subtle": { value: "#fcfcfd", notes: "" },
    "bg-dark-subtle": { value: "#ced4da", notes: "" },
  },
  border: {
    "border-primary-subtle": { value: "#99c5bc", notes: "" },
    "border-secondary-subtle": { value: "#c4c8cb", notes: "" },
    "border-success-subtle": { value: "#c1da9e", notes: "" },
    "border-info-subtle": { value: "#a2dae3", notes: "" },
    "border-warning-subtle": { value: "#ffe69c", notes: "" },
    "border-danger-subtle": { value: "#f1aeb5", notes: "" },
    "border-light-subtle": { value: "#e9ecef", notes: "" },
    "border-dark-subtle": { value: "#adb5bd", notes: "" },
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
      notes: data.notes ?? "",
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
      className={cx(
        "rounded-3",
        "shadow-sm",
        "border",
        "overflow-hidden",
        "font-sans"
      )}
      style={{ width: 300, height: 280 }}
    >
      {/* Top section: Color display */}
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "justify-content-center",
          "p-2"
        )}
        style={{ height: 120, background: bg, fontSize: "0.9rem" }}
        title={hex || rgb}
      ></div>
      {/* Bottom section: Color details */}
      <div
        className={cx("p-3", "bg-white", "d-flex", "flex-column")}
        style={{ height: 120 }}
      >
        <div
          className={cx(
            "fs-6",
            "mb-1",
            "cursor-pointer",
            "d-flex",
            "align-items-center"
          )}
          onClick={() => token && Copy(token, setCopied)}
        >
          <strong className="me-1">Token: </strong>
          {token}
          {copied === token && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== token && <CopyIcon />}
        </div>
        <div
          className={cx(
            "fs-6",
            "text-muted",
            "mb-1",
            "cursor-pointer",
            "d-flex",
            "align-items-center"
          )}
          onClick={() => hex && Copy(hex, setCopied)}
        >
          {hex}
          {copied === hex && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== hex && <CopyIcon />}
        </div>
        {rgb && (
          <div
            className={cx(
              "fs-6",
              "text-muted",
              "mb-1",
              "cursor-pointer",
              "d-flex",
              "align-items-center"
            )}
            onClick={() => Copy(rgb, setCopied)}
          >
            {rgb}
            {copied === rgb && (
              <span className={cx("ms-1", "text-success")}>✓</span>
            )}
            {copied !== rgb && <CopyIcon />}
          </div>
        )}
        {notes && (
          <div className={cx("mt-4", "small", "text-muted")}>{notes}</div>
        )}
      </div>
    </div>
  );
};

const TextColorCard: React.FC<{
  token: string;
  color: string;
  bgColor: string;
  notes?: string;
}> = ({ token, color, bgColor }) => {
  const [copied, setCopied] = useState("");
  return (
    <div
      className={cx(
        "border",
        "rounded-3",
        "shadow-sm",
        "overflow-hidden",
        "font-sans",
        "d-flex",
        "flex-column",
        "justify-content-between"
      )}
      style={{
        width: 400,
        minHeight: 120,
        border: `1px solid ${
          bgColor === "#ffffff" ? "#dee2e6" : "transparent"
        }`,
      }}
    >
      <div
        className={cx("p-3", "border-bottom")}
        style={{ backgroundColor: bgColor }}
      >
        <p className={cx("fs-5", "lh-base", "mb-2")} style={{ color: color }}>
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>
      <div className="p-3">
        <div className={cx("mt-auto", "d-flex", "align-items-center", "mb-1")}>
          <strong className="me-1">Token:</strong>
          {token}
          <span
            className={cx("cursor-pointer")}
            onClick={() => token && Copy(token, setCopied)}
          >
            {copied === token && (
              <span className={cx("text-success", "ms-1")}>✓</span>
            )}
            {copied !== token && <CopyIcon />}
          </span>
        </div>
        <div
          className={cx("text-muted", "small", "d-flex", "align-items-center")}
          onClick={() => token && Copy(color, setCopied)}
        >
          {color}
          {copied === color && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== color && <CopyIcon />}
        </div>
      </div>
    </div>
  );
};

const BorderColorCard: React.FC<{
  token: string;
  hex: string;
  rgb?: string;
  borderSize: string;
}> = ({ token, hex, rgb, borderSize }) => {
  const [copied, setCopied] = useState("");
  const borderColor = hex || rgb || "#fff"; // Use the color for the border
  const displayBg =
    borderColor === "#ffffff" || borderColor === "rgb(255, 255, 255)"
      ? "#f8f9fa"
      : "#ffffff"; // A subtle background for white borders

  return (
    <div
      className={cx(
        "rounded-3",
        "shadow-sm",
        "overflow-hidden",
        "font-sans",
        "border",
        token,
        borderSize
      )}
      style={{ width: 400, height: 120, background: displayBg }}
    >
      <div className={cx("p-3", "bg-white", "d-flex", "flex-column")}>
        <div
          className={cx(
            "fs-6",
            "mb-1",
            "cursor-pointer",
            "d-flex",
            "align-items-center"
          )}
          onClick={() => token && Copy(token, setCopied)}
        >
          <strong className="me-1">Token: </strong>
          {token}
          {copied === token && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== token && <CopyIcon />}
        </div>
        <div
          className={cx(
            "fs-6",
            "text-muted",
            "mb-1",
            "cursor-pointer",
            "d-flex",
            "align-items-center"
          )}
          onClick={() => hex && Copy(hex, setCopied)}
        >
          {hex}
          {copied === hex && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== hex && <CopyIcon />}
        </div>
        {rgb && (
          <div
            className={cx(
              "fs-6",
              "text-muted",
              "mb-1",
              "cursor-pointer",
              "d-flex",
              "align-items-center"
            )}
            onClick={() => Copy(rgb, setCopied)}
          >
            {rgb}
            {copied === rgb && (
              <span className={cx("ms-1", "text-success")}>✓</span>
            )}
            {copied !== rgb && <CopyIcon />}
          </div>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  tokens: { token: string; hex: string; rgb?: string; notes?: string }[];
}> = ({ title, tokens }) => (
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
      {title}
    </h2>
    <div className={cx("d-flex", "flex-wrap", "gap-3")}>
      {tokens.map((c) => (
        <ColorCard key={c.token} {...c} />
      ))}
    </div>
  </section>
);

const SectionBorder: React.FC<{
  title: string;
  tokens: { token: string; hex: string; rgb?: string; notes?: string }[];
  borderSize: string;
}> = ({ title, tokens, borderSize }) => (
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
      {title}
    </h2>
    <div className={cx("d-flex", "flex-wrap", "gap-3")}>
      {tokens.map((c) => (
        <BorderColorCard key={c.token} {...c} borderSize={borderSize} />
      ))}
    </div>
  </section>
);

const SectionText: React.FC<{ title: string; tokens: { token: string }[] }> = ({
  title,
}) => (
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
      {title}
    </h2>
    <p
      className={cx("font-sans", "small", "text-muted", "mb-4")}
      style={{ maxWidth: 800 }}
    >
      They directly correspond to Bootstrap&apos;s `.text-*` utility classes.
    </p>
    <div className={cx("d-flex", "flex-wrap", "gap-3")}>
      <TextColorCard
        token="text-primary"
        color={allColorTokens.text["text-primary"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-secondary"
        color={allColorTokens.text["text-secondary"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-success"
        color={allColorTokens.text["text-success"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-info"
        color={allColorTokens.text["text-info"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-warning"
        color={allColorTokens.text["text-warning"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-danger"
        color={allColorTokens.text["text-danger"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-body"
        color={allColorTokens.text["text-body"].value}
        bgColor="#fff"
      />
      <TextColorCard
        token="text-muted"
        color={allColorTokens.text["text-muted"].value}
        bgColor="#fff"
      />

      <TextColorCard
        token="text-light"
        color={allColorTokens.text["text-light"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />
      <TextColorCard
        token="text-dark"
        color={allColorTokens.text["text-dark"].value}
        bgColor={allColorTokens.grayscale.light.value}
      />
      <TextColorCard
        token="text-white"
        color={allColorTokens.text["text-white"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />
      <TextColorCard
        token="text-black-50"
        color={allColorTokens.text["text-black-50"].value}
        bgColor={allColorTokens.grayscale.light.value}
      />
      <TextColorCard
        token="text-white-50"
        color={allColorTokens.text["text-white-50"].value}
        bgColor={allColorTokens.grayscale.dark.value}
      />

      <TextColorCard
        token="text-primary-emphasis"
        color={allColorTokens.text["text-primary-emphasis"].value}
        bgColor={allColorTokens.background["bg-primary-subtle"].value}
        notes="On primary subtle background"
      />
      <TextColorCard
        token="text-secondary-emphasis"
        color={allColorTokens.text["text-secondary-emphasis"].value}
        bgColor={allColorTokens.background["bg-secondary-subtle"].value}
        notes="On secondary subtle background"
      />
      <TextColorCard
        token="text-success-emphasis"
        color={allColorTokens.text["text-success-emphasis"].value}
        bgColor={allColorTokens.background["bg-success-subtle"].value}
        notes="On success subtle background"
      />
      <TextColorCard
        token="text-info-emphasis"
        color={allColorTokens.text["text-info-emphasis"].value}
        bgColor={allColorTokens.background["bg-info-subtle"].value}
        notes="On info subtle background"
      />
      <TextColorCard
        token="text-warning-emphasis"
        color={allColorTokens.text["text-warning-emphasis"].value}
        bgColor={allColorTokens.background["bg-warning-subtle"].value}
        notes="On warning subtle background"
      />
      <TextColorCard
        token="text-danger-emphasis"
        color={allColorTokens.text["text-danger-emphasis"].value}
        bgColor={allColorTokens.background["bg-danger-subtle"].value}
        notes="On danger subtle background"
      />
      <TextColorCard
        token="text-light-emphasis"
        color={allColorTokens.text["text-light-emphasis"].value}
        bgColor={allColorTokens.grayscale.dark.value}
        notes="On dark background"
      />
      <TextColorCard
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
  argTypes: {
    borderSize: {
      options: ["border-1", "border-2", "border-3", "border-4", "border-5"],
      control: { type: "select" },
      description: "Sets the thickness of the border using Bootstrap classes.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ColorPalette: Story = {
  args: {
    borderSize: "border-1", // Default value for the control
  },
  render: (args) => {
    const renderSection = (section: { title: string; tokens: any[] }) => {
      //eslint-disable-line @typescript-eslint/no-explicit-any
      switch (section.title) {
        case "5. Text Colors":
          return (
            <SectionText
              key={section.title}
              title={section.title}
              tokens={section.tokens}
            />
          );
        case "9. Border Colors":
        case "7. Subtle Border Colors":
          return (
            <SectionBorder
              key={section.title}
              title={section.title}
              tokens={section.tokens}
              borderSize={args.borderSize}
            />
          );
        default:
          return (
            <Section
              key={section.title}
              title={section.title}
              tokens={section.tokens}
            />
          );
      }
    };
    return (
      <div className="p-4 mx-auto" style={{ maxWidth: "1200px" }}>
        {transformedSections.map(renderSection)}
      </div>
    );
  },
};
