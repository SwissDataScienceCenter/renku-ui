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

import React, { Component, useEffect, useState } from "react";
import { Loader } from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faSave } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Col, Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from "reactstrap/lib";


const LogTabs = ({ logs }) => {
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    if (logs) {
      const keys = Object.keys(logs);
      if (keys.length)
        setActiveTab(keys[0]);
    }
  }, [logs]);

  const getTitle = (name) => {
    return name.split("-").map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(" ");
  };

  if (!logs)
    return null;

  return (
    <div>
      <Nav tabs>
        { Object.keys(logs).map( tab => {
          return (
            <NavItem key={tab}>
              <NavLink
                className={activeTab === tab ? "active" : ""}
                onClick={() => { setActiveTab(tab); }}>
                {getTitle(tab)}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <TabContent activeTab={activeTab}>
        { Object.keys(logs).map(tab => {
          return (
            <TabPane key={`log_${tab}`} tabId={tab}>
              <Row>
                <Col sm="12">
                  <pre style={{ height: "600px" }}>
                    { logs[tab] }
                  </pre>
                </Col>
              </Row>
            </TabPane>
          );
        })}
      </TabContent>
    </div>
  );
};

/**
 * Simple environment logs container
 *
 * @param {function} fetchLogs - async function to get logs as an array string
 * @param {function} toggleLogs - toggle logs visibility and fetch logs on show
 * @param {object} logs - log object from redux store enhanced with `show` property
 * @param {string} name - server name
 * @param {object} annotations - list of cleaned annotations
 */
class EnvironmentLogs extends Component {
  async save() {
    // get full logs
    const { fetchLogs, name } = this.props;
    const fullLogs = await fetchLogs(name, true);

    // create the blob element to download logs as a file
    const elem = document.createElement("a");
    const file = new Blob([fullLogs.join("\n")], { type: "text/plain" });
    elem.href = URL.createObjectURL(file);
    this.props.fetchLogs();
    elem.download = `Logs_${this.props.name}.txt`;
    document.body.appendChild(elem);
    elem.click();
  }

  render() {
    const { logs, name, toggleLogs, fetchLogs, annotations } = this.props;
    if (!logs.show || logs.show !== name)
      return null;

    let body;
    if (logs.fetching) {
      body = (<Loader />);
    }
    else {
      if (!logs.fetched) {
        body = (<p>Logs unavailable. Please
          <Button color="primary" onClick={() => { fetchLogs(name); }}>download</Button> them again.
        </p>);
      }
      else {
        if (logs.data) {
          body = (<LogTabs logs={logs.data}/> );
        }
        else {
          body = (<div>
            <p>No logs available for this pod yet.</p>
            <p>You can try to <Button color="primary" onClick={() => { fetchLogs(name); }}>Refresh</Button>
              them after a while.</p>
          </div>);
        }
      }
    }

    const canDownload = (logs) => {
      if (logs.fetching)
        return false;
      if (!logs.data)
        return false;
      // Validate if this result is possible
      if (logs.data.length === 1 && logs.data[0].startsWith("Logs unavailable"))
        return false;
      return true;
    };

    return (
      <Modal
        isOpen={logs.show ? true : false}
        className="modal-dynamic-width"
        scrollable={true}
        toggle={() => { toggleLogs(name); }}>
        <ModalHeader toggle={() => { toggleLogs(name); }} className="header-multiline">
          Logs
          <br /><small>{annotations["namespace"]}/{annotations["projectName"]}</small>
          <br /><small>{annotations["branch"]}@{annotations["commit-sha"].substring(0, 8)}</small>
        </ModalHeader>
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={!canDownload(logs)} onClick={() => { this.save(); }}>
            <FontAwesomeIcon icon={faSave} /> Download
          </Button>
          <Button color="primary" disabled={logs.fetching} onClick={() => { fetchLogs(name); }}>
            <FontAwesomeIcon icon={faRedo} /> Refresh
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export { EnvironmentLogs };
