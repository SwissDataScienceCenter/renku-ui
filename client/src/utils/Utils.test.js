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

import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-test-renderer";
import { DateTime } from "luxon";
import { StateModel, globalSchema } from "../model";
import { RefreshButton } from "../components/buttons/Button";
import { CommitsUtils, CommitsView } from "../components/commits/Commits";
import {
  convertUnicodeToAscii,
  formatBytes,
  parseINIString,
  refreshIfNecessary,
  sanitizedHTMLFromMarkdown,
  splitAutosavedBranches,
  verifyTitleCharacters,
  slugFromTitle,
} from "./helpers/HelperFunctions";
import { fixRelativePath } from "../components/markdown/RenkuMarkdownWithPathTranslation";

describe("Render React components and functions", () => {
  it("render RefreshButton", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const fakeAction = () => {
      return false;
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <RefreshButton action={fakeAction} updating={false} />
        </MemoryRouter>
      );
    });
  });

  it("render CommitsView", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const projectModel = new StateModel(globalSchema);
    const commits = projectModel.get("project.commits");

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CommitsView
            commits={commits.list}
            fetched={commits.fetched}
            fetching={commits.fetching}
            urlRepository="https://fakeUrl.ne/gitlab"
            urlDiff="https://fakeUrl.ne/gitlab/commit/"
          />
        </MemoryRouter>
      );
    });
  });
});

describe("Commits functions", () => {
  const { ElementType, createDateObject, createCommitsObjects } = CommitsUtils;
  const COMMITS = [
    {
      id: "cfed40406aee875a98203279745bbc35fe0a92b0",
      short_id: "cfed4040",
      created_at: "2021-04-21T17:04:37.000+02:00",
      title: "new renku version",
      message: "new renku version\n",
      author_name: "Fake author",
      author_email: "no@email.abc",
      committed_date: "2019-08-26T17:04:37.000+02:00",
    },
    {
      id: "2f28167c3a2a012e8e69d309747c121c55f1a3cb",
      short_id: "2f28167c",
      created_at: "2021-04-20T09:28:44.000+00:00",
      title: "new history!",
      message: "new history!\n",
      author_name: "Fake author",
      author_email: "no@email.abc",
      committed_date: "2019-08-05T09:28:44.000+00:00",
    },
  ];

  it("function createDateElement", () => {
    const dateObject = createDateObject(COMMITS[0]);

    expect(dateObject).toMatchObject({
      type: "date",
      date: new Date("2019-08-26T15:04:37Z"),
      readableDate: "August 26, 2019",
    });
  });

  it("function createCommitsObjects", () => {
    const dateObject = createCommitsObjects(COMMITS);
    expect(dateObject.length).toBeGreaterThan(COMMITS.length);

    let dates = 0;
    let last;
    for (const commit of COMMITS) {
      if (
        !last ||
        !DateTime.fromISO(commit.committed_date).hasSame(
          DateTime.fromISO(last.committed_date),
          "day"
        )
      ) {
        dates++;
      }
      last = commit;
    }
    expect(dateObject.length).toBe(COMMITS.length + dates);
    expect(dateObject[0].type).toBe(ElementType.DATE);
    expect(dateObject[1].type).toBe(ElementType.COMMIT);
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
    invalid_contents.forEach((content) => {
      // eslint-disable-next-line
      expect(() => {
        parseINIString(content);
      }).toThrow();
    });
  });
});

