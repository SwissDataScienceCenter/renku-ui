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
import { skipToken, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { DateTime, Duration } from "luxon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRepeat,
  ClockHistory,
  FileEarmarkArrowDown,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  ListGroup,
  ListGroupItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { decodeTime as decodeTimeULID, isValid as isValidULID } from "ulid";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { toHumanDateTime } from "~/utils/helpers/DateTimeUtils";
import { toHumanRelativeDuration } from "~/utils/helpers/DurationUtils";
import { LogsModalBody, useDownloadLogs } from "../logsDisplay/LogsModal";
import type { SessionLauncher } from "../sessionsV2/api/sessionLaunchersV2.api";
import {
  persistedLogsApi,
  useGetPersistedLogsForModalQuery,
  useGetPersistedLogsSessionsByLauncherIdRunsQuery,
  type SessionRun,
  type SessionRuns,
} from "./api/persistedLogs.api";

interface PersistedLogsHistoryModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

export default function SessionsPersistedLogsHistoryModal({
  isOpen,
  launcher,
  toggle,
}: PersistedLogsHistoryModalProps) {
  const {
    data: sessionRuns,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useGetPersistedLogsSessionsByLauncherIdRunsQuery(
    isOpen
      ? {
          launcherId: launcher.id,
        }
      : skipToken,
  );

  const [selectedRunId, setSelectedRunId] = useState("");
  const onClickBack = useCallback(() => {
    setSelectedRunId("");
  }, []);

  return (
    <ScrollableModal
      backdrop="static"
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <ClockHistory className={cx("bi", "me-1")} />
        Logs history for {launcher.name}
      </ModalHeader>
      <ModalBody>
        <LogsHistoryBody
          error={error}
          isLoading={isLoading}
          isOpen={isOpen}
          selectedRunId={selectedRunId}
          sessionRuns={sessionRuns}
          setSelectedRunId={setSelectedRunId}
        />
      </ModalBody>
      <ModalFooter>
        {isOpen && selectedRunId ? (
          <>
            <Button
              className="me-auto"
              color="outline-primary"
              data-cy="logs-history-back-to-list"
              onClick={onClickBack}
            >
              <ArrowLeft className={cx("bi", "me-1")} /> Back to runs list
            </Button>
            <LogsActions
              selectedRunId={selectedRunId}
              sessionRuns={sessionRuns}
            />
          </>
        ) : (
          <Button
            color="outline-primary"
            data-cy="logs-history-refetch-session-runs"
            onClick={refetch}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <ArrowRepeat className={cx("bi", "me-1")} />
            )}
            Refresh runs
          </Button>
        )}
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

interface LogsHistoryBodyProps {
  error: FetchBaseQueryError | SerializedError | undefined;
  isLoading: boolean;
  isOpen: boolean;
  selectedRunId: string;
  sessionRuns: SessionRuns | undefined;
  setSelectedRunId: (runId: string) => void;
}

function LogsHistoryBody({
  error,
  isLoading,
  isOpen,
  selectedRunId,
  sessionRuns,
  setSelectedRunId,
}: LogsHistoryBodyProps) {
  const selectedSessionRun = useMemo(
    () =>
      selectedRunId
        ? sessionRuns?.find(({ id }) => id === selectedRunId)
        : null,
    [selectedRunId, sessionRuns],
  );

  useEffect(() => {
    if (selectedRunId && selectedSessionRun == null) {
      setSelectedRunId("");
    }
  }, [selectedRunId, selectedSessionRun, setSelectedRunId]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || sessionRuns == null) {
    return (
      <>
        <p>Logs history not available.</p>
        <RtkOrDataServicesError error={error} />
      </>
    );
  }

  if (sessionRuns.length == 0) {
    return (
      <p className="mb-0">
        The logs history is empty. Note that logs are purged after a while.
      </p>
    );
  }

  if (selectedSessionRun) {
    return <LogsDisplay isOpen={isOpen} sessionRun={selectedSessionRun} />;
  }

  return (
    <ListGroup tag="div">
      {sessionRuns.map((sessionRun) => (
        <SessionRunItem
          key={sessionRun.id}
          sessionRun={sessionRun}
          setSelectedRunId={setSelectedRunId}
        />
      ))}
    </ListGroup>
  );
}

interface SessionRunItemProps {
  sessionRun: SessionRun;
  setSelectedRunId: (runId: string) => void;
}

function SessionRunItem({ sessionRun, setSelectedRunId }: SessionRunItemProps) {
  const timestamp = useMemo(
    () =>
      isValidULID(sessionRun.id)
        ? DateTime.fromMillis(decodeTimeULID(sessionRun.id)) // eslint-disable-line spellcheck/spell-checker
        : null,
    [sessionRun.id],
  );

  const onClick = useCallback(() => {
    setSelectedRunId(sessionRun.id);
  }, [sessionRun.id, setSelectedRunId]);

  const [now, setNow] = useState<DateTime>(DateTime.utc());
  const timeoutRef = useRef<number | null>(null);

  // Refresh every duration / 10, clamped to [5 seconds, 10 minutes]
  useEffect(() => {
    if (timestamp == null || !timestamp.isValid) {
      return;
    }

    const duration = now.diff(timestamp);
    /* eslint-disable spellcheck/spell-checker */
    const refresh = Math.min(
      Math.max(
        duration.toMillis() / 10,
        Duration.fromObject({ seconds: 5 }).toMillis(),
      ),
      Duration.fromObject({ minutes: 10 }).toMillis(),
    );
    /* eslint-enable spellcheck/spell-checker */

    timeoutRef.current = window.setTimeout(() => {
      setNow(DateTime.utc());
    }, refresh);
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = null;
    };
  }, [now, timestamp]);

  return (
    <ListGroupItem tag="button" action onClick={onClick}>
      {sessionRun.submission_id && (
        <>
          {sessionRun.submission_id}
          {" | "}
        </>
      )}
      <>
        {timestamp ? (
          <>
            {toHumanDateTime({ datetime: timestamp })} (
            {toHumanRelativeDuration({ datetime: timestamp, now })})
          </>
        ) : (
          sessionRun.id
        )}
      </>
    </ListGroupItem>
  );
}

interface LogsDisplayProps {
  isOpen: boolean;
  sessionRun: SessionRun;
}

function LogsDisplay({ isOpen, sessionRun }: LogsDisplayProps) {
  const query = useGetPersistedLogsForModalQuery(
    isOpen
      ? {
          launcherId: sessionRun.launcher_id,
          params: {
            submission_id: sessionRun.submission_id,
          },
        }
      : skipToken,
  );

  return (
    <LogsModalBody
      data={query.data}
      error={query.error}
      isFetching={query.isFetching}
      isLoading={query.isLoading}
      refetch={query.refetch}
      // eslint-disable-next-line spellcheck/spell-checker
      defaultTab="amalthea-session"
    />
  );
}

interface LogsActionsProps {
  selectedRunId: string;
  sessionRuns: SessionRuns | undefined;
}

function LogsActions({ selectedRunId, sessionRuns }: LogsActionsProps) {
  const sessionRun = useMemo(
    () =>
      selectedRunId
        ? sessionRuns?.find(({ id }) => id === selectedRunId)
        : null,
    [selectedRunId, sessionRuns],
  );

  if (sessionRun == null) {
    return null;
  }

  return <LogsActionsInner sessionRun={sessionRun} />;
}

interface LogsActionsInnerProps {
  sessionRun: SessionRun;
}

function LogsActionsInner({ sessionRun }: LogsActionsInnerProps) {
  const logsName = `${sessionRun.submission_id ? sessionRun.submission_id + "_" : ""}${sessionRun.launcher_id}`;

  const query = useGetPersistedLogsForModalQuery({
    launcherId: sessionRun.launcher_id,
    params: {
      submission_id: sessionRun.submission_id,
    },
  });

  const [trigger] =
    persistedLogsApi.endpoints.getPersistedLogsForModal.useLazyQuery();
  const downloadQueryTrigger = useCallback(
    () =>
      trigger({
        launcherId: sessionRun.launcher_id,
        params: { submission_id: sessionRun.submission_id },
      }),
    [sessionRun.launcher_id, sessionRun.submission_id, trigger],
  );

  const [isDownloading, triggerDownload] = useDownloadLogs(
    logsName,
    query.refetch,
    downloadQueryTrigger,
  );
  const canDownload =
    !query.isFetching &&
    !isDownloading &&
    query.data != null &&
    Object.keys(query.data).length >= 1;

  return (
    <>
      <Button
        color="outline-primary"
        id="session-refresh-logs"
        onClick={downloadQueryTrigger}
        disabled={query.isFetching}
      >
        {query.isFetching ? (
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
