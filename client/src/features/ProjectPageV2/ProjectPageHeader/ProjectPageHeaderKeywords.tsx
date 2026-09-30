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
import {
  HTMLAttributes,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Bookmarks } from "react-bootstrap-icons";

import KeywordBadge, {
  KeywordBadgeContent,
} from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";

import styles from "../../../components/Separator.module.scss";

const KEYWORDS_DATA_CY = "project-header-keywords";

function useKeywordsInline({
  enabled,
  keywords,
  rowRef,
  metadataRef,
  measureRef,
}: {
  enabled: boolean;
  keywords: string[];
  rowRef: RefObject<HTMLDivElement>;
  metadataRef: RefObject<HTMLDivElement>;
  measureRef: RefObject<HTMLDivElement>;
}): boolean | null {
  const [inline, setInline] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    if (!enabled || keywords.length < 1) return;

    const row = rowRef.current;
    const metadata = metadataRef.current;
    const keywordsMeasure = measureRef.current;
    if (row == null || metadata == null || keywordsMeasure == null) return;

    const measure = () => {
      const available = row.clientWidth - metadata.offsetWidth;
      const fits = keywordsMeasure.offsetWidth <= available;
      setInline((current) => (current === fits ? current : fits));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(metadata);
    observer.observe(keywordsMeasure);
    return () => observer.disconnect();
  }, [enabled, keywords, measureRef, metadataRef, rowRef]);

  if (!enabled) return null;
  return inline;
}

export function useProjectPageHeaderKeywords(keywords: string[] | undefined) {
  const hasKeywords = !!keywords?.length && keywords.length > 0;
  const keywordsSorted = useMemo(() => {
    if (!keywords) return [];
    return keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [keywords]);
  const rowRef = useRef<HTMLDivElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const keywordsInline = useKeywordsInline({
    enabled: hasKeywords,
    keywords: keywordsSorted,
    rowRef,
    metadataRef,
    measureRef,
  });

  return {
    hasKeywords,
    keywordsInline,
    keywordsSorted,
    measureRef,
    metadataRef,
    rowRef,
  };
}

const keywordMeasureProps = {
  "aria-hidden": true,
  inert: true,
} as HTMLAttributes<HTMLDivElement>;

const KEYWORD_MEASURE_STYLE = { width: "max-content" } as const;

interface ProjectPageHeaderKeywordsProps {
  keywordsSorted: string[];
  leadingSeparator?: boolean;
  measureRef?: RefObject<HTMLDivElement>; // Passing the ref is what switches this instance into the off-screen measurement row. The visible keyword rows omit it
  wrapBadges?: boolean;
}

export default function ProjectPageHeaderKeywords({
  keywordsSorted,
  leadingSeparator = false,
  measureRef,
  wrapBadges = false,
}: ProjectPageHeaderKeywordsProps) {
  const measuring = measureRef != null;
  const row = (
    <div
      ref={measureRef}
      {...(measuring ? keywordMeasureProps : {})}
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-row",
        "gap-1",
        measuring && "flex-nowrap",
        measuring && "invisible",
        measuring && "position-absolute",
        !measuring && "col-12",
        !measuring && (wrapBadges ? "min-w-0" : "col-md-auto"),
        !measuring && !wrapBadges && "flex-shrink-0",
        leadingSeparator && styles.leadingSeparator,
      )}
      data-cy={measuring ? undefined : KEYWORDS_DATA_CY}
      style={measuring ? KEYWORD_MEASURE_STYLE : undefined}
    >
      {keywordsSorted.length > 0 && (
        <KeywordContainer
          className={cx("mt-1", !measuring && wrapBadges && "min-w-0")}
          nowrap={measuring}
        >
          <Bookmarks className={cx("bi", "flex-shrink-0")} />
          {keywordsSorted.map((keyword, index) =>
            measuring ? (
              <KeywordBadgeContent key={`keyword-${index}`}>
                {keyword}
              </KeywordBadgeContent>
            ) : (
              <KeywordBadge key={`keyword-${index}`} searchKeyword={keyword}>
                {keyword}
              </KeywordBadge>
            ),
          )}
        </KeywordContainer>
      )}
    </div>
  );

  if (!measuring) return row;
  return (
    <div
      className={cx(
        "h-0",
        "overflow-hidden",
        "pe-none",
        "position-absolute",
        "start-0",
        "top-0",
        "w-0",
      )}
    >
      {row}
    </div>
  );
}
