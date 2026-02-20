import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import { useRef, useState } from "react";

import { CopyRow } from "~/storybook/CopyRow";
import { useResolvedColor } from "~/storybook/useResolvedColor";

interface ColorToken {
  title: string;
  tokens: string[];
  type: "color" | "text" | "border";
  backgroundColor?: string;
}

const allColorTokens: Record<string, ColorToken> = {
  "brand colors": {
    title: "Core Brand Colors",
    type: "color",
    tokens: ["primary", "secondary", "navy"],
  },

  "body colors": {
    title: "Body Colors",
    type: "color",
    tokens: ["body-color"],
  },

  grayscale: {
    title: "Main Colors",
    type: "color",
    tokens: ["white", "black", "light", "dark"],
  },

  text: {
    title: "Text Colors",
    type: "text",
    tokens: [
      "text-primary",
      "text-secondary",
      "text-success",
      "text-info",
      "text-warning",
      "text-danger",
      "text-light",
      "text-dark",
      "text-body",
      "text-muted",
      "text-white",
      "text-black-50",
      "text-white-50",
      "text-primary-emphasis",
      "text-secondary-emphasis",
      "text-success-emphasis",
      "text-info-emphasis",
      "text-warning-emphasis",
      "text-danger-emphasis",
      "text-light-emphasis",
      "text-dark-emphasis",
    ],
  },

  background: {
    title: "Subtle Background Colors",
    type: "color",
    tokens: [
      "bg-primary-subtle",
      "bg-secondary-subtle",
      "bg-success-subtle",
      "bg-info-subtle",
      "bg-warning-subtle",
      "bg-danger-subtle",
      "bg-light-subtle",
      "bg-dark-subtle",
    ],
  },

  "link colors": {
    title: "Link Colors",
    type: "color",
    tokens: ["link-color", "link-hover-color"],
  },

  "form colors": {
    title: "Form Validation Colors",
    type: "text",
    tokens: ["form-valid-color", "form-invalid-color"],
  },

  "other colors": {
    title: "Other Colors",
    type: "text",
    tokens: ["code-color"],
  },

  border: {
    title: "Subtle Border Colors",
    type: "border",
    tokens: [
      "border-color",
      "border-primary-subtle",
      "border-secondary-subtle",
      "border-success-subtle",
      "border-info-subtle",
      "border-warning-subtle",
      "border-danger-subtle",
      "border-light-subtle",
      "border-dark-subtle",
    ],
  },
};

interface ColorCardProps {
  token: string;
}
function ColorCard({ token }: ColorCardProps) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");

  const { rgb, hex } = useResolvedColor(probeRef, token, (styles) =>
    styles.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? styles.backgroundColor
      : styles.color !== "rgba(0, 0, 0, 0)"
      ? styles.color
      : styles.borderTopColor
  );

  const bg = rgb || "#fff";
  const isBgClass = token.startsWith("bg-") || token.endsWith("-bg");

  return (
    <>
      <div
        ref={probeRef}
        className={isBgClass ? token : undefined}
        style={{
          display: "none",
          backgroundColor: !isBgClass ? `var(--bs-${token})` : undefined,
        }}
      />

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
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ height: 120, background: bg }}
          title={hex || rgb}
        />
        <div
          className="p-3 bg-white d-flex flex-column"
          style={{ height: 160 }}
        >
          <CopyRow
            value={token}
            prefix="Class:"
            copied={copied}
            setCopied={setCopied}
            className="fs-6 mb-1 cursor-pointer d-flex align-items-center"
          />

          {hex && (
            <CopyRow
              value={hex}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted mb-1 cursor-pointer d-flex align-items-center"
            />
          )}

          {rgb && (
            <CopyRow
              value={rgb}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted cursor-pointer d-flex align-items-center"
            />
          )}
        </div>
      </div>
    </>
  );
}

