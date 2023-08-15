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

export type DatasetFormFields = DatasetFormState["form"];

export type DatasetPostClient = {
  getAllJobStatus(versionUrl: string): Promise<{ jobs: RemoteJob[] }>;
  postDataset(
    projectUrl: string,
    renkuDataset: PostDataset,
    defaultBranch: string,
    edit: boolean,
    versionUrl: string | undefined
  ): Promise<PostDatasetResponse>;
  uploadSingleFile(
    file: unknown,
    unpackArchive: boolean,
    versionUrl: string
  ): Promise<PostImageUploadResponse>;
};

type JobStatus = "ENQUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type FileUploadJob = {
  job_id: string;
  file_url: string;
  job_status?: JobStatus;
  extras?: unknown;
};

type ImageUploadJob = {
  file_id: string;
};

export type PostDataset = {
  creators: Partial<Creator>[];
  description: string;
  files: ({ file_id: string } | { file_url: string })[];
  images: DatasetImage[];
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

export type PostDatasetSuccessResponse = {
  error: null | undefined;
  result: {
    remote_branch: string;
    files?: FileUploadJob[];
  };
};

type PostDatasetResponse = {
  data: PostDatasetErrorResponse | PostDatasetSuccessResponse;
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

type RemoteJob = {
  job_id: string;
  state?: JobStatus;
  extras: unknown;
};

async function createSubmitDataset(
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

function gatherDatasetFilesForSubmit(datasetInput: DatasetFormFields) {
  // TODO: make sure file_status is kept in the form
  const pendingFiles = datasetInput.files
    .filter((f) => f.file_status === FILE_STATUS.PENDING)
    .map((f) => ({ file_url: f.file_name }));
  const readyFiles = datasetInput.files
    .filter(
      (f) =>
        f.file_status !== FILE_STATUS.PENDING &&
        f.file_status !== FILE_STATUS.ADDED &&
        f.file_id !== undefined
    )
    .map((f) => ({ file_id: f.file_id }));
  return { readyFiles, pendingFiles };
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

function updateJobStatuses(jobs: RemoteJob[], uploadJobs: FileUploadJob[]) {
  const remoteJobDict = jobs.reduce((acc, job) => {
    acc[job.job_id] = job;
    return acc;
  }, {} as Record<string, RemoteJob>);

  uploadJobs.forEach((localJob) => {
    const r = remoteJobDict[localJob.job_id];
    if (r == null) return;
    localJob.job_status = r.state;
    localJob.extras = r.extras;
  });
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

type PostDatasetProps = {
  client: DatasetPostClient;
  defaultBranch: string;
  edit: boolean;
  externalUrl: string;
  versionUrl: string;
};
export async function postDataset(
  datasetInput: DatasetFormFields,
  props: PostDatasetProps
): Promise<{ dataset: PostDataset | null; response: PostDatasetResponse }> {
  const dataset = await createSubmitDataset(
    datasetInput,
    props.client,
    props.versionUrl
  );
  if ("data" in dataset) return { dataset: null, response: dataset };

  // TODO: Convert to RTK query
  const response = await props.client.postDataset(
    props.externalUrl,
    dataset,
    props.defaultBranch,
    props.edit,
    props.versionUrl
  );
  return { dataset, response };
}

type PostDatasetCreationResponse = {
  problemJobs: FileUploadJob[];
};
export async function pollForDatasetCreation(
  result: PostDatasetSuccessResponse["result"],
  client: DatasetPostClient,
  versionUrl: string
): Promise<PostDatasetCreationResponse> {
  if (result.files == null) return { problemJobs: [] };
  const uploadJobs: FileUploadJob[] = result.files
    .filter((f) => f.job_id != null)
    .map((f) => ({
      job_id: f.job_id,
      file_url: f.file_url,
      job_status: undefined,
    }));
  if (uploadJobs.length < 1) return { problemJobs: [] };

  const POLL_INTERVAL_MS = 5_000;
  return await new Promise<PostDatasetCreationResponse>((resolve) => {
    let pollCount = 0;
    const monitorJobs = setInterval(async () => {
      try {
        // Get all the running jobs
        const response = await client.getAllJobStatus(versionUrl);
        updateJobStatuses(response.jobs, uploadJobs);

        // If all jobs are completed, we are done
        if (uploadJobs.every((j) => j.job_status === "COMPLETED")) {
          clearInterval(monitorJobs);
          resolve({ problemJobs: [] });
          return;
        }

        // If all the jobs have completed or failed, report back about the failed jobs
        const unfinishedJobs = uploadJobs.filter(
          (j) => j.job_status !== "COMPLETED"
        );
        if (unfinishedJobs.every((j) => j.job_status === "FAILED")) {
          clearInterval(monitorJobs);
          resolve({ problemJobs: unfinishedJobs });
          return;
        }
      } finally {
        if (++pollCount >= 24) {
          const unfinishedJobs = uploadJobs.filter(
            (j) => j.job_status !== "COMPLETED"
          );
          clearInterval(monitorJobs);
          resolve({ problemJobs: unfinishedJobs });
        }
      }
    }, POLL_INTERVAL_MS);
  });
}
