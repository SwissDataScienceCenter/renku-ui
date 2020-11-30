/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renku-ui
 *
 *  utils.test.js
 *  test fo utilities
 */

import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import Time from "./Time";
import { CommitsView, CommitsUtils } from "./Commits";
import {
  splitAutosavedBranches, sanitizedHTMLFromMarkdown, parseINIString, slugFromTitle,
  verifyTitleCharacters, convertUnicodeToAscii
} from "./HelperFunctions";
import { RefreshButton } from "./UIComponents";
import { StateModel, globalSchema } from "../model";
import { fixRelativePath } from "./Markdown";


describe("Render React components and functions", () => {
  it("render RefreshButton", () => {
    const div = document.createElement("div");
    const fakeAction = () => { return false; };

    ReactDOM.render(
      <MemoryRouter>
        <RefreshButton action={fakeAction} updating={false} />
      </MemoryRouter>
      , div);
  });

  it("render CommitsView", () => {
    const div = document.createElement("div");
    const projectModel = new StateModel(globalSchema);
    const commits = projectModel.get("project.commits");

    ReactDOM.render(
      <MemoryRouter>
        <CommitsView
          commits={commits.list}
          fetched={commits.fetched}
          fetching={commits.fetching}
          urlRepository="https://fakeUrl.ne/gitlab"
          urlDiff="https://fakeUrl.ne/gitlab/commit/"
        />
      </MemoryRouter>
      , div);
  });
});

describe("Commits functions", () => {
  const { ElementType, createDateObject, createCommitsObjects } = CommitsUtils;
  const COMMITS = [
    {
      "id": "cfed40406aee875a98203279745bbc35fe0a92b0",
      "short_id": "cfed4040",
      "created_at": "2021-04-21T17:04:37.000+02:00",
      "title": "new renku version",
      "message": "new renku version\n",
      "author_name": "Fake author",
      "author_email": "no@email.abc",
      "committed_date": "2019-08-26T17:04:37.000+02:00",
    },
    {
      "id": "2f28167c3a2a012e8e69d309747c121c55f1a3cb",
      "short_id": "2f28167c",
      "created_at": "2021-04-20T09:28:44.000+00:00",
      "title": "new history!",
      "message": "new history!\n",
      "author_name": "Fake author",
      "author_email": "no@email.abc",
      "committed_date": "2019-08-05T09:28:44.000+00:00",
    }
  ];

  it("function createDateElement", () => {
    const dateObject = createDateObject(COMMITS[0]);

    expect(dateObject.date).toBeTruthy();
    expect(Time.isSameDay(dateObject.date, COMMITS[0].committed_date)).toBeTruthy();
    expect(dateObject.readableDate).toBeTruthy();
    expect(dateObject.type).toBe(ElementType.DATE);
  });

  it("function createCommitsObjects", () => {
    const dateObject = createCommitsObjects(COMMITS);
    expect(dateObject.length).toBeGreaterThan(COMMITS.length);

    let dates = 0;
    let last;
    for (const commit of COMMITS) {
      if (!last || !Time.isSameDay(commit.committed_date, last.committed_date))
        dates++;
      last = commit;
    }
    expect(dateObject.length).toBe(COMMITS.length + dates);
    expect(dateObject[0].type).toBe(ElementType.DATE);
    expect(dateObject[1].type).toBe(ElementType.COMMIT);
  });
});

