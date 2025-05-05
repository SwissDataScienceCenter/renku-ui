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

import React, { createRef, ReactNode, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";

import { displaySlice } from "../features/display";
import { NotebooksHelper } from "../notebooks";
import { LOG_ERROR_KEY } from "../notebooks/Notebooks.state";
import { NotebookAnnotations } from "../notebooks/components/session.types";
import useGetSessionLogs from "../utils/customHooks/UseGetSessionLogs";
import useAppDispatch from "../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../utils/customHooks/useAppSelector.hook";
import {
  capitalizeFirstLetter,
  generateZip,
} from "../utils/helpers/HelperFunctions";
import { Loader } from "./Loader";

import cx from "classnames";
import { ArrowRepeat, FileEarmarkArrowDown } from "react-bootstrap-icons";

import styles from "./Logs.module.scss";

export interface ILogs {
  data: Record<string, string>;
  fetching: boolean;
  fetched: boolean;
  show: string | boolean;
}

function getLogsToShow(logs: ILogs) {
  const logsWithData: Record<string, string> = {};
  if (!logs || logs.data === undefined) return logsWithData;
  if (logs.data && typeof logs.data !== "string") {
    Object.keys(logs.data).map((key) => {
      if (logs.data[key].length > 0) logsWithData[key] = logs.data[key];
    });
  }
  return logsWithData;
}

export interface IFetchableLogs {
  fetchLogs: (name: string, fullLogs?: boolean) => Promise<ILogs["data"]>;
  logs: ILogs;
}

interface LogBodyProps extends IFetchableLogs {
  name: string;
  showButtons?: boolean;
  defaultTab?: string;
}

const LogTabs = ({
  logs,
  defaultTab,
}: {
  logs: Record<string, string>;
  defaultTab?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultTab);
  const [data, setData] = useState<Record<string, string> | null>(null);
  const activeTabPaneRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (logs) {
      const orderedLogs =
        logs && logs["jupyter-server"]
          ? { "jupyter-server": logs["jupyter-server"], ...logs }
          : logs;
      setData(orderedLogs);
      if (activeTab == null) {
        const keys = Object.keys(orderedLogs);
        setActiveTab(keys[0]);
      }
    }
  }, [logs, activeTab]);

  useEffect(() => {
    if (activeTabPaneRef.current && activeTab === defaultTab) {
      requestAnimationFrame(() => {
        const preElement = activeTabPaneRef.current?.querySelector("pre");
        if (preElement) {
          preElement.scrollTop = preElement.scrollHeight;
        }
      });
    }
  }, [activeTab, defaultTab, data, activeTabPaneRef]);

  const getTitle = (name: string) => {
    return name
      .split("-")
      .map((word) => capitalizeFirstLetter(word))
      .join(" ");
  };

  if (!data) return null;

  return (
    <>
      <Nav
        tabs
        className={cx("mb-2", "position-sticky", "top-0", "z-index-100")}
      >
        {Object.keys(data).map((tab) => {
          return (
            <NavItem key={tab} data-cy="log-tab" role="button">
              <NavLink
                className={activeTab === tab ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab);
                }}
              >
                {getTitle(tab)}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <TabContent
        activeTab={activeTab}
        className={cx("flex-1", "overflow-y-auto")}
      >
        {Object.keys(data).map((tab) => {
          return (
            <TabPane key={`log_${tab}`} tabId={tab}>
              <div
                className="d-flex flex-column"
                ref={tab === activeTab ? activeTabPaneRef : null}
              >
                <pre
                  className="overflow-auto"
                  // eslint-disable-next-line spellcheck/spell-checker
                  style={{ whiteSpace: "pre-line", maxHeight: "60vh" }}
                >
                  {data[tab]}
                </pre>
              </div>
            </TabPane>
          );
        })}
      </TabContent>
    </>
  );
};

interface LogDownloadButtonProps {
  color?: string;
  downloading?: boolean;
  logs: ILogs;
  save: () => unknown;
  size?: string;
}

const LogDownloadButton = ({
  logs,
  downloading,
  save,
  size,
  color,
}: LogDownloadButtonProps) => {
  const canDownload = (logs: ILogs) => {
    if (logs.fetching || downloading) return false;
    if (!logs.data || typeof logs.data === "string") return false;
    if (Object.keys(logs.data).length < 1 || logs.data[LOG_ERROR_KEY] != null)
      return false;
    return true;
  };

  return (
    <Button
      data-cy="session-log-download-button"
      color={color ?? "primary"}
      size={size ?? "s"}
      disabled={!canDownload(logs)}
      onClick={() => {
        save();
      }}
    >
      <FileEarmarkArrowDown className={cx("bi", "me-1")} />
      {downloading ? " Downloading " : " Download"}
      {downloading && <Loader inline size={16} />}
    </Button>
  );
};

const useDownloadLogs = (
  _logs: IFetchableLogs["logs"],
  fetchLogs: IFetchableLogs["fetchLogs"],
  sessionName: string
): [boolean | undefined, () => Promise<void>] => {
  const [downloading, setDownloading] = React.useState<boolean | undefined>(
    undefined
  );

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
          color="primary"
          data-cy="retry-logs-body"
          size="sm"
          onClick={() => {
            fetchLogs(name);
          }}
        >
          refresh
        </Button>{" "}
        them after a while.
      </p>
    </>
  );
}

