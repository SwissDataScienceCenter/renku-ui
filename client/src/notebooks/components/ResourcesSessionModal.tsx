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

import "./SessionModal.css";
import { Notebook, SessionHandlers } from "./Session";
import { Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from "../../utils/ts-wrappers";
import { SESSION_TABS, SessionLogs } from "../Notebooks.present";
import SessionCheatSheet from "../SessionCheatSheet";
import { Docs } from "../../utils/constants/Docs";

/**
 *  renku-ui
 *
 *  ResourcesSessionModel.tsx
 *  ResourcesSessionModel component
 */

export interface ResourcesSessionModelProp {
  toggleModal: Function;
  isOpen: boolean;
  handlers: SessionHandlers;
  notebook: Notebook;
  defaultBranch: string;
}
const ResourcesSessionModel =
  ({ toggleModal, isOpen, handlers, notebook, defaultBranch }: ResourcesSessionModelProp) => {
    const [activeTab, setActiveTab] = useState<string>(SESSION_TABS.commands);
    return (
      <Modal
        isOpen={isOpen}
        className="resources-modal modal-xl"
        scrollable={true}
        toggle={() => { toggleModal(); }}>
        <ModalHeader className="bg-body header-multiline" toggle={() => { toggleModal(); }} >
          <div className="d-flex flex-wrap gap-sm-0 gap-md-0 gap-lg-3 gap-xl-3">
            <div>Resources</div>
            <Nav pills className="nav-pills-underline modal-header-nav">
              <NavItem key={SESSION_TABS.commands} data-cy="logs-tab" role="button">
                <NavLink
                  className={activeTab === SESSION_TABS.commands ? "active" : ""}
                  onClick={() => { setActiveTab(SESSION_TABS.commands); }}>
                  Cheat Sheet
                </NavLink>
              </NavItem>
              <NavItem key={SESSION_TABS.docs} data-cy="logs-tab" role="button">
                <NavLink
                  className={activeTab === SESSION_TABS.docs ? "active" : ""}
                  onClick={() => { setActiveTab(SESSION_TABS.docs); }}>
                  Documentation
                </NavLink>
              </NavItem>
              <NavItem key={SESSION_TABS.logs} data-cy="logs-tab" role="button">
                <NavLink
                  className={activeTab === SESSION_TABS.logs ? "active" : ""}
                  onClick={() => { setActiveTab(SESSION_TABS.logs); }}>
                  Logs
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </ModalHeader>
        <ModalBody className="bg-body pt-0">
          <div className="about-box d-flex flex-column">
            <Resources handlers={handlers} notebook={notebook} defaultBranch={defaultBranch} activeTab={activeTab} />
          </div>
        </ModalBody>
      </Modal>
    );
  };

interface ResourcesProps {
  handlers: any;
  notebook: Notebook;
  defaultBranch: string;
  activeTab: string;
}
const Resources = ({ handlers, notebook, defaultBranch, activeTab }: ResourcesProps) => {

  const fetchLogs = () => {
    if (!notebook.available)
      return;
    return handlers.fetchLogs(notebook.data.name);
  };

  return (
    <div>
      <TabContent activeTab={activeTab}>
        <TabPane key={SESSION_TABS.commands} tabId={SESSION_TABS.commands}>
          <div className="session-cheat-sheet bg-white border-radius-8">
            <SessionCheatSheet branch={defaultBranch} />
          </div>
        </TabPane>
        <TabPane key={SESSION_TABS.docs} tabId={SESSION_TABS.docs}>
          <div>
            <iframe id="docs-iframe" title="documentation iframe" src={Docs.READ_THE_DOCS_ROOT}
              style={{ borderRadius: "8px" }} width="100%" height="800px"
              referrerPolicy="origin" sandbox="allow-same-origin allow-scripts"/></div>
        </TabPane>
        <TabPane key={SESSION_TABS.logs} tabId={SESSION_TABS.logs}>
          <div className="session-cheat-sheet bg-white border-radius-8">
            <SessionLogs fetchLogs={fetchLogs} notebook={notebook} tab={activeTab} /></div>
        </TabPane>
      </TabContent>
    </div>
  );
};

export { ResourcesSessionModel };
