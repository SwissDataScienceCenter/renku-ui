import { describe, expect, it } from "vitest";

import { extractTextFromObject } from "./TextUtils";

describe("extractTextFromObject", () => {
  it("should extract all text values from an object with unknown keys", () => {
    const obj = {
      key1: "This is some text.",
      key2: {
        nestedKey1: "More text here.",
        nestedKey2: {
          deeplyNestedKey: "Even more text.",
        },
      },
      key3: "text in key 3.",
      key4: ["Array text 1", "Array text 2"],
      key5: {
        nestedArray: ["Array text 3", "Array text 4"],
        nestedObject: {
          objectArray: ["Array text 5", "array text 6"],
        },
      },
    };

    const expectedTextValues = [
      "This is some text.",
      "More text here.",
      "Even more text.",
      "Text in key 3.",
      "Array text 1",
      "Array text 2",
      "Array text 3",
      "Array text 4",
      "Array text 5",
      "Array text 6",
    ];

    const textValues = extractTextFromObject(obj);
    expect(textValues).toEqual(expectedTextValues);
  });
});