function TextColorCard({ token }: { token: string }) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");

  const { rgb, hex } = useResolvedColor(probeRef, token, (styles) =>
    styles.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? styles.backgroundColor
      : styles.color !== "rgba(0, 0, 0, 0)"
      ? styles.color
      : styles.borderTopColor
  );

  const textColor = rgb || "#000";
  const lightColors = ["text-light", "text-white", "text-white-50"];
  const backgroundColor = lightColors.includes(token) ? "#343a40" : "#fff";

  const shouldApplyTextClass = token.startsWith("text-");

  return (
    <>
      <div
        ref={probeRef}
        className={shouldApplyTextClass ? token : undefined}
        style={{
          display: "none",
          color: !shouldApplyTextClass ? `var(--bs-${token})` : undefined,
        }}
      />

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
          borderColor: "#dee2e6",
        }}
      >
        <div className={cx("p-3", "border-bottom")} style={{ backgroundColor }}>
          <p
            className={cx("fs-5", "lh-base", "mb-2")}
            style={{ color: textColor }}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        <div className="p-3">
          <CopyRow
            value={token}
            prefix="Class:"
            copied={copied}
            setCopied={setCopied}
            className="fs-6 mb-1 cursor-pointer d-flex align-items-center"
          />

          {hex && (
            <CopyRow
              value={hex}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted mb-1 cursor-pointer d-flex align-items-center"
            />
          )}

          {rgb && (
            <CopyRow
              value={rgb}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted mb-1 cursor-pointer d-flex align-items-center"
            />
          )}
        </div>
      </div>
    </>
  );
}

interface BorderColorCardProps {
  token: string;
  borderSize: string;
}

function BorderColorCard({ token, borderSize }: BorderColorCardProps) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");

  const { rgb, hex } = useResolvedColor(probeRef, token, (styles) =>
    styles.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? styles.backgroundColor
      : styles.color !== "rgba(0, 0, 0, 0)"
      ? styles.color
      : styles.borderTopColor
  );

  return (
    <>
      <div
        ref={probeRef}
        className={token}
        style={{
          display: "none",
          borderStyle: "solid",
        }}
      />

      <div
        className={cx(
          "rounded-3",
          "shadow-sm",
          "overflow-hidden",
          "font-sans",
          "border",
          borderSize,
          token
        )}
        style={{
          width: 400,
          height: 120,
          background: "#fff",
        }}
      >
        <div className="p-3 bg-white d-flex flex-column h-100">
          <CopyRow
            value={token}
            prefix="Class:"
            copied={copied}
            setCopied={setCopied}
            className="fs-6 mb-1 cursor-pointer d-flex align-items-center"
          />

          {hex && (
            <CopyRow
              value={hex}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted mb-1 cursor-pointer d-flex align-items-center"
            />
          )}

          {rgb && (
            <CopyRow
              value={rgb}
              copied={copied}
              setCopied={setCopied}
              className="fs-6 text-muted mb-1 cursor-pointer d-flex align-items-center"
            />
          )}
        </div>
      </div>
    </>
  );
}

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
    const CARD_MAP = {
      color: (t: string) => <ColorCard key={t} token={t} />,
      text: (t: string) => <TextColorCard key={t} token={t} />,
      border: (t: string, size: string) => (
        <BorderColorCard key={t} token={t} borderSize={size} />
      ),
    };
    return (
      <div className="p-4 mx-auto" style={{ maxWidth: "1200px" }}>
        {Object.values(allColorTokens).map(({ title, type, tokens }) => (
          <section key={title} className="mb-5">
            <h2 className="fw-bold fs-5 mb-3 border-bottom border-2 border-primary pb-2 text-primary">
              {title}
            </h2>

            <div className="d-flex flex-wrap gap-3">
              {tokens.map((t) =>
                type === "border"
                  ? CARD_MAP.border(t, args.borderSize)
                  : CARD_MAP[type](t)
              )}
            </div>
          </section>
        ))}
      </div>
    );
  },
};
