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

/**
 *  Container components for privacy
 */
import { useContext } from "react";

import { WarnAlert } from "../components/Alert";
import { Loader } from "../components/Loader";
import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";
import { isValidMarkdownResponse } from "../components/markdown/utils";
import { useGetPrivacyPolicyQuery } from "../features/terms/terms.api";
import AppContext from "../utils/context/appContext";

export default function PrivacyPolicy() {
  const { params } = useContext(AppContext);
  const { data, isLoading } = useGetPrivacyPolicyQuery();
  if (params == null) return null;
  if (isLoading) return <Loader />;
  if (params == null) return null;
  const content =
    params["TERMS_PAGES_ENABLED"] &&
    data != null &&
    isValidMarkdownResponse(data)
      ? data
      : null;

  if (content == null) {
    return (
      <WarnAlert dismissible={false}>
        No privacy policy has been configured.
      </WarnAlert>
    );
  }

  return <LazyRenkuMarkdown markdownText={content} />;
}
