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
import { ReactNode, useCallback, useState } from "react";
import { ArrowRepeat, FileEarmarkArrowDown } from "react-bootstrap-icons";
import { Button, ModalFooter, ModalHeader } from "reactstrap";

import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import useRenkuToast from "~/components/toast/useRenkuToast";
import { generateZip } from "~/utils/helpers/HelperFunctions";

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
  query: LogsQuery;
  toggle: () => void;

  title: ReactNode;
  name: string;
}

export default function LogsModal({
  isOpen,
  query,
  toggle,
  title,
  name,
}: LogsModalModalProps) {
  const { data, error, isLoading, isFetching, refetch } = query;

  return (
    <ScrollableModal isOpen={isOpen} className="modal-xl" toggle={toggle}>
      <ModalHeader className="header-multiline" toggle={toggle} tag="div">
        <h2>{title}</h2>
        {/* {sessionState && (
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
        )} */}
      </ModalHeader>
      <>LogsModal placeholder</>
      <ModalFooter>
        <ModalFooterButtons
          isFetching={isFetching}
          refetch={refetch}
          name={name}

          /*fetchLogs={fetchLogs} logs={logs} name={name}*/
        />
      </ModalFooter>
    </ScrollableModal>
  );
}

// interface ModalFooterButtonsProps {
//   data?: Record<string, string | undefined> | undefined;
//   error?: FetchBaseQueryError | SerializedError | undefined;
//   isFetching: boolean;
//   refetch: () => void;
// }

type ModalFooterButtonsProps = Pick<LogsQuery, "isFetching" | "refetch"> &
  Pick<LogsModalModalProps, "name">;

function ModalFooterButtons({
  isFetching,
  name,
  refetch,
}: ModalFooterButtonsProps) {
  // const { fetchLogs, logs } = props;
  // const sessionName = props.name;
  // const [downloading, save] = useDownloadLogs(logs, fetchLogs, sessionName);

  // useEffect(() => {
  //   if (fetchLogs) fetchLogs(sessionName);
  // }, []); // eslint-disable-line

  const [isDownloading, triggerDownload] = useDownloadLogs(name, refetch);

  // // ? Having a minHeight prevent losing the vertical scroll position.
  // // TODO: Revisit after #1219
  return (
    <>
      <Button
        color="outline-primary"
        // style={{ marginRight: 8 }}
        id="session-refresh-logs"
        onClick={refetch}
        // onClick={() => {
        //   fetchLogs(sessionName);
        // }}
        disabled={isFetching}
      >
        <ArrowRepeat className={cx("bi", "me-1")} />
        Refresh logs
      </Button>

      <Button
        data-cy="session-log-download-button"
        color="outline-primary"
        onClick={triggerDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader className="me-1" inline size={16} />
        ) : (
          <FileEarmarkArrowDown className={cx("bi", "me-1")} />
        )}
        {isDownloading ? "Downloading" : "Download"}
      </Button>
    </>
    // <div className={cx("text-nowrap", "mb-3")}>
    //  <Button
    //     key="button"
    //     color="outline-primary"
    //     style={{ marginRight: 8 }}
    //     id="session-refresh-logs"
    //     onClick={() => {
    //       fetchLogs(sessionName);
    //     }}
    //     disabled={logs.fetching}
    //   >
    //     <ArrowRepeat className={cx("bi", "me-1")} /> Refresh logs
    //   </Button>
    //   <LogDownloadButton
    //     logs={logs}
    //     downloading={downloading}
    //     save={save}
    //     color="outline-primary"
    //   />
    // </div>

    //     const LogDownloadButton = ({
    //   logs,
    //   downloading,
    //   save,
    //   size,
    //   color,
    // }: LogDownloadButtonProps) => {
    //   const canDownload = (logs: ILogs) => {
    //     if (logs.fetching || downloading) return false;
    //     if (!logs.data || typeof logs.data === "string") return false;
    //     if (Object.keys(logs.data).length < 1 || logs.data[LOG_ERROR_KEY] != null)
    //       return false;
    //     return true;
    //   };

    //   return (
    //     <Button
    //       data-cy="session-log-download-button"
    //       color={color ?? "primary"}
    //       size={size ?? "s"}
    //       disabled={!canDownload(logs)}
    //       onClick={() => {
    //         save();
    //       }}
    //     >
    //       <FileEarmarkArrowDown className={cx("bi", "me-1")} />
    //       {downloading ? " Downloading " : " Download"}
    //       {downloading && <Loader inline size={16} />}
    //     </Button>
    //   );
    // };
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
  }, []);

  return [isDownloading, triggerDownload];

  // const save = async () => {
  //   setIsDownloading(true);
  //   const fullLogs = await fetchLogs(sessionName, true);

  //   if (!fullLogs) {
  //     setDownloading(false);
  //     return;
  //   }
  //   const logName = `Logs_${sessionName}`;
  //   const files = [];
  //   for (const fullLogsKey in fullLogs) {
  //     const data = fullLogs[fullLogsKey];
  //     // create the blob element to download logs as a file
  //     const file = new Blob([data], { type: "text/plain" });
  //     files.push({
  //       name: `${logName}/${fullLogsKey}.txt`,
  //       content: file,
  //     });
  //   }

  //   await generateZip(files, logName);
  //   setIsDownloading(false);
  // };

  // return [downloading, save];
}
