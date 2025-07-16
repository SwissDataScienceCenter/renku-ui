import cx from "classnames";
import { useContext } from "react";
import { Link, Navigate } from "react-router";
import { ArrowLeft } from "react-bootstrap-icons";

import ContainerWrap from "../../components/container/ContainerWrap";
import { DatasetCoordinator } from "../../dataset/Dataset.state";
import LazyShowDataset from "../../dataset/LazyShowDataset";
import LazyProjectView from "../../project/LazyProjectView";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";

import SunsetBanner from "../projectsV2/shared/SunsetV1Banner";
import LazyRootV1 from "../rootV1/LazyRootV1";
import NavbarV2 from "../rootV2/NavbarV2";
import type { UserInfo } from "../usersV2/api/users.types";

function NoLegacySupport() {
  const title = "Legacy not supported";
  const description = "Renku Legacy is not supported in this deployment.";
  const descriptionType = typeof description;
  const Tag =
    descriptionType === "string" ||
    descriptionType === "number" ||
    descriptionType === "boolean"
      ? "p"
      : "div";

  const homeLink = "/";
  return (
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            data-cy="not-found-title"
            className={cx(
              "fw-bold",
              "mt-0",
              "mb-3",
              "d-flex",
              "align-items-center",
              "gap-3",
              "text-primary"
            )}
          >
            {/*
            TODO: Put a nice image here when available
            <img src={rkNotFoundImg} /> */}
            {title}
          </h3>
          <Tag data-cy="not-found-description">{description}</Tag>
          <div>
            <Link to={homeLink} className={cx("btn", "btn-primary")}>
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}

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
    return <NoLegacySupport />;
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
