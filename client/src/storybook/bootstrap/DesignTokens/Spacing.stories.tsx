import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import React, { useState } from "react";

import { Copy, CopyIcon } from "~/storybook/bootstrap/utils";

interface SpacingBoxProps {
  token: string;
  spacingClass: string;
  type: "padding" | "margin";
  value: string;
}

function SpacingBox({ token, spacingClass, type, value }: SpacingBoxProps) {
  const [copied, setCopied] = useState("");

  return (
    <div
      className={cx(
        "bg-white",
        "rounded-2",
        "shadow-sm",
        "overflow-hidden",
        "d-flex",
        "flex-column",
        "m-2"
      )}
      style={{ width: 180, minHeight: 220 }}
    >
      {type === "margin" && (
        <div
          className={cx(
            "flex-fill",
            "d-flex",
            "flex-column",
            "justify-content-center",
            "align-items-center"
          )}
          style={{
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            border: "1px dashed rgba(0, 123, 255, 0.5)",
            padding: value,
          }}
        >
          <div
            className={cx(spacingClass, "flex-fill", "d-flex")}
            style={{ border: "2px solid #006e58", width: "calc(100% - 2px)" }}
          >
            <div
              className={cx(
                "bg-secondary",
                "text-white",
                "flex-fill",
                "d-flex",
                "align-items-center",
                "justify-content-center",
                "fw-bold"
              )}
              style={{
                fontSize: "1rem",
                minHeight: "50px",
              }}
            >
              {token.split("(")[0].trim()}
            </div>
          </div>
        </div>
      )}
      {type === "padding" && (
        <div
          className={cx(spacingClass, "d-flex", "flex-column", "flex-fill")}
          style={{
            backgroundColor: "rgba(40, 167, 69, 0.2)",
            border: "1px dashed rgba(40, 167, 69, 0.5)",
            borderWidth: "2px",
            borderColor: "#006e58",
            borderStyle: "solid",
          }}
        >
          <div
            className={cx(
              "bg-secondary",
              "text-white",
              "flex-fill",
              "d-flex",
              "align-items-center",
              "justify-content-center",
              "fw-bold"
            )}
            style={{
              fontSize: "1rem",
              minHeight: "50px",
            }}
          >
            {token.split("(")[0].trim()}
          </div>
        </div>
      )}

      <div className={cx("p-3", "text-center", "bg-white")}>
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
        <div className={cx("mt-2", "small")}>Value: {value}</div>
        <div className={cx("mt-2", "small", "text-muted")}>
          Bootstrap class: <code>{spacingClass}</code>
        </div>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2
      className={cx("fw-bold", "mb-3", "pb-1")}
      style={{
        fontFamily: "sans-serif",
        fontSize: 20,
        borderBottom: "2px solid #006e58",
        color: "#006e58",
      }}
    >
      {title}
    </h2>
  );
}

interface SpacingGridProps {
  children: React.ReactNode;
}

function SpacingGrid({ children }: SpacingGridProps) {
  return (
    <div className={cx("d-flex", "flex-wrap")} style={{ gap: 16 }}>
      {children}
    </div>
  );
}

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
};

export default meta;

type Story = StoryObj<typeof SpacingBox>;

export const SpacingExamples: Story = {
  render: () => (
    <div className={cx("p-4", "mx-auto")} style={{ maxWidth: "1200px" }}>
      <section className="mb-5">
        <SectionHeader title="1. Padding (p-*)" />
        <SpacingGrid>
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
        </SpacingGrid>
      </section>

      <section>
        <SectionHeader title="2. Margin (m-*)" />
        <SpacingGrid>
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
        </SpacingGrid>
      </section>
    </div>
  ),
};
