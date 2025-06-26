import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

const fontTokens = {
  typography: {
    "body-font-family": { value: '"Inter", sans-serif', px: "" },
    "body-font-size": { value: "1rem", px: "16px" },
    "body-font-weight": { value: "400", px: "" },
    "body-line-height": { value: "1.5", px: "" },
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

interface FontPropertyCardProps {
  token: string;
  value: string | number;
  px?: string;
  notes?: string;
}

const FontPropertyCard: React.FC<FontPropertyCardProps> = ({
  token,
  value,
  px,
  notes,
}) => (
  <div
    className={cx(
      "bg-white",
      "p-3",
      "rounded",
      "shadow-sm",
      "border",
      "d-flex",
      "flex-column",
      "justify-content-between"
    )}
  >
    <div>
      <div
        className={cx("fw-semibold", "text-primary", "mb-1")}
        style={{ fontSize: "14px" }}
      >
        {token}
      </div>
      <div className={cx("text-dark", "mb-1")} style={{ fontSize: "13px" }}>
        Value: <strong>{value}</strong>
      </div>
      {px && (
        <div className="text-muted" style={{ fontSize: "13px" }}>
          PX: {px}
        </div>
      )}
    </div>
    {notes && (
      <div className={cx("text-muted", "mt-auto")} style={{ fontSize: "11px" }}>
        {notes}
      </div>
    )}
  </div>
);

interface FontSizeExampleCardProps {
  token: string;
  value: string;
  px: string;
}

const FontSizeExampleCard: React.FC<FontSizeExampleCardProps> = ({
  token,
  value,
  px,
}) => {
  const [copied, setCopied] = useState("");

  return (
    <div
      className={cx(
        "bg-white",
        "rounded",
        "shadow-sm",
        "border",
        "p-4",
        "d-flex",
        "flex-column",
        "justify-content-center",
        "align-items-start",
        "w-100"
      )}
    >
      <div
        className="text-dark"
        style={{
          fontSize: value,
          lineHeight: fontTokens.typography["body-line-height"].value,
          fontWeight: fontTokens.typography["body-font-weight"].value,
          fontFamily: fontTokens.typography["body-font-family"].value,
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </div>
      <div className={cx("mt-3", "text-muted")} style={{ fontSize: "0.9rem" }}>
        <strong>Token:</strong>
        <span
          className={cx("cursor-pointer", "ms-2")}
          onClick={() => Copy(token, setCopied)}
        >
          <code>{token}</code>
          {copied === token && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value} (
          {px})
        </span>
      </div>
      <div className={cx("text-muted", "mt-1")} style={{ fontSize: "0.8rem" }}>
        Bootstrap class: <code>.fs-{token.split("-")[1]}</code>
      </div>
    </div>
  );
};

interface LineHeightExampleCardProps {
  token: string;
  value: number;
  description: string;
  px?: string;
  rem: string;
}

const LineHeightExampleCard: React.FC<LineHeightExampleCardProps> = ({
  token,
  value,
  description,
  px,
  rem,
}) => {
  const [copied, setCopied] = useState("");

  return (
    <div
      className={cx(
        "bg-white",
        "rounded",
        "shadow-sm",
        "border",
        "p-4",
        "d-flex",
        "flex-column",
        "justify-content-center",
        "align-items-start",
        "w-100"
      )}
    >
      <div
        className="text-dark"
        style={{
          fontSize: fontTokens.typography["body-font-size"].value,
          lineHeight: value,
          fontWeight: fontTokens.typography["body-font-weight"].value,
          fontFamily: fontTokens.typography["body-font-family"].value,
        }}
      >
        This is an example of text with <b>line height {value}</b>. <br />
        It demonstrates how spacing between lines changes. <br />
        Readability is key to a great user experience.
      </div>
      <div className={cx("mt-3", "text-muted")} style={{ fontSize: "0.9rem" }}>
        <strong>Token:</strong>
        <span
          className={cx("cursor-pointer", "ms-2")}
          onClick={() => Copy(token, setCopied)}
        >
          <code>lh-{token}</code>
          {copied === token && (
            <span className={cx("ms-1", "text-success")}>✓</span>
          )}
          {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value} (
          {px})
        </span>{" "}
        | <strong>PX:</strong> {px} | <strong>REM:</strong> {rem}
      </div>
      <div className={cx("text-muted", "mt-1")} style={{ fontSize: "0.8rem" }}>
        {description} (Bootstrap class: <code>.lh-{token}</code>)
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h2
    className={cx(
      "fw-bold",
      "text-primary",
      "border-bottom",
      "border-primary",
      "border-2",
      "pb-2",
      "mb-3"
    )}
  >
    {children}
  </h2>
);

const SectionDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p
    className={cx("text-muted", "mb-4")}
    style={{ fontSize: "14px", maxWidth: "800px" }}
  >
    {children}
  </p>
);

const meta: Meta = {
  title: "Design Tokens/Fonts",
  component: () => <div />,
  parameters: {
    docs: {
      description: {
        component:
          "This section defines our core **typographic system**, including font families, sizes, weights, and line heights. These tokens are seamlessly integrated with **Bootstrap's native font and line-height utilities** (e.g., `.fs-1` to `.fs-6`, and `.lh-1` to `.lh-lg`), ensuring a consistent and responsive typographic hierarchy across all applications. Designers and developers can leverage these tokens to maintain visual harmony and readability.",
      },
    },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const FontSystem: Story = {
  render: () => (
    <div className={cx("p-4", "mx-auto")} style={{ maxWidth: "1200px" }}>
      <section className="mb-5">
        <SectionHeader>1. Core Typography</SectionHeader>
        <div className={cx("d-flex", "flex-wrap", "gap-3")}>
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

      <section className="mb-5">
        <SectionHeader>2. Font Sizes (Headings & Display)</SectionHeader>
        <SectionDescription>
          These tokens define our scalable font sizes, directly mapping to
          Bootstrap&apos;s `.fs-` classes for easy application.
        </SectionDescription>
        <div className={cx("d-flex", "flex-column", "gap-4")}>
          {Object.entries(fontTokens.fontSizes)
            .sort(([, a], [, b]) => parseFloat(b.px) - parseFloat(a.px))
            .map(([key, data]) => (
              <FontSizeExampleCard
                key={key}
                token={key}
                value={data.value}
                px={data.px}
              />
            ))}
        </div>
      </section>

      <section>
        <SectionHeader>3. Line Heights</SectionHeader>
        <SectionDescription>
          These tokens map directly to Bootstrap&apos;s `.lh-` classes.
        </SectionDescription>
        <div className={cx("d-flex", "flex-column", "gap-4")}>
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
