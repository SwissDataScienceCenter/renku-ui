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


import "./Logs.css";
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";
import { Loader } from "./Loader";
import { capitalizeFirstLetter, generateZip } from "../helpers/HelperFunctions";
import { LOG_ERROR_KEY } from "../../notebooks/Notebooks.state";

import { faSyncAlt
} from "@fortawesome/free-solid-svg-icons";

interface ILogs {
  data: Record<string, string>;
  fetching: boolean;
  fetched: boolean;
  show: string;
}

function getLogsToShow(logs: ILogs) {
  const logsWithData: Record<string, string> = {};
  if (logs.data && typeof logs.data !== "string") {
    Object.keys(logs.data).map(key => {
      if (logs.data[key].length > 0)
        logsWithData[key] = logs.data[key];
    });
  }
  return logsWithData;
}

interface IFetchableLogs {
  fetchLogs: (name: string, fullLogs?: boolean) => Promise<ILogs["data"]>;
  logs: ILogs;
}

interface LogBodyProps extends IFetchableLogs {
  name: string;
}

const LogTabs = ({ logs }: { logs: Record<string, string>;}) => {
  const [activeTab, setActiveTab] = React.useState<string|undefined>(undefined);
  const [data, setData] = React.useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (logs) {
      const orderedLogs = logs && logs["jupyter-server"] ? { "jupyter-server": logs["jupyter-server"], ...logs } : logs;
      setData(orderedLogs);
      if (activeTab == null) {
        const keys = Object.keys(orderedLogs);
        setActiveTab(keys[0]);
      }
    }
  }, [logs, activeTab]);


  const getTitle = (name: string) => {
    return name.split("-").map(word => capitalizeFirstLetter(word)).join(" ");
  };

  if (!data)
    return null;

  return (
    <div>
      <Nav pills className="nav-pills-underline log-nav bg-white">
        { Object.keys(data).map( tab => {
          return (
            <NavItem key={tab} data-cy="log-tab" role="button">
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
              <div className="d-flex flex-column">
                <pre
                  className="bg-primary text-white p-2 w-100 overflow-hidden log-container border-radius-8">
                  { data[tab] }
                </pre>
              </div>
            </TabPane>
          );
        })}
      </TabContent>
    </div>
  );
};

interface LogDownloadButtonProps {
  color?: string;
  downloading?: boolean;
  logs: ILogs;
  save: () => unknown;
  size?: string;
}

const LogDownloadButton = ({ logs, downloading, save, size, color }: LogDownloadButtonProps) => {

  const canDownload = (logs: ILogs) => {
    if (logs.fetching || downloading)
      return false;
    if (!logs.data || typeof logs.data === "string")
      return false;
    if (Object.keys(logs.data).length < 1 || logs.data[LOG_ERROR_KEY] != null) return false;
    return true;
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


const useDownloadLogs = (logs: IFetchableLogs["logs"],
  fetchLogs: IFetchableLogs["fetchLogs"],
  sessionName: string): [boolean|undefined, ()=>Promise<void>] => {
  const [downloading, setDownloading] = React.useState<boolean|undefined>(undefined);

  const save = async () => {
    setDownloading(true);
    const fullLogs = await fetchLogs(sessionName, true);

    if (!fullLogs) {
      setDownloading(false);
      return;
    }
    const logName = `Logs_${sessionName}`;
    const files = [];
    for (const fullLogsKey in fullLogs) {
      const data = fullLogs[fullLogsKey];
      // create the blob element to download logs as a file
      const file = new Blob([data], { type: "text/plain" });
      files.push({
        name: `${logName}/${fullLogsKey}.txt`,
        content: file,
      });
    }

    await generateZip(files, logName);
    setDownloading(false);
  };

  return [downloading, save];
};

function NoLogsAvailable(props: LogBodyProps) {
  const { fetchLogs, name } = props;
  return (
    <>
      <p data-cy="no-logs-message">No logs available for this pod yet.</p>
      <p>
            You can try to{" "}
        <Button
          data-cy="retry-logs-body"
          className="btn-outline-rk-green"
          size="sm"
          onClick={() => { fetchLogs(name); }}>
              refresh
        </Button>
        {" "}them after a while.
      </p>
    </>
  );
}

function SessionLogsBody(props: LogBodyProps) {
  const { fetchLogs, logs, name } = props;
  if (logs.fetching) return <Loader />;
  if (!logs.fetched) {
    return (
      <p>
          Logs unavailable. Please{" "}
        <Button className="btn-outline-rk-green" size="sm" onClick={() => { fetchLogs(name); }}>download</Button>
        {" "}them again.
      </p>
    );
  }
  // The keys of logsWithData indicate which logs have data
  const logsWithData = getLogsToShow(logs);
  if (Object.keys(logsWithData).length < 1 || !logs.data || logs.data[LOG_ERROR_KEY] != null)
    return <NoLogsAvailable fetchLogs={fetchLogs} logs={logs} name={name} />;
  return <LogTabs logs={logsWithData}/>;
}


function SessionLogs(props: LogBodyProps) {
  const { fetchLogs, logs } = props;
  const sessionName = props.name;
  const [ downloading, save ] = useDownloadLogs(logs, fetchLogs, sessionName);

  useEffect(() => {
    if (fetchLogs)
      fetchLogs(sessionName);
  }, []); // eslint-disable-line


  // ? Having a minHeight prevent losing the vertical scroll position.
  // TODO: Revisit after #1219
  return (
    <>
      <div className="p-2 p-lg-3 text-nowrap">
        <Button key="button" color="rk-green" size="sm" style={{ marginRight: 8 }}
          id="session-refresh-logs" onClick={() => {
            fetchLogs(sessionName);
          }} disabled={logs.fetching} >
          <FontAwesomeIcon icon={faSyncAlt} /> Refresh logs
        </Button>
        <LogDownloadButton logs={logs} downloading={downloading} save={save} size="sm" color="secondary"/>
      </div>
      <div className="p-2 p-lg-3 border-top">
        <SessionLogsBody fetchLogs={fetchLogs} logs={logs} name={sessionName} />
      </div>
    </>
  );
}

/**
 * Simple environment logs container
 *
 * @param {function} fetchLogs - async function to get logs as an array string
 * @param {function} toggleLogs - toggle logs visibility and fetch logs on show
 * @param {object} logs - log object from redux store enhanced with `show` property
 * @param {string} name - server name
 * @param {object} annotations - list of cleaned annotations
 */
interface EnvironmentLogsProps {
  annotations: Record<string, string>;
  fetchLogs: IFetchableLogs["fetchLogs"];
  logs: ILogs;
  name: string;
  toggleLogs: (name:string) => unknown;
}
const EnvironmentLogs = ({ logs, name, toggleLogs, fetchLogs, annotations }: EnvironmentLogsProps) => {

  if (!logs.show || logs.show !== name)
    return null;

  return (
    <Modal
      isOpen={!!logs.show}
      className="bg-body modal-dynamic-width"
      scrollable={true}
      toggle={() => { toggleLogs(name); }}>
      <ModalHeader className="bg-body header-multiline" toggle={() => { toggleLogs(name); }} >
        <div>Logs</div>
        <div className="fs-5 fw-normal">
          <small>
            {annotations["namespace"]}/{annotations["projectName"]}{" "}
          [{annotations["branch"]}@{annotations["commit-sha"].substring(0, 8)}]
          </small>
        </div>
      </ModalHeader>
      <ModalBody className="logs-modal">
        <div className="mx-2 bg-white">
          <SessionLogs fetchLogs={fetchLogs} logs={logs} name={name} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export { EnvironmentLogs, SessionLogs };
