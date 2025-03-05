/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { ProjectStatistics } from "../../../notebooks/components/session.types";
import { MIN_SESSION_STORAGE_GB } from "../startSessionOptions.constants";
import {
  computeRequestedStorageSize,
  computeStorageSizes,
  validateStorageAmount,
} from "./sessionOptions.utils";

const ONE_GB_IN_BYTES = 1_000_000_000;

describe("Test the sessionOptions.utils functions", () => {
  describe("validateStorageAmount()", () => {
    it("is always less than maxValue", () => {
      const iterations = 1_000;

      for (let it = 0; it < iterations; ++it) {
        const value = Math.random() * 100;
        const maxValue = 1 + Math.round(Math.random() * 100);

        const storage = validateStorageAmount({ value, maxValue });

        expect(storage).toBe(Math.round(storage));
        expect(storage).toBeLessThanOrEqual(maxValue);
        if (MIN_SESSION_STORAGE_GB < value && value < maxValue) {
          expect(storage).toBe(Math.round(value));
        }
      }
    });

    it("is always at least MIN_SESSION_STORAGE_GB", () => {
      const iterations = 1_000;

      for (let it = 0; it < iterations; ++it) {
        const value = Math.random() * 100;
        const maxValue = 1 + Math.round(Math.random() * 100);

        const storage = validateStorageAmount({ value, maxValue });

        expect(storage).toBeGreaterThanOrEqual(MIN_SESSION_STORAGE_GB);
      }
    });
  });

  describe("computeStorageSizes()", () => {
    it("returns null if statistics are not available", () => {
      const lfsAutoFetchValues = [true, false];

      for (const key in lfsAutoFetchValues) {
        const lfsAutoFetch = lfsAutoFetchValues[key];

        const result = computeStorageSizes({ lfsAutoFetch, statistics: null });

        expect(result).toBeNull();
      }
    });

    it("computes storage sizes without LFS auto-fetch", () => {
      const iterations = 1_000;

      for (let it = 0; it < iterations; ++it) {
        const statistics: ProjectStatistics = {
          repository_size: 1 + Math.round(Math.random() * 100),
          lfs_objects_size: 1 + Math.round(Math.random() * 100),
        };

        const { minimumStorageGb, recommendedStorageGb } =
          computeStorageSizes({ lfsAutoFetch: false, statistics }) ?? {};

        expect(minimumStorageGb).toBeTruthy();
        expect(minimumStorageGb).toBeGreaterThanOrEqual(1);

        expect(recommendedStorageGb).toBeTruthy();
        expect(recommendedStorageGb).toBeGreaterThanOrEqual(1);
        if (recommendedStorageGb != null) {
          expect(minimumStorageGb).toBeLessThanOrEqual(recommendedStorageGb);
        }
      }
    });

    it("computes storage sizes with LFS auto-fetch", () => {
      const iterations = 1_000;

      for (let it = 0; it < iterations; ++it) {
        const statistics: ProjectStatistics = {
          repository_size: 1 + Math.round(Math.random() * 100),
          lfs_objects_size: 1 + Math.round(Math.random() * 100),
        };

        const { minimumStorageGb, recommendedStorageGb } =
          computeStorageSizes({ lfsAutoFetch: true, statistics }) ?? {};

        expect(minimumStorageGb).toBeTruthy();
        expect(minimumStorageGb).toBeGreaterThanOrEqual(1);

        expect(recommendedStorageGb).toBeTruthy();
        expect(recommendedStorageGb).toBeGreaterThanOrEqual(1);
        if (recommendedStorageGb != null) {
          expect(minimumStorageGb).toBeLessThanOrEqual(recommendedStorageGb);
        }
      }
    });
  });

  describe("computeStorageSizes()", () => {
    it("computes the storage size to request", () => {
      const iterations = 1_000;

      for (let it = 0; it < iterations; ++it) {
        const statistics: ProjectStatistics & {
          [P in keyof ProjectStatistics]-?: number;
        } = {
          repository_size: 1 + Math.round(Math.random() * ONE_GB_IN_BYTES),
          lfs_objects_size: 1 + Math.round(Math.random() * 5 * ONE_GB_IN_BYTES),
        };

        const requestedStorage = computeRequestedStorageSize({
          defaultStorage: 2,
          lfsAutoFetch: false,
          maxStorage: 8,
          statistics,
        });

        expect(requestedStorage).toBeTruthy();
        expect(requestedStorage).toBeGreaterThanOrEqual(MIN_SESSION_STORAGE_GB);

        if (statistics.repository_size > 8 * ONE_GB_IN_BYTES) {
          expect(requestedStorage).toBeGreaterThan(8);
        } else {
          expect(requestedStorage).toBeLessThanOrEqual(8);
        }

        expect(requestedStorage).toBeGreaterThanOrEqual(
          Math.min(2, statistics.repository_size)
        );
      }
    });
  });
});
