import React from "react";

import { Copy, CopyIcon } from "~/storybook/bootstrap/utils";

interface CopyRowProps {
  value: string;
  copied: string;
  setCopied: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  prefix?: string;
}

export function CopyRow({
  value,
  copied,
  setCopied,
  className,
  prefix,
}: CopyRowProps) {
  return (
    <div className={className} onClick={() => Copy(value, setCopied)}>
      {prefix && <strong className="me-1">{prefix}</strong>}
      {value}
      {copied === value ? (
        <span className="ms-1 text-success">✓</span>
      ) : (
        <CopyIcon />
      )}
    </div>
  );
}
