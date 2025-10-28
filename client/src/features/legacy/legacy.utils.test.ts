import { describe, expect, it } from "vitest";
import { doesUrlHostMatchHost } from "./legacy.utils";

describe("doesUrlHostMatchHost", () => {
  it("should return true for matching hosts", () => {
    expect(
      doesUrlHostMatchHost("https://gitlab.renkulab.io", "gitlab.renkulab.io")
    ).toBe(true);
    expect(
      doesUrlHostMatchHost(
        "registry.renkulab.io/ns/project:abc7ba5e",
        "registry.renkulab.io"
      )
    ).toBe(true);
  });

  it("should return false for non-matching hosts", () => {
    expect(
      doesUrlHostMatchHost("https://gitlab.renkulab.io", "gitlab.example.com")
    ).toBe(false);
    expect(
      doesUrlHostMatchHost(
        "registry.renkulab.io/ns/project:abc7ba5e",
        "registry.example.io"
      )
    ).toBe(false);
  });

  it("should return false for invalid URLs", () => {
    expect(doesUrlHostMatchHost("invalid-url", "gitlab.renkulab.io")).toBe(
      false
    );
  });
});