describe("Time class helper", () => {
  const Dates = {
    NOW: new Date(),
    UTCZ_STRING: "2019-03-11T09:34:51.000Z",
    INVALID: "this is not a date",
    ISO_READABLE_DATETIME: "2019-03-11 09:34:51",
    ISO_READABLE_DATETIME_SHORT: "2019-03-11 09:34",
    ISO_READABLE_DATE: "2019-03-11",
    ISO_READABLE_TIME: "09:34:51",
  };

  const DatesTimezoneFriendly = {
    Plus: {
      UTCZ_STRING: "2019-08-23T18:00:00.000Z",
      ISO_READABLE_DATETIME: "2019-08-23 18:00:00",
      ISO_READABLE_DATETIME_SHORT: "2019-08-23 18:00"
    },
    Minus: {
      UTCZ_STRING: "2019-08-23T06:00:00.000Z",
      ISO_READABLE_DATETIME: "2019-08-23 06:00:00",
      ISO_READABLE_DATETIME_SHORT: "2019-08-23 06:00",
    }
  };

  const DatesComparison = {
    DAY1: new Date("2020-04-20T09:48:00.000Z"),
    DAY2: "2020-04-21T09:48:00.000Z",
    DAY2_B: "2020-04-21T23:48:00.000Z",
    DAY3: "2020-04-22T00:00:00.000Z",
  };

  it("function isSameDay", () => {
    const locale = false;
    expect(Time.isSameDay(DatesComparison.DAY1, DatesComparison.DAY2, locale)).toBeFalsy();
    expect(Time.isSameDay(DatesComparison.DAY2, DatesComparison.DAY2_B, locale)).toBeTruthy();
    expect(Time.isSameDay(DatesComparison.DAY2, DatesComparison.DAY3, locale)).toBeFalsy();
  });

  it("function isDate", () => {
    expect(Time.isDate(Dates.NOW)).toBeTruthy();
    expect(Time.isDate(Dates.UTCZ_STRING)).toBeFalsy();
    expect(Time.isDate(new Date(Dates.UTCZ_STRING))).toBeTruthy();
    expect(Time.isDate(Dates.INVALID)).toBeFalsy();
  });
  it("function parseDate", () => {
    expect(Time.parseDate(Dates.NOW)).toEqual(Dates.NOW);
    expect(Time.parseDate(Dates.UTCZ_STRING)).toEqual(new Date(Dates.UTCZ_STRING));
    expect(() => { Time.parseDate(Dates.INVALID); }).toThrow("Invalid date");
  });
  it("function toIsoString", () => {
    expect(Time.toIsoString(Dates.UTCZ_STRING)).toEqual(Dates.ISO_READABLE_DATETIME);
    expect(Time.toIsoString(Dates.UTCZ_STRING, "datetime")).toEqual(Dates.ISO_READABLE_DATETIME);
    expect(Time.toIsoString(Dates.UTCZ_STRING, "datetime-short")).toEqual(Dates.ISO_READABLE_DATETIME_SHORT);
    expect(Time.toIsoString(Dates.UTCZ_STRING, "date")).toEqual(Dates.ISO_READABLE_DATE);
    expect(Time.toIsoString(Dates.UTCZ_STRING, "time")).toEqual(Dates.ISO_READABLE_TIME);
    const fakeType = "not existing";
    expect(() => { Time.toIsoString(Dates.UTCZ_STRING, fakeType); }).toThrow(`Unknown type "${fakeType}"`);

    expect(Time.toIsoString(DatesTimezoneFriendly.Minus.UTCZ_STRING))
      .toEqual(DatesTimezoneFriendly.Minus.ISO_READABLE_DATETIME);
    expect(Time.toIsoString(DatesTimezoneFriendly.Minus.UTCZ_STRING))
      .toEqual(DatesTimezoneFriendly.Minus.ISO_READABLE_DATETIME);
  });
  it("function toIsoTimezoneString", () => {
    // Create the string manually. It's a creepy logic, but here string manipulation seems to be
    // a valid way to avoid re-writing function code in the test.
    const positive = (new Date().getTimezoneOffset()) >= 0 ?
      true :
      false;
    const DatesTimezone = positive ?
      DatesTimezoneFriendly.Plus :
      DatesTimezoneFriendly.Minus;
    const date = new Date(DatesTimezone.UTCZ_STRING);
    const deltaHours = Math.abs(parseInt(date.getTimezoneOffset() / 60));
    const deltaMinutes = Math.abs(date.getTimezoneOffset()) - (deltaHours * 60);
    let expectedString = DatesTimezone.ISO_READABLE_DATETIME;
    if (deltaHours) {
      let hour = parseInt(expectedString.substring(11, 13));
      if (positive) {
        hour = hour - deltaHours;
        if (deltaMinutes)
          hour--;
      }
      else {
        hour = hour + deltaHours;
      }
      let stringHour = `0${hour}`.substring(0, 2);
      expectedString = expectedString.substring(0, 11) + stringHour + expectedString.substring(13);
    }
    if (deltaMinutes) {
      let minute = parseInt(expectedString.substring(14, 16));
      minute = positive ?
        minute - deltaMinutes :
        minute + deltaMinutes;
      let stringMinute = `0${minute}`.substring(0, 2);
      expectedString = expectedString.substring(0, 14) + stringMinute + expectedString.substring(16);
    }
    expect(Time.toIsoTimezoneString(DatesTimezone.UTCZ_STRING)).toEqual(expectedString);
  });
  it("function formatDateTime", () => {
    let dt = Time.parseDate(Dates.ISO_READABLE_DATETIME);
    expect(Time.formatDateTime(dt))
      .not.toBeNull();
    expect(Time.formatDateTime(dt, { d3FormatString: "%d %m %Y %H:%M:%S" }))
      .toEqual("11 03 2019 09:34:51");
    // Correct for the UTC offset, but this will not work for timezone with non-whole hour offsets
    dt = Time.parseDate(Dates.UTCZ_STRING);
    const offset = dt.getTimezoneOffset() / 60;
    const hour = String(9 - offset).padStart(2, "0");
    expect(Time.formatDateTime(dt, { d3FormatString: "%d %m %Y %H:%M:%S" }))
      .toEqual(`11 03 2019 ${hour}:34:51`);
  });
});

