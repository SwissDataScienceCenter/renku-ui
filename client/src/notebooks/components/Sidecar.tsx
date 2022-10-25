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

import { Button, Col, Row } from "../../utils/ts-wrappers";
import { Loader } from "../../utils/components/Loader";


function commitsPhrasing(numberOfCommits: number) {
  return numberOfCommits > 1 ?
      `${numberOfCommits} commits` :
      `${numberOfCommits} commit`;
}

function CenteredLoader() {
  return <div className="d-flex justify-content-center">
    <div><Loader size="16" inline="true" margin="2" /></div>
  </div>;
}

interface CloseModalProps {
  closeModal: Function;
}

interface ModalProps extends CloseModalProps {
  isOpen: boolean;
}

interface InformationalProps extends CloseModalProps {
  children: React.ReactElement | React.ReactElement[]
}

function InformationalBody({ closeModal, children }: InformationalProps) {

  return (<Row>
    <Col>
      {children}
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


export { CenteredLoader, InformationalBody, commitsPhrasing };
export type { CloseModalProps, ModalProps };
