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
import "./AutorFilter.css";
import { Input } from "../../ts-wrappers";
import { ChangeEvent } from "react";
import { KgAuthor } from "../../../features/kgSearch/KgSearch";
/**
 *  renku-ui
 *
 *  AuthorFilter.tsx
 *  Author filter component
 */

export interface AuthorFilterProps {
  handler: Function;
  value: KgAuthor;
}

const AuthorFilter = ({ handler, value }: AuthorFilterProps) => {
  const changeAuthor = (author: string) => {
    if (handler)
      handler(author);
  };
  const items = [
    { title: "All", value: "all" },
    { title: "Only Me", value: "user" },
  ];

  const options = items.map(item => {
    const nameInput = `author-${item.value}`;
    return (
      <div className="d-flex align-items-center" key={nameInput}>
        <Input
          type="radio"
          name="author-filter"
          value={item.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => changeAuthor(e.target.value)}
          className="author-input"
          checked={value === item.value}
          data-cy={nameInput}/>
        <label className="px-2 author-label">{item.title}</label>
      </div>
    );
  });
  return (
    <>
      <h3 className="filter-label">Author</h3>
      {options}
    </>
  );
};

export { AuthorFilter };
