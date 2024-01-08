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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { versionedPathForEndpoint } from "../../utils/helpers/url/versionedUrls";
import {
  AddFiles,
  AddFilesParams,
  AddFilesResponse,
  DeleteDataset,
  DeleteDatasetParams,
  DeleteDatasetResponse,
  PostDataset,
  PostDatasetParams,
  PostDatasetResponse,
} from "./datasets.types";

export const datasetsCoreApi = createApi({
  reducerPath: "datasetsCore",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/renku" }),
  tagTypes: ["datasets"],
  endpoints: (builder) => ({
    addFiles: builder.mutation<AddFiles, AddFilesParams>({
      query: ({ apiVersion, branch, files, gitUrl, metadataVersion, slug }) => {
        return {
          body: { branch, files, git_url: gitUrl, slug },
          method: "POST",
          url: versionedPathForEndpoint({
            endpoint: "datasets.add",
            metadataVersion,
            apiVersion,
          }),
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
        };
      },
      transformResponse: (response: AddFilesResponse) => {
        if (!response.result) throw new Error("Unexpected response");
        return {
          files: response.result.files,
          slug: response.result.slug,
          remoteBranch: response.result.remote_branch,
        };
      },
    }),
    deleteDataset: builder.mutation<DeleteDataset, DeleteDatasetParams>({
      query: ({ apiVersion, gitUrl, metadataVersion, slug }) => {
        const body = { git_url: gitUrl, slug };
        return {
          body,
          method: "POST",
          url: versionedPathForEndpoint({
            endpoint: "datasets.remove",
            metadataVersion,
            apiVersion,
          }),
          validateStatus: (response, body) =>
            response.status >= 200 && response.status < 300 && !body.error,
        };
      },
      transformResponse: (response: DeleteDatasetResponse) => {
        if (!response.result) throw new Error("Unexpected response");
        return {
          slug: response.result.slug,
          remoteBranch: response.result.remote_branch,
        };
      },
    }),
    // ? This includes both "create" and "edit" operations
    postDataset: builder.mutation<PostDataset, PostDatasetParams>({
      query: ({
        apiVersion,
        branch,
        dataset,
        edit,
        gitUrl,
        metadataVersion,
      }) => {
        const targetApi = edit ? "datasets.edit" : "datasets.create";
        // files must be added after the dataset is created
        const groomedDataset = { ...dataset };
        if ("files" in groomedDataset) delete groomedDataset.files;
        if (groomedDataset.images && !groomedDataset.images.length)
          delete groomedDataset.images;
        return {
          body: { ...groomedDataset, branch, git_url: gitUrl },
          method: "POST",
          url: versionedPathForEndpoint({
            endpoint: targetApi,
            metadataVersion,
            apiVersion,
          }),
          validateStatus: (response, body) => {
            return response.status < 400 && !body.error?.code;
          },
        };
      },
      transformResponse: (response: PostDatasetResponse) => {
        if (!response.result) throw new Error("Unexpected response");
        return {
          slug: response.result.slug,
          remoteBranch: response.result.remote_branch,
        };
      },
    }),
  }),
});

export const {
  useAddFilesMutation,
  useDeleteDatasetMutation,
  usePostDatasetMutation,
} = datasetsCoreApi;
