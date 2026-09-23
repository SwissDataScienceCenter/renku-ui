import { describe, expect, it } from "vitest";

import type { DataConnector } from "../api/data-connectors.api";
import {
  getDataConnectorDoi,
  getDataConnectorIdentifier,
  normalizeAsDoi,
} from "./dataConnector.utils";

type DataConnectorDoiFields = Pick<
  DataConnector,
  "doi" | "namespace" | "storage"
>;

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
      },
    );
  });
});

describe("getDataConnectorDoi()", () => {
  const doiSource = (fields: {
    doi?: string;
    namespace?: string;
    configuration: Record<string, unknown>;
  }): DataConnectorDoiFields =>
    ({
      doi: fields.doi,
      namespace: fields.namespace,
      storage: { configuration: fields.configuration },
    }) as DataConnectorDoiFields;

  it("returns the parsed DOI from the storage configuration", () => {
    expect(
      getDataConnectorDoi(
        doiSource({ configuration: { doi: "https://doi.org/10.1000/182" } }),
      ),
    ).toBe("10.1000/182");
  });

  it("falls back to the connector DOI when the configuration DOI is empty", () => {
    expect(
      getDataConnectorDoi(
        doiSource({
          doi: "doi:10.1000/182",
          configuration: { doi: "" },
        }),
      ),
    ).toBe("10.1000/182");
  });

  it("returns undefined for namespace- and project-owned connectors", () => {
    expect(
      getDataConnectorDoi(
        doiSource({
          namespace: "user1-uuid",
          configuration: { doi: "10.1000/182" },
        }),
      ),
    ).toBeUndefined();
    expect(
      getDataConnectorDoi(
        doiSource({
          namespace: "user1-uuid/my-project",
          configuration: { doi: "10.1000/182" },
        }),
      ),
    ).toBeUndefined();
  });

  it("returns undefined when there is no DOI at all", () => {
    expect(
      getDataConnectorDoi(doiSource({ configuration: {} })),
    ).toBeUndefined();
    expect(getDataConnectorDoi(undefined)).toBeUndefined();
  });
});

describe("getDataConnectorIdentifier()", () => {
  it("prefixes namespace-owned connectors with their namespace", () => {
    expect(
      getDataConnectorIdentifier({
        namespace: "user1-uuid",
        slug: "example-storage",
      }),
    ).toBe("user1-uuid/example-storage");
  });

  it("prefixes project-owned connectors with the full project path", () => {
    expect(
      getDataConnectorIdentifier({
        namespace: "user1-uuid/my-project",
        slug: "example-storage",
      }),
    ).toBe("user1-uuid/my-project/example-storage");
  });

  it("uses the bare slug for global connectors", () => {
    expect(getDataConnectorIdentifier({ slug: "doi-10.1000-182" })).toBe(
      "doi-10.1000-182",
    );
  });
});