function SessionLogsBody(props: LogBodyProps) {
  const { fetchLogs, logs, name, defaultTab } = props;
  if (logs.fetching) return <Loader />;
  if (!logs.fetched) {
    return (
      <p data-cy="logs-unavailable-message">
        Logs unavailable. Please{" "}
        <Button
          color="primary"
          onClick={() => {
            fetchLogs(name);
          }}
          size="sm"
        >
          download
        </Button>{" "}
        them again.
      </p>
    );
  }
  // The keys of logsWithData indicate which logs have data
  const logsWithData = getLogsToShow(logs);
  if (
    Object.keys(logsWithData).length < 1 ||
    !logs.data ||
    logs.data[LOG_ERROR_KEY] != null
  )
    return <NoLogsAvailable fetchLogs={fetchLogs} logs={logs} name={name} />;
  return <LogTabs logs={logsWithData} defaultTab={defaultTab} />;
}

function SessionLogs(props: LogBodyProps) {
  const { fetchLogs, logs, showButtons = true, defaultTab } = props;
  const sessionName = props.name;
  const [downloading, save] = useDownloadLogs(logs, fetchLogs, sessionName);

  useEffect(() => {
    if (fetchLogs) fetchLogs(sessionName);
  }, []); // eslint-disable-line

  // ? Having a minHeight prevent losing the vertical scroll position.
  // TODO: Revisit after #1219
  return (
    <>
      {showButtons && (
        <div className={cx("text-nowrap", "mb-3")}>
          <Button
            key="button"
            color="outline-primary"
            style={{ marginRight: 8 }}
            id="session-refresh-logs"
            onClick={() => {
              fetchLogs(sessionName);
            }}
            disabled={logs.fetching}
          >
            <ArrowRepeat className={cx("bi", "me-1")} /> Refresh logs
          </Button>
          <LogDownloadButton
            logs={logs}
            downloading={downloading}
            save={save}
            color="outline-primary"
          />
        </div>
      )}
      <SessionLogsBody
        fetchLogs={fetchLogs}
        logs={logs}
        name={sessionName}
        defaultTab={defaultTab}
      />
    </>
  );
}

