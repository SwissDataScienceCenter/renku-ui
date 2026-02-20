import { describe, expect, it } from "vitest";

import { getRelease } from "./utils";

describe("Sentry utilities", () => {
  it("getRelease", () => {
    const RELEASE = {
      normal: "1.10.0",
      short: "1.10",
      full: "1.10.0-abcd123",
      wrong: "1.10.0.abcd123",
      extended: "1.10.0-n24.h376dd06",
    };
    const DEV_SUFFIX = "-dev";

    expect(getRelease(RELEASE.normal)).toBe(RELEASE.normal);
    expect(getRelease(RELEASE.short)).toBe(RELEASE.short);
    expect(getRelease(RELEASE.full)).toBe(RELEASE.normal + DEV_SUFFIX);
    expect(getRelease(RELEASE.extended)).toBe(RELEASE.normal + DEV_SUFFIX);
    expect(getRelease("abcd")).toBe("unknown");
    expect(getRelease(RELEASE.wrong)).toBe("unknown");
  });
});
