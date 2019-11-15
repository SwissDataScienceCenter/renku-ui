/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 *  SelectInput.js
 *  Presentational components.
 */

import * as React from 'react';
import ValidationAlert from './ValidationAlert';
import HelpText from './HelpText';
import { FormGroup, Input, Label} from 'reactstrap';

function SelectInput({ name, label, type, value, alert, options, initial, placeholder, setInputs, help }) {
  return <FormGroup>
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} type={type} value={value || ""} onChange={setInputs} placeholder={placeholder}>
      {options && options.map(option => <option key={option.value} value={option.value}>{option.name}</option>)}
    </Input>
    <HelpText content={help} />
    <ValidationAlert content={alert} />
  </FormGroup>
}

export default SelectInput;