function SessionLogsButtons(props: LogBodyProps) {
  const { fetchLogs, logs } = props;
  const sessionName = props.name;
  const [downloading, save] = useDownloadLogs(logs, fetchLogs, sessionName);

  useEffect(() => {
    if (fetchLogs) fetchLogs(sessionName);
  }, []); // eslint-disable-line

  // ? Having a minHeight prevent losing the vertical scroll position.
  // TODO: Revisit after #1219
  return (
    <>
      <div className={cx("text-nowrap", "mb-3")}>
        <Button
          key="button"
          color="outline-primary"
          style={{ marginRight: 8 }}
          id="session-refresh-logs"
          onClick={() => {
            fetchLogs(sessionName);
          }}
          disabled={logs.fetching}
        >
          <ArrowRepeat className={cx("bi", "me-1")} /> Refresh logs
        </Button>
        <LogDownloadButton
          logs={logs}
          downloading={downloading}
          save={save}
          color="outline-primary"
        />
      </div>
    </>
  );
}

/**
 * Sessions logs container integrating state and actions
 *
 * @param {string} name - server name
 * @param {object} annotations - list of cleaned annotations
 */
interface EnvironmentLogsProps {
  annotations: Record<string, unknown>;
  name: string;
}
const EnvironmentLogs = ({ name, annotations }: EnvironmentLogsProps) => {
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const { logs, fetchLogs } = useGetSessionLogs(
    displayModal.targetServer,
    displayModal.show
  );
  const dispatch = useAppDispatch();
  const toggleLogs = function (target: string) {
    dispatch(
      displaySlice.actions.toggleSessionLogsModal({ targetServer: target })
    );
  };

  const cleanAnnotations = NotebooksHelper.cleanAnnotations(
    annotations
  ) as NotebookAnnotations;

  const modalTitle = !cleanAnnotations.renkuVersion && (
    <div className="fs-5 fw-normal">
      <small>
        {cleanAnnotations["namespace"]}/{cleanAnnotations["projectName"]} [
        {cleanAnnotations["branch"]}@
        {cleanAnnotations["commit-sha"].substring(0, 8)}]
      </small>
    </div>
  );

  return (
    <EnvironmentLogsPresent
      fetchLogs={fetchLogs}
      toggleLogs={toggleLogs}
      logs={logs}
      name={name}
      title={modalTitle}
    />
  );
};

/**
 * Simple environment logs container
 *
 * @param {function} fetchLogs - async function to get logs as an array string
 * @param {function} toggleLogs - toggle logs visibility and fetch logs on show
 * @param {object} logs - log object from redux store enhanced with `show` property
 * @param {string} name - server name
 * @param {ReactNode | string} title - modal title
 */
interface EnvironmentLogsPresentProps {
  title: ReactNode;
  fetchLogs: IFetchableLogs["fetchLogs"];
  logs?: ILogs;
  name: string;
  toggleLogs: (name: string) => unknown;
  defaultTab?: string;
}
function EnvironmentLogsPresent({
  logs,
  name,
  toggleLogs,
  fetchLogs,
  title,
  defaultTab,
}: EnvironmentLogsPresentProps) {
  if (!logs?.show || logs?.show !== name || !logs) return null;

  return (
    <Modal
      isOpen={!!logs.show}
      className="modal-xl"
      scrollable={true}
      toggle={() => {
        toggleLogs(name);
      }}
    >
      <ModalHeader
        className={cx(styles.modalHeader, "header-multiline")}
        toggle={() => {
          toggleLogs(name);
        }}
      >
        {title}
      </ModalHeader>
      <ModalBody className={cx("d-flex", "flex-column", "h-auto")}>
        <SessionLogs
          fetchLogs={fetchLogs}
          logs={logs}
          name={name}
          showButtons={false}
          defaultTab={defaultTab}
        />
      </ModalBody>
      <ModalFooter>
        <SessionLogsButtons fetchLogs={fetchLogs} logs={logs} name={name} />
      </ModalFooter>
    </Modal>
  );
}

export { EnvironmentLogs, EnvironmentLogsPresent, SessionLogs };
