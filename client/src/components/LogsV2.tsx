/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { displaySlice } from "../features/display";
import useAppDispatch from "../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../utils/customHooks/useAppSelector.hook";
import { useGetSessionLogsV2 } from "../utils/customHooks/UseGetSessionLogs";
import { IFetchableLogs, ILogs, SessionLogs } from "./Logs";

/**
 * Sessions logs container integrating state and actions V2
 *
 * @param {string} name - server name
 */
interface EnvironmentLogsPropsV2 {
  name: string;
}
export const EnvironmentLogsV2 = ({ name }: EnvironmentLogsPropsV2) => {
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const { logs, fetchLogs } = useGetSessionLogsV2(
    displayModal.targetServer,
    displayModal.show
  );
  const dispatch = useAppDispatch();
  const toggleLogs = function (target: string) {
    dispatch(
      displaySlice.actions.toggleSessionLogsModal({ targetServer: target })
    );
  };

  return (
    <EnvironmentLogsPresentV2
      fetchLogs={fetchLogs}
      toggleLogs={toggleLogs}
      logs={logs}
      name={name}
    />
  );
};
interface EnvironmentLogsPresentV2Props {
  fetchLogs: IFetchableLogs["fetchLogs"];
  logs?: ILogs;
  name: string;
  toggleLogs: (name: string) => unknown;
}
const EnvironmentLogsPresentV2 = ({
  logs,
  name,
  toggleLogs,
  fetchLogs,
}: EnvironmentLogsPresentV2Props) => {
  if (!logs?.show || logs?.show !== name || !logs) return null;

  return (
    <Modal
      isOpen={!!logs.show}
      className="modal-xl"
      scrollable={true}
      toggle={() => {
        toggleLogs(name);
      }}
    >
      <ModalHeader
        className="header-multiline"
        toggle={() => {
          toggleLogs(name);
        }}
      >
        <div>Logs</div>
      </ModalHeader>
      <ModalBody>
        <div className="mx-2">
          <SessionLogs fetchLogs={fetchLogs} logs={logs} name={name} />
        </div>
      </ModalBody>
    </Modal>
  );
};
