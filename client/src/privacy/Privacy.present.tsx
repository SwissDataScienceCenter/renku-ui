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
 *  Presentational components for the privacy policy.
 */

import React from "react";

import CookieConsent from "react-cookie-consent";

import { WarnAlert } from "../components/Alert";
import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";

type CookieBannerProps = {
  layout: Record<string, unknown>;
  content: React.ReactNode;
};
function CookieBanner({ layout, content }: CookieBannerProps) {
  return <CookieConsent {...layout}>{content}</CookieConsent>;
}

type PrivacyProps = {
  content: string | null;
};
function Privacy({ content }: PrivacyProps) {
  if (!content || !content.length) {
    return (
      <WarnAlert dismissible={false}>
        No privacy policy has been configured.
      </WarnAlert>
    );
  }

  const stringContent = content;
  return <LazyRenkuMarkdown markdownText={stringContent} />;
}

export { CookieBanner, Privacy };
