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

import { skipToken } from "@reduxjs/toolkit/query";

import { useGetSessionsImagesQuery } from "./api/sessionsV2.api";
import { BUILDER_IMAGE_NOT_READY_VALUE } from "./session.constants";
import type { ImageToCheck } from "./sessionsV2.types";

export interface ImagePlatformCompatibility {
  isCompatible?: boolean;
  imagePlatforms?: string[];
  isLoading: boolean;
}

export default function useImagePlatformCompatibility(
  image: ImageToCheck | undefined,
  platform: string | undefined,
): ImagePlatformCompatibility {
  const containerImage =
    image &&
    "containerImage" in image &&
    image.containerImage &&
    image.containerImage !== BUILDER_IMAGE_NOT_READY_VALUE
      ? image.containerImage
      : undefined;
  const { data, isFetching } = useGetSessionsImagesQuery(
    containerImage && platform ? { imageUrl: containerImage } : skipToken,
  );

  const isBuild = image && "platforms" in image;
  const imagePlatforms = isBuild
    ? image.platforms
    : data?.platforms?.map(({ os, architecture }) => `${os}/${architecture}`);
  const isCompatible =
    platform == null || imagePlatforms == null || imagePlatforms.length === 0
      ? undefined
      : imagePlatforms.includes(platform);

  return { isCompatible, imagePlatforms, isLoading: isFetching };
}
