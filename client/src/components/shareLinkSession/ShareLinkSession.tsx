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
import { faInfoCircle, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { Url } from "../../utils/helpers/url";
import { CommandCopy } from "../commandCopy/CommandCopy";

interface ShareLinkSessionProps {
  filters: ProjectFilters;
  filePath: string;
  launchNotebookUrl: string;
}

const ShareLinkSessionIcon = ({
  filePath,
  launchNotebookUrl,
  filters,
}: ShareLinkSessionProps) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  return (
    <>
      <span>
        <FontAwesomeIcon
          id="openShareLinkModal"
          className="icon-link"
          icon={faLink}
          onClick={toggleModal}
        />
        <UncontrolledTooltip target="openShareLinkModal">
          Share link Session
        </UncontrolledTooltip>
      </span>
      <ShareLinkSessionOpenFileModal
        filters={filters}
        filePath={filePath}
        launchNotebookUrl={launchNotebookUrl}
        showModal={showModal}
        toggleModal={toggleModal}
      />
    </>
  );
};

interface ProjectFilters {
  namespace: string;
  project: string;
  branch: {
    name: string;
  };
  commit: {
    id: string;
  };
}

interface EnvVariablesField {
  key: string;
  value: string;
}

interface ShareLinkSessionModalProps {
  filters: ProjectFilters;
  showModal: boolean;
  toggleModal: () => void;
  notebookFilePath: string;
  environmentVariables: EnvVariablesField[];
}
const ShareLinkSessionModal = ({
  filters,
  showModal,
  toggleModal,
  notebookFilePath,
  environmentVariables,
}: ShareLinkSessionModalProps) => {
  const [includeBranch, setIncludeBranch] = useState(false);
  const [includeCommit, setIncludeCommit] = useState(false);
  const [includeEnvVariables, setIncludeEnvVariables] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const data = {
      namespace: filters?.namespace,
      path: filters?.project,
      branch: filters?.branch?.name,
      commit: filters?.commit?.id,
    };

    if (!data.namespace || !data.path) return;
    let urlSession = Url.get(Url.pages.project.session.autostart, data, true);
    urlSession = notebookFilePath
      ? `${urlSession}&notebook=${notebookFilePath}`
      : urlSession;
    urlSession = includeCommit
      ? `${urlSession}&commit=${data.commit}`
      : urlSession;
    urlSession = includeBranch
      ? `${urlSession}&branch=${data.branch}`
      : urlSession;
    if (includeEnvVariables && environmentVariables.length) {
      let urlVariables = "";
      environmentVariables.map((env) => {
        if (env.key && env.value)
          urlVariables = `${urlVariables}&env[${encodeURIComponent(
            env.key
          )}]=${encodeURIComponent(env.value)}`;
      });
      urlSession = `${urlSession}${urlVariables}`;
    }

    setUrl(urlSession);
  }, [
    includeCommit,
    includeBranch,
    includeEnvVariables,
    filters,
    notebookFilePath,
    environmentVariables,
  ]);

  const setCommit = (checked: boolean) => {
    setIncludeCommit(checked);
    if (checked) setIncludeBranch(checked);
  };
  const setBranch = (checked: boolean) => {
    setIncludeBranch(checked);
    if (!checked) setIncludeCommit(checked);
  };
  const setVariables = (checked: boolean) => {
    setIncludeEnvVariables(checked);
  };

  const validVariables = environmentVariables.filter(
    (variable) => variable.key.length && variable.value.length
  );
  const isVariablesEmpty = !validVariables.length;

  const markdown = `[![launch - renku](${Url.get(
    Url.pages.landing,
    undefined,
    true
  )}renku-badge.svg)](${url})`;
  const notebookFilePathLabel = notebookFilePath ? (
    <FormGroup key="notebook-file-path">
      <Label>
        With <b>{notebookFilePath}</b> initially open
      </Label>
      .
    </FormGroup>
  ) : null;
  return (
    <Modal isOpen={showModal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Form className="mb-3 form-rk-green">
              {notebookFilePathLabel}
              <FormGroup key="link-branch" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={includeBranch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBranch(e.target.checked)
                    }
                  />{" "}
                  Branch
                </Label>
              </FormGroup>
              <FormGroup key="link-commit" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={includeCommit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCommit(e.target.checked)
                    }
                  />{" "}
                  Commit
                </Label>
              </FormGroup>
              <FormGroup key="env-variables" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={isVariablesEmpty ? false : includeEnvVariables}
                    disabled={isVariablesEmpty}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setVariables(e.target.checked)
                    }
                  />
                  <span
                    className={isVariablesEmpty ? "text-rk-text-light" : ""}
                  >
                    Environment Variables
                  </span>
                </Label>
              </FormGroup>
              <FormText>
                <FontAwesomeIcon id="commit-info" icon={faInfoCircle} />
                &nbsp;The commit requires including also the branch
              </FormText>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col>
            <h3 className="fs-6 lh-sm fw-bold mt-2">URL</h3>
            <CommandCopy command={url} />
            <h3 className="fs-6 lh-sm fw-bold mt-2">Badge</h3>
            <p className="m-0" style={{ fontSize: "smaller" }}>
              Paste it in your README to show a{" "}
              <img src="/renku-badge.svg" alt="renku-badge" /> badge.
            </p>
            <CommandCopy command={markdown} />
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

interface ShareLinkSessionOpenFileModalProps {
  filters: ProjectFilters;
  showModal: boolean;
  toggleModal: () => void;
  filePath: string;
  launchNotebookUrl: string;
}
const ShareLinkSessionOpenFileModal = ({
  filters,
  showModal,
  toggleModal,
  filePath,
  launchNotebookUrl,
}: ShareLinkSessionOpenFileModalProps) => {
  const [url, setUrl] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const data = {
      namespace: filters?.namespace,
      path: filters?.project,
      branch: filters?.branch?.name,
      commit: filters?.commit?.id,
    };

    if (!data.namespace || !data.path) return;
    let urlSession = Url.get(Url.pages.project.session.autostart, data, true);
    urlSession = filePath ? `${urlSession}&notebook=${filePath}` : urlSession;
    setUrl(urlSession);
  }, [filters, filePath]);

  const goToSpecifyCommit = () => {
    const search = new URLSearchParams({ filePath, showCreateLink: "1" });
    const state = { from: location.pathname };
    navigate(
      { pathname: launchNotebookUrl, search: search.toString() },
      { state }
    );
  };

  const markdown = `[![launch - renku](${Url.get(
    Url.pages.landing,
    undefined,
    true
  )}renku-badge.svg)](${url})`;
  const notebookFilePathLabel = filePath ? (
    <FormGroup key="notebook-file-path">
      <Label>
        With <b>{filePath}</b> initially open
      </Label>
      .
    </FormGroup>
  ) : null;
  return (
    <Modal isOpen={showModal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Form className="mb-3">{notebookFilePathLabel}</Form>
          </Col>
        </Row>

        <Row>
          <Col>
            <h3 className="fs-6 lh-sm fw-bold mt-2">URL</h3>
            <CommandCopy command={url} />
            <h3 className="fs-6 lh-sm fw-bold mt-2">Badge</h3>
            <p className="m-0" style={{ fontSize: "smaller" }}>
              Paste it in your README to show a{" "}
              <img src="/renku-badge.svg" alt="renku-badge" /> badge.
            </p>
            <CommandCopy command={markdown} />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={goToSpecifyCommit}>
          Want a specific branch or commit?
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ShareLinkSessionIcon, ShareLinkSessionModal };
