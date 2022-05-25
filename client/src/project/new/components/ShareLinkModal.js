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
/**
 *  renku-ui
 *
 *  ShareLinkModal.js
 *  Share Link Modal component to create a project
 */
import React, { useEffect, useState } from "react";
import { Clipboard } from "../../../utils/components/Clipboard";
import {
  FormGroup,
  FormText,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Form,
  Table
} from "reactstrap";

function ShareLinkModal(props) {
  const { createUrl, input } = props;
  const { userTemplates } = props.meta;

  const defaultObj = {
    title: false,
    description: false,
    namespace: false,
    visibility: false,
    templateRepo: false,
    template: false,
    variables: false
  };

  const [available, setAvailable] = useState(defaultObj);
  const [include, setInclude] = useState(defaultObj);
  const [url, setUrl] = useState("");

  // Set availability of inputs
  useEffect(() => {
    let variablesAvailable = false;
    if (input.template && input.variables && Object.keys(input.variables).length) {
      for (let variable of Object.keys(input.variables)) {
        if (input.variables[variable]) {
          variablesAvailable = true;
          break;
        }
      }
    }

    setAvailable({
      title: input.title ? true : false,
      description: input.description ? true : false,
      namespace: true,
      visibility: true,
      templateRepo: input.userRepo && userTemplates.fetched && userTemplates.url && userTemplates.ref ? true : false,
      template: input.template ? true : false,
      variables: variablesAvailable
    });
  }, [input, userTemplates]);

  // Update selected params
  useEffect(() => {
    setInclude({
      title: available.title,
      description: available.description,
      namespace: false,
      visibility: false,
      templateRepo: available.templateRepo,
      template: available.template,
      variables: available.variables
    });
  }, [available]);

  // Re-create shareable link
  useEffect(() => {
    let dataObject = {};
    if (include.title)
      dataObject.title = input.title;
    if (include.description)
      dataObject.description = input.description;
    if (include.namespace)
      dataObject.namespace = input.namespace;
    if (include.visibility)
      dataObject.visibility = input.visibility;
    if (include.templateRepo) {
      dataObject.url = userTemplates.url;
      dataObject.ref = userTemplates.ref;
    }
    if (include.template)
      dataObject.template = input.template;
    if (include.variables) {
      let variablesObject = {};
      for (let variable of Object.keys(input.variables)) {
        if (input.variables[variable] != null)
          variablesObject[variable] = input.variables[variable];
      }
      dataObject.variables = variablesObject;
    }

    setUrl(createUrl(dataObject));
  }, [createUrl, include, input, userTemplates]);

  const handleCheckbox = (target, event) => {
    setInclude({ ...include, [target]: event.target.checked });
  };

  const labels = Object.keys(include).map(item => (
    <FormGroup key={item} check>
      <Label check className={`text-capitalize${available[item] ? "" : " text-muted"}`}>
        <Input
          type="checkbox"
          disabled={available[item] ? false : true}
          checked={include[item]}
          onChange={e => handleCheckbox(item, e)}
        /> {item === "templateRepo" ? "template source" : item}
      </Label>
    </FormGroup>
  ));

  const feedback = include.namespace ?
    (
      <FormText color="danger">
        Pre-filling the namespace may lead to errors since other users are not guaranteed to have access to it.
      </FormText>
    ) :
    null;

  return (
    <Modal isOpen={props.show} toggle={props.toggle}>
      <ModalHeader toggle={props.toggle}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Here is your shareable link, containing the current values for a new project.
              Following the link will lead to a <b>New project</b> form with these values pre-filled.
            </p>
            <p>
              You can control which values should be pre-filled.
            </p>

            <Form className="mb-3">
              {labels}
              {feedback}
            </Form>


            <Table size="sm">
              <tbody>
                <tr className="border-bottom">
                  <th scope="row">URL</th>
                  <td style={{ wordBreak: "break-all" }}>{url}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={url} /></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default ShareLinkModal;
