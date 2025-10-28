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
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { SessionLogs } from "../../../components/Logs";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import SessionCheatSheetGenerated from "../../../notebooks/components/SessionCheatSheet";
import { SESSION_TABS } from "../../../notebooks/Notebooks.present";
import { Docs } from "../../../utils/constants/Docs";
import useGetSessionLogs from "../../../utils/customHooks/UseGetSessionLogs";
import styles from "./SessionModals.module.scss";

interface ResourcesSessionModalProps {
  activeTab: string;
  isOpen: boolean;
  sessionName: string;
  setActiveTab: (tab: string) => void;
  toggleModal: () => void;
}

export default function ResourcesSessionModal({
  activeTab,
  isOpen,
  sessionName,
  setActiveTab,
  toggleModal,
}: ResourcesSessionModalProps) {
  return (
    <ScrollableModal
      className={cx(
        styles.resourcesModal,
        "modal-fullscreen-lg-down",
        "modal-xl"
      )}
      isOpen={isOpen}
      toggle={toggleModal}
    >
      <ModalHeader data-cy="modal-header" toggle={toggleModal}>
        <div className={cx("d-flex", "flex-wrap", "gap-3")}>
          <div>Resources</div>
          <Nav
            className={cx(styles.resourcesHeaderNav, "nav-pills-underline")}
            pills
          >
            <NavItem data-cy="logs-tab" key={SESSION_TABS.logs} role="button">
              <NavLink
                className={cx(activeTab === SESSION_TABS.logs && "active")}
                onClick={() => {
                  setActiveTab(SESSION_TABS.logs);
                }}
              >
                Logs
              </NavLink>
            </NavItem>
            <NavItem
              data-cy="cheat-sheet-tab"
              key={SESSION_TABS.commands}
              role="button"
            >
              <NavLink
                className={cx(activeTab === SESSION_TABS.commands && "active")}
                onClick={() => {
                  setActiveTab(SESSION_TABS.commands);
                }}
              >
                Cheat Sheet
              </NavLink>
            </NavItem>
            <NavItem data-cy="docs-tab" key={SESSION_TABS.docs} role="button">
              <NavLink
                className={cx(activeTab === SESSION_TABS.docs && "active")}
                onClick={() => {
                  setActiveTab(SESSION_TABS.docs);
                }}
              >
                Documentation
              </NavLink>
            </NavItem>
          </Nav>
        </div>
      </ModalHeader>
      <ModalBody className="h-100">
        <div className={cx("about-box", "h-100", "d-flex", "flex-column")}>
          <Resources activeTab={activeTab} sessionName={sessionName} />
        </div>
      </ModalBody>
    </ScrollableModal>
  );
}

interface ResourcesProps {
  activeTab: string;
  sessionName: string;
}

function Resources({ activeTab, sessionName }: ResourcesProps) {
  const { logs, fetchLogs } = useGetSessionLogs(sessionName, sessionName);

  return (
    <div className="h-100">
      <TabContent activeTab={activeTab} className="h-100">
        <TabPane
          className="h-100"
          key={SESSION_TABS.commands}
          tabId={SESSION_TABS.commands}
        >
          <div>
            <SessionCheatSheetGenerated />
          </div>
        </TabPane>
        <TabPane
          className="h-100"
          key={SESSION_TABS.docs}
          tabId={SESSION_TABS.docs}
        >
          <div className="h-100">
            <iframe
              id="docs-iframe"
              referrerPolicy="origin"
              sandbox="allow-same-origin allow-scripts"
              src={Docs.READ_THE_DOCS_ROOT}
              style={{ height: "calc(100vh - 200px)" }} // eslint-disable-line spellcheck/spell-checker
              title="documentation iframe"
              width="100%"
            />
          </div>
        </TabPane>
        <TabPane
          className="h-100"
          key={SESSION_TABS.logs}
          tabId={SESSION_TABS.logs}
        >
          <div>
            {logs && (
              <SessionLogs
                fetchLogs={fetchLogs}
                logs={logs}
                name={sessionName}
              />
            )}
          </div>
        </TabPane>
      </TabContent>
    </div>
  );
}
