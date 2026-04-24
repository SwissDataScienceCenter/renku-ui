/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import ContainerWrap from "~/components/container/ContainerWrap";
import { Loader } from "~/components/Loader";
import { useGetPlatformRedirectsBySourceUrlQuery } from "~/features/platform/api/platform.api";
import { locationPathnameToSourceUrl } from "~/features/platform/api/platform.utils";
import NoLegacySupportForProjects from "./NoLegacySupportForProjects";

interface ClientSideCheckForRedirectsProps {
  projectSlug: string;
}

export default function ClientSideCheckForRedirects({
  projectSlug,
}: ClientSideCheckForRedirectsProps) {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const sourceUrl = locationPathnameToSourceUrl(projectSlug);
  const { data: redirectPlan, isFetching: isFetchingRedirects } =
    useGetPlatformRedirectsBySourceUrlQuery(
      sourceUrl ? { sourceUrl } : skipToken
    );
  const autostart = !!searchParams.get("autostart");
  const navigate = useNavigate();
  useEffect(() => {
    if (redirectPlan?.target_url != null) {
      navigate(
        {
          pathname: redirectPlan.target_url,
          search: autostart
            ? new URLSearchParams({
                autostartRedirect: "true",
              }).toString()
            : undefined,
        },
        {
          replace: true,
        }
      );
    }
  }, [autostart, navigate, redirectPlan]);
  if (isFetchingRedirects || redirectPlan?.target_url != null) {
    return <CheckingForRedirect />;
  }
  return <NoLegacySupportForProjects />;
}

function CheckingForRedirect() {
  return (
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            data-cy="not-found-title"
            className={cx("fw-bold", "mt-0", "mb-3", "text-primary")}
          >
            <Loader className={cx("bi", "me-2")} inline size={20} />
            Checking for redirect...
          </h3>
        </div>
      </div>
    </ContainerWrap>
  );
}
