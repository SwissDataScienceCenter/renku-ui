/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { SuccessAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { User } from "../../../model/RenkuModels";
import {
  CenteredLoader,
  InformationalBody,
  commitsPhrasing,
} from "../../../notebooks/components/Sidecar";
import {
  GitStatusResult,
  useGitStatusQuery,
  useHealthQuery,
  useRenkuSaveMutation,
} from "../sidecarApi";
import styles from "./SessionModals.module.scss";

interface SaveSessionModalProps {
  isOpen: boolean;
  isSessionReady: boolean;
  sessionName: string;
  toggleModal: () => void;
}

export default function SaveSessionModal({
  isOpen,
  isSessionReady,
  sessionName,
  toggleModal,
}: SaveSessionModalProps) {
  return (
    <Modal className={styles.sessionModal} isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Save Session</ModalHeader>
      <ModalBody>
        {isSessionReady ? (
          <RunningSaveSessionContent
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

interface RunningSaveSessionContentProps {
  sessionName: string;
  toggleModal: () => void;
}

function RunningSaveSessionContent({
  sessionName,
  toggleModal,
}: RunningSaveSessionContentProps) {
  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );
  const accessLevel = useSelector<RootStateOrAny, number>(
    (state) => state.stateModel.project.metadata.accessLevel
  );

  const { data, error, isLoading } = useHealthQuery({
    serverName: sessionName,
  });

  if (!logged) {
    return <AnonymousSession toggleModal={toggleModal} />;
  }
  if (accessLevel < ACCESS_LEVELS.DEVELOPER) {
    return <NoSaveAccess toggleModal={toggleModal} />;
  }
  if (isLoading) {
    return <CenteredLoader />;
  }
  if (
    error != null ||
    data == null ||
    data.status !== "running" ||
    data.error
  ) {
    return <NoSidecar toggleModal={toggleModal} />;
  }
  return (
    <SaveSessionStatus sessionName={sessionName} toggleModal={toggleModal} />
  );
}

interface AnonymousSessionProps {
  toggleModal: () => void;
}

function AnonymousSession({ toggleModal }: AnonymousSessionProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <div>
        This is an anonymous session so you will need to log in and redo your
        work.
      </div>
    </InformationalBody>
  );
}

interface NoSaveAccessProps {
  toggleModal: () => void;
}

function NoSaveAccess({ toggleModal }: NoSaveAccessProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <div>
        You do not have sufficient rights to save changes to this project. If
        you wish to keep your changes, you can fork the project and push your
        changes to the fork.
      </div>
    </InformationalBody>
  );
}

interface NoSidecarProps {
  toggleModal: () => void;
}

function NoSidecar({ toggleModal }: NoSidecarProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <div>
        It is not possible to offer a one-click save for this session. If you
        are logged in, please invoke `<code>renku save</code>` in the terminal.
        If this is an anonymous session, you will need to log in and redo your
        work.
      </div>
    </InformationalBody>
  );
}

interface SaveSessionStatusProps {
  sessionName: string;
  toggleModal: () => void;
}

function SaveSessionStatus({
  sessionName,
  toggleModal,
}: SaveSessionStatusProps) {
  const [succeeded, setSucceeded] = useState<boolean | undefined>(undefined);
  const { data, error, isFetching } = useGitStatusQuery({
    serverName: sessionName,
  });
  const [renkuSave, { isLoading: saving }] = useRenkuSaveMutation();

  const saveSession = useCallback(
    async (commitMessage: string | undefined) => {
      const result = await renkuSave({
        serverName: sessionName,
        message: commitMessage,
      }).unwrap();
      setSucceeded(result.error == null);
    },
    [renkuSave, sessionName]
  );

  if (isFetching || data == null) {
    return <CenteredLoader />;
  }
  if (error || data.error) {
    return <NoSidecar toggleModal={toggleModal} />;
  }
  if (data.result.behind > 0) {
    return <SaveSessionNoFFBody gitStatus={data} toggleModal={toggleModal} />;
  }
  if (succeeded === false) {
    return <SaveSessionFailedBody toggleModal={toggleModal} />;
  }
  if (succeeded === true) {
    return <SaveSessionSuccessBody toggleModal={toggleModal} />;
  }
  if (!data.result.clean || data.result.ahead > 0) {
    return (
      <SaveSessionBody
        gitStatus={data}
        saveSession={saveSession}
        saving={saving}
        toggleModal={toggleModal}
      />
    );
  }
  return <SaveSessionUpToDateBody toggleModal={toggleModal} />;
}

interface SaveSessionUpToDateBodyProps {
  toggleModal: () => void;
}

function SaveSessionUpToDateBody({
  toggleModal,
}: SaveSessionUpToDateBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <p>Your session is up-to-date. There are no changes that need saving.</p>
    </InformationalBody>
  );
}

