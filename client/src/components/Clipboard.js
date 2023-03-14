/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useEffect, useRef, useState } from "react";
import ReactClipboard from "react-clipboard.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

/**
 * Clipboard
 *
 * A component that copies text to the clipboard
 * @param {string} [clipboardText] - Text to copy to the clipboard
 */
function Clipboard(props) {
  const [copied, setCopied] = useState(false);
  const timeoutDur = 3000;

  // keep track of mounted state
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  let className = "";
  if (props.className)
    className += ` ${props.className}`;

  return (
    <ReactClipboard component="a"
      data-clipboard-text={props.clipboardText}
      onSuccess={
        () => { setCopied(true); setTimeout(() => { if (isMounted.current) setCopied(false); }, timeoutDur); }
      }
      className={className}
      style={{ textDecoration: "none" }}
    > {
        (copied) ?
          <FontAwesomeIcon icon={faCheck} color="success" /> :
          <FontAwesomeIcon icon={faCopy} />
      }
    </ReactClipboard>
  );
}

export { Clipboard };
