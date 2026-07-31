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

import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";

import { GroupMemberResponseList } from "~/features/projectsV2/api/namespace.api";
import { ProjectMemberListResponse } from "~/features/projectsV2/api/projectV2.api";
import UserAvatar, { OverflowBadge } from "~/features/usersV2/show/UserAvatar";

// Size of the "+n" overflow badge
const OVERFLOW_BADGE_WIDTH = 44;
// Gap between member items
const MEMBER_GAP = 8;

interface MemberListRowProps {
  members: ProjectMemberListResponse | GroupMemberResponseList;
}

export default function MemberListRow({ members }: MemberListRowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const measuredWidths = useRef<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(members.length);
  // When the first member does not fit at full width, constrain it so the name can truncate.
  const [truncateMaxWidth, setTruncateMaxWidth] = useState<number | null>(null);

  const measureItemWidths = useCallback(() => {
    for (let i = 0; i < members.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      // Sum children so a truncated item still reports its natural width
      // (the item's own scrollWidth collapses to maxWidth when truncating).
      const avatar = el.children[0] as HTMLElement | undefined;
      const name = el.children[1] as HTMLElement | undefined;
      const innerGap =
        avatar && name
          ? parseFloat(
              getComputedStyle(el).columnGap || getComputedStyle(el).gap,
            ) || 0
          : 0;
      measuredWidths.current[i] =
        (avatar?.offsetWidth ?? 0) + innerGap + (name?.scrollWidth ?? 0);
    }
  }, [members.length]);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const total = members.length;
    let usedWidth = 0;
    let count = 0;

    for (let i = 0; i < total; i++) {
      const itemWidth = measuredWidths.current[i];
      if (itemWidth == null) continue;

      // Account for the gap before each item (except the first)
      const widthWithGap = i === 0 ? itemWidth : itemWidth + MEMBER_GAP;

      // Reserve space for the "+n" badge if there are members after this one
      const remaining = total - (count + 1);
      const needsBadge = remaining > 0;
      const reservedForBadge = needsBadge
        ? OVERFLOW_BADGE_WIDTH + MEMBER_GAP
        : 0;

      if (usedWidth + widthWithGap + reservedForBadge > containerWidth) {
        break;
      }

      usedWidth += widthWithGap;
      count++;
    }

    if (count === 0 && total > 0) {
      // Always show at least one member; cap width so text-truncate
      const reservedForBadge =
        total > 1 ? OVERFLOW_BADGE_WIDTH + MEMBER_GAP : 0;
      setVisibleCount(1);
      setTruncateMaxWidth(Math.max(0, containerWidth - reservedForBadge));
      return;
    }

    setVisibleCount(count);
    setTruncateMaxWidth(null);
  }, [members.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibleMembers = () => {
      measureItemWidths();
      recalculate();
    };

    // TODO: fix react-hooks/set-state-in-effect
    updateVisibleMembers();

    const observer = new ResizeObserver(() => {
      updateVisibleMembers();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [measureItemWidths, recalculate]);

  const hiddenCount = members.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-nowrap",
        "gap-2",
        "mb-0",
        "overflow-hidden",
        "position-relative",
      )}
      data-cy="member-list-row"
    >
      {members.map((member, index) => {
        const isHidden = index >= visibleCount;
        const shouldTruncate =
          !isHidden && truncateMaxWidth != null && index === 0;
        return (
          <div
            key={member.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={cx(
              "align-items-center",
              "d-flex",
              "gap-1",
              shouldTruncate ? "overflow-hidden" : "flex-shrink-0",
            )}
            style={
              isHidden
                ? {
                    visibility: "hidden",
                    position: "absolute",
                    pointerEvents: "none",
                  }
                : shouldTruncate
                  ? { maxWidth: truncateMaxWidth, minWidth: 0 }
                  : undefined
            }
          >
            <UserAvatar namespace={member.namespace ?? ""} />
            <span className={cx("text-truncate", "min-w-0")}>
              {member.first_name} {member.last_name}
            </span>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <OverflowBadge
          count={hiddenCount}
          hiddenMembers={members.slice(visibleCount)}
        />
      )}
    </div>
  );
}
