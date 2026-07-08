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

import Anser, { type AnserJsonEntry } from "anser";
import cx from "classnames";
import { useMemo } from "react";

import styles from "./ColoredLogs.module.scss";

interface ColoredLogsProps {
  children?: string;
}

export default function ColoredLogs({ children }: ColoredLogsProps) {
  const logLines = useMemo(
    () =>
      children
        ? children
            .split("\n")
            .map((line, idx, arr) =>
              idx == arr.length - 1 ? line : `${line}\n`,
            )
        : null,
    [children],
  );

  if (!logLines) {
    return null;
  }

  return (
    <>
      {logLines.map((line, idx) => (
        <ColoredLogLine key={idx}>{line}</ColoredLogLine>
      ))}
    </>
  );
}

interface ColoredLogLineProps {
  children: string;
}

function ColoredLogLine({ children }: ColoredLogLineProps) {
  const parsedLine = useMemo(() => {
    try {
      // eslint-disable-next-line spellcheck/spell-checker
      return Anser.ansiToJson(children, {
        json: true,
        remove_empty: true,
        use_classes: true,
      });
    } catch {
      return null;
    }
  }, [children]);

  // Display the raw line if we failed to parse the ANSI escape codes
  if (parsedLine == null) {
    return children;
  }

  return (
    <>
      {parsedLine.map((entry, idx) => (
        <ColoredEntry key={idx} entry={entry} />
      ))}
    </>
  );
}

interface ColoredEntryProps {
  entry: AnserJsonEntry;
}

function ColoredEntry({ entry }: ColoredEntryProps) {
  const decorationClassNames = entry.decorations.map(
    (dec) => `${styles.logLine}-decorations-${dec}`,
  );
  const fgClassName = entry.fg ? `${styles.logLine}-fg-${entry.fg}` : null;
  const bgClassName = entry.bg ? `${styles.logLine}-bg-${entry.bg}` : null;

  return (
    <span
      className={cx(
        styles.logLine,
        decorationClassNames,
        fgClassName,
        bgClassName,
      )}
    >
      {entry.content}
    </span>
  );
}
