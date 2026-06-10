/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { describe, expect, it } from "vitest";

import {
  buildLauncherHash,
  buildLauncherJobHash,
  getJobAccordionTargetId,
  isLauncherHashOpen,
  parseLauncherHash,
  resolveOpenJobSubmissionId,
  toggleLauncherHash,
} from "./session.utils";

describe("launcher hash utils", () => {
  const launcherId = "abc-123";
  const submissionId = "run-test01";

  it("builds launcher hash", () => {
    expect(buildLauncherHash(launcherId)).toBe("launcher-abc-123");
  });

  it("builds launcher job hash", () => {
    expect(buildLauncherJobHash(launcherId, submissionId)).toBe(
      "launcher-abc-123/job/run-test01"
    );
  });

  it("parses launcher hash without job", () => {
    expect(parseLauncherHash("launcher-abc-123")).toEqual({
      launcherId: "abc-123",
    });
  });

  it("parses launcher hash with job", () => {
    expect(parseLauncherHash("launcher-abc-123/job/run-test01")).toEqual({
      launcherId: "abc-123",
      submissionId: "run-test01",
    });
  });

  it("returns empty parse result for unrelated hash", () => {
    expect(parseLauncherHash("orphan-session-foo")).toEqual({});
  });

  it("detects open launcher hash", () => {
    expect(isLauncherHashOpen("launcher-abc-123", launcherId)).toBe(true);
    expect(
      isLauncherHashOpen("launcher-abc-123/job/run-test01", launcherId)
    ).toBe(true);
    expect(isLauncherHashOpen("launcher-other", launcherId)).toBe(false);
  });

  it("maps submission id to accordion target id", () => {
    expect(getJobAccordionTargetId(submissionId)).toBe("job-run-test01");
  });

  it("resolves hash submission id when job exists", () => {
    expect(
      resolveOpenJobSubmissionId(submissionId, [
        { submission_id: submissionId },
      ])
    ).toBe(submissionId);
  });

  it("ignores invalid hash submission id", () => {
    expect(
      resolveOpenJobSubmissionId("missing-job", [
        { submission_id: submissionId },
      ])
    ).toBeUndefined();
  });

  it("auto-opens single job when hash has no submission id", () => {
    expect(
      resolveOpenJobSubmissionId(undefined, [{ submission_id: submissionId }])
    ).toBe(submissionId);
  });

  it("does not auto-open when multiple jobs exist", () => {
    expect(
      resolveOpenJobSubmissionId(undefined, [
        { submission_id: "run-one" },
        { submission_id: "run-two" },
      ])
    ).toBeUndefined();
  });

  it("toggles launcher hash", () => {
    expect(toggleLauncherHash("", launcherId)).toBe("launcher-abc-123");
    expect(toggleLauncherHash("launcher-abc-123", launcherId)).toBe("");
    expect(
      toggleLauncherHash("launcher-abc-123/job/run-test01", launcherId)
    ).toBe("launcher-abc-123");
    expect(toggleLauncherHash("launcher-other", launcherId)).toBe(
      "launcher-abc-123"
    );
  });
});
