/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { sanitizedHTMLFromMarkdown } from "./markdown.utils";

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