describe("branch functions", () => {
  const branches = [
    { name: "master" },
    { name: "renku/autosave/myUser/master/1234567/890acbd" },
  ];

  it("function splitAutosavedBranches", () => {
    const splitBranches = splitAutosavedBranches(branches);
    expect(splitBranches.standard.length).toEqual(1);
    expect(splitBranches.autosaved.length).toEqual(1);
    const [username, branch, commit, finalCommit] = branches[1].name
      .replace("renku/autosave/", "")
      .split("/");
    expect(splitBranches.autosaved[0].autosave.username).toEqual(username);
    expect(splitBranches.autosaved[0].autosave.branch).toEqual(branch);
    expect(splitBranches.autosaved[0].autosave.commit).toEqual(commit);
    expect(splitBranches.autosaved[0].autosave.finalCommit).toEqual(
      finalCommit
    );
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
    expect(slugFromTitle("This is my Project", true, false, "+")).toEqual(
      "this+is+my+project"
    );
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
    const markdown =
      "# internal-test\nA Renku project.\n\nThis is an *internal* project that is used for testing.";
    const html = sanitizedHTMLFromMarkdown(markdown);
    // eslint-disable-next-line
    expect(html).toEqual(
      `<h1 id="internal-test">internal-test</h1>\n<p>A Renku project.</p>\n<p>This is an <em>internal</em> project that is used for testing.</p>`
    );
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

describe("display latex in markdown", () => {
  it("handles valid latex source code", () => {
    const markdown =
      "This is a README with some LaTeX expressions that should render nicely:\n" +
      "\n" +
      "**Expression 1**\n" +
      "```math\n" +
      "\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),\n" +
      "```\n";
    const html = sanitizedHTMLFromMarkdown(markdown);
    const resultExpected =
      "<p>This is a README with some LaTeX expressions that should render nicely:</p>\n" +
      "<p><strong>Expression 1</strong></p>\n" +
      // eslint-disable-next-line max-len
      '<span title="\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math><mrow><mo>∫</mo><mi>f</mi><mo>(</mo><mi mathvariant="bold">x</mi><mo>)</mo><mi mathvariant="normal">d</mi><mi>u</mi><mo>(</mo><mi mathvariant="bold">x</mi><mo>)</mo><mo separator="true">,</mo></mrow>\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),\n' +
      // eslint-disable-next-line max-len
      '</math></span><span aria-hidden="true" class="katex-html"><span class="base"><span style="height:2.22225em;vertical-align:-0.86225em;" class="strut"></span><span style="margin-right:0.44445em;position:relative;top:-0.0011249999999999316em;" class="mop op-symbol large-op">∫</span><span style="margin-right:0.16666666666666666em;" class="mspace"></span><span style="margin-right:0.10764em;" class="mord mathdefault">f</span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">x</span></span><span class="mclose">)</span><span class="mord"><span class="mord"><span class="mord mathrm">d</span></span></span><span class="mord mathdefault">u</span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">x</span></span><span class="mclose">)</span><span class="mpunct">,</span></span></span></span></span></span>';

    expect(html).toEqual(resultExpected);
  });

  it("handles invalid latex source code", () => {
    const markdown =
      "This is a README with some LaTeX expressions that should render nicely:\n" +
      "\n" +
      "**Expression 1**\n" +
      "```math\n" +
      "\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),&\n" +
      "```\n";
    const html = sanitizedHTMLFromMarkdown(markdown);
    const resultExpected =
      "<p>This is a README with some LaTeX expressions that should render nicely:</p>\n" +
      "<p><strong>Expression 1</strong></p>\n" +
      // eslint-disable-next-line max-len
      '<span title="\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),&amp;"><span style="color:var(--bs-danger)" title="ParseError: KaTeX parse error: Expected \'EOF\', got \'&amp;\' at position 41: …}u(\\mathbf{x}),&amp;̲" class="katex-error">\\int f(\\mathbf{x}) {\\rm d}u(\\mathbf{x}),&amp;\n' +
      "</span></span>";
    expect(html).toEqual(resultExpected);
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
      expectedResult: "images/testImage1.png",
    },
    {
      relativePath: "./testImage2.png",
      localFilePath: ["folder2", "folder1"],
      expectedResult: "folder1/folder2/testImage2.png",
    },
    {
      relativePath: "../folder3/testImage3.png",
      localFilePath: ["folder2", "folder1"],
      expectedResult: "folder1/folder3/testImage3.png",
    },
  ];

  it("function fixRelativePath", () => {
    testCases.forEach((test) => {
      expect(fixRelativePath(test.relativePath, test.localFilePath)).toEqual(
        test.expectedResult
      );
    });
  });
});

describe("function formatBytes", () => {
  it("formatBytes", () => {
    expect(formatBytes(1551859712)).toEqual("1.45 GB");
    expect(formatBytes(1551859712, 1)).toEqual("1.4 GB");
    expect(formatBytes(5000)).toEqual("4.88 KB");
    expect(formatBytes(1100000, 0)).toEqual("1 MB");
    expect(formatBytes(1000000)).toEqual("976.56 KB");
    expect(formatBytes(-1000000)).toEqual("-976.56 KB");
    expect(formatBytes("aaa")).toEqual("NaN");
  });
});

describe("function refreshIfNecessary", () => {
  it("formatBytes", () => {
    const fakeFunction = () => {
      return true;
    };

    // fetch on falsy data
    expect(refreshIfNecessary(null, null, fakeFunction)).toBe(true);

    // Do not fetch when it's already fetching
    expect(refreshIfNecessary(true, null, fakeFunction)).toBeUndefined();
    expect(refreshIfNecessary(false, null, fakeFunction)).toBe(true);

    // Fetch only when outdated
    const fiveSecondsAgo = new Date(+new Date() - 5000);
    const fifteenSecondsAgo = new Date(+new Date() - 15000);
    expect(refreshIfNecessary(false, fifteenSecondsAgo, fakeFunction)).toBe(
      true
    );
    expect(
      refreshIfNecessary(true, fiveSecondsAgo, fakeFunction)
    ).toBeUndefined();

    // Tolerance
    expect(
      refreshIfNecessary(true, fiveSecondsAgo, fakeFunction, 50)
    ).toBeUndefined();
    expect(refreshIfNecessary(false, fiveSecondsAgo, fakeFunction, 2)).toBe(
      true
    );
  });
});
