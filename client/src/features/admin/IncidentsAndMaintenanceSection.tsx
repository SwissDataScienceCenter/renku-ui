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
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";

import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Form,
  Label,
  Nav,
  NavItem,
  TabContent,
  TabPane,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import LazyRenkuMarkdown from "../../components/markdown/LazyRenkuMarkdown";
import { Docs } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import {
  useGetPlatformConfigQuery,
  usePatchPlatformConfigMutation,
} from "../platform/api/platform.api";
import StatusBanner from "../platform/components/StatusBanner";
import { useGetSummaryQuery } from "../platform/statuspage-api/statuspage.api";

export default function IncidentsAndMaintenanceSection() {
  const { params } = useContext(AppContext);
  const statusPageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  return (
    <section>
      <h2 className="fs-5">Incidents And Maintenance</h2>

      <p>
        <Link
          to={Docs.rtdHowToGuide("admin/incidents-maintenance.html")}
          target="_blank"
          rel="noreferrer noopener"
        >
          Renku documentation about incidents and maintenance
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </Link>
      </p>

      <StatusPageCheck statusPageId={statusPageId} />

      <IncidentBannerSection />

      <div>
        <p>Current status banner</p>
        <StatusBanner params={params} />
      </div>
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
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
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
  const incidentBanner = watch("incidentBanner");

  const onSubmit = useCallback(
    (data: IncidentBannerForm) => {
      const incidentBanner = data.incidentBanner.trim();

      patchPlatformConfig({
        "If-Match": platformConfig?.etag ?? "",
        platformConfigPatch: { incident_banner: incidentBanner },
      });
    },
    [patchPlatformConfig, platformConfig?.etag]
  );

  const onClearIncidentBanner = useCallback(
    () => onSubmit({ incidentBanner: "" }),
    [onSubmit]
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
        {error && <RtkOrNotebooksError error={error} dismissible={false} />}
      </div>
    );
  }

  return (
    <Form className="mb-3" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-1">
        <Label for="admin-incident-banner-content">Incident banner</Label>
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
            <textarea
              {...register("incidentBanner")}
              id="admin-incident-banner-content"
              className={cx("form-control", "border-0")}
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
                  "rounded-0"
                )}
                fade={false}
              >
                <h3>Ongoing incident</h3>
                <LazyRenkuMarkdown markdownText={incidentBanner} />
              </Alert>
            ) : (
              <p className="fst-italic">No content</p>
            )}
          </TabPane>
        </TabContent>
      </div>
      <div>
        <Button type="submit" disabled={result.isLoading || !isDirty}>
          Update incident banner
        </Button>
        {platformConfig.incident_banner && (
          <Button
            className="ms-2"
            color="outline-danger"
            disabled={result.isLoading}
            onClick={onClearIncidentBanner}
          >
            <XLg className={cx("bi", "me-1")} />
            Clear incident banner
          </Button>
        )}
      </div>
      {result.error && <RtkOrNotebooksError error={error} />}
    </Form>
  );
}

interface IncidentBannerForm {
  incidentBanner: string;
}