describe("Ini file parser", () => {
  it("valid code", () => {
    // simple variable
    let content = "my_prop = abc";
    let parsedCode = parseINIString(content);
    // variables are parsed as key-value pairs and return in an object
    expect(Object.keys(parsedCode).length).toBe(1);
    expect(Object.keys(parsedCode)).toContain("my_prop");
    expect(parsedCode.my_prop).toBe("abc");

    // multiple variables
    content = `
    my_prop_1 = 1
    my_prop_2 = true`;
    parsedCode = parseINIString(content);
    expect(Object.keys(parsedCode).length).toBe(2);
    expect(Object.keys(parsedCode)).toContain("my_prop_1");
    expect(Object.keys(parsedCode)).toContain("my_prop_2");
    // note that values are not automatically converted
    expect(parsedCode.my_prop_1).toBe("1");
    expect(parsedCode.my_prop_1).not.toBe(1);
    expect(parsedCode.my_prop_2).toBe("true");
    expect(parsedCode.my_prop_2).not.toBe(true);

    // sections
    content = `
    [sub]
    my_prop = cde`;
    parsedCode = parseINIString(content);
    // variables in sections sections are parsed as sub-objects
    expect(Object.keys(parsedCode).length).toBe(1);
    expect(Object.keys(parsedCode)).toContain("sub");
    expect(Object.keys(parsedCode.sub).length).toBe(1);
    expect(Object.keys(parsedCode.sub)).toContain("my_prop");
    expect(parsedCode.sub.my_prop).toBe("cde");
  });
  it("invalid code", () => {
    // random string
    const content = "this is a random string";
    const parsedCode = parseINIString(content);
    // any valid string always returns an object
    expect(typeof parsedCode).toBe("object");
    expect(Object.keys(parsedCode).length).toBe(0);
  });
  it("partially valid code", () => {
    // sections
    const content = `
    valid_prop_1 = abc
    random_text
    123
    valid_prop_2 = def`;
    const parsedCode = parseINIString(content);
    // the function try to parse everything and leaves out simple errors
    expect(Object.keys(parsedCode).length).toBe(2);
    expect(Object.keys(parsedCode)).toContain("valid_prop_1");
    expect(Object.keys(parsedCode)).toContain("valid_prop_2");
    expect(Object.keys(parsedCode)).not.toContain("random_text");
    expect(Object.keys(parsedCode)).not.toContain("123");
    expect(parsedCode.valid_prop_1).toBe("abc");
    expect(parsedCode.valid_prop_2).toBe("def");
  });
  it("throwing code", () => {
    // any non-string will throw an exception
    const invalid_contents = [true, 12345, null, undefined, [], {}];
    invalid_contents.forEach(content => {
      // eslint-disable-next-line
      expect(() => { parseINIString(content); }).toThrow();
    });
  });
});

