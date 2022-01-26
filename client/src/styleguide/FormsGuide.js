/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React, { Fragment } from "react";

import { Row, Col, Card, CardBody, CardHeader } from "reactstrap";

import FormGenerator, { FormGenerator as FormPanel } from "../utils/components/formgenerator";
import { Schema, StateModel, globalSchema } from "../model";
import { DatasetImages } from "../utils/components/formgenerator/fields/stockimages";

let schema = new Schema({
  name: {
    initial: "",
    name: "text",
    label: "Text",
    type: FormGenerator.FieldTypes.TEXT,
    parseFun: FormGenerator.Parsers.parseOnlyLetterAndSpace,
    help: "Help text",
    edit: false,
    validators: [
      {
        id: "text-length",
        isValidFun: input => FormGenerator.Validators.isAtLeastLength(input, 3),
        alert: "Text must be at least 3 characters long."
      }
    ]
  },
  description: {
    initial: "",
    name: "textarea",
    label: "TextArea",
    type: FormGenerator.FieldTypes.TEXT_AREA,
    edit: false,
    validators: [
      {
        id: "textarea-length",
        isValidFun: input => FormGenerator.Validators.isNotEmpty(input),
        alert: "TextArea can't be empty"
      }
    ]
  },
  image: {
    initial: { options: DatasetImages, selected: -1 },
    name: "image",
    label: "Image",
    edit: false,
    type: FormGenerator.FieldTypes.IMAGE
  }
});

/* eslint-disable */
function CardsSection(props) {
  return <Row>
    <Col>
      <h3>Cards</h3>
      <p>Use cards to show information grouped by sections.</p>
      <Card className="border-rk-light">
        <CardHeader className="bg-white p-3 ps-4"><b>Card Title</b></CardHeader>
        <CardBody style={{ overflow: "auto" }} className="p-4">
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
            vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
            consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
            magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et
            ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </CardBody>
      </Card>
    </Col>
  </Row>;
}

function FormsSection(props) {
  const model = new StateModel(globalSchema);

  const submitCallback = e =>
  Object.values(schema)
    .map(m => m.label + ": " + m.value + ",\n")
    .join("");  
  return <Row>
    <Col>
      <h3>Forms</h3>
      <p>Forms should have standard buttons.</p>
      <FormPanel title="Example Form" submitLoader={false} btnName="Default Action"
        submitCallback={submitCallback} model={schema} modelTop={model}
        formLocation={props.location} />,
    </Col>
  </Row>;
}


function FormsGuide(props) {
  return <Fragment>
    <h2>Forms and Fields</h2>
    <CardsSection />
    <br />
    <FormsSection location={props.urlMap.formsUrl} />
  </Fragment>;
}

export default FormsGuide;
