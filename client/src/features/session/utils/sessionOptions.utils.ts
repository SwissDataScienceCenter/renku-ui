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

import { clamp } from "lodash";

import { ProjectStatistics } from "../../../notebooks/components/session.types";
import { MIN_SESSION_STORAGE_GB } from "../startSessionOptions.constants";

const ONE_GB_IN_BYTES = 1_000_000_000;

interface ValidateStorageAmountArgs {
  value: number;
  maxValue: number;
}

export function validateStorageAmount({
  value,
  maxValue,
}: ValidateStorageAmountArgs) {
  return isNaN(value)
    ? MIN_SESSION_STORAGE_GB
    : clamp(Math.round(value), MIN_SESSION_STORAGE_GB, maxValue);
}

interface CheckStorageArgs {
  lfsAutoFetch: boolean;
  statistics: ProjectStatistics | null | undefined;
}

/**
 * Computes rounded up storage sizes needed to start a session.
 * @returns the minimum amount of storage and the recommended
 * amount of storage.
 *
 * Note: It is not possible to accurately compute the storage
 * sizes when a repository uses LFS. In this case, we assume
 * the worst case scenario, i.e. all objects are required at HEAD.
 */
export function computeStorageSizes({
  lfsAutoFetch,
  statistics,
}: CheckStorageArgs) {
  if (!statistics) {
    return null;
  }

  const { lfs_objects_size, repository_size } = statistics;

  if (lfs_objects_size == null || repository_size == null) {
    return null;
  }

  // ? With git LFS, objects are stored twice: once in their intended location and once in .git/lfs.
  const minimumStorage = lfsAutoFetch
    ? 2 * lfs_objects_size + repository_size
    : repository_size;
  const recommendedStorage =
    minimumStorage + (lfsAutoFetch ? 0 : lfs_objects_size) + ONE_GB_IN_BYTES;

  const minimumStorageGb = Math.ceil(minimumStorage / ONE_GB_IN_BYTES);
  const recommendedStorageGb = Math.ceil(recommendedStorage / ONE_GB_IN_BYTES);

  return { minimumStorageGb, recommendedStorageGb };
}

interface ComputeRequestedStorageSizeArgs {
  defaultStorage: number;
  lfsAutoFetch: boolean;
  maxStorage: number;
  statistics: ProjectStatistics | null | undefined;
}

/**
 * Computes the storage size to request in the auto-start flow.
 *
 * We want to return the clamped recommended storage
 * (i.e. max(recommended, maxStorage)) when this value is
 * greater than the default and greater than the minimum needed
 * for the session.
 *
 * The minimum storage value is not clamped so that we can interrupt
 * the auto-start flow when that value exceeds the amount of
 * available storage.
 */
export function computeRequestedStorageSize({
  defaultStorage,
  lfsAutoFetch,
  maxStorage,
  statistics,
}: ComputeRequestedStorageSizeArgs) {
  const sizes = computeStorageSizes({ lfsAutoFetch, statistics });

  if (sizes == null) {
    return defaultStorage;
  }

  const { minimumStorageGb, recommendedStorageGb } = sizes;
  const clampedRecommended = validateStorageAmount({
    value: recommendedStorageGb,
    maxValue: maxStorage,
  });

  if (
    clampedRecommended > defaultStorage &&
    clampedRecommended > minimumStorageGb
  ) {
    return clampedRecommended;
  }

  if (minimumStorageGb > defaultStorage) {
    return minimumStorageGb;
  }

  return defaultStorage;
}
