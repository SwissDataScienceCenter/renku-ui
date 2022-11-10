/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faSave } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Col, Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from "reactstrap";
import { Loader } from "./Loader";
import { capitalizeFirstLetter, generateZip } from "../helpers/HelperFunctions";

function getLogsToShow(logs) {
  const logsWithData = {};
  if (logs.data && typeof logs.data !== "string") {
    Object.keys(logs.data).map(key => {
      if (logs.data[key].length > 0)
        logsWithData[key] = logs.data[key];
    });
  }
  return logsWithData;
}

function LogBody({ fetchLogs, logs, name }) {
  if (logs.fetching) return <Loader />;

  if (!logs.fetched) {
    return <p>Logs unavailable. Please
      <Button color="primary" onClick={() => { fetchLogs(name); }}>download</Button> them again.
    </p>;
  }

  const logsWithData = getLogsToShow(logs);
  if (logs.data && typeof logs.data !== "string" && Object.keys(logsWithData).length)
    return <LogTabs logs={logsWithData}/>;

  return <div>
    <p data-cy="no-logs-available">No logs available for this pod yet.</p>
    <p>You can try to <Button className="btn-outline-rk-green" onClick={() => { fetchLogs(name); }}>Refresh</Button>
      {" "}them after a while.</p>
  </div>;
}


const LogTabs = ({ logs }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (logs) {
      const orderedLogs = logs && logs["jupyter-server"] ? { "jupyter-server": logs["jupyter-server"], ...logs } : logs;
      setData(orderedLogs);
      if (activeTab === null) {
        const keys = Object.keys(orderedLogs);
        setActiveTab(keys[0]);
      }
    }
  }, [logs, activeTab]);


  const getTitle = (name) => {
    return name.split("-").map(word => capitalizeFirstLetter(word)).join(" ");
  };

  if (!data)
    return null;

  return (
    <div>
      <Nav pills className="nav-pills-underline">
        { Object.keys(data).map( tab => {
          return (
            <NavItem key={tab} data-cy="logs-tab" role="button">
              <NavLink
                className={activeTab === tab ? "active" : ""}
                onClick={() => { setActiveTab(tab); }}>
                {getTitle(tab)}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <TabContent activeTab={activeTab}>
        { Object.keys(data).map(tab => {
          return (
            <TabPane key={`log_${tab}`} tabId={tab}>
              <Row>
                <Col sm="12">
                  <pre
                    className="bg-primary text-white p-2 w-100 overflow-auto log-container border-radius-8">
                    { data[tab] }
                  </pre>
                </Col>
              </Row>
            </TabPane>
          );
        })}
      </TabContent>
    </div>
  );
};

const LogDownloadButton = ({ logs, downloading, save, size, color }) => {

  const canDownload = (logs) => {
    if (logs.fetching || downloading)
      return false;
    if (!logs.data || typeof logs.data === "string")
      return false;
    // Validate if this result is possible
    return !(logs.data.length === 1 && logs.data[0].startsWith("Logs unavailable"));
  };

  return (
    <Button data-cy="session-log-download-button" color={color ?? "rk-green"} size={size ?? "s"}
      disabled={!canDownload(logs)} onClick={() => { save(); }}>
      <FontAwesomeIcon icon={faSave} />
      { downloading ? " Downloading " : " Download"}
      { downloading ? <Loader inline={true} size={16} /> : ""}
    </Button>
  );
};

const useDownloadLogs = (logs, fetchLogs, sessionName) => {
  const [downloading, setDownloading] = useState(null);

  const save = async () => {
    setDownloading(true);
    const fullLogs = await fetchLogs(sessionName, true);

    if (!fullLogs) {
      setDownloading(false);
      return;
    }
    const files = [];
    for (const fullLogsKey in fullLogs) {
      const data = fullLogs[fullLogsKey];
      // create the blob element to download logs as a file
      const file = new Blob([data], { type: "text/plain" });
      files.push({
        name: `${fullLogsKey}.txt`,
        content: file,
      });
    }

    await generateZip(files, `Logs_${sessionName}`);
    setDownloading(false);
  };

  return [downloading, save];
};

/**
 * Simple environment logs container
 *
 * @param {function} fetchLogs - async function to get logs as an array string
 * @param {function} toggleLogs - toggle logs visibility and fetch logs on show
 * @param {object} logs - log object from redux store enhanced with `show` property
 * @param {string} name - server name
 * @param {object} annotations - list of cleaned annotations
 */
const EnvironmentLogs = ({ logs, name, toggleLogs, fetchLogs, annotations }) => {

  const [ downloading, save ] = useDownloadLogs(logs, fetchLogs, name);

  if (!logs.show || logs.show !== name)
    return null;

  return (
    <Modal
      isOpen={!!logs.show}
      className="modal-dynamic-width"
      scrollable={true}
      toggle={() => { toggleLogs(name); }}>
      <ModalHeader className="bg-body header-multiline" toggle={() => { toggleLogs(name); }} >
        Logs <small>
          {annotations["namespace"]}/{annotations["projectName"]}{" "}
          [{annotations["branch"]}@{annotations["commit-sha"].substring(0, 8)}]</small>
      </ModalHeader>
      <ModalBody className="bg-body logs-modal">
        <LogBody fetchLogs={fetchLogs} logs={logs} name={name} />
      </ModalBody>
      <ModalFooter className="bg-body">
        <LogDownloadButton logs={logs} downloading={downloading} save={save}/>
        <Button className="btn-outline-rk-green" disabled={logs.fetching} onClick={() => { fetchLogs(name); }}>
          <FontAwesomeIcon icon={faRedo} /> Refresh
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export { EnvironmentLogs, LogTabs, LogDownloadButton, useDownloadLogs, getLogsToShow };
