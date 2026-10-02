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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  BoxArrowUpRight,
  CheckCircleFill,
  WrenchAdjustableCircle,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  Alert,
  Button,
  Form,
  Input,
  Nav,
  NavItem,
  TabContent,
  TabPane,
} from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import RtkOrDataServicesError from "../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../components/Loader";
import { Links } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import {
  useGetPlatformConfigQuery,
  usePatchPlatformConfigMutation,
} from "../platform/api/platform.api";
import { useGetSummaryQuery } from "../platform/statuspage-api/statuspage.api";

export default function IncidentsAndMaintenanceSection() {
  const { params } = useContext(AppContext);
  const statusPageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  return (
    <section>
      <h2 className="mb-3">
        <WrenchAdjustableCircle className="me-1" />
        Incidents and Maintenance
      </h2>

      <StatusPageCheck statusPageId={statusPageId} />

      <IncidentBannerSection />

      <p>
        <ExternalLink href={Links.RENKU_2_ADMIN_HOW_TO_GUIDE_INCIDENTS}>
          Renku documentation about incidents and maintenance
        </ExternalLink>
      </p>
    </section>
  );
}

interface StatusPageCheckProps {
  statusPageId: string;
}

function StatusPageCheck({ statusPageId }: StatusPageCheckProps) {
  const {
    data: summary,
    isLoading,
    error,
  } = useGetSummaryQuery(statusPageId ? { statusPageId } : skipToken);

  const statusPageManageUrl = `https://manage.statuspage.io/pages/${statusPageId}`;

  if (!statusPageId) {
    return (
      <p>
        Status Page ID: <span className="fst-italic">Not configured</span>
      </p>
    );
  }

  const checkContent = isLoading ? (
    <p>
      <Loader inline className="me-1" size={16} />
      Checking status from statuspage.io...
    </p>
  ) : error || summary == null ? (
    <>
      <p>
        <XCircleFill className={cx("bi", "me-1", "text-danger")} />
        Error: could not retrieve RenkuLab&apos;s status from statuspage.io.
      </p>
      {error && <RtkOrDataServicesError error={error} dismissible={false} />}
    </>
  ) : (
    <p>
      <CheckCircleFill className={cx("bi", "me-1", "text-success")} />
      Status retrieved from{" "}
      <Link to={summary.page.url} target="_blank" rel="noreferrer noopener">
        {summary.page.url}
        <BoxArrowUpRight className={cx("bi", "ms-1")} />
      </Link>
      .
    </p>
  );

  return (
    <>
      <p>
        Status Page ID:{" "}
        <Link
          to={statusPageManageUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {statusPageId}
        </Link>{" "}
        (click to open the management page)
      </p>
      {checkContent}
    </>
  );
}

function IncidentBannerSection() {
  const {
    data: platformConfig,
    isLoading,
    error,
  } = useGetPlatformConfigQuery();

  const [patchPlatformConfig, result] = usePatchPlatformConfigMutation();

  const {
    register,
    formState: { isDirty },
    handleSubmit,
    reset,
    watch,
  } = useForm<IncidentBannerForm>({
    defaultValues: { incidentBanner: platformConfig?.incident_banner },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const incidentBanner = watch("incidentBanner");
  const { ref: incidentBannerRef, ...incidentBannerField } =
    register("incidentBanner");

  //? The platform config may not be loaded yet when the form is initialized
  useEffect(() => {
    if (platformConfig != null) {
      reset({ incidentBanner: platformConfig.incident_banner });
    }
  }, [platformConfig, reset]);

  const onSubmit = useCallback(
    (data: IncidentBannerForm) => {
      const incidentBanner = data.incidentBanner.trim();

      patchPlatformConfig({
        "If-Match": platformConfig?.etag ?? "",
        platformConfigPatch: { incident_banner: incidentBanner },
      });
    },
    [patchPlatformConfig, platformConfig?.etag],
  );

  const onClearIncidentBanner = useCallback(
    () => onSubmit({ incidentBanner: "" }),
    [onSubmit],
  );

  useEffect(() => {
    if (result.isSuccess) {
      reset({ incidentBanner: result.data.incident_banner });
    }
  }, [reset, result.data?.incident_banner, result.isSuccess]);

  const [tab, setTab] = useState<"write-tab" | "preview-tab">("write-tab");
  const onClickWrite = useCallback(() => setTab("write-tab"), []);
  const onClickPreview = useCallback(() => setTab("preview-tab"), []);

  if (isLoading) {
    return (
      <p>
        <Loader className="me-1" inline size={16} />
        Loading platform configuration...
      </p>
    );
  }

  if (error || !platformConfig) {
    return (
      <div>
        <p>Error: could not load platform configuration.</p>
        {error && <RtkOrDataServicesError error={error} dismissible={false} />}
      </div>
    );
  }

  return (
    <>
      <h3>Incident banner</h3>
      <Form className="mb-3" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className={cx("d-flex", "flex-column", "gap-1", "mb-1")}>
          <Nav tabs>
            <NavItem>
              <button
                className={cx("nav-link", tab === "write-tab" && "active")}
                onClick={onClickWrite}
                type="button"
              >
                Write
              </button>
            </NavItem>
            <NavItem>
              <button
                className={cx("nav-link", tab === "preview-tab" && "active")}
                onClick={onClickPreview}
                type="button"
              >
                Preview
              </button>
            </NavItem>
          </Nav>
          <TabContent activeTab={tab}>
            <TabPane tabId="write-tab">
              <Input
                id="admin-incident-banner-content"
                type="textarea"
                innerRef={incidentBannerRef}
                {...incidentBannerField}
              />
            </TabPane>
            <TabPane tabId="preview-tab">
              {incidentBanner ? (
                <Alert
                  color="danger"
                  className={cx(
                    "container-xxl",
                    "renku-container",
                    "border-0",
                    "rounded-0",
                  )}
                  fade={false}
                >
                  <h3>Ongoing incident</h3>
                  <LazyMarkdown>{incidentBanner}</LazyMarkdown>
                </Alert>
              ) : (
                <p className="fst-italic">
                  No content; no incident banner will be shown.
                </p>
              )}
            </TabPane>
          </TabContent>
        </div>
        <div>
          <Button
            color="primary"
            type="submit"
            disabled={result.isLoading || !isDirty}
          >
            Update incident banner
          </Button>
          {platformConfig.incident_banner && (
            <Button
              className="ms-2"
              color="outline-primary"
              disabled={result.isLoading}
              onClick={onClearIncidentBanner}
            >
              <XLg className={cx("bi", "me-1")} />
              Clear incident banner
            </Button>
          )}
        </div>
        {result.error && <RtkOrDataServicesError error={error} />}
      </Form>
    </>
  );
}

interface IncidentBannerForm {
  incidentBanner: string;
}
