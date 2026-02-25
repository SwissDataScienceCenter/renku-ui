/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { startCase } from "lodash-es";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRepeat, FileEarmarkArrowDown } from "react-bootstrap-icons";
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";

import { ErrorAlert } from "~/components/Alert";
import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import useRenkuToast from "~/components/toast/useRenkuToast";
import { generateZip } from "~/utils/helpers/HelperFunctions";
import { getSessionStatusStyles } from "../sessionsV2/components/SessionStatus/SessionStatus";
import type { SessionV2 } from "../sessionsV2/sessionsV2.types";

interface LogsQuery {
  data?: Record<string, string | undefined> | undefined;
  error?: FetchBaseQueryError | SerializedError | undefined;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => Promise<{
    data?: Record<string, string | undefined> | undefined;
    error?: FetchBaseQueryError | SerializedError | undefined;
  }>;
}

interface LogsModalModalProps {
  isOpen: boolean;
  name: string;
  query: LogsQuery;
  sessionError?: string;
  sessionState?: SessionV2["status"]["state"];
  title: ReactNode;
  toggle: () => void;
  defaultTab?: string;
}

export default function LogsModal({
  isOpen,
  name,
  query,
  sessionError,
  sessionState,
  title,
  toggle,
  defaultTab,
}: LogsModalModalProps) {
  const { data, error, isLoading, isFetching, refetch } = query;

  return (
    <ScrollableModal className="modal-xl" isOpen={isOpen} toggle={toggle}>
      <ModalHeader className="header-multiline" toggle={toggle} tag="div">
        <h2>{title}</h2>
        {sessionState && (
          <h3
            className={cx(
              "fs-4",
              "fst-italic",
              "mb-0",
              getSessionStatusStyles({
                status: { state: sessionState },
                image: "url",
              })["textColorCard"]
            )}
          >
            Session status: {sessionState}
          </h3>
        )}
      </ModalHeader>
      <ModalBody className={cx("d-flex", "flex-column", "h-auto")}>
        {sessionError && <ErrorAlert>{sessionError}</ErrorAlert>}
        <LogsModalBody
          data={data}
          error={error}
          isFetching={isFetching}
          isLoading={isLoading}
          refetch={refetch}
          defaultTab={defaultTab}
        />
      </ModalBody>
      <ModalFooter>
        <ModalFooterButtons
          data={data}
          isFetching={isFetching}
          name={name}
          refetch={refetch}
        />
      </ModalFooter>
    </ScrollableModal>
  );
}

type LogsModalBodyProps = LogsQuery & Pick<LogsModalModalProps, "defaultTab">;

function LogsModalBody({
  data,
  error,
  isFetching,
  isLoading,
  refetch,
  defaultTab,
}: LogsModalBodyProps) {
  if (isLoading) {
    return <Loader />;
  }

  if (error || data == null) {
    return (
      <p data-cy="logs-unavailable-message" className="mb-0">
        Logs unavailable. Please try to{" "}
        <Button
          color="primary"
          onClick={refetch}
          size="sm"
          disabled={isFetching}
        >
          refresh
        </Button>{" "}
        them again.
      </p>
    );
  }

  if (Object.keys(data).length < 1) {
    return <NoLogsAvailable refetch={refetch} />;
  }

  return <TabbedLogs data={data} defaultTab={defaultTab} />;
}

type NoLogsAvailableProps = Pick<LogsQuery, "refetch">;

function NoLogsAvailable({ refetch }: NoLogsAvailableProps) {
  return (
    <>
      <p data-cy="no-logs-message">No logs available for this pod yet.</p>
      <p>
        You can try to{" "}
        <Button
          color="primary"
          data-cy="retry-logs-body"
          size="sm"
          onClick={refetch}
        >
          refresh
        </Button>{" "}
        them after a while.
      </p>
    </>
  );
}

interface TabbedLogsProps {
  data: Exclude<LogsQuery["data"], undefined>;
  defaultTab?: string;
}

