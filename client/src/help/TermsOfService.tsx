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
 * limitations under the License.
 */

import type { AppParams } from "../utils/context/appParams.types";

import { WarnAlert } from "../components/Alert";
import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";

type TermsProps = {
  params: AppParams;
};
export default function TermsOfService({ params }: TermsProps) {
  const content = params["TERMS_ENABLED"] ? params["TERMS_STATEMENT"] : null;

  if (!content || !content.length) {
    return (
      <WarnAlert dismissible={false}>
        No terms of use have been configured.
      </WarnAlert>
    );
  }

  return <LazyRenkuMarkdown markdownText={content} />;
}
