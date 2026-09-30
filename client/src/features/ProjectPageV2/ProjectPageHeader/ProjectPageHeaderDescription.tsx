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
import { useId, useLayoutEffect, useRef, useState } from "react";

import styles from "./ProjectPageHeaderDescription.module.scss";

interface ProjectPageHeaderDescriptionProps {
  description: string;
}

export default function ProjectPageHeaderDescription({
  description,
}: ProjectPageHeaderDescriptionProps) {
  const textId = useId();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const textElement = textRef.current;
    if (textElement == null || expanded) return;

    const check = () =>
      setOverflowing(textElement.scrollHeight > textElement.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(textElement);
    return () => observer.disconnect();
  }, [description, expanded]);

  const showToggle = overflowing || expanded;

  return (
    <div className="min-w-0">
      <p
        ref={textRef}
        id={textId}
        className={cx(
          "mb-0",
          "min-w-0",
          styles.description,
          !expanded && styles.descriptionClamped,
        )}
        data-cy="project-description"
      >
        {showToggle && (
          <button
            type="button"
            className={cx(
              styles.descriptionToggle,
              "small",
              "text-decoration-underline",
            )}
            aria-expanded={expanded}
            aria-controls={textId}
            onClick={() => setExpanded((value) => !value)}
            data-cy="project-description-toggle"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        {description}
      </p>
    </div>
  );
}