describe("branch functions", () => {
  const branches = [
    { name: "master" },
    { name: "renku/autosave/myUser/master/1234567/890acbd" }
  ];

  it("function splitAutosavedBranches", () => {
    const splitBranches = splitAutosavedBranches(branches);
    expect(splitBranches.standard.length).toEqual(1);
    expect(splitBranches.autosaved.length).toEqual(1);
    const [username, branch, commit, finalCommit] = branches[1].name.replace("renku/autosave/", "").split("/");
    expect(splitBranches.autosaved[0].autosave.username).toEqual(username);
    expect(splitBranches.autosaved[0].autosave.branch).toEqual(branch);
    expect(splitBranches.autosaved[0].autosave.commit).toEqual(commit);
    expect(splitBranches.autosaved[0].autosave.finalCommit).toEqual(finalCommit);
  });
});

describe("title related functions", () => {
  // convertUnicodeToAscii
  it("function convertUnicodeToAscii - valid strings", () => {
    expect(convertUnicodeToAscii("João")).toEqual("Joao"); // eslint-disable-line
    expect(convertUnicodeToAscii("здрасти")).toEqual("здрасти");
    expect(convertUnicodeToAscii("Zürich")).toEqual("Zuerich"); // eslint-disable-line
  });

  // slugFromTitle
  it("function slugFromTitle without parameters", () => {
    expect(slugFromTitle("This is my Project")).toEqual("This-is-my-Project");
  });
  it("slugFromTitle lowercase - remove accents", () => {
    expect(slugFromTitle("João", true)).toEqual("jo-o");
  });
  it("slugFromTitle lowercase - replaces any whitespace with hyphens", () => {
    expect(slugFromTitle("My Input String", true)).toEqual("my-input-string");
  });
  it("slugFromTitle lowercase - remove trailing whitespace", () => {
    expect(slugFromTitle(" a new project ", true)).toEqual("a-new-project");
  });
  it("slugFromTitle lowercase - remove only non-allowed special characters", () => {
    expect(slugFromTitle("test!_pro-ject~", true)).toEqual("test-pro-ject"); // eslint-disable-line
  });
  it("slugFromTitle lowercase - squash multiple hyphens", () => {
    expect(slugFromTitle("test!!!!_pro-ject~", true)).toEqual("test-pro-ject"); // eslint-disable-line
  });
  it("slugFromTitle lowercase - return empty string if only non-allowed characters", () => {
    expect(slugFromTitle("здрасти", true)).toEqual("");
  });
  it("slugFromTitle lowercase - squash multiple separators", () => {
    expect(slugFromTitle("Test:-)", true)).toEqual("test");
  });
  it("slugFromTitle lowercase - trim any separators from the beginning and end", () => {
    expect(slugFromTitle("-Test:-)-", true)).toEqual("test");
  });
  it("function slugFromTitle lowercase with custom separator", () => {
    expect(slugFromTitle("This is my Project", true, false, "+")).toEqual("this+is+my+project");
  });
  it("function slugFromTitle ascii", () => {
    expect(slugFromTitle("João-Mario", true, true)).toEqual("joao-mario"); // eslint-disable-line
    expect(slugFromTitle("João-._--Mario", true, true)).toEqual("joao-mario"); // eslint-disable-line
    expect(slugFromTitle("Zürich", true, true)).toEqual("zuerich"); // eslint-disable-line
    expect(slugFromTitle("здрасти", true, true)).toEqual("");
  });

  // verifyTitleCharacters
  it("function verifyTitleCharacters - valid strings", () => {
    expect(verifyTitleCharacters("João")).toBeTruthy();
    expect(verifyTitleCharacters("здрасти_.и")).toBeTruthy();
    expect(verifyTitleCharacters("")).toBeTruthy();
  });

  it("function verifyTitleCharacters - invalid strings", () => {
    expect(verifyTitleCharacters("Test:-)")).toBeFalsy();
    expect(verifyTitleCharacters("test!_pro-ject~")).toBeFalsy(); // eslint-disable-line
    expect(verifyTitleCharacters("yeah 🚀")).toBeFalsy();
  });
});

