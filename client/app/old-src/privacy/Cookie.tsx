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
import CookieConsent from "react-cookie-consent";

import AppContext from "../utils/context/appContext";
import RoutedContent from "./RoutedContent";

const LAYOUT = {
  cookieName: "RenkuLabPrivacy",
  disableStyles: true,
  containerClasses: "fixed-bottom p-3 bg-dark",
  contentClasses: "text-white small",
  buttonClasses: "btn btn-sm btn-light me-2",
  buttonWrapperClasses: "mt-2",
};
const CONTENT = `This website requires cookies in order to ensure basic functionality. By clicking
or navigating the site, you consent to the use of cookies in accordance with
our <u><a class="text-white" href="/privacy">Privacy Policy</a></u>.`;

export default function Cookie() {
  const { params } = useContext(AppContext);
  if (params == null || !params.PRIVACY_BANNER_ENABLED) return null;

  // REF: https://www.npmjs.com/package/react-cookie-consent
  const layout = params.PRIVACY_BANNER_LAYOUT ?? LAYOUT;
  const content = params["PRIVACY_BANNER_CONTENT"]
    ? atob(params["PRIVACY_BANNER_CONTENT"])
    : CONTENT;

  return (
    <CookieConsent {...layout}>
      <RoutedContent htmlContent={content} />
    </CookieConsent>
  );
}