interface SaveSessionSuccessBodyProps {
  toggleModal: () => void;
}
function SaveSessionSuccessBody({ toggleModal }: SaveSessionSuccessBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <SuccessAlert dismissible={false} timeout={0}>
        <p>Your session has been saved successfully.</p>
      </SuccessAlert>
    </InformationalBody>
  );
}

interface SaveSessionFailedBodyProps {
  toggleModal: () => void;
}

function SaveSessionFailedBody({ toggleModal }: SaveSessionFailedBodyProps) {
  return (
    <InformationalBody closeModal={toggleModal}>
      <p>
        Session save failed. Please try to save by running `
        <code>renku save</code>` in the terminal.
      </p>
    </InformationalBody>
  );
}

interface SaveSessionNoFFBodyProps {
  gitStatus: GitStatusResult;
  toggleModal: () => void;
}

function SaveSessionNoFFBody({
  gitStatus,
  toggleModal,
}: SaveSessionNoFFBodyProps) {
  const commitsToken = commitsPhrasing(gitStatus.result.behind);

  return (
    <InformationalBody closeModal={toggleModal}>
      <div>
        This session is behind the server by {commitsToken}. You must first `
        <code>git pull</code>` in the work from the server before you can save.
      </div>
    </InformationalBody>
  );
}

interface SaveSessionBodyProps {
  gitStatus: GitStatusResult;
  saveSession: (commitMessage: string | undefined) => void;
  saving: boolean;
  toggleModal: () => void;
}

function SaveSessionBody({
  gitStatus,
  saveSession,
  saving,
  toggleModal,
}: SaveSessionBodyProps) {
  const [commitMessage, setCommitMessage] = useState<string | undefined>(
    undefined
  );
  const saveText = saving ? (
    <span>
      <Loader className="me-2" inline size={16} />
      Saving Session
    </span>
  ) : (
    "Save Session"
  );

  return (
    <Row>
      <Col>
        <p>
          You have work in this session that has not yet been saved to the
          server.
        </p>
        <MessageForm
          commitMessage={commitMessage}
          gitStatus={gitStatus}
          saving={saving}
          setCommitMessage={setCommitMessage}
        />
        <div className={cx("d-flex", "justify-content-end")}>
          <Button
            className={cx("float-right", "mt-1", "btn-outline-rk-green")}
            disabled={saving}
            onClick={toggleModal}
          >
            Back to Session
          </Button>
          <Button
            className={cx("float-right", "mt-1", "ms-2", "btn-rk-green")}
            data-cy="save-session-modal-button"
            disabled={saving}
            onClick={() => {
              saveSession(commitMessage);
            }}
            type="submit"
          >
            {saveText}
          </Button>
        </div>
      </Col>
    </Row>
  );
}

interface MessageFormProps {
  commitMessage: string | undefined;
  gitStatus: GitStatusResult;
  saving: boolean;
  setCommitMessage: Dispatch<SetStateAction<string | undefined>>;
}

function MessageForm({
  commitMessage,
  gitStatus,
  saving,
  setCommitMessage,
}: MessageFormProps) {
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCommitMessage(event.target.value);
    },
    [setCommitMessage]
  );

  if (gitStatus.result.clean) {
    const commitsToken = commitsPhrasing(gitStatus.result.ahead);
    return <p>{commitsToken} will be pushed to the server.</p>;
  }

  return (
    <Form>
      <FormGroup>
        <Label for="commitMessage">Message</Label>
        <Input
          className={cx("border-light", "text-rk-text")}
          disabled={saving}
          id="commitMessage"
          name="commitMessage"
          placeholder={
            "You may provide an informative message to explain what has changed."
          }
          type="textarea"
          value={commitMessage}
          onChange={onChange}
        />
      </FormGroup>
    </Form>
  );
}
