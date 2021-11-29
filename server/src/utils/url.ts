/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { CheckURLResponse } from "../routes/apis.interfaces";
import config from "../config";
import { parse } from "tldts";

export function validateCSP(url: string, csp: string): CheckURLResponse {
  const response: CheckURLResponse = {
    isIframeValid: false,
    url: url,
  };

  try {
    const externalUrl = new URL(url);
    const originUrl = new URL(config.server.url);
    const frameAncestor = csp.split(";").find( (p: string) => p.split(" ")?.includes("frame-ancestors"));

    // If is not set framer-ancestor it can be use in iframes
    if (!frameAncestor)
      return { ...response, isIframeValid: true, detail: "No include frame-ancestor in Content-Security-Policy (CSP)" };

    const allowedSources = frameAncestor?.split(" ");

    // frame ancestor include all domains
    if (allowedSources.includes("*"))
      return { ...response, isIframeValid: true, detail: "frame-ancestors include all domains *" };

    // match full url including protocol
    if (allowedSources.includes(originUrl.toString())) {
      return {
        ...response,
        isIframeValid: true,
        detail: `Url ${ config.server.url } is included in frame-ancestors sources` };
    }

    // self case
    if (allowedSources.includes("'self'") && originUrl.origin === externalUrl.origin)
      return { ...response, isIframeValid: true, detail: "frame-ancestors self match origin url" };

    // none case
    if (allowedSources.includes("'none'"))
      return { ...response, isIframeValid: false, error: "frame-ancestors has 'none' rule" };

    // protocol case
    if ((allowedSources.includes("https://*") && originUrl.protocol === "https:") ||
      (allowedSources.includes("http://*") && originUrl.protocol === "http:"))
      return { ...response, isIframeValid: true, detail: "frame-ancestors protocol rule" };

    // subdomain case
    const specialCases = ["https://*", "http://*", "*"];
    const subdomainsAllowed = allowedSources
      .filter( (source: string) => !specialCases.includes(source) && source.includes("*"));
    for (const subdomainAllowed of subdomainsAllowed) {
      // replace for valid string to use parse function
      const allowedUrlParse = parse(subdomainAllowed.replace("*", "www"));
      const originUrlParse = parse(originUrl.toString());
      if (allowedUrlParse.subdomain === "www") {
        if (allowedUrlParse.domain === originUrlParse.domain) {
          return {
            ...response,
            isIframeValid: true,
            detail: `URL ${originUrl.toString()} match frame-ancestors rule ${subdomainAllowed}` };
        }
      }
      else {
        // subdomain composed
        const subdomainList = allowedUrlParse.subdomain.split(".");
        const asteriskIndex = subdomainList.indexOf("www");
        if (asteriskIndex > -1)
          subdomainList.splice(asteriskIndex, 1);

        const subdomainOrigin = originUrlParse.subdomain.split(".");
        // remove at the same location as the asterisk index to compare the rest of the string
        subdomainOrigin.splice(asteriskIndex, 1);
        if (subdomainList.toString() === subdomainOrigin.toString()) {
          return {
            ...response,
            isIframeValid: true,
            detail: `URL ${originUrl.toString()} match frame-ancestors rule ${subdomainAllowed}` };
        }
      }
    }
    return { ...response, error: "URL does not match any Content-Security-Policy rule" };
  }
  catch (e) {
    return { ...response, error: e.toString() };
  }
}