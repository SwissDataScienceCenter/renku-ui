import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { Copy, CopyIcon } from "~/storybook/bootstrap/utils";

const tokenData = {
  "core borders": {
    "border-width": { notes: "Default border thickness" },
    "border-style": { notes: "Default border line style" },
  },
  borderRadius: [
    "rounded-0",
    "rounded-1",
    "rounded-2",
    "rounded-3",
    "rounded-circle",
    "rounded-pill",
  ],
  shadow: ["shadow", "shadow-sm", "shadow-lg", "shadow-inset"],
};

interface PropertyCardProps {
  token: string;
  notes?: string;
}

function PropertyCard({ token, notes }: PropertyCardProps) {
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
      </div>
      {notes && (
        <div
          className={cx("text-muted", "mt-auto")}
          style={{ fontSize: "11px" }}
        >
          {notes}
        </div>
      )}
    </div>
  );
}

interface BorderRadiusExampleCardProps {
  token: string;
}

const BorderRadiusExampleCard: React.FC<BorderRadiusExampleCardProps> = ({
  token,
}) => {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");
  const [value, setValue] = useState("N/A");
  const [px, setPx] = useState("N/A");

  const isCircle = token === "rounded-circle";

  useEffect(() => {
    if (!probeRef.current) return;

    const styles = getComputedStyle(probeRef.current);
    const radiusPx = styles.borderRadius;

    if (!radiusPx || radiusPx === "0px") {
      setValue("0");
      setPx("0px");
      return;
    }

    const pxNumber = parseFloat(radiusPx);
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );

    const remValue = pxNumber / rootFontSize;

    setPx(`${pxNumber}px`);
    setValue(`${remValue}rem`);
  }, [token]);

  return (
    <>
      {/* Hidden probe */}
      <div ref={probeRef} className={token} style={{ display: "none" }} />

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

        <div className="mb-2">
          {value} ({px})
        </div>

        <div
          className={cx("mt-2", "cursor-pointer")}
          style={{ fontSize: "13px" }}
          onClick={() => Copy(token, setCopied)}
        >
          <code>{token}</code>
          {copied === token ? (
            <span className="ms-1 text-success">✓</span>
          ) : (
            <CopyIcon />
          )}
        </div>
      </div>
    </>
  );
};

interface ShadowExampleCardProps {
  token: string;
}

const ShadowExampleCard: React.FC<ShadowExampleCardProps> = ({ token }) => {
  const probeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");
  const [value, setValue] = useState("N/A");

  useEffect(() => {
    if (!probeRef.current) return;

    const styles = getComputedStyle(probeRef.current);
    const boxShadow = styles.boxShadow;

    setValue(boxShadow && boxShadow !== "none" ? boxShadow : "none");
  }, [token]);

  return (
    <>
      <div ref={probeRef} className={token} style={{ display: "none" }} />

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
          "p-3",
          token
        )}
        style={{
          width: "250px",
          height: "150px",
          fontSize: "0.9rem",
        }}
      >
        <div className={cx("fw-semibold", "mb-2")}>{token}</div>

        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
          {value}
        </div>

        <div
          className={cx("text-muted", "mt-2", "cursor-pointer")}
          style={{ fontSize: "0.75rem" }}
          onClick={() => Copy(token, setCopied)}
        >
          <code>{token || "Custom Shadow"}</code>
          {copied === token ? (
            <span className="ms-1 text-success">✓</span>
          ) : (
            <CopyIcon />
          )}
        </div>
      </div>
    </>
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
          {Object.entries(tokenData["core borders"]).map(([key, data]) => (
            <PropertyCard key={key} token={key} notes={data.notes} />
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
          {tokenData.borderRadius.map((key) => (
            <BorderRadiusExampleCard key={key} token={key} />
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
          {tokenData.shadow.map((key) => (
            <ShadowExampleCard key={key} token={key} />
          ))}
        </div>
      </section>
    </div>
  ),
};
