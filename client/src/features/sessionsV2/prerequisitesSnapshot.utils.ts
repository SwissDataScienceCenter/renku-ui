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

import type {
  PrerequisitesNewEntries,
  PrerequisitesSnapshot,
  PrerequisitesSnapshotItem,
  PrerequisitesSnapshotStep,
} from "./prerequisitesSnapshot.types";

export function mergeSnapshotOnRefresh(
  current: PrerequisitesSnapshot,
  next: PrerequisitesSnapshot,
  stepOrder: readonly string[],
): PrerequisitesSnapshot {
  const currentById = new Map(current.steps.map((step) => [step.id, step]));
  const nextById = new Map(next.steps.map((step) => [step.id, step]));
  const stepIds = orderStepIds(
    [...currentById.keys(), ...nextById.keys()],
    stepOrder,
  );

  return {
    steps: stepIds.map((stepId) =>
      mergeStep(stepId, currentById.get(stepId), nextById.get(stepId)),
    ),
  };
}

function orderStepIds(ids: string[], stepOrder: readonly string[]): string[] {
  const pending = new Set(ids);
  const ordered: string[] = [];
  for (const id of stepOrder) {
    if (pending.delete(id)) {
      ordered.push(id);
    }
  }
  for (const id of pending) {
    ordered.push(id);
  }
  return ordered;
}

function mergeStep(
  stepId: string,
  current: PrerequisitesSnapshotStep | undefined,
  next: PrerequisitesSnapshotStep | undefined,
): PrerequisitesSnapshotStep {
  if (current == null) {
    return next ?? { id: stepId, items: [] };
  }
  if (next == null) {
    return current;
  }

  const nextById = new Map(next.items.map((item) => [item.id, item]));
  const items: PrerequisitesSnapshotItem[] = current.items.map((item) => {
    const refreshed = nextById.get(item.id);
    if (refreshed == null) {
      return item;
    }
    return {
      id: item.id,
      label: refreshed.label,
      detail: refreshed.detail,
    };
  });
  const seen = new Set(items.map((item) => item.id));
  for (const item of next.items) {
    if (!seen.has(item.id)) {
      items.push(item);
    }
  }
  return { id: stepId, items };
}

export function getNewSnapshotEntries(
  snapshot: PrerequisitesSnapshot,
  liveSnapshot: PrerequisitesSnapshot,
  isFetching: boolean,
): PrerequisitesNewEntries | null {
  if (isFetching) {
    return null;
  }

  const snapshotStepIds = new Set(snapshot.steps.map((step) => step.id));
  const stepIds = liveSnapshot.steps
    .map((step) => step.id)
    .filter((id) => !snapshotStepIds.has(id));

  const itemIdsByStep: Record<string, string[]> = {};
  for (const liveStep of liveSnapshot.steps) {
    const snapshotStep = snapshot.steps.find((step) => step.id === liveStep.id);
    if (snapshotStep == null) {
      continue;
    }
    const knownIds = new Set(snapshotStep.items.map((item) => item.id));
    const added = liveStep.items
      .map((item) => item.id)
      .filter((id) => !knownIds.has(id));
    if (added.length > 0) {
      itemIdsByStep[liveStep.id] = added;
    }
  }

  if (stepIds.length === 0 && Object.keys(itemIdsByStep).length === 0) {
    return null;
  }
  return { stepIds, itemIdsByStep };
}

export function getSnapshotStepCounts(
  step: PrerequisitesSnapshotStep,
  isItemResolved: (itemId: string) => boolean,
): { resolved: number; total: number } {
  return {
    total: step.items.length,
    resolved: step.items.filter((item) => isItemResolved(item.id)).length,
  };
}

export function unresolvedItemIds(
  step: PrerequisitesSnapshotStep | undefined,
  isItemResolved: (itemId: string) => boolean,
): string[] {
  if (step == null) {
    return [];
  }
  return step.items
    .filter((item) => !isItemResolved(item.id))
    .map((item) => item.id);
}

export function findSnapshotStep(
  snapshot: PrerequisitesSnapshot,
  stepId: string,
): PrerequisitesSnapshotStep | undefined {
  return snapshot.steps.find((step) => step.id === stepId);
}

export function isPendingListItemResolved(
  itemId: string,
  stepReady: boolean,
  pendingIds: ReadonlySet<string>,
): boolean {
  return stepReady || !pendingIds.has(itemId);
}
