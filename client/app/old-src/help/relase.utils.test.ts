import { describe, expect, it } from "vitest";

import { parseChartVersion } from "./release.utils";

describe("Parse versions from chartpress", () => {
  it("parses release tagged versions", () => {
    const parsed = parseChartVersion("0.32.1");
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBeNull();
  });
  it("parses dev tagged versions", () => {
    const parsed = parseChartVersion("0.32.1-3.662f190");
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("662f190");
  });
  it("parses commit versions", () => {
    const parsed = parseChartVersion("0.32.1-n001.hasdf123");
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("asdf123");
  });
  it("parses dev-tagged derived commit versions", () => {
    const parsed = parseChartVersion("0.32.1-3.662f190.n001.hasdf123");
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("asdf123");
  });
});
