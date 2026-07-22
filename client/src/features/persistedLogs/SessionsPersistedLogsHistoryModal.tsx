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
import { DateTime, Duration } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRepeat, ClockHistory, XLg } from "react-bootstrap-icons";
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
import type { SessionLauncher } from "../sessionsV2/api/sessionLaunchersV2.api";
import {
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
  } = useGetPersistedLogsSessionsByLauncherIdRunsQuery({
    launcherId: launcher.id,
  });

  return (
    <ScrollableModal
      backdrop="static"
      centered
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
          sessionRuns={sessionRuns}
        />
      </ModalBody>
      <ModalFooter>
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
  sessionRuns: SessionRuns | undefined;
}

function LogsHistoryBody({
  error,
  isLoading,
  sessionRuns,
}: LogsHistoryBodyProps) {
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

  //  || data == null) {
  //     return (
  //       <p data-cy="logs-unavailable-message" className="mb-0">
  //         Logs unavailable. Please try to{" "}
  //         <Button
  //           color="primary"
  //           onClick={refetch}
  //           size="sm"
  //           disabled={isFetching}
  //         >
  //           refresh
  //         </Button>{" "}
  //         them again.
  //       </p>
  //     );
  //   }

  return (
    <ListGroup>
      {sessionRuns.map((sessionRun) => (
        <SessionRunItem key={sessionRun.id} sessionRun={sessionRun} />
      ))}
    </ListGroup>
  );
}

interface SessionRunItemProps {
  sessionRun: SessionRun;
}

function SessionRunItem({ sessionRun }: SessionRunItemProps) {
  const timestamp = useMemo(
    () =>
      isValidULID(sessionRun.id)
        ? DateTime.fromMillis(decodeTimeULID(sessionRun.id)) // eslint-disable-line spellcheck/spell-checker
        : null,
    [sessionRun.id],
  );

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
    <ListGroupItem>
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
