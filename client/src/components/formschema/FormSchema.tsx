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

import { ReactNode } from "react";
import { Col, Row } from "reactstrap";

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
  const desc =
    typeof description === "string" ? <p>{description}</p> : description;
  return (
    <>
      <h2 id="form-header">{title}</h2>
      {desc}
    </>
  );
};

const FormSchema = ({
  title,
  description,
  showHeader,
  children,
}: FormSchemaProps) => {
  const header = showHeader ? (
    <FormHeader title={title} description={description} />
  ) : null;
  return (
    <Row>
      <Col xs={12} md={4} xl={3}>
        {header}
      </Col>
      <Col xs={12} md={8} xl={9}>
        <div>{children}</div>
      </Col>
    </Row>
  );
};

export default FormSchema;
