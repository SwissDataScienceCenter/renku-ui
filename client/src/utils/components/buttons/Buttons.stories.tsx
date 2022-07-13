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
import * as React from "react";
import { Button } from "../../ts-wrappers";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


interface LabelsProps {
  text: string;
  isRequired: boolean;
}


export default {
  title: "components/Buttons",
};

export const PrimaryGreen = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-green">{args.text}</Button>
  </>
);
PrimaryGreen.args = {
  text: "My Button",
};

export const SecondaryGreen = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-green">{args.text}</Button>
  </>
);
SecondaryGreen.args = {
  text: "My Button",
};

export const PrimaryGreenWithIcon = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-green btn-icon-text"><FontAwesomeIcon icon={faPen} color="dark" />{args.text}</Button>
  </>
);
PrimaryGreenWithIcon.args = {
  text: "My Button",
};

export const SecondaryGreenWithIcon = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-green btn-icon-text" >
      <FontAwesomeIcon icon={faPen} color="dark" />{args.text}
    </Button>
  </>
);
SecondaryGreenWithIcon.args = {
  text: "My Button",
};

export const PrimaryPink = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-pink">{args.text}</Button>
  </>
);
PrimaryPink.args = {
  text: "My Button",
};

export const SecondaryPink = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-pink">{args.text}</Button>
  </>
);
SecondaryPink.args = {
  text: "My Button",
};

