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
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CheckLg, Clipboard } from "react-bootstrap-icons";
import { DropdownItem } from "reactstrap";

const IDENTIFIER_COPIED_FEEDBACK_MS = 1_000;

interface CopyIdentifierMenuItemProps {
  clipboardText: string;
  dataCy: string;
  isMenuOpen: boolean;
  label: string;
  onClose: () => void;
  confirmationText?: string;
}

function clearFeedbackTimeout(timeoutRef: { current: number | null }) {
  if (timeoutRef.current == null) {
    return;
  }
  window.clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}

export default function CopyIdentifierMenuItem({
  clipboardText,
  dataCy,
  isMenuOpen,
  label,
  confirmationText,
  onClose,
}: CopyIdentifierMenuItemProps) {
  const [copied, setCopied] = useState(false);
  const [wasMenuOpen, setWasMenuOpen] = useState(isMenuOpen);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const feedbackRequestRef = useRef(0);

  if (wasMenuOpen !== isMenuOpen) {
    setWasMenuOpen(isMenuOpen);
    if (!isMenuOpen) {
      setCopied(false);
    }
  }

  useLayoutEffect(() => {
    if (isMenuOpen) {
      return;
    }
    feedbackRequestRef.current += 1;
    clearFeedbackTimeout(feedbackTimeoutRef);
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout(feedbackTimeoutRef);
    };
  }, []);

  const copyIdentifier = useCallback(() => {
    const requestId = feedbackRequestRef.current;
    window.navigator.clipboard
      .writeText(clipboardText)
      .then(() => {
        if (requestId !== feedbackRequestRef.current) {
          return;
        }
        setCopied(true);
        clearFeedbackTimeout(feedbackTimeoutRef);
        feedbackTimeoutRef.current = window.setTimeout(() => {
          if (requestId !== feedbackRequestRef.current) {
            return;
          }
          onClose();
        }, IDENTIFIER_COPIED_FEEDBACK_MS);
      })
      .catch(() => undefined);
  }, [clipboardText, onClose]);

  return (
    <DropdownItem data-cy={dataCy} onClick={copyIdentifier} toggle={false}>
      <span className={cx("d-flex", "gap-1", "align-items-baseline")}>
        {copied ? (
          <CheckLg aria-hidden="true" className="bi" />
        ) : (
          <Clipboard aria-hidden="true" className="bi" />
        )}
        <span className={cx("d-flex", "flex-column", "min-w-0")}>
          {!copied && <span>{label}</span>}
          <span className={cx(!copied && "visually-hidden")} role="status">
            {copied ? confirmationText : ""}
          </span>
          <code
            className={cx("d-block", "small", "text-truncate")}
            style={{ maxWidth: "200px" }}
            title={clipboardText}
          >
            {clipboardText}
          </code>
        </span>
      </span>
    </DropdownItem>
  );
}
