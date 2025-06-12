import cx from "classnames";
import { useContext } from "react";
import { Navigate } from "react-router";

import SunsetBanner from "../projectsV2/shared/SunsetV1Banner";
import { DatasetCoordinator } from "../../dataset/Dataset.state";
import LazyShowDataset from "../../dataset/LazyShowDataset";
import LazyProjectView from "../../project/LazyProjectView";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";

import LazyRootV1 from "../rootV1/LazyRootV1";

export function LegacyDatasetAddToProject() {
  return (
    <div className={cx("d-flex", "flex-column", "align-items-center", "w-100")}>
      <SunsetBanner />
    </div>
  );
}

export function LegacyDatasets() {
  return <Navigate to={`${ABSOLUTE_ROUTES.v1.search}?type=dataset`} replace />;
}

export function LegacyProjectView() {
  return <LazyProjectView />;
}

export function LegacyRoot() {
  return <LazyRootV1 />;
}

interface LegacyDatasetProps {
  user: { logged: boolean };
}

export function LegacyShowDataset({ user }: LegacyDatasetProps) {
  const { client, model: contextModel } = useContext(AppContext);
  const model = contextModel as { subModel: (arg0: string) => unknown };
  return (
    <LazyShowDataset
      insideProject={false}
      client={client}
      projectsUrl="/projects"
      datasetCoordinator={
        new DatasetCoordinator(client, model.subModel("dataset"))
      }
      logged={user.logged}
      model={model}
    />
  );
}
