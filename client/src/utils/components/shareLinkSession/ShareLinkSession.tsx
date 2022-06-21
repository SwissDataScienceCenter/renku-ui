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
import { useHistory, useLocation } from "react-router-dom";
import { faInfoCircle, faLink } from "@fortawesome/free-solid-svg-icons";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Url } from "../../helpers/url";
import {
  Col, Form, FormGroup, FormText, Input, Label, Modal, ModalBody,
  ModalHeader, Row, Table, ModalFooter, Button } from "../../ts-wrappers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Clipboard } from "../Clipboard";
import { ThrottledTooltip } from "../Tooltip";

interface ShareLinkSessionProps {
  filters: ProjectFilters;
  filePath: string;
  launchNotebookUrl: string;
}

const ShareLinkSessionIcon = ({ filePath, launchNotebookUrl, filters }: ShareLinkSessionProps) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  return <>
    <span>
      <FontAwesomeIcon
        id="openShareLinkModal" className="icon-link" icon={faLink}
        onClick={toggleModal}
      />
      <ThrottledTooltip target="openShareLinkModal" tooltip="Share link Session" />
    </span>
    <ShareLinkSessionOpenFileModal
      filters={filters} filePath={filePath} launchNotebookUrl={launchNotebookUrl}
      showModal={showModal} toggleModal={toggleModal} />
  </>;
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

interface ShareLinkSessionModalProps {
  filters: ProjectFilters;
  showModal: boolean;
  toggleModal: Function;
  notebookFilePath: string;
}
const ShareLinkSessionModal = ({ filters, showModal, toggleModal, notebookFilePath }: ShareLinkSessionModalProps) => {
  const [includeBranch, setIncludeBranch] = useState(false);
  const [includeCommit, setIncludeCommit] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const data = {
      namespace: filters?.namespace,
      path: filters?.project,
      branch: filters?.branch?.name,
      commit: filters?.commit?.id,
    };

    if (!data.namespace || !data.path)
      return;
    let urlSession = Url.get(Url.pages.project.session.autostart, data, true);
    urlSession = notebookFilePath ? `${urlSession}&notebook=${notebookFilePath}` : urlSession;
    urlSession = includeCommit ? `${urlSession}&commit=${data.commit}` : urlSession;
    urlSession = includeBranch ? `${urlSession}&branch=${data.branch}` : urlSession;
    setUrl(urlSession);
  }, [ includeCommit, includeBranch, filters, notebookFilePath ]);

  const setCommit = (checked: boolean) => {
    setIncludeCommit(checked);
    if (checked)
      setIncludeBranch(checked);
  };
  const setBranch = (checked: boolean) => {
    setIncludeBranch(checked);
    if (!checked)
      setIncludeCommit(checked);
  };

  const markdown = `[![launch - renku](${Url.get(Url.pages.landing, undefined, true)}renku-badge.svg)](${url})`;
  const notebookFilePathLabel = notebookFilePath ? (
    <FormGroup key="notebook-file-path">
      <Label>With <b>{notebookFilePath}</b> initially open</Label>.
    </FormGroup>
  ) : null;
  return (
    <Modal isOpen={showModal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Form className="mb-3">
              {notebookFilePathLabel}
              <FormGroup key="link-branch" check>
                <Label check>
                  <Input type="checkbox" checked={includeBranch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBranch(e.target.checked)}/> Branch
                </Label>
              </FormGroup>
              <FormGroup key="link-commit" check>
                <Label check>
                  <Input type="checkbox" checked={includeCommit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCommit(e.target.checked)}/> Commit
                </Label>
              </FormGroup>
              <FormText>
                <FontAwesomeIcon id="commit-info" icon={faInfoCircle} />
                &nbsp;The commit requires including also the branch
              </FormText>
            </Form>

            <Table size="sm">
              <tbody>
                <tr className="border-bottom">
                  <th scope="row">URL</th>
                  <td style={{ wordBreak: "break-all" }}>{url}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={url} /></td>
                </tr>
                <tr style={{ borderBottomColor: "transparent" }} >
                  <th scope="row">Badge</th>
                  <td colSpan={2} style={{ wordBreak: "break-all" }}>
                    <small>Paste it in your README to show a </small>
                    <img src="/renku-badge.svg" alt="renku-badge"/>
                  </td>
                </tr>
                <tr className="border-bottom">
                  <th scope="row"> </th>
                  <td style={{ wordBreak: "break-all" }}>{markdown}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={markdown} /></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

interface ShareLinkSessionOpenFileModalProps {
  filters: ProjectFilters;
  showModal: boolean;
  toggleModal: Function;
  filePath: string;
  launchNotebookUrl: string;
}
const ShareLinkSessionOpenFileModal = (
  { filters, showModal, toggleModal, filePath, launchNotebookUrl }: ShareLinkSessionOpenFileModalProps) => {
  const [url, setUrl] = useState("");
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const data = {
      namespace: filters?.namespace,
      path: filters?.project,
      branch: filters?.branch?.name,
      commit: filters?.commit?.id,
    };

    if (!data.namespace || !data.path)
      return;
    let urlSession = Url.get(Url.pages.project.session.autostart, data, true);
    urlSession = filePath ? `${urlSession}&notebook=${filePath}` : urlSession;
    setUrl(urlSession);
  }, [ filters, filePath ]);

  const goToSpecifyCommit = () => {
    const state = { filePath, showShareLinkModal: true, from: location.pathname };
    history.push({ pathname: launchNotebookUrl, search: "", state });
  };

  const markdown = `[![launch - renku](${Url.get(Url.pages.landing, undefined, true)}renku-badge.svg)](${url})`;
  const notebookFilePathLabel = filePath ? (
    <FormGroup key="notebook-file-path">
      <Label>With <b>{filePath}</b> initially open</Label>.
    </FormGroup>
  ) : null;
  return (
    <Modal isOpen={showModal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Form className="mb-3">
              {notebookFilePathLabel}
            </Form>
            <Table size="sm">
              <tbody>
                <tr className="border-bottom">
                  <th scope="row">URL</th>
                  <td style={{ wordBreak: "break-all" }}>{url}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={url} /></td>
                </tr>
                <tr style={{ borderBottomColor: "transparent" }} >
                  <th scope="row">Badge</th>
                  <td colSpan={2} style={{ wordBreak: "break-all" }}>
                    <small>Paste it in your README to show a </small>
                    <img src="/renku-badge.svg" alt="renku-badge"/>
                  </td>
                </tr>
                <tr className="border-bottom">
                  <th scope="row"> </th>
                  <td style={{ wordBreak: "break-all" }}>{markdown}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={markdown} /></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={goToSpecifyCommit}>Want a specific branch or commit?</Button>
      </ModalFooter>
    </Modal>
  );
};

export { ShareLinkSessionModal, ShareLinkSessionIcon };
