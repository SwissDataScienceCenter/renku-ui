/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { FILE_STATUS } from "../../../components/form-field/FileUploaderInput";
import type { ImageInputImage } from "../../../components/form-field/ImageInput";
import type { Creator } from "../Project";
import type { DatasetFormState } from "./datasetForm.slice";
import type { DatasetImage } from "./dataset.types";
import { DatasetUploaderFile } from "./datasetForm.slice";

export type DatasetFormFields = DatasetFormState["form"];

export type DatasetPostClient = {
  uploadSingleFile(
    file: unknown,
    unpackArchive: boolean,
    versionUrl: string
  ): Promise<PostImageUploadResponse>;
};

type ImageUploadJob = {
  file_id: string;
};

export type PostDatasetFile = { file_id: string } | { file_url: string };

export type PostDataset = {
  creators: Partial<Creator>[];
  description: string;
  files?: PostDatasetFile[];
  images?: DatasetImage[];
  keywords: string[];
  name: string;
  title: string;
};

export type PostDatasetErrorResponse = {
  error: {
    errorOnFileAdd?: boolean;
    userMessage?: string;
    reason: string;
  };
  result: null | undefined;
};

type PostImageUploadSuccessResponse = {
  error: null | undefined;
  result: {
    files: ImageUploadJob[];
  };
};

type PostImageUploadResponse = {
  data: PostDatasetErrorResponse | PostImageUploadSuccessResponse;
};

export async function createSubmitDataset(
  datasetInput: DatasetFormFields,
  client: DatasetPostClient,
  versionUrl: string
): Promise<PostDataset | { data: PostDatasetErrorResponse }> {
  const { readyFiles, pendingFiles } =
    gatherDatasetFilesForSubmit(datasetInput);

  const images = await getDatasetImagesForSubmit(
    datasetInput,
    client,
    versionUrl
  );
  if ("data" in images) return images;
  const dataset = {
    creators: datasetInput.creators.map((creator) => getCreator(creator)),
    description: datasetInput.description,
    files: [...readyFiles, ...pendingFiles],
    images,
    keywords: datasetInput.keywords,
    name: datasetInput.name,
    title: datasetInput.title,
  };
  return dataset;
}

type NewCreator = Partial<Creator>;
function getCreator(creator: Creator) {
  const newCreator: NewCreator = { name: creator.name };
  if (creator.email) newCreator.email = creator.email;
  if (creator.affiliation) newCreator.affiliation = creator.affiliation;
  return newCreator;
}

function getFileIds(
  files: Omit<DatasetUploaderFile, "file">[]
): { file_id: string }[] {
  return files.flatMap((file) => {
    if (Array.isArray(file.file_id))
      return file.file_id.map((id) => ({ file_id: id as string }));
    return { file_id: file.file_id as string };
  });
}
function gatherDatasetFilesForSubmit(datasetInput: DatasetFormFields) {
  // TODO: make sure file_status is kept in the form
  const pendingFiles = datasetInput.files
    .filter((f) => f.file_status === FILE_STATUS.PENDING)
    .map((f) => ({ file_url: f.file_name }));
  const readyFiles = datasetInput.files.filter(
    (f) =>
      f.file_status !== FILE_STATUS.PENDING &&
      f.file_status !== FILE_STATUS.ADDED &&
      f.file_id !== undefined
  );
  return { readyFiles: getFileIds(readyFiles), pendingFiles };
}

async function getDatasetImagesForSubmit(
  datasetInput: DatasetFormFields,
  client: DatasetPostClient,
  versionUrl: string
): ReturnType<typeof uploadDatasetImages> {
  if (datasetInput.image.options.length < 1) return [];

  const imageSelected = datasetInput.image.options[datasetInput.image.selected];
  if (imageSelected.STOCK) {
    const imageUrl =
      datasetInput.image.options[datasetInput.image.selected]?.URL;
    if (imageUrl != null) {
      return [
        {
          content_url: imageUrl,
          position: 0,
          mirror_locally: true,
        },
      ];
    }
    return [];
  }
  const uploadedImages = await uploadDatasetImages(
    client,
    versionUrl,
    datasetInput.image
  );
  return uploadedImages ?? [];
}

async function uploadDatasetImages(
  client: DatasetPostClient,
  versionUrl: string,
  image: ImageInputImage
): Promise<DatasetImage[] | { data: PostDatasetErrorResponse }> {
  if (image == null) return [];
  if (image.selected === -1) return [];
  if (!image.options) return [];
  if (!image.options[image.selected].FILE) return [];
  const selectedFile = image.options[image.selected];
  const result = await client
    .uploadSingleFile(selectedFile.FILE, false, versionUrl)
    .then((response) => {
      if (response.data.error != null) return { data: response.data };
      return [
        {
          file_id: response.data.result.files[0].file_id,
          position: 0,
          mirror_locally: true,
        },
      ];
    });
  return result;
}
