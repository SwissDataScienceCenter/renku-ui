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

import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom-v5-compat";

import AppContext from "../utils/context/appContext";
import type { AppParams } from "../utils/context/appParams.types";
import { RenkuQueryParams } from "./Authentication.container";

interface UseLoginUrlArgs {
  params?: AppParams;
  redirectUrl?: URL;
}

export function useLoginUrl({
  params: params_,
  redirectUrl: redirectUrl_,
}: UseLoginUrlArgs): URL {
  const { params: appContextParams } = useContext(AppContext);
  const params = params_ ?? appContextParams;
  const gatewayUrl = params?.GATEWAY_URL;

  const location = useLocation();
  const windowLocationRef = useRef<string>(window.location.href);

  useEffect(() => {
    windowLocationRef.current = window.location.href;
  }, [location]);

  if (!gatewayUrl) {
    throw new Error("Cannot create login URL");
  }

  const redirectUrl = redirectUrl_ ?? new URL(windowLocationRef.current);
  if (!redirectUrl.search.includes(RenkuQueryParams.login)) {
    redirectUrl.searchParams.append(
      RenkuQueryParams.login,
      RenkuQueryParams.loginValue
    );
  }

  const loginUrl = new URL(`${gatewayUrl}/auth/login`);
  loginUrl.searchParams.set("redirect_url", redirectUrl.href);

  return loginUrl;
}
