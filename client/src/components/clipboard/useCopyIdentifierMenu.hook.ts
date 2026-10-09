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

import useCopyToClipboard from "~/components/clipboard/useCopyToClipboard.hook";

const IDENTIFIER_COPIED_FEEDBACK_MS = 1_000;
export function useCopyIdentifierMenu(clipboardText: string) {
  const { copy } = useCopyToClipboard(clipboardText);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [identifierCopied, setIdentifierCopied] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const isMenuOpenRef = useRef(isMenuOpen);

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current == null) {
      return;
    }
    window.clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    clearFeedbackTimeout();
    isMenuOpenRef.current = false;
    setIdentifierCopied(false);
    setIsMenuOpen(false);
  }, [clearFeedbackTimeout]);

  const toggleMenu = useCallback(() => {
    if (isMenuOpenRef.current) {
      closeMenu();
      return;
    }
    isMenuOpenRef.current = true;
    setIsMenuOpen(true);
  }, [closeMenu]);

  const copyIdentifier = useCallback(() => {
    copy()
      .then(() => {
        if (!isMenuOpenRef.current) {
          return;
        }
        setIdentifierCopied(true);
        clearFeedbackTimeout();
        feedbackTimeoutRef.current = window.setTimeout(() => {
          closeMenu();
        }, IDENTIFIER_COPIED_FEEDBACK_MS);
      })
      .catch(() => undefined);
  }, [clearFeedbackTimeout, closeMenu, copy]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout();
    };
  }, [clearFeedbackTimeout]);

  return { copyIdentifier, identifierCopied, isMenuOpen, toggleMenu };
}
