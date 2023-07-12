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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Creator } from "../../../components/form-field/CreatorsInput";
import type { ImageInputImage } from "../../../components/form-field/ImageInput";
import type { RenkuUser } from "../../../model/RenkuModels";
import { createSliceSelector } from "../../../utils/customHooks/UseSliceSelector";

export type DatasetUploaderFile = {
  file: unknown;
  file_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_status: number;
  upload_id: string;
};

// type ServerErrorSource = "edit" | "jobs" | "general" | "remoteBranch";
type ServerError =
  | {
      context?: undefined;
      error: {
        userMessage?: string | undefined;
        reason: string;
      };
      source: "edit" | "general" | "remoteBranch";
    }
  | {
      context: Record<string, unknown>;
      error?: undefined;
      source: "jobs";
    };

export type DatasetFormState = {
  form: {
    creators: Creator[];
    description: string;
    files: Omit<DatasetUploaderFile, "file">[];
    image: ImageInputImage;
    keywords: string[];
    name: string;
    title: string;
  };
  context: {
    projectPathWithNamespace: string;
    location: {
      pathname: string;
    };
    serverError?: ServerError;
    serverWarning?: ServerError;
  };
};

type FormInitialValues = {
  location: { pathname: string };
  projectPathWithNamespace: string;
  user: RenkuUser;
};

function newDatasetCreators(user: RenkuUser): Creator[] {
  return [
    {
      id: 0,
      name: user.data.name,
      email: user.data.email,
      affiliation: user.data.organization,
      default: true,
    },
  ];
}

const initialState: DatasetFormState = {
  form: {
    creators: [],
    description: "",
    files: [],
    image: { options: [], selected: -1 },
    keywords: [],
    name: "",
    title: "",
  },
  context: {
    projectPathWithNamespace: "",
    location: { pathname: "" },
  },
};

export const datasetFormSlice = createSlice({
  name: "datasetForm",
  initialState,
  reducers: {
    initializeForUser: (state, action: PayloadAction<FormInitialValues>) => {
      if (state.context.location.pathname === action.payload.location.pathname)
        return state;
      state.form = {
        creators: newDatasetCreators(action.payload.user),
        description: "",
        files: [],
        image: { options: [], selected: -1 },
        keywords: [],
        name: "",
        title: "",
      };
      state.context = {
        projectPathWithNamespace: action.payload.projectPathWithNamespace,
        location: action.payload.location,
      };
    },
    setFiles: (
      state,
      action: PayloadAction<DatasetFormState["form"]["files"]>
    ) => {
      state.form.files = action.payload;
    },
    setFormValues: (state, action: PayloadAction<DatasetFormState["form"]>) => {
      state.form = action.payload;
    },
    setServerError: (state, action: PayloadAction<ServerError>) => {
      state.context.serverError = action.payload;
    },
    setServerWarning: (state, action: PayloadAction<ServerError>) => {
      state.context.serverWarning = action.payload;
    },

    reset: () => initialState,
  },
});

export const {
  initializeForUser,
  setFiles,
  setFormValues,
  setServerError,
  setServerWarning,
  reset,
} = datasetFormSlice.actions;
export const useDatasetFormSelector = createSliceSelector(datasetFormSlice);

export type { ServerError };
