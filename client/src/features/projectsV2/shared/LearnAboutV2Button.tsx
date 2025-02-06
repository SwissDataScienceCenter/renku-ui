/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import cx from "classnames";
import { ExternalLink } from "../../../components/ExternalLinks";

interface LearnAboutV2ButtonProps {
  outline?: boolean;
  color?: string;
}
export default function LearnAboutV2Button({
  outline = false,
  color = "light",
}: LearnAboutV2ButtonProps) {
  return (
    <ExternalLink
      className={cx(
        "btn",
        "btn-sm",
        outline ? `btn-outline-${color}` : `btn-${color}`,
        "text-decoration-none"
      )}
      url="https://blog.renkulab.io/early-access/"
    >
      Learn more about Renku 2.0
    </ExternalLink>
  );
}
