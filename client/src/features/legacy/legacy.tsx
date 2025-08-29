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

import cx from "classnames";
import { useContext } from "react";
import { Navigate } from "react-router";

import { DatasetCoordinator } from "../../dataset/Dataset.state";
import LazyShowDataset from "../../dataset/LazyShowDataset";
import LazyProjectView from "../../project/LazyProjectView";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";

import SunsetBanner from "../projectsV2/shared/SunsetV1Banner";
import LazyRootV1 from "../rootV1/LazyRootV1";
import NavbarV2 from "../rootV2/NavbarV2";
import type { UserInfo } from "../usersV2/api/users.types";

import CheckForRedirect from "./CheckForRedirect";
import NoLegacySupport from "./NoLegacySupport";

export function LegacyDatasetAddToProject() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return <NoLegacySupport />;
  }
  return (
    <div className={cx("d-flex", "flex-column", "align-items-center", "w-100")}>
      <SunsetBanner />
    </div>
  );
}

export function LegacyDatasets() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return (
      <Navigate
        // eslint-disable-next-line spellcheck/spell-checker
        to={`${ABSOLUTE_ROUTES.v2.search}?q=type%3Adataconnector`}
        replace
      />
    );
  }
  return <Navigate to={`${ABSOLUTE_ROUTES.v1.search}?type=dataset`} replace />;
}

export function LegacyProjectView() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return <CheckForRedirect />;
  }

  return <LazyProjectView />;
}

export function LegacyRoot() {
  const { params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return (
      <div className={cx("d-flex", "flex-column", "w-100")}>
        <NavbarV2 />
        <NoLegacySupport />
      </div>
    );
  }
  return <LazyRootV1 />;
}

interface LegacyDatasetProps {
  userInfo: UserInfo;
}

export function LegacyShowDataset({ userInfo }: LegacyDatasetProps) {
  const { client, model: contextModel, params } = useContext(AppContext);
  if (params && !params.LEGACY_SUPPORT.enabled) {
    return <NoLegacySupport />;
  }

  const model = contextModel as { subModel: (arg0: string) => unknown };
  return (
    <LazyShowDataset
      insideProject={false}
      client={client}
      projectsUrl="/projects"
      datasetCoordinator={
        new DatasetCoordinator(client, model.subModel("dataset"))
      }
      logged={userInfo?.isLoggedIn ?? false}
      model={model}
    />
  );
}
