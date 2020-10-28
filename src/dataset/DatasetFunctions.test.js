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
 *  DatasetFunctions.test.js
 *  Tests for datasets function.
 */
import { mapDataset } from "./DatasetFunctions";

describe("Dataset functions", () => {

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
      { "name": "Data file 1.xlsx", "atLocation": "data/test_dataset/Data file 1.xlsx" }
    ],
    "url": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "sameAs": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "isPartOf": []
  };

  const result_datast_in_kg = {
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
      { "name": "Data file 2.xlsx", "atLocation": "data/test_dataset/Data file 2.xlsx" },
      { "name": "Data file 1.xlsx", "atLocation": "data/test_dataset/Data file 1.xlsx" }
    ],
    "url": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "sameAs": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "isPartOf": [],
    "insideKg": true
  };

  const result_datast_no_kg = {
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
      { "name": "Data file 2.xlsx", "atLocation": "data/test_dataset/Data file 2.xlsx" },
      { "name": "Data file 1.xlsx", "atLocation": "data/test_dataset/Data file 1.xlsx" }
    ],
    "insideKg": false
  };

  const result_datast_only_kg = {
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
      { "name": "Data file 1.xlsx", "atLocation": "data/test_dataset/Data file 1.xlsx" }
    ],
    "url": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "sameAs": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "isPartOf": [],
    "insideKg": true
  };

  const core_files = [
    { "name": "Data file 2.xlsx", "atLocation": "data/test_dataset/Data file 2.xlsx" },
    { "name": "Data file 1.xlsx", "atLocation": "data/test_dataset/Data file 1.xlsx" }
  ];

  it("maps core dataset into kg dataset structure", () => {
    expect(mapDataset(core_dataset, kg_dataset, core_files)).toEqual(result_datast_in_kg);
  });

  it("maps core dataset into kg dataset structure for dataset outside of kg", () => {
    expect(mapDataset(core_dataset, undefined, core_files)).toEqual(result_datast_no_kg);
  });

  it("maps core dataset into kg dataset outside of a project - kg only", () => {
    expect(mapDataset(undefined, kg_dataset, undefined)).toEqual(result_datast_only_kg);
  });

});
