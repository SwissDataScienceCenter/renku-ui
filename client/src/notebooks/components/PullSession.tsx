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

import React from "react";

import { Button, Col, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import { Loader } from "../../utils/components/Loader";
import { useGitStatusQuery, useHealthQuery, useRenkuPullMutation } from "../../features/session/sidecarApi";
import type { GitStatusResult } from "../../features/session/sidecarApi";

import { Notebook } from "./Session";
import { CenteredLoader, InformationalBody, commitsPhrasing } from "./Sidecar";
import type { CloseModalProps, ModalProps } from "./Sidecar";

interface PullSessionProps extends ModalProps {
  isSessionReady: boolean;
  notebook: Notebook;
  urlList: any;
}

function PullSession(props: PullSessionProps) {
  const { closeModal, isOpen } = props;

  const body = (!props.isSessionReady) ?
    <p>The session is not available yet.</p> :
    <RunningPullSessionBody {...props} />;

  return <Modal className="modal-session" isOpen={isOpen} toggle={closeModal}>
    <ModalHeader toggle={closeModal}>
      Refresh Session
    </ModalHeader>
    <ModalBody>
      {body}
    </ModalBody>
  </Modal>;
}

function RunningPullSessionBody(props: PullSessionProps) {
  const { closeModal, isOpen } = props;
  const serverName = props.notebook.data.name;
  const { data, error, isLoading } = useHealthQuery({ serverName });

  let body = null;
  if (isLoading)
    body = <CenteredLoader />;

  else if (error != null || data == null || data.status !== "running")
    body = <NoSidecarBody closeModal={closeModal} />;

  else body = <PullSessionStatusBody closeModal={closeModal} isOpen={isOpen} sessionName={serverName} />;

  return body;
}

function NoSidecarBody({ closeModal }: CloseModalProps) {

  return (<InformationalBody closeModal={closeModal}>
    <div>It is not possible to offer a one-click refresh for this session.
    You can, however, execute `<code>renku pull</code>` in the terminal to retrieve
    the latest work from the server.
    </div>
  </InformationalBody>
  );
}

interface PullSessionStatusBodyProps extends ModalProps {
  sessionName: string;
}

function PullSessionStatusBody({ closeModal, isOpen, sessionName }: PullSessionStatusBodyProps) {
  const [succeeded, setSucceeded] = React.useState<boolean|undefined>(undefined);
  const { data, error, isFetching } = useGitStatusQuery({ serverName: sessionName });
  const [renkuPull, { isLoading: pulling }] = useRenkuPullMutation();

  const pullSession = async () => {
    setSucceeded(undefined);
    const result = await renkuPull({ serverName: sessionName }).unwrap();
    if (result.error == null)
      setSucceeded(true);
    else
      setSucceeded(false);
  };

  if (isFetching || data == null) return <CenteredLoader />;
  if (error) return <NoSidecarBody closeModal={closeModal} />;
  if (succeeded === false) return <PullSessionFailedBody closeModal={closeModal} />;
  if (succeeded === true) return <PullSessionUpToDateBody closeModal={closeModal}/>;
  if (data.result.behind < 1) return <PullSessionUpToDateBody closeModal={closeModal} />;
  if (!data.result.clean || data.result.ahead > 0)
    return <PullSessionDivergedBody clean={data.result.clean} closeModal={closeModal} />;
  if (data.result.behind > 0) {
    return <PullSessionBody
      closeModal={closeModal}
      gitStatus={data}
      isOpen={isOpen}
      sessionName={sessionName}
      pulling={pulling}
      pullSession={pullSession} />;
  }
  return <PullSessionUpToDateBody closeModal={closeModal} />;
}

interface DivergedProps extends CloseModalProps {
  clean: boolean;
}

function PullSessionDivergedBody({ clean, closeModal }: DivergedProps) {
  return (
    <InformationalBody closeModal={closeModal}>
      <p>
        Your session has diverged from the origin.
      </p>
      {clean ? <span></span> :
        <div>First, commit your unsaved work with
          <div className="ps-4"><code>git commit -m [reason for changes]</code></div>
        </div>}
      <div className="pt-2">{clean ? "You" : "Then, you"} should run{" "}
        <code>git pull</code> in the terminal to get the changes from the server.
        You may need to manually resolve merge conflicts to incorporate the changes.
      </div>
    </InformationalBody>
  );
}


function PullSessionFailedBody({ closeModal }: CloseModalProps) {
  return (
    <InformationalBody closeModal={closeModal}>
      <p>Session pull failed. Please try to pull by running `<code>renku pull</code>` in the terminal.</p>
    </InformationalBody>
  );
}

function PullSessionUpToDateBody({ closeModal }: CloseModalProps) {
  return (
    <InformationalBody closeModal={closeModal}>
      <p>Your session is up-to-date. There are no changes that need retrieving.</p>
    </InformationalBody>
  );
}


interface PullSessionBodyProps extends PullSessionStatusBodyProps {
  gitStatus: GitStatusResult;
  pullSession: Function;
  pulling: boolean;
}

function PullSessionBody({ closeModal, gitStatus, pullSession, pulling }: PullSessionBodyProps) {
  const commitsToken = commitsPhrasing(gitStatus.result.behind);
  const pullText = pulling ? <span><Loader inline={true} size={16} />Pulling Changes</span> : "Pull Changes";
  return (<Row>
    <Col>
      <div className="mb-3">
        This session is behind the server by {commitsToken}.
        Pull changes to bring them into the session.
      </div>
      <div className="d-flex justify-content-end">
        <Button className="float-right mt-1 btn-outline-rk-green"
          onClick={closeModal}>
          Back to Session
        </Button>
        <Button type="submit" onClick={() => { pullSession(); }} data-cy="pull-changes-modal-button"
          disabled={pulling} className="float-right mt-1  ms-2 btn-rk-green" >
          {pullText}
        </Button>
      </div>
    </Col>
  </Row>
  );
}

export default PullSession;
