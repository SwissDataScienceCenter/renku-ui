import { parseChartVersion } from "./HelpRelease";

describe("Parse versions from chartpress", () => {
  it("parses tagged versions", () => {
    let taggedVersion = "0.32.1";
    let parsed = parseChartVersion(taggedVersion);
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBeNull();
    taggedVersion = "0.32.1-3.662f190";
    parsed = parseChartVersion(taggedVersion);
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("662f190");
  });
  it("parses commit versions", () => {
    let commitVersion = "0.32.1-n001.hasdf123";
    let parsed = parseChartVersion(commitVersion);
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("asdf123");
    commitVersion = "0.32.1-3.662f190.n001.hasdf123";
    parsed = parseChartVersion(commitVersion);
    expect(parsed.taggedVersion).toBe("0.32.1");
    expect(parsed.devHash).toBe("asdf123");
  });
});
