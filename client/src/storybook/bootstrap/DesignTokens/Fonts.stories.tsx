import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { Copy, CopyIcon, pxToRem } from "~/storybook/bootstrap/utils";

const fontTokens = {
  typography: {
    "body-font-family": "The primary typeface for body text",
    "body-font-size": "Base font size for body copy",
    "body-font-weight": "Default font weight",
    "body-line-height": "Default line height for readability",
  },
  fontSizes: ["fs-1", "fs-2", "fs-3", "fs-4", "fs-5", "fs-6"],
  lineHeight: ["lh-1", "lh-sm", "lh-base", "lh-lg"],
};

interface FontPropertyCardProps {
  token: string;
  notes: string;
}

function FontPropertyCard({ token, notes }: FontPropertyCardProps) {
  const [value, setValue] = useState<string>("N/A");

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    const cssVarName = `--bs-${token}`;
    const resolvedValue = styles.getPropertyValue(cssVarName).trim();

    setValue(resolvedValue || "N/A");
  }, [token]);
  return (
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
      </div>
      <div className={cx("text-muted", "mt-auto")} style={{ fontSize: "11px" }}>
        {notes}
      </div>
    </div>
  );
}

interface FontSizeExampleCardProps {
  token: string;
}

function FontSizeExampleCard({ token }: FontSizeExampleCardProps) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");
  const [value, setValue] = useState("N/A");
  const [px, setPx] = useState("N/A");

  useEffect(() => {
    if (!probeRef.current) return;

    const styles = getComputedStyle(probeRef.current);
    const value = parseFloat(styles.fontSize);
    const remValue = pxToRem(value);

    setPx(`${value}px`);
    setValue(`${remValue}rem`);
  }, [token]);

  return (
    <>
      <div ref={probeRef} className={token} style={{ display: "none" }} />
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
        <div className={cx("text-dark", token)}>
          The quick brown fox jumps over the lazy dog.
        </div>
        <div
          className={cx("mt-3", "text-muted")}
          style={{ fontSize: "0.9rem" }}
        >
          <strong>Token:</strong>
          <span
            className={cx("cursor-pointer", "ms-2")}
            onClick={() => Copy(token, setCopied)}
          >
            <code>{token}</code>
            {copied === token && (
              <span className={cx("ms-1", "text-success")}>✓</span>
            )}
            {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value}{" "}
            ({px})
          </span>
        </div>
        <div
          className={cx("text-muted", "mt-1")}
          style={{ fontSize: "0.8rem" }}
        >
          Bootstrap class: <code>.fs-{token.split("-")[1]}</code>
        </div>
      </div>
    </>
  );
}

interface LineHeightExampleCardProps {
  token: string;
}

function LineHeightExampleCard({ token }: LineHeightExampleCardProps) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");
  const [value, setValue] = useState("N/A");
  const [px, setPx] = useState("N/A");

  useEffect(() => {
    if (!probeRef.current) return;

    const styles = getComputedStyle(probeRef.current);
    const value = parseFloat(styles.lineHeight);
    const remValue = pxToRem(value);

    setPx(`${value}px`);
    setValue(`${remValue}rem`);
  }, [token]);

  return (
    <>
      <div ref={probeRef} className={token} style={{ display: "none" }} />
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
        <div className="text-dark">
          This is an example of text with <b>line height {token}</b>. <br />
          It demonstrates how spacing between lines changes. <br />
        </div>
        <div
          className={cx("mt-3", "text-muted")}
          style={{ fontSize: "0.9rem" }}
        >
          <strong>Token:</strong>
          <span
            className={cx("cursor-pointer", "ms-2")}
            onClick={() => Copy(token, setCopied)}
          >
            <code>{token}</code>
            {copied === token && (
              <span className={cx("ms-1", "text-success")}>✓</span>
            )}
            {copied !== token && <CopyIcon />} | <strong>Value:</strong> {value}{" "}
            ({px})
          </span>{" "}
        </div>
      </div>
    </>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
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
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cx("text-muted", "mb-4")}
      style={{ fontSize: "14px", maxWidth: "800px" }}
    >
      {children}
    </p>
  );
}

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
            <FontPropertyCard key={key} token={key} notes={data} />
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
          {fontTokens.fontSizes.map((key) => (
            <FontSizeExampleCard key={key} token={key} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader>3. Line Heights</SectionHeader>
        <SectionDescription>
          These tokens map directly to Bootstrap&apos;s `.lh-` classes.
        </SectionDescription>
        <div className={cx("d-flex", "flex-column", "gap-4")}>
          {fontTokens.lineHeight.map((key) => (
            <LineHeightExampleCard key={key} token={key} />
          ))}
        </div>
      </section>
    </div>
  ),
};