describe("html sanitization", () => {
  it("handles empty markdown", () => {
    const markdown = "";
    const html = sanitizedHTMLFromMarkdown(markdown);
    expect(html).toEqual("");
  });

  it("handles pure markdown", () => {
    const markdown = "# internal-test\nA Renku project.\n\nThis is an *internal* project that is used for testing.";
    const html = sanitizedHTMLFromMarkdown(markdown);
    // eslint-disable-next-line
    expect(html).toEqual(`<h1 id="internal-test">internal-test</h1>\n<p>A Renku project.</p>\n<p>This is an <em>internal</em> project that is used for testing.</p>`);
  });

  it("handles mixed markdown", () => {
    const markdown = `# internal-test

A Renku project.

This is an *internal* project that is used for testing.

<div>
  This is some HTML in a div, since that is valid Markdown.
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
</div>`;
    const expected = `<h1 id="internal-test">internal-test</h1>
<p>A Renku project.</p>
<p>This is an <em>internal</em> project that is used for testing.</p>
<div>
  This is some HTML in a div, since that is valid Markdown.
</div>
<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
</div>`;
    const html = sanitizedHTMLFromMarkdown(markdown);
    expect(html).toEqual(expected);
  });

  it("strips suspicious markdown", () => {
    const markdown = `# internal-test

A Renku project.

This is an *internal* project that is used for testing.

<div>
  This is some HTML in a div, since that is valid Markdown.
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      The following alerts should get sanitized away.
      <script>alert('xss');</script>
      hello <a name="n" href="javascript:alert('xss')">*you*</a>
    </div>
  </div>
</div>`;
    const expected = `<h1 id="internal-test">internal-test</h1>
<p>A Renku project.</p>
<p>This is an <em>internal</em> project that is used for testing.</p>
<div>
  This is some HTML in a div, since that is valid Markdown.
</div>
<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      The following alerts should get sanitized away.
      \n      hello <a name="n">*you*</a>
    </div>
  </div>
</div>`;
    const html = sanitizedHTMLFromMarkdown(markdown);
    expect(html).toEqual(expected);
  });
});

describe("Translate path for markdown", () => {

  // This is the folder structure that will be used for testing
  //
  // /fileStructure
  // ├── folder1
  // │   ├── folder2
  // │   │   ├── fileWithReferencesToFix.md
  // │   │   └── testImage2.md
  // │   └── folder3
  // │       └── testImage3.md
  // └── images
  //     └── testImage1.png

  const testCases = [
    {
      relativePath: "../../images/testImage1.png",
      localFilePath: ["folder2", "folder1"],
      expectedResult: "images/testImage1.png"
    },
    {
      relativePath: "./testImage2.png",
      localFilePath: ["folder2", "folder1"],
      expectedResult: "folder1/folder2/testImage2.png"
    },
    {
      relativePath: "../folder3/testImage3.png",
      localFilePath: ["folder2", "folder1"],
      expectedResult: "folder1/folder3/testImage3.png"
    }
  ];

  it("function fixRelativePath", () => {
    testCases.forEach(test => {
      expect(fixRelativePath(test.relativePath, test.localFilePath)).toEqual(test.expectedResult);
    });
  });

});
