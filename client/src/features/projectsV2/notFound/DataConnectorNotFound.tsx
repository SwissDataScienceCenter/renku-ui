import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ArrowLeft } from "react-bootstrap-icons";
import { Link, useParams } from "react-router";

import ContainerWrap from "../../../components/container/ContainerWrap";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import rkNotFoundImgV2 from "../../../styles/assets/not-foundV2.svg";

interface DataConnectorNotFoundProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function DataConnectorNotFound({
  error,
}: DataConnectorNotFoundProps) {
  const { dataConnectorNamespace, projectNamespace, slug } = useParams<{
    dataConnectorNamespace?: string;
    projectNamespace?: string;
    slug: string;
  }>();

  const dataConnectorSlug = [projectNamespace, dataConnectorNamespace, slug]
    .filter((value) => value != null)
    .join("/");

  const notFoundText = dataConnectorSlug ? (
    <>
      We could not find the data connector{" "}
      <span className={cx("fw-bold", "user-select-all")}>
        {dataConnectorSlug}
      </span>
      .
    </>
  ) : (
    <>We could not find the requested data connector.</>
  );

  return (
    <ContainerWrap>
      <div className="d-flex">
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            className={cx(
              "text-primary",
              "fw-bold",
              "my-0",
              "d-flex",
              "align-items-center",
              "gap-3"
            )}
          >
            <img src={rkNotFoundImgV2} />
            Data Connector not found
          </h3>
          <div className={cx("text-start", "mt-3")}>
            <p>{notFoundText}</p>
            <p>
              It is possible that the data connector has been deleted by its
              owner or you do not have the necessary permissions to view it.
            </p>
            {error && (
              <RtkOrDataServicesError error={error} dismissible={false} />
            )}
            <Link
              to={`${ABSOLUTE_ROUTES.v2.search}?type=DataConnector`}
              className={cx("btn", "btn-primary")}
            >
              <ArrowLeft className={cx("bi", "me-1")} />
              Go to the data connectors list
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
