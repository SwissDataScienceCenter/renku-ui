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

import React, { useCallback, useState } from "react";
import cx from "classnames";
import { Button, Col, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { Loader } from "../../../components/Loader";
import {
  CenteredLoader,
  InformationalBody,
  commitsPhrasing,
} from "../../../notebooks/components/Sidecar";
import {
  GitStatusResult,
  useGitStatusQuery,
  useHealthQuery,
  useRenkuPullMutation,
} from "../sidecarApi";

interface PullSessionModalProps {
  isOpen: boolean;
  isSessionReady: boolean;
  sessionName: string;
  toggleModal: () => void;
}

export default function PullSessionModal({
  isOpen,
  isSessionReady,
  sessionName,
  toggleModal,
}: PullSessionModalProps) {
  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Refresh Session</ModalHeader>
      <ModalBody>
        {isSessionReady ? (
          <PullSessionModalContent
            sessionName={sessionName}
            toggleModal={toggleModal}
          />
        ) : (
          <p>The session is not available yet.</p>
        )}
      </ModalBody>
    </Modal>
  );
}

interface PullSessionModalContentProps {
  sessionName: string;
  toggleModal: () => void;
}

function PullSessionModalContent({
  sessionName,
  toggleModal,
}: PullSessionModalContentProps) {
  const { data, error, isLoading } = useHealthQuery({
    serverName: sessionName,
  });

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (
    error != null ||
    data == null ||
    data.status !== "running" ||
    data.error
  ) {
    return <NoSidecarBody toggleModal={toggleModal} />;
  }

  return (
    <PullSessionStatusBody
      sessionName={sessionName}
      toggleModal={toggleModal}
    />
  );
}

interface NoSidecarBodyProps {
  toggleModal: () => void;
}

function NoSidecarBody({ toggleModal }: NoSidecarBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <div>
        It is not possible to offer a one-click refresh for this session. You
        can, however, execute `<code>renku pull</code>` in the terminal to
        retrieve the latest work from the server.
      </div>
    </InformationalBody>
  );
}

interface PullSessionStatusBodyProps {
  sessionName: string;
  toggleModal: () => void;
}

function PullSessionStatusBody({
  sessionName,
  toggleModal,
}: PullSessionStatusBodyProps) {
  const [succeeded, setSucceeded] = useState<boolean | undefined>(undefined);
  const { data, error, isFetching } = useGitStatusQuery({
    serverName: sessionName,
  });
  const [renkuPull, { isLoading: pulling }] = useRenkuPullMutation();

  const pullSession = useCallback(async () => {
    setSucceeded(undefined);
    const result = await renkuPull({ serverName: sessionName }).unwrap();
    setSucceeded(result.error == null);
  }, [renkuPull, sessionName]);

  if (isFetching || data == null) {
    return <CenteredLoader />;
  }
  if (error || data.error) {
    return <NoSidecarBody toggleModal={toggleModal} />;
  }
  if (succeeded === false) {
    return <PullSessionFailedBody toggleModal={toggleModal} />;
  }
  if (succeeded === true) {
    return <PullSessionUpToDateBody toggleModal={toggleModal} />;
  }
  if (data.result.behind < 1) {
    return <PullSessionUpToDateBody toggleModal={toggleModal} />;
  }
  if (!data.result.clean || data.result.ahead > 0) {
    return (
      <PullSessionDivergedBody
        clean={data.result.clean}
        toggleModal={toggleModal}
      />
    );
  }
  if (data.result.behind > 0) {
    return (
      <PullSessionBody
        gitStatus={data}
        pulling={pulling}
        pullSession={pullSession}
        toggleModal={toggleModal}
      />
    );
  }
  return <PullSessionUpToDateBody toggleModal={toggleModal} />;
}

interface PullSessionFailedBodyProps {
  toggleModal: () => void;
}

function PullSessionFailedBody({ toggleModal }: PullSessionFailedBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <p>
        Session pull failed. Please try to pull by running `
        <code>renku pull</code>` in the terminal.
      </p>
    </InformationalBody>
  );
}

interface PullSessionUpToDateBodyProps {
  toggleModal: () => void;
}

function PullSessionUpToDateBody({
  toggleModal,
}: PullSessionUpToDateBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <p>
        Your session is up-to-date. There are no changes that need retrieving.
      </p>
    </InformationalBody>
  );
}

interface PullSessionDivergedBodyProps {
  clean: boolean;
  toggleModal: () => void;
}

function PullSessionDivergedBody({
  clean,
  toggleModal,
}: PullSessionDivergedBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <p>Your session has diverged from the origin.</p>
      {clean ? (
        <span></span>
      ) : (
        <div>
          First, commit your unsaved work with
          <div className="ps-4">
            <code>git commit -m [reason for changes]</code>
          </div>
        </div>
      )}
      <div className="pt-2">
        {clean ? "You" : "Then, you"} should run <code>git pull</code> in the
        terminal to get the changes from the server. You may need to manually
        resolve merge conflicts to incorporate the changes.
      </div>
    </InformationalBody>
  );
}

interface PullSessionBodyProps {
  gitStatus: GitStatusResult;
  pullSession: () => void;
  pulling: boolean;
  toggleModal: () => void;
}

function PullSessionBody({
  gitStatus,
  pullSession,
  pulling,
  toggleModal,
}: PullSessionBodyProps) {
  const commitsToken = commitsPhrasing(gitStatus.result.behind);
  const pullText = pulling ? (
    <span>
      <Loader inline size={16} />
      Pulling Changes
    </span>
  ) : (
    "Pull Changes"
  );
  return (
    <Row>
      <Col>
        <div className="mb-3">
          This session is behind the server by {commitsToken}. Pull changes to
          bring them into the session.
        </div>
        <div className={cx("d-flex", "justify-content-end")}>
          <Button
            className={cx("float-right", "mt-1", "btn-outline-rk-green")}
            onClick={toggleModal}
          >
            Back to Session
          </Button>
          <Button
            className={cx("float-right", "mt-1", "ms-2", "btn-rk-green")}
            data-cy="pull-changes-modal-button"
            disabled={pulling}
            onClick={pullSession}
            type="submit"
          >
            {pullText}
          </Button>
        </div>
      </Col>
    </Row>
  );
}
