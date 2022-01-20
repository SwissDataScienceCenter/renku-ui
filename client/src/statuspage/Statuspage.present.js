/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  renku-ui
 *
 *  Statuspage.present
 *  Components for the displaying information from statuspage.io
 */

import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import human from "human-time";

import { Row, Col } from "reactstrap";
import { Alert, Badge, Table } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faMinusCircle, faTimesCircle, faWrench } from "@fortawesome/free-solid-svg-icons";

import { Time } from "../utils/helpers/Time";
import { Url } from "../utils/helpers/url";
import { WarnAlert } from "../utils/components/Alert";
import { Loader } from "../utils/components/Loader";
import { TimeCaption } from "../utils/components/TimeCaption";

function componentIsLoud(c) { return c["name"].toLowerCase() === "loud"; }

function ComponentStatusIndicator(props) {
  const status = props.status;
  let indicator = null;
  switch (status) {
    case "operational":
      indicator = {
        color: "success",
        icon: <FontAwesomeIcon icon={faCheckCircle} />
      };
      break;
    case "degraded_performance":
      indicator = {
        color: "warning",
        icon: <FontAwesomeIcon icon={faMinusCircle} />
      };
      break;
    case "partial_outage":
      indicator = {
        color: "warning",
        icon: <FontAwesomeIcon icon={faExclamationCircle} />
      };
      break;
    case "major_outage":
      indicator = {
        color: "danger",
        icon: <FontAwesomeIcon icon={faTimesCircle} />
      };
      break;
    case "under_maintenance":
      indicator = {
        color: "info",
        icon: <FontAwesomeIcon icon={faWrench} />
      };
      break;
    default:
      indicator = null;
      break;
  }

  if (indicator == null) return <span></span>;
  return <Badge color={indicator.color}>{indicator.icon}</Badge>;
}

/**
 * The site status formatted for the details page.
 */
function SiteStatusDetails(props) {
  const status = props.statuspage.status;
  if (status.indicator === "none") {
    return <div>
      <span className="text-success" >
        <FontAwesomeIcon icon={faCheckCircle} />
      </span> { status.description }
    </div>;
  }
  return <WarnAlert>{ status.description }</WarnAlert>;
}

/**
 * The site status formatted for the landing page.
 */
function SiteStatusLanding(props) {
  const status = props.statuspage.status;
  const siteStatusUrl = props.siteStatusUrl;
  if (status.indicator === "none")
    return null;
  return <WarnAlert className="container-xxl renku-container">
    RenkuLab is unstable: { status.description }. {" "}
    See <b><Link to={siteStatusUrl}>RenkuLab Status</Link></b> for more details.
  </WarnAlert>;
}

/**
 * Sort scheduled maintenances so the earliest is the first
 * @param {array} maintenances
 */
function sortedMaintenances(maintenances) {
  return maintenances.sort((a, b) => {
    return (new Date(a.scheduled_for) < new Date(b.scheduled_for)) ?
      -1 :
      1;
  });
}

function maintenanceTimeFragment(first) {
  const scheduledDt = new Date(first.scheduled_for);
  const displayTime = human(scheduledDt);
  const maintenanceTimeFragment =
    scheduledDt > new Date() ?
      `Maintenance scheduled in ${displayTime}` :
      `Maintenance started ${displayTime}`;
  return maintenanceTimeFragment;
}

function MaintenanceSummaryDetails(props) {
  const scheduled = sortedMaintenances(props.statuspage.scheduled_maintenances);
  if (scheduled.length < 1)
    return <span></span>;
  const first = scheduled[0];
  const mtf = maintenanceTimeFragment(first);
  const summary =
    `${mtf}. See below for information about the availability and limitations.`;
  return <WarnAlert>{ summary }</WarnAlert>;
}

function MaintenanceInfo(props) {
  const maintenance = props.maintenance;
  const loud = props.loud;
  const mtf = maintenanceTimeFragment(maintenance);
  const command = maintenance["incident_updates"][0].body;
  const displayCommand = (loud) ?
    <div className="py-md-3"><b>{command}</b></div> :
    null;
  return <Fragment>
    <FontAwesomeIcon icon={faWrench} /> { " "}
    {mtf}: <i>{maintenance.name}</i>. { displayCommand }
  </Fragment>;
}

function MaintenanceSummaryLanding(props) {
  const siteStatusUrl = props.siteStatusUrl;
  const scheduled = sortedMaintenances(props.statuspage.scheduled_maintenances);
  if (scheduled.length < 1)
    return <span></span>;
  const loud = (props.loud != null) ? props.loud : false;
  const alertStyle = (loud) ? { "fontSize": "larger" } : {};
  const first = scheduled[0];
  // Not use custom Alert due it use a custom icon
  return <Alert color="warning" className="container-xxl renku-container">
    <div style={alertStyle}><MaintenanceInfo maintenance={first} loud={loud} /></div>
    <div style={alertStyle}>See <b><Link to={siteStatusUrl}>details</Link></b> { " "}
      for information about the availability and limitations.
    </div>
  </Alert>;
}

