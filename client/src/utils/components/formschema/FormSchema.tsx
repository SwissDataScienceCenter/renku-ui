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
 *  FormSchema.tsx
 *  FormSchema component.
 */
import * as React from "react";
import { Col, Row } from "../../ts-wrappers";
import { ReactNode } from "react";

import "./FormSchema.css";

interface FormSchemaProps {
  title: string;
  description: string | ReactNode;
  showHeader: boolean;
  children: ReactNode;
}

interface FormHeaderProps {
  title: string;
  description: string | ReactNode;
}

const FormHeader = ({ title, description }: FormHeaderProps) => {
  const desc = typeof description === "string" ?
    <p>{description}</p> :
    description;
  return (
    <>
      <h2 id="form-header">{title}</h2>
      {desc}
    </>
  );
};

const FormSchema = ({ title, description, showHeader, children }: FormSchemaProps) => {
  const header = showHeader ? <FormHeader title={title} description={description} /> : null;
  return (
    <Row>
      <Col className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-forms--header pb-2">{header}</Col>
      <Col className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-12">
        <div className="rk-forms">{children}</div>
      </Col>
    </Row>
  );
};

export default FormSchema;
