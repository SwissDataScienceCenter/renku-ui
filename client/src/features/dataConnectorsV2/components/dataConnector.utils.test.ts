import { describe, expect, it } from "vitest";

import { normalizeAsDoi } from "./dataConnector.utils";

describe("Test data connectors DOI parser", () => {
  describe("normalizeAsDoi", () => {
    const output = "10.1000/182";
    const validCases = [
      ["10.1000/182", output],
      ["  10.1000/182  ", output],
      ["doi:10.1000/182", output],
      ["DOI:   10.1000/182", output],
      ["https://doi.org/10.1000/182", output],
      ["https://dx.doi.org/10.1000/182", output],
      ["10.1234/a suffix with spaces", "10.1234/a suffix with spaces"],
    ];

    it.each(validCases)("Normalizes %p to %p", (input, expected) => {
      expect(normalizeAsDoi(input)).toBe(expected);
    });

    const invalidCases = [
      "",
      "some random text",
      "doi:",
      "https://example.com/10.1000/182",
      "11.1000/182", // wrong start
      "10.abc/182", // non-digit prefix
      "10.1000/", // empty suffix
    ];

    it.each(invalidCases)(
      "Returns empty string for invalid input %p",
      (input) => {
        expect(normalizeAsDoi(input)).toBe("");
      }
    );
  });
});