function ComponentStatusRow(props) {
  const status = props.component.status;
  const statusText = status.split("_").join(" ");
  return <tr>
    <td><ComponentStatusIndicator status={status} /></td>
    <td>
      <span style={{ textTransform: "capitalize" }}>{statusText}</span>
    </td>
    <td>{props.component.name}</td>
  </tr>;
}


function ComponentStatusDetails(props) {
  const components = props.components;
  return <Table>
    <thead>
      <tr><th width="10%"></th><th width="30%">Status</th><th>Component</th></tr>
    </thead>
    <tbody>
      {
        components.filter(c => !componentIsLoud(c)).map(c => <ComponentStatusRow key={c.id} component={c} />)
      }
    </tbody>
  </Table>;
}

function ScheduledMaintenanceIncident(props) {
  const incident = props.incident;
  return <Fragment>
    <p>{incident.body} {" "}
      <span className="time-caption" style={{ fontSize: "smaller" }}>Posted at {" "}
        {Time.formatDateTime(Time.parseDate(incident.display_at))}
      </span>
    </p>
  </Fragment>;
}

function ScheduledMaintenanceDetails(props) {
  const maintenance = props.maintenance;
  const maintenanceDuration = (new Date(maintenance.scheduled_until) - new Date(maintenance.scheduled_for)) / 1000;
  // get the displayTime, but remove " ago" from it
  const displayTime = human(maintenanceDuration).slice(0, -4);
  const incidents = maintenance.incident_updates.map((u) => <ScheduledMaintenanceIncident key={u.id} incident={u} />);
  return [
    <h5 key="heading" className="border-bottom">{maintenance.name} {" "}
      <span className="time-caption" style={{ fontSize: "smaller", fontWeight: "bold" }}>on {" "}
        {Time.formatDateTime(Time.parseDate(maintenance.scheduled_for))} {" "}
        for {displayTime}
      </span>
    </h5>,
    ...incidents
  ];
}


function ScheduledMaintenance(props) {
  const maintenances = sortedMaintenances(props.maintenances);
  if (maintenances.length < 1) {
    return <p>
      <span className="text-success" >
        <FontAwesomeIcon icon={faCheckCircle} />
      </span> No scheduled maintenance.</p>;
  }
  return maintenances.map(s => <ScheduledMaintenanceDetails key={s.id} maintenance={s} />);
}

/**
 *
 * @param {object} props.statusSummary The result from the StatuspageAPI.summary() call
 */
function StatuspageDisplay(props) {
  const summary = props.statusSummary;
  if (summary == null)
    return <Loader />;
  if (summary.not_configured) return null;
  if (summary.error != null) {
    return <WarnAlert>Could not retrieve status information about this RenkuLab instance. {" "}
      Please ask an administrator to check the statuspage.io configuration.</WarnAlert>;
  }
  if (summary.statuspage == null)
    return <Loader />;
  return <Row>
    <Col md={8}>
      <h3>RenkuLab Status</h3>
      <MaintenanceSummaryDetails statuspage={summary.statuspage} />
      <SiteStatusDetails statuspage={summary.statuspage} />
      <br />
      <h4>Scheduled Maintenance Details</h4>
      <ScheduledMaintenance maintenances={summary.statuspage.scheduled_maintenances} />
      <br />
      <h4>Component Details</h4>
      <ComponentStatusDetails components={summary.statuspage.components} />
      <br />
      <p>
        For further information, see <a href={summary.statuspage.page.url}>{summary.statuspage.page.url}</a>.<br />
        <TimeCaption caption="Status retrieved" time={summary.retrieved_at} endPunctuation=";" />
        {" "}<TimeCaption caption="last updated" time={summary.statuspage.page.updated_at} />
      </p>
    </Col>
  </Row>;
}

/**
 * Indicate whether the statuspage banner should be shown everywhere.
 * @param {object} statusSummary
 * @returns true if the statuspage information should be extra visible
 */
function displayLoud(statusSummary) {
  if (!statusSummary.statuspage) return false;

  function maintenanceHasLoudComponent(sm) {
    const components = sm.components.filter(componentIsLoud);
    return components.length > 0;
  }
  // return true if any scheduled maintenance affects the "Loud" component
  const loudMaintenances =
    statusSummary
      .statuspage
      .scheduled_maintenances.filter(maintenanceHasLoudComponent);
  return loudMaintenances.length > 0;
}

/**
 *
 * @param {object} props.location The browser location
 * @param {object} props.statusSummary The result from the StatuspageAPI.summary() call with timing information
 * @param {string} props.siteStatusUrl The URL for the site status page
 */
function StatuspageBanner(props) {
  // Never show the banner on the status page
  if (props.location.pathname === Url.get(Url.pages.help.status))
    return null;

  const summary = props.statusSummary;
  if (summary == null || summary.statuspage == null || summary.not_configured)
    return null;

  const loud = displayLoud(summary);
  if (!loud && (props.location.pathname !== Url.get(Url.pages.landing)))
    return null;
  const statuspage = summary.statuspage;
  return <Fragment>
    <SiteStatusLanding statuspage={statuspage} siteStatusUrl={props.siteStatusUrl} />
    <MaintenanceSummaryLanding statuspage={statuspage} siteStatusUrl={props.siteStatusUrl} loud={loud} />
  </Fragment>;
}


export { StatuspageDisplay, StatuspageBanner };
