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
import { ErrorLabel, HelperLabel, InputHintLabel, InputLabel, LoadingLabel } from "./FormLabels";


interface LabelsProps {
  text: string;
  isRequired: boolean;
}


export default {
  title: "components/FormLabels",
};

export const Input = (args: LabelsProps) => (
  <>
    <InputLabel isRequired={args.isRequired} text={args.text} />
  </>
);
Input.args = {
  text: "My Label",
  isRequired: true,
};

export const Loading = (args: LabelsProps) => (
  <>
    <LoadingLabel text={args.text} />
  </>
);
Loading.args = {
  text: "Fetching templates...",
};

export const Helper = (args: LabelsProps) => (
  <>
    <HelperLabel text={args.text} />
  </>
);
Helper.args = {
  text: "Fetch templates first, or switch template source to RenkuLab",
};

export const InputHint = (args: LabelsProps) => (
  <>
    <InputHintLabel text={args.text} />
  </>
);
InputHint.args = {
  text: "Provide a number between 0 and 9",
};

export const Error = (args: LabelsProps) => (
  <>
    <ErrorLabel text={args.text} />
  </>
);
Error.args = {
  text: "Please select a template",
};
