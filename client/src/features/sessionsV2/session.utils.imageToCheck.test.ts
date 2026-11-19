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

import type {
  EnvironmentList,
  SessionLauncher,
} from "./api/sessionLaunchersV2.api";
import { BUILDER_IMAGE_NOT_READY_VALUE } from "./session.constants";
import {
  getLauncherFormImageToCheck,
  getLauncherImageToCheck,
} from "./session.utils";

function launcherWith(
  environment: object,
): Pick<SessionLauncher, "environment"> {
  return { environment } as Pick<SessionLauncher, "environment">;
}

describe("getLauncherImageToCheck", () => {
  it("uses the container image when there is one", () => {
    expect(
      getLauncherImageToCheck(
        launcherWith({
          environment_image_source: "image",
          container_image: "renku/python:latest",
        }),
      ),
    ).toEqual({ containerImage: "renku/python:latest" });
  });

  it("uses the built image once a build has produced one", () => {
    expect(
      getLauncherImageToCheck(
        launcherWith({
          environment_image_source: "build",
          container_image: "registry/built:abc",
          build_parameters: { platforms: ["linux/arm64"] },
        }),
      ),
    ).toEqual({ containerImage: "registry/built:abc" });
  });

  it.each([undefined, BUILDER_IMAGE_NOT_READY_VALUE])(
    "falls back to the build platforms when the image is %s",
    (containerImage) => {
      expect(
        getLauncherImageToCheck(
          launcherWith({
            environment_image_source: "build",
            container_image: containerImage,
            build_parameters: { platforms: ["linux/arm64"] },
          }),
        ),
      ).toEqual({ platforms: ["linux/arm64"] });
    },
  );

  it("returns nothing when neither an image nor build platforms exist", () => {
    expect(
      getLauncherImageToCheck(
        launcherWith({
          environment_image_source: "build",
          build_parameters: {},
        }),
      ),
    ).toBeUndefined();
  });
});

describe("getLauncherFormImageToCheck", () => {
  const globalEnvironments = [
    { id: "ENV1", container_image: "renku/global:1" },
  ] as EnvironmentList;
  const emptyForm = {
    environmentId: "",
    container_image: "",
    platform: "",
  };

  it("resolves a global environment to its image", () => {
    expect(
      getLauncherFormImageToCheck(
        { ...emptyForm, environmentSelect: "global", environmentId: "ENV1" },
        globalEnvironments,
      ),
    ).toEqual({ containerImage: "renku/global:1" });
  });

  it("returns nothing for an unknown global environment", () => {
    expect(
      getLauncherFormImageToCheck(
        { ...emptyForm, environmentSelect: "global", environmentId: "NOPE" },
        globalEnvironments,
      ),
    ).toBeUndefined();
  });

  it("uses the typed image for a custom image environment", () => {
    expect(
      getLauncherFormImageToCheck(
        {
          ...emptyForm,
          environmentSelect: "custom + image",
          container_image: "  my/image:tag ",
        },
        globalEnvironments,
      ),
    ).toEqual({ containerImage: "my/image:tag" });
    expect(
      getLauncherFormImageToCheck(
        { ...emptyForm, environmentSelect: "custom + image" },
        globalEnvironments,
      ),
    ).toBeUndefined();
  });

  it("uses the build platform for a build environment", () => {
    expect(
      getLauncherFormImageToCheck(
        {
          ...emptyForm,
          environmentSelect: "custom + build",
          platform: "linux/arm64",
        },
        globalEnvironments,
      ),
    ).toEqual({ platforms: ["linux/arm64"] });
  });
});
