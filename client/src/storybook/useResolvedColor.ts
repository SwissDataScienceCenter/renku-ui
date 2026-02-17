import React, { useEffect, useState } from "react";

import { resolveCssVar, rgbToHex } from "~/storybook/bootstrap/utils.tsx";

type Resolver = (styles: CSSStyleDeclaration) => string;

export function useResolvedColor(
  ref: React.RefObject<HTMLElement>,
  token: string,
  resolver: Resolver
) {
  const [rgb, setRgb] = useState("");
  const [hex, setHex] = useState("");

  useEffect(() => {
    if (!ref.current) return;

    const styles = getComputedStyle(ref.current);
    const rawColor = resolver(styles);
    const resolved = resolveCssVar(rawColor);

    setRgb(resolved);
    setHex(rgbToHex(resolved));
  }, [ref, token, resolver]);

  return { rgb, hex };
}
