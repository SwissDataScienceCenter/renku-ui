/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  Datasets.test.js
 *  Tests for datasets function.
 */
import React from "react";
import ReactDOM from "react-dom";
import { createMemoryHistory } from "history";
import ShowDataset from "./Dataset.container";
import { MemoryRouter } from "react-router-dom";
import { mapDataset } from "./DatasetFunctions";
import { testClient as client } from "../api-client";
import { StateModel, globalSchema } from "../model";
import DatasetList from "./list";

describe("Dataset functions", () => {

  const model = new StateModel(globalSchema);
  const fakeHistory = createMemoryHistory({
    initialEntries: ["/"],
    initialIndex: 0,
  });
  fakeHistory.push({
    pathname: "/projects",
    search: "?page=1"
  });

  it("renders datasets list view without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <DatasetList key="datasets"
          client={client}
          model={model}
          history={fakeHistory}
          location={fakeHistory.location}
        />
      </MemoryRouter>
      , div);
  });

  it("renders dataset view without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <ShowDataset
          insideProject={false}
          identifier={"79215657-4319-4fcf-82b9-58267f2a1db8"}
          client={client}
          projectsUrl="/projects"
          selectedDataset={"79215657-4319-4fcf-82b9-58267f2a1db8"}
          logged={true}
          model={model}
        />
      </MemoryRouter>
      , div);
  });

  const core_dataset = {
    "created_at": "01/01/2001",
    "description": "some description for a dataset",
    "title": "Test dataset title",
    "identifier": "79215657-4319-4fcf-82b9-58267f2a1db8",
    "keywords": ["test1", "test2", "test3"],
    "name": "test-dataset-name",
    "version": null,
    "creators": [{
      "name": "First, Creator",
      "email": null,
      "affiliation": "Some Affiliation"
    }]
  };

  const kg_dataset = {
    "name": "test-dataset-name",
    "title": "Test dataset title",
    "description": "some description for a dataset",
    "published": {
      "creator": [{
        "name": "First, Creator",
        "email": null,
        "affiliation": "Some Affiliation"
      }],
      "datePublished": "01/01/2001",
    },
    "identifier": "79215657-4319-4fcf-82b9-58267f2a1db8",
    "keywords": ["test1", "test2", "test3"],
    "hasPart": [
      { "name": "Data file 1.xls", "atLocation": "data/test_dataset/Data file 1.xls" }
    ],
    "url": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "sameAs": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "isPartOf": []
  };

  const result_dataset_in_kg = {
    ...kg_dataset,
    "hasPart": [
      { "name": "Data file 2.xls", "atLocation": "data/test_dataset/Data file 2.xls" },
      { "name": "Data file 1.xls", "atLocation": "data/test_dataset/Data file 1.xls" }
    ],
    "insideKg": true
  };

  const result_dataset_no_kg = {
    "name": "test-dataset-name",
    "title": "Test dataset title",
    "description": "some description for a dataset",
    "published": {
      "creator": [{
        "name": "First, Creator",
        "email": null,
        "affiliation": "Some Affiliation"
      }],
      "datePublished": "01/01/2001",
    },
    "identifier": "79215657-4319-4fcf-82b9-58267f2a1db8",
    "keywords": ["test1", "test2", "test3"],
    "hasPart": [
      { "name": "Data file 2.xls", "atLocation": "data/test_dataset/Data file 2.xls" },
      { "name": "Data file 1.xls", "atLocation": "data/test_dataset/Data file 1.xls" }
    ],
    "insideKg": false
  };

  const result_dataset_only_kg = {
    ...kg_dataset,
    "insideKg": true
  };


  const core_files = [
    { "name": "Data file 2.xls", "atLocation": "data/test_dataset/Data file 2.xls" },
    { "name": "Data file 1.xls", "atLocation": "data/test_dataset/Data file 1.xls" }
  ];

  it("maps core dataset into kg dataset structure", () => {
    expect(mapDataset(core_dataset, kg_dataset, core_files)).toEqual(result_dataset_in_kg);
  });

  it("maps core dataset into kg dataset structure for dataset outside of kg", () => {
    expect(mapDataset(core_dataset, undefined, core_files)).toEqual(result_dataset_no_kg);
  });

  it("maps core dataset into kg dataset outside of a project - kg only", () => {
    expect(mapDataset(undefined, kg_dataset, undefined)).toEqual(result_dataset_only_kg);
  });

});
