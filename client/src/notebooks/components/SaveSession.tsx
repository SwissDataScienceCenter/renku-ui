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

import React, { Fragment, useState } from "react";

import { Button, Col, Form, FormGroup, FormText, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import { Input, Label } from "../../utils/ts-wrappers";
import { Loader } from "../../utils/components/Loader";
import { Notebook } from "./Session";
import { useGitStatusQuery, useHealthQuery, useRenkuSaveMutation } from "../../features/session/sidecarApi";
import type { GitStatusResult } from "../../features/session/sidecarApi";

function CenteredLoader() {
  return <div className="d-flex justify-content-center">
    <div><Loader size="16" inline="true" margin="2" /></div>
  </div>;
}

interface ModalProps {
  isOpen: boolean;
  closeModal: Function;
}

interface SaveSessionProps extends ModalProps {
  hasSaveAccess: boolean;
  isLogged: boolean;
  notebook: Notebook;
  urlList: any;
}

function SaveSession(props: SaveSessionProps) {
  const { closeModal, isOpen } = props;
  const serverName = props.notebook.data.name;
  const { data, error, isLoading } = useHealthQuery({ serverName });

  let body = null;
  if (!props.isLogged) body = <AnonymousSessionBody closeModal={closeModal} isOpen={isOpen} />;
  else if (!props.hasSaveAccess) body = <NoSaveAccessBody closeModal={closeModal} isOpen={isOpen} />;
  else if (isLoading)
    body = <CenteredLoader />;

  else if (error != null || data == null || data.status !== "running")
    body = <NoSidecarBody closeModal={closeModal} isOpen={isOpen} />;

  else body = <SaveSessionStatusBody closeModal={closeModal} isOpen={isOpen} sessionName={serverName} />;

  return <Modal className="modal-session" isOpen={isOpen} toggle={closeModal}>
    <ModalHeader toggle={closeModal}>
    Save Session
    </ModalHeader>
    <ModalBody>
      {body}
    </ModalBody>
  </Modal>;
}

function AnonymousSessionBody({ closeModal }: ModalProps) {

  return (<Row>
    <Col>
      <div>This is an anonymous session so you will need to log in and redo your work.</div>
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

function NoSaveAccessBody({ closeModal }: ModalProps) {
  return (<Row>
    <Col>
      <div>You do not have sufficient rights to save changes to this project.
        If you wish to keep your changes, you can fork the project and push your changes to the fork.
      </div>
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

function NoSidecarBody({ closeModal }: ModalProps) {

  return (<Row>
    <Col>
      <div>It is not possible to offer a one-click save for this session.
          If you are logged in, please invoke `<code>renku save</code>` in the terminal.
          If this is an anonymous session, you will need to log in and redo your work.</div>
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

interface SaveSessionStatusBodyProps extends ModalProps {
  sessionName: string;
}

function SaveSessionStatusBody({ closeModal, isOpen, sessionName }: SaveSessionStatusBodyProps) {
  const [succeeded, setSucceeded] = useState<boolean|undefined>(undefined);
  const { data, error, isFetching } = useGitStatusQuery({ serverName: sessionName });
  const [renkuSave, { isLoading: saving }] = useRenkuSaveMutation();

  const saveSession = async (commitMessage: string|undefined) => {
    const result = await renkuSave({ serverName: sessionName, message: commitMessage }).unwrap();
    if (result.error == null)
      setSucceeded(true);
    else
      setSucceeded(false);

  };

  if (isFetching || data == null) return <CenteredLoader />;
  if (error) return <NoSidecarBody closeModal={closeModal} isOpen={isOpen} />;
  if (data.result.behind > 0)
    return <SaveSessionNoFFBody closeModal={closeModal} gitStatus={data} isOpen={isOpen} sessionName={sessionName} />;
  if (succeeded === false) return <SaveSessionFailedBody closeModal={closeModal} isOpen={isOpen} />;
  if (succeeded === true) return <SaveSessionUpToDateBody closeModal={closeModal} isOpen={isOpen} />;
  if (!data.result.clean || data.result.ahead > 0) {
    return <SaveSessionBody
      closeModal={closeModal} gitStatus={data} isOpen={isOpen} sessionName={sessionName}
      saving={saving} saveSession={saveSession}
    />;
  }
  return <SaveSessionUpToDateBody closeModal={closeModal} isOpen={isOpen} />;
}


function SaveSessionUpToDateBody({ closeModal }: ModalProps) {
  return (
    <Row>
      <Col>
        <p>Your session is up-to-date. There are no changes that need saving.</p>
        <div className="d-flex justify-content-end">
          <Button className="float-right mt-1 btn-rk-green"
            onClick={closeModal}>
                  Back to Session
          </Button>
        </div>
      </Col>
    </Row>
  );
}


function SaveSessionFailedBody({ closeModal }: ModalProps) {
  return (
    <Row>
      <Col>
        <p>Session save failed. Please try to save by running `<code>renku save</code>` in the terminal.</p>
        <div className="d-flex justify-content-end">
          <Button className="float-right mt-1 btn-rk-green"
            onClick={closeModal}>
                  Back to Session
          </Button>
        </div>
      </Col>
    </Row>
  );
}

interface SaveSessionBodyProps extends SaveSessionStatusBodyProps {
  gitStatus: GitStatusResult;
}

function SaveSessionNoFFBody({ closeModal, gitStatus }: SaveSessionBodyProps) {
  const commitsToken = commitsPhrasing(gitStatus.result.behind);

  return (<Row>
    <Col>
      <div>
        This session is behind the server by {commitsToken}.
        You must first `<code>git pull</code>` in the work from the server before you can save.
      </div>
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

interface MessageFormProps {
  commitMessage?: string;
  setCommitMessage: Function;
  gitStatus: GitStatusResult;
  saving: boolean;
}

function MessageForm(props: MessageFormProps) {
  if (props.gitStatus.result.clean) {
    const commitsToken = commitsPhrasing(props.gitStatus.result.ahead);
    return <p>
      {commitsToken} will be pushed to the server.
    </p>;
  }
  return <Form>
    <FormGroup>
      <Label for="commitMessage">Message</Label>
      <Input type="textarea"
        name="commitMessage"
        id="commitMessage"
        disabled={props.saving}
        placeholder={"You may provide an informative message to explain what has changed."}
        value={props.commitMessage}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { props.setCommitMessage(e.target.value); }}
        className="border-light text-rk-text" />
    </FormGroup>
  </Form>;
}

interface SaveSessionSaveBodyProps extends SaveSessionBodyProps {
  saving: boolean;
  saveSession: (arg0?: string) => unknown;
}

function commitsPhrasing(numberOfCommits: number) {
  return numberOfCommits > 1 ?
    `${numberOfCommits} commits` :
    `${numberOfCommits} commit`;
}

function SaveSessionBody({ closeModal, gitStatus, saveSession, saving }: SaveSessionSaveBodyProps) {
  const [commitMessage, setCommitMessage] = useState(undefined);
  return (
    <Row>
      <Col>
        <p>
        You have work in this session that has not yet been saved to the server.
        </p>
        <MessageForm commitMessage={commitMessage} setCommitMessage={setCommitMessage}
          gitStatus={gitStatus} saving={saving} />
        <Fragment>
          { saving ?
            <FormText color="primary">
              <Loader size="16" inline="true" margin="2" />Saving Session<br />
            </FormText>
            : null
          }
          <div className="d-flex justify-content-end">
            <Button disabled={saving} className="float-right mt-1 btn-outline-rk-green"
              onClick={closeModal}>
                  Back to Session
            </Button>
            <Button type="submit" onClick={() => { saveSession(commitMessage); }} data-cy="save-session-modal-button"
              disabled={saving} className="float-right mt-1  ms-2 btn-rk-green" >
                  Save Session
            </Button>
          </div>
        </Fragment>
      </Col>
    </Row>
  );
}


export default SaveSession;
export { commitsPhrasing };
