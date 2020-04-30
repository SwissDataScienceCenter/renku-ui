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
 *  UseForm.js
 *  Presentational components.
 */

import { useState } from "react";

const useForm = (initModel, submitCallback) => {
  const [inputs, setInputs] = useState(initModel);
  const handleChange = e => {
    if (e.isPersistent && e.isPersistent()) e.persist();
    inputs.forEach(i => {
      if (i.name === e.target.name) {
        i.value = i.type === "checkbox" ? e.target.checked : e.target.value;
        parseInput(i);
        validateInput(i);
      }
    });
    setInputs([...inputs]);
  };

  const handleSubmit = e => {
    e && e.preventDefault();
    inputs.forEach(i => validateInput(i));
    inputs.some(i => i.alert) ? setInputs([...inputs]) : submitCallback(e);
  };

  const parseInput = input => input.value = input.parseFun ? input.parseFun(input.value) : input.value;

  const validateInput = input => {
    let alert = null;
    input.validators && input.validators.forEach(
      v => alert = v.isValidFun && !v.isValidFun(input) ? v.alert : alert);
    input.alert = alert;
  };

  return [inputs, handleChange, handleSubmit];
};

export default useForm;
