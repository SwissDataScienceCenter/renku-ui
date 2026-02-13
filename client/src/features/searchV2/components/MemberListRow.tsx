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

import UserAvatar from "~/features/usersV2/show/UserAvatar";

// Size of the "+n" overflow badge (matches UserAvatar sm size + gap)
const OVERFLOW_BADGE_WIDTH = 44;
// Gap between member items (Bootstrap gap-2 = 0.5rem = 8px)
const MEMBER_GAP = 8;

interface MemberListRowProps {
  members: {
    id: string;
    namespace?: string;
    first_name?: string;
    last_name?: string;
  }[];
}

export default function MemberListRow({ members }: MemberListRowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const measuredWidths = useRef<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(members.length);

  const measureItemWidths = useCallback(() => {
    for (let i = 0; i < members.length; i++) {
      const el = itemRefs.current[i];
      if (el) {
        measuredWidths.current[i] = el.scrollWidth;
      }
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

    setVisibleCount(Math.max(1, count));
  }, [members.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    measureItemWidths();
    recalculate();

    const observer = new ResizeObserver(() => {
      recalculate();
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
        "position-relative"
      )}
    >
      {members.map((member, index) => {
        const isHidden = index >= visibleCount;
        return (
          <div
            key={member.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-shrink-0",
              "gap-1"
            )}
            style={
              isHidden
                ? {
                    visibility: "hidden",
                    position: "absolute",
                    pointerEvents: "none",
                  }
                : undefined
            }
          >
            <UserAvatar namespace={member.namespace ?? ""} />
            <span className="text-truncate">
              {member.first_name} {member.last_name}
            </span>
          </div>
        );
      })}
      {hiddenCount > 0 && <OverflowBadge count={hiddenCount} />}
    </div>
  );
}

function OverflowBadge({ count }: { count: number }) {
  return (
    <div
      className={cx(
        "align-content-center",
        "border",
        "flex-shrink-0",
        "rounded-circle",
        "text-center",
        "text-black"
      )}
      style={{
        backgroundColor: "#dee2e6",
        width: 28,
        height: 28,
        fontSize: 12,
      }}
    >
      +{count}
    </div>
  );
}
