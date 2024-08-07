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
 * limitations under the License
 */

import { useState } from "react";

function Parent() {
  const fieldName = "Family name";

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (text: string) => setInputValue(text);

  console.log("Parent render"); // eslint-disable-line

  return (
    <div className="p-4 bg-info-subtle d-flex gap-4">
      <ChildLeft
        fieldName={fieldName}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
      />

      <ChildRight fieldName={fieldName} />
    </div>
  );
}

function ChildLeft({
  fieldName,
  inputValue,
  handleInputChange,
}: {
  fieldName: string;
  inputValue: string;
  handleInputChange: (text: string) => void;
}) {
  return (
    <div className="bg-dark bg-opacity-10 p-4 w-50">
      <label>{fieldName}</label>
      <input
        className="w-100"
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </div>
  );
}

function ChildRight({ fieldName }: { fieldName: string }) {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (text: string) => setInputValue(text);

  return (
    <div className="bg-dark bg-opacity-10 p-4 w-50">
      <label>{fieldName}</label>
      <input
        className="w-100"
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </div>
  );
}

export default function Help() {
  return (
    <div className="container">
      <h2>React components</h2>
      <Parent />
    </div>
  );
}
