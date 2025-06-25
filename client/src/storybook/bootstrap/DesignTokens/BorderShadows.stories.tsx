import cx from "classnames";
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Copy, CopyIcon } from "~/storybook/bootstrap/utils.tsx";

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
      extensions: {
        px: "",
      },
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

interface PropertyCardProps {
  token: string;
  value: string;
  px?: string;
  notes?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  token,
  value,
  px,
  notes,
}) => (
  <div
    className={cx(
      "bg-white",
      "p-3",
      "border",
      "rounded",
      "shadow-sm",
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

interface BorderRadiusExampleCardProps {
  token: string;
  value: string;
  px: string;
}

const BorderRadiusExampleCard: React.FC<BorderRadiusExampleCardProps> = ({
  token,
  value,
  px,
}) => {
  const [copied, setCopied] = useState("");
  const isCircle = token === "rounded-circle";

  return (
    <div
      className={cx(
        "border",
        "border-2",
        "border-primary",
        "bg-light",
        "d-flex",
        "align-items-center",
        "justify-content-center",
        "text-center",
        "flex-column",
        "shadow-sm",
        token
      )}
      style={{
        width: "200px",
        height: isCircle ? "200px" : "150px",
        fontSize: "0.8rem",
      }}
    >
      <div className="fw-semibold">{token}</div>
      <div>
        {value} ({px})
      </div>
      <div
        className={cx("mt-3", "cursor-pointer")}
        style={{ fontSize: "13px" }}
        onClick={() => token && Copy(token, setCopied)}
      >
        <code>{token}</code>
        {copied === token && (
          <span className={cx("ms-1", "text-success")}>✓</span>
        )}
        {copied !== token && <CopyIcon />}
      </div>
    </div>
  );
};

interface ShadowExampleCardProps {
  token: string;
  value: string;
  description: string;
  cssClass?: string;
}

const ShadowExampleCard: React.FC<ShadowExampleCardProps> = ({
  token,
  value,
  description,
}) => {
  const [copied, setCopied] = useState("");

  return (
    <div
      className={cx(
        "bg-white",
        "rounded",
        "border",
        "border-light-subtle",
        "d-flex",
        "flex-column",
        "align-items-center",
        "justify-content-center",
        "text-center",
        "p-3"
      )}
      style={{
        width: "250px",
        height: "150px",
        fontSize: "0.9rem",
        boxShadow: value,
      }}
    >
      <div className={cx("fw-semibold", "mb-2")}>{token}</div>
      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
        {description}
      </div>
      <div
        className={cx("text-muted", "mt-2", "cursor-pointer")}
        style={{ fontSize: "0.75rem" }}
        onClick={() => token && Copy(token, setCopied)}
      >
        <code>{token || "Custom Shadow"}</code>
        {copied === token && (
          <span className={cx("ms-1", "text-success")}>✓</span>
        )}
        {copied !== token && <CopyIcon />}
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
    className="text-muted mb-4"
    style={{ fontSize: "14px", maxWidth: "800px" }}
  >
    {children}
  </p>
);

const meta: Meta = {
  title: "Design Tokens/Borders & Shadows",
  component: () => <div />,
  parameters: {
    docs: {
      description: {
        component:
          "This section defines our visual treatments for **borders** and **shadows**, crucial for defining element boundaries and conveying depth in our UI. These tokens are designed to align with **Bootstrap's border and shadow utilities** (e.g., `.border-radius-*`, `.shadow-*`), ensuring consistent visual presentation and seamless integration across all components. They empower designers and developers to create clear, layered, and modern interfaces.",
      },
    },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const BordersAndShadows: Story = {
  render: () => (
    <div className={cx("p-4", "mx-auto")} style={{ maxWidth: "1200px" }}>
      <section className="mb-5">
        <SectionHeader>1. Core Borders</SectionHeader>
        <SectionDescription>
          Fundamental properties defining the default appearance of borders.
        </SectionDescription>
        <div className={cx("d-flex", "flex-wrap", "gap-3")}>
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

      <section className="mb-5">
        <SectionHeader>2. Border Radius</SectionHeader>
        <SectionDescription>
          Defines the roundness of element corners, aligning with
          Bootstrap&apos;s `.rounded-*` classes for consistent visual softness.
        </SectionDescription>
        <div
          className={cx(
            "d-flex",
            "flex-wrap",
            "gap-4",
            "justify-content-center"
          )}
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
        <SectionHeader>3. Box Shadows</SectionHeader>
        <SectionDescription>
          Adds depth and visual hierarchy using predefined shadow values,
          directly corresponding to Bootstrap&apos;s `.shadow-*` classes.
        </SectionDescription>
        <div
          className={cx(
            "d-flex",
            "flex-wrap",
            "gap-4",
            "justify-content-center"
          )}
        >
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
            cssClass="shadow-inset"
          />
        </div>
      </section>
    </div>
  ),
};
