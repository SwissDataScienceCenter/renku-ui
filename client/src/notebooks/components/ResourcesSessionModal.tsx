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

import "./SessionModal.css";
import { Notebook, SessionHandlers } from "./Session";
import { Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from "../../utils/ts-wrappers";
import { SESSION_TABS, SessionLogs } from "../Notebooks.present";
import { Docs } from "../../utils/constants/Docs";
import SessionCheatSheetGenerated from "./SessionCheatSheet";

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
  setActiveTab: Function;
  activeTab: string;
}
const ResourcesSessionModel =
  ({ toggleModal, isOpen, handlers, notebook, defaultBranch, setActiveTab, activeTab }: ResourcesSessionModelProp) => {
    return (
      <Modal
        isOpen={isOpen}
        className="resources-modal modal-fullscreen-lg-down modal-xl"
        scrollable={true}
        toggle={() => { toggleModal(); }}>
        <ModalHeader className="bg-body header-multiline" toggle={() => { toggleModal(); }} data-cy="modal-header" >
          <div className="d-flex flex-wrap gap-sm-0 gap-md-0 gap-lg-3 gap-xl-3">
            <div className="pe-2">Resources</div>
            <Nav pills className="nav-pills-underline modal-header-nav">
              <NavItem key={SESSION_TABS.commands} data-cy="cheat-sheet-tab" role="button">
                <NavLink
                  className={activeTab === SESSION_TABS.commands ? "active" : ""}
                  onClick={() => { setActiveTab(SESSION_TABS.commands); }}>
                  Cheat Sheet
                </NavLink>
              </NavItem>
              <NavItem key={SESSION_TABS.docs} data-cy="docs-tab" role="button">
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
        <ModalBody className="bg-body h-100 pt-0">
          <div className="about-box h-100 d-flex flex-column">
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

  const fetchLogs = (_sessionName: string, fullLogs = false) => {
    if (!notebook.available)
      return;
    return handlers.fetchLogs(notebook.data.name, fullLogs);
  };

  return (
    <div className="h-100">
      <TabContent className="h-100" activeTab={activeTab}>
        <TabPane className="h-100" key={SESSION_TABS.commands} tabId={SESSION_TABS.commands}>
          <div className="session-cheat-sheet bg-white border-radius-8">
            <SessionCheatSheetGenerated />
          </div>
        </TabPane>
        <TabPane className="h-100" key={SESSION_TABS.docs} tabId={SESSION_TABS.docs}>
          <div className="h-100">
            <iframe id="docs-iframe" title="documentation iframe" src={Docs.READ_THE_DOCS_ROOT}
              style={{ borderRadius: "8px", height: "calc(100%)" }} width="100%"
              referrerPolicy="origin" sandbox="allow-same-origin allow-scripts"/></div>
        </TabPane>
        <TabPane className="h-100" key={SESSION_TABS.logs} tabId={SESSION_TABS.logs}>
          <div className="session-cheat-sheet bg-white border-radius-8">
            <SessionLogs fetchLogs={fetchLogs} notebook={notebook} tab={activeTab} /></div>
        </TabPane>
      </TabContent>
    </div>
  );
};

export { ResourcesSessionModel };
