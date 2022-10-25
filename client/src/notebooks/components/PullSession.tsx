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

import React, { useState } from "react";

import { Button, Col, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import { Loader } from "../../utils/components/Loader";
import { Notebook } from "./Session";
import { useGitStatusQuery, useHealthQuery, useRenkuPullMutation } from "../../features/session/sidecarApi";
import type { GitStatusResult } from "../../features/session/sidecarApi";
import { commitsPhrasing } from "./SaveSession";

function CenteredLoader() {
  return <div className="d-flex justify-content-center">
    <div><Loader size="16" inline="true" margin="2" /></div>
  </div>;
}

interface ModalProps {
  isOpen: boolean;
  closeModal: Function;
}

interface PullSessionProps extends ModalProps {
  hasPullAccess: boolean;
  isLogged: boolean;
  notebook: Notebook;
  urlList: any;
}

function PullSession(props: PullSessionProps) {
  const { closeModal, isOpen } = props;
  const serverName = props.notebook.data.name;
  const { data, error, isLoading } = useHealthQuery({ serverName });

  let body = null;
  if (isLoading)
    body = <CenteredLoader />;

  else if (error != null || data == null || data.status !== "running")
    body = <NoSidecarBody closeModal={closeModal} isOpen={isOpen} />;

  else body = <PullSessionStatusBody closeModal={closeModal} isOpen={isOpen} sessionName={serverName} />;

  return <Modal className="modal-session" isOpen={isOpen} toggle={closeModal}>
    <ModalHeader toggle={closeModal}>
      Refresh Session
    </ModalHeader>
    <ModalBody>
      {body}
    </ModalBody>
  </Modal>;
}

function NoSidecarBody({ closeModal }: ModalProps) {

  return (<Row>
    <Col>
      <div>It is not possible to offer a one-click refresh for this session.</div>
      <div className="d-flex justify-content-end">
        <Button className="float-right mt-1 btn-outline-rk-green"
          onClick={closeModal}>
          Back to Session
        </Button>
      </div>
    </Col>
  </Row>
  );
}

interface PullSessionStatusBodyProps extends ModalProps {
  sessionName: string;
}

function PullSessionStatusBody({ closeModal, isOpen, sessionName }: PullSessionStatusBodyProps) {
  const [succeeded, setSucceeded] = useState<boolean|undefined>(undefined);
  const { data, error, isFetching } = useGitStatusQuery({ serverName: sessionName });
  const [renkuPull, { isLoading: pulling }] = useRenkuPullMutation();

  const pullSession = async (commitMessage: string|undefined) => {
    setSucceeded(undefined);
    const result = await renkuPull({ serverName: sessionName }).unwrap();
    if (result.error == null)
      setSucceeded(true);
    else
      setSucceeded(false);
  };

  if (isFetching || data == null) return <CenteredLoader />;
  if (error) return <NoSidecarBody closeModal={closeModal} isOpen={isOpen} />;
  if (succeeded === false) return <PullSessionFailedBody closeModal={closeModal} isOpen={isOpen} />;
  if (succeeded === true) return <PullSessionUpToDateBody closeModal={closeModal} isOpen={isOpen} />;
  if (data.result.behind > 0) {
    return <PullSessionNoFFBody
      closeModal={closeModal}
      gitStatus={data}
      isOpen={isOpen}
      sessionName={sessionName}
      pulling={pulling}
      pullSession={pullSession} />;
  }
  if (!data.result.clean || data.result.ahead > 0)
    return <PullSessionUpToDateBody closeModal={closeModal} isOpen={isOpen} />;
  return <PullSessionUpToDateBody closeModal={closeModal} isOpen={isOpen} />;
}


function PullSessionUpToDateBody({ closeModal }: ModalProps) {
  return (
    <Row>
      <Col>
        <p>Your session is up-to-date. There are no changes that need pulling.</p>
        <div className="d-flex justify-content-end">
          <Button className="float-right mt-1 btn-rk-green" onClick={closeModal}>
            Back to Session
          </Button>
        </div>
      </Col>
    </Row>
  );
}


function PullSessionFailedBody({ closeModal }: ModalProps) {
  return (
    <Row>
      <Col>
        <p>Session pull failed. Please try to pull by running `<code>renku pull</code>` in the terminal.</p>
        <div className="d-flex justify-content-end">
          <Button className="float-right mt-1 btn-rk-green" onClick={closeModal}>
            Back to Session
          </Button>
        </div>
      </Col>
    </Row>
  );
}

interface PullSessionBodyProps extends PullSessionStatusBodyProps {
  gitStatus: GitStatusResult;
  pullSession: Function;
  pulling: boolean;
}

function PullSessionNoFFBody({ closeModal, gitStatus, pullSession, pulling }: PullSessionBodyProps) {
  const commitsToken = commitsPhrasing(gitStatus.result.behind);

  return (<Row>
    <Col>
      <div className="mb-3">
        This session is behind the server by {commitsToken}.
        Continue to pull those changes in your current session.
      </div>
      <div className="d-flex justify-content-end">
        <Button className="float-right mt-1 btn-outline-rk-green"
          onClick={closeModal}>
          Back to Session
        </Button>
        <Button type="submit" onClick={() => { pullSession(); }} data-cy="pull-session-modal-button"
          disabled={pulling} className="float-right mt-1  ms-2 btn-rk-green" >
          Continue
        </Button>
      </div>
    </Col>
  </Row>
  );
}

export default PullSession;
