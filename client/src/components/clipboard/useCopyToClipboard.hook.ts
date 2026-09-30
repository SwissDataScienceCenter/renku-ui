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

import { useCallback, useEffect, useRef, useState } from "react";

const COPY_TIMEOUT_MS = 3_000;

function useCopiedIndicator() {
  const [copied, setCopied] = useState(false);
  const currentTimeoutRef = useRef<number | null>(null);

  const markCopied = useCallback(() => {
    if (currentTimeoutRef.current != null) {
      window.clearTimeout(currentTimeoutRef.current);
    }
    currentTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, COPY_TIMEOUT_MS);
    setCopied(true);
  }, []);

  useEffect(() => {
    return () => {
      if (currentTimeoutRef.current != null) {
        window.clearTimeout(currentTimeoutRef.current);
      }
    };
  }, []);

  return { copied, markCopied };
}

export default function useCopyToClipboard(clipboardText: string) {
  const { copied, markCopied } = useCopiedIndicator();
  const copy = useCallback(() => {
    window.navigator.clipboard.writeText(clipboardText).then(() => {
      markCopied();
    });
  }, [clipboardText, markCopied]);

  return { copied, copy };
}
