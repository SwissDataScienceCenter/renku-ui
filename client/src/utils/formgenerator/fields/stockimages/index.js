/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

// eslint-disable-next-line
/**
 *  renku-ui
 *
 *  formgenerator/fields/stockimages
 *  A collection of stock images available to Renku
 */

const ImageFieldPropertyName = {
  NAME: "NAME",
  URL: "URL",
  STOCK: "STOCK",
  FILE: "FILE"
};

const DatasetImages = [
  {
    [ImageFieldPropertyName.NAME]: "lines",
    [ImageFieldPropertyName.URL]: "stockimages/dataset1.svg"
  },
  {
    [ImageFieldPropertyName.NAME]: "bars",
    [ImageFieldPropertyName.URL]: "stockimages/dataset2.svg"
  },
  {
    // eslint-disable-next-line
    [ImageFieldPropertyName.NAME]: "science",
    [ImageFieldPropertyName.URL]: "stockimages/dataset3.png"
  }
];

DatasetImages.forEach(i => {
  i[ImageFieldPropertyName.STOCK] = true;
  i[ImageFieldPropertyName.NAME] = `[stock:${i[ImageFieldPropertyName.NAME]}]`;
});

export { DatasetImages, ImageFieldPropertyName };
