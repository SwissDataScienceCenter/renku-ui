/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Clipboard.js
 *  Clipboard code and presentation.
 */

import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactClipboard from "react-clipboard.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

const COPY_TIMEOUT_MS = 3_000;

interface ClipboardProps {
  className?: string;
  clipboardText: string;
  children?: ReactNode;
}

export const Clipboard = ({
  className,
  clipboardText,
  children,
}: ClipboardProps) => {
  const [copied, setCopied] = useState(false);

  const currentTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (currentTimeoutRef.current) {
        window.clearTimeout(currentTimeoutRef.current);
      }
    };
  }, []);

  const onSuccess = useCallback(() => {
    currentTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, COPY_TIMEOUT_MS);
    setCopied(true);
  }, []);

  const Wrap = children
    ? ({ children }: { children?: ReactNode }) => (
        <span className="btn-icon-text">{children}</span>
      )
    : Fragment;

  return (
    <ReactClipboard
      component="a"
      data-clipboard-text={clipboardText}
      onSuccess={onSuccess}
      className={className}
      style={{ textDecoration: "none" }}
    >
      <Wrap>
        {copied ? (
          <FontAwesomeIcon icon={faCheck} size="1x" style={{ minWidth: 16 }} />
        ) : (
          <FontAwesomeIcon icon={faCopy} size="1x" style={{ minWidth: 16 }} />
        )}
        {children}
      </Wrap>
    </ReactClipboard>
  );
};