function TabbedLogs({ data, defaultTab }: TabbedLogsProps) {
  const sortedLogs = useMemo(() => {
    const result: LogTab[] = [];
    const keys = Object.keys(data);
    for (const key of keys) {
      if (key === defaultTab) {
        result.push({ tab: key, content: data[key] ?? "" });
        break;
      }
    }
    for (const key of keys) {
      if (key !== defaultTab) {
        result.push({ tab: key, content: data[key] ?? "" });
      }
    }
    return result;
  }, [data, defaultTab]);

  const [activeTab, setActiveTab] = useState<string>(
    sortedLogs.at(0)?.tab ?? ""
  );

  const preRef = useRef<HTMLPreElement>(null);

  // Scrolls to the bottom of the logs when we change tabs
  useEffect(() => {
    if (preRef.current && activeTab) {
      const pre = preRef.current;
      requestAnimationFrame(() => {
        pre.scrollTop = pre.scrollHeight;
      });
    }
  }, [activeTab]);

  return (
    <>
      <Nav
        className={cx("mb-2", "position-sticky", "top-0", "z-index-100")}
        tabs
      >
        {sortedLogs.map(({ tab }) => (
          <NavItem key={tab} data-cy="log-tab" role="button">
            <NavLink
              className={cx(activeTab === tab && "active")}
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              {startCase(tab)}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent
        activeTab={activeTab}
        className={cx("flex-1", "overflow-y-auto")}
      >
        {sortedLogs.map(({ tab, content }) => (
          <TabPane key={tab} tabId={tab}>
            <div className={cx("d-flex", "flex-column")}>
              <pre
                className="overflow-auto"
                // eslint-disable-next-line spellcheck/spell-checker
                style={{ whiteSpace: "pre-line", maxHeight: "60vh" }}
                ref={activeTab === tab ? preRef : undefined}
              >
                {content}
              </pre>
            </div>
          </TabPane>
        ))}
      </TabContent>
    </>
  );
}

interface LogTab {
  tab: string;
  content: string;
}

type ModalFooterButtonsProps = Pick<
  LogsQuery,
  "data" | "isFetching" | "refetch"
> &
  Pick<LogsModalModalProps, "name">;

function ModalFooterButtons({
  data,
  isFetching,
  name,
  refetch,
}: ModalFooterButtonsProps) {
  const [isDownloading, triggerDownload] = useDownloadLogs(name, refetch);
  const canDownload =
    !isFetching &&
    !isDownloading &&
    data != null &&
    Object.keys(data).length >= 1;

  return (
    <>
      <Button
        color="outline-primary"
        id="session-refresh-logs"
        onClick={refetch}
        disabled={isFetching}
      >
        {isFetching ? (
          <Loader className="me-1" inline size={16} />
        ) : (
          <ArrowRepeat className={cx("bi", "me-1")} />
        )}
        Refresh logs
      </Button>

      <Button
        data-cy="session-log-download-button"
        color="outline-primary"
        onClick={triggerDownload}
        disabled={!canDownload}
      >
        {isDownloading ? (
          <Loader className="me-1" inline size={16} />
        ) : (
          <FileEarmarkArrowDown className={cx("bi", "me-1")} />
        )}
        {isDownloading ? "Downloading" : "Download"}
      </Button>
    </>
  );
}

/**
 * Hook to download the logs as an archive
 *
 * NOTE: will download with maxLines = 250, so the logs will be incomplete
 */
function useDownloadLogs(
  name: string,
  refetch: LogsQuery["refetch"]
): [boolean, () => void] {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { renkuToastSuccess, renkuToastDanger } = useRenkuToast();

  const triggerDownload = useCallback(() => {
    let ignore: boolean = false;
    setIsDownloading(true);
    refetch()
      .then(async ({ data, error }) => {
        if (error != null || data == null) {
          renkuToastDanger({ textHeader: "Failed to download logs" });
          return;
        }
        const logName = `Logs_${name}`;
        const files: { name: string; content: Blob }[] = [];
        for (const key in data) {
          const contents = data[key] ?? "";
          // create the blob element to download logs as a file
          const file = new Blob([contents], { type: "text/plain" });
          files.push({
            name: `${logName}/${key}.txt`,
            content: file,
          });
        }
        await generateZip(files, logName);
        renkuToastSuccess({ textHeader: "Successfully downloaded logs" });
      })
      .catch(() => {
        renkuToastDanger({ textHeader: "Failed to download logs" });
      })
      .finally(() => {
        if (!ignore) {
          setIsDownloading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [name, refetch, renkuToastDanger, renkuToastSuccess]);

  return [isDownloading, triggerDownload];
}
