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

import cx from "classnames";
import React from "react";
import type { FieldErrors } from "react-hook-form";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Button, FormGroup, UncontrolledAlert } from "reactstrap";

import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import CreatorsInput, {
  validateCreators,
} from "../../../components/form-field/CreatorsInput";
import FileUploaderInput, {
  FILE_STATUS,
} from "../../../components/form-field/FileUploaderInput";
import ImageInput from "../../../components/form-field/ImageInput";
import KeywordsInput from "../../../components/form-field/KeywordsInput";
import TextAreaInput from "../../../components/form-field/TextAreaInput";
import TextInput from "../../../components/form-field/TextInput";
import type { RenkuUser } from "../../../model/renkuModels.types";
import { FormErrorFields } from "../../../project/new/components/FormValidations";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import type { AppDispatch } from "../../../utils/helpers/EnhancedState";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { CoreErrorResponse } from "../../../utils/types/coreService.types";
import {
  AddFilesParams,
  PostDatasetParams,
} from "../../datasets/datasets.types";
import {
  useAddFilesMutation,
  usePostDatasetMutation,
} from "../../datasets/datasetsCore.api";
import { DatasetCore, IDatasetFiles } from "../../project/Project";
import type {
  DatasetFormFields,
  DatasetPostClient,
  PostDataset,
} from "./datasetCore.api";
import { createSubmitDataset } from "./datasetCore.api";
import type { DatasetFormState, ServerError } from "./datasetForm.slice";
import {
  reset,
  setFiles,
  setFormValues,
  setServerError,
  setServerWarning,
} from "./datasetForm.slice";

export type PostSubmitProps = {
  datasetId: string;
  dispatch: AppDispatch;
  fetchDatasets: (forceRefetch: boolean, versionUrl: string) => Promise<void>;
  history: DatasetModifyProps["history"];
  projectPathWithNamespace: string;
  state?: unknown;
  versionUrl: string;
};
async function redirectAfterSubmit({
  datasetId,
  dispatch,
  fetchDatasets,
  history,
  projectPathWithNamespace,
  state,
  versionUrl,
}: PostSubmitProps) {
  dispatch(reset());
  await fetchDatasets(true, versionUrl);
  history.push({
    pathname: `/projects/${projectPathWithNamespace}/datasets/${datasetId}`,
    state,
  });
}

type DatasetCreateSubmitGroupProps = {
  submitLoader: { value: boolean; text: string };
  btnName: string;
  onCancel: () => void;
  handlers?: unknown;
};

function DatasetCreateSubmitGroup(props: DatasetCreateSubmitGroupProps) {
  const { submitLoader, btnName } = props;
  const { onCancel } = props;
  const buttonColor = "rk-pink";
  const submitButton = (
    <Button
      data-cy="submit-button"
      type="submit"
      disabled={submitLoader.value}
      className="float-end mt-1"
      color={buttonColor}
    >
      {btnName}
    </Button>
  );
  const cancelButton = (
    <Button
      disabled={submitLoader.value}
      className={cx("float-end", "mt-1", "me-1", `btn-outline-${buttonColor}`)}
      onClick={() => onCancel()}
    >
      Cancel
    </Button>
  );

  return (
    <FormGroup className="row">
      <div>
        {submitButton}
        {cancelButton}
      </div>
    </FormGroup>
  );
}

type DatasetFormFieldKey = keyof DatasetFormFields;
type DatasetFormErrorsProps = { errors: FieldErrors<DatasetFormFields> };
function DatasetFormErrors({ errors }: DatasetFormErrorsProps) {
  function fieldNameToLabel(fieldName: string) {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
  const formFields = Object.keys(errors) as unknown as DatasetFormFieldKey[];
  const errorFields = formFields
    .filter((field) => errors[field])
    .map(fieldNameToLabel);
  if (errorFields.length == 0) return null;
  return (
    <div className="mb-2">
      <FormErrorFields errorFields={errorFields} />
    </div>
  );
}

interface DatasetModifyFormProps extends DatasetModifyDisplayProps {
  dataset: DatasetCore | undefined;
  existingFiles: IDatasetFiles | undefined;
  formState: DatasetFormState;
  location: unknown;
  notifications: unknown;
  onCancel: () => void;
  onSubmit: SubmitHandler<DatasetFormFields>;
  projectPathWithNamespace: string;
  versionUrl: string;
}
function DatasetModifyForm(props: DatasetModifyFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    register,
    setValue,
    watch,
  } = useForm<DatasetFormFields>({
    defaultValues: props.formState.form,
  });
  const name = watch("name");
  React.useEffect(() => {
    // only update the name if the dataset does not already exist
    if (props.dataset == null && name)
      setValue("slug", slugFromTitle(name, true));
  }, [props.dataset, setValue, name]);
  const [areKeywordsDirty, setKeywordsDirty] = React.useState(false);
  return (
    <form className="form-rk-pink" onSubmit={handleSubmit(props.onSubmit)}>
      <TextInput
        error={errors.name}
        dataCy="input-title"
        help={
          <span>
            The name is displayed in listings of datasets. The <b>slug</b> is
            automatically derived from the name, but can be changed.
          </span>
        }
        label="Name"
        name="name"
        required={true}
        register={register("name", { required: "A name is required" })}
      />
      <TextInput
        error={errors.slug}
        help="Slug is used as an identifier in renku commands."
        label="Slug"
        name="slug"
        required={true}
        register={register("slug", {
          disabled: props.dataset != null,
          required:
            "A slug is required; a default is derived from the name, but it can be modified",
        })}
      />
      <CreatorsInput
        error={errors.creators}
        label="Creators"
        name="creators"
        register={register("creators", { validate: validateCreators })}
        value={getValues("creators")}
      />
      <KeywordsInput
        hasError={errors.keywords != null}
        help="Keywords are used to describe the dataset. To add one, type a keyword and press enter."
        label="Keywords"
        name="keywords"
        register={register("keywords", { validate: () => !areKeywordsDirty })}
        setDirty={setKeywordsDirty}
        value={getValues("keywords")}
      />
      <TextAreaInput<DatasetFormFields>
        control={control}
        help="Basic markdown styling tags are allowed in this field."
        getValue={() => getValues("description")}
        label="Description"
        name="description"
        register={register("description")}
      />
      <FileUploaderInput
        dataset={props.dataset}
        existingFiles={props.existingFiles}
        help="You can upload files from your computer or add files from a remote location."
        label="Files"
        location={props.location}
        name="files"
        notifications={props.notifications}
        projectPathWithNamespace={props.projectPathWithNamespace}
        register={register("files", {
          validate: (files: DatasetFormState["form"]["files"]) =>
            files.every((file) =>
              [
                FILE_STATUS.ADDED,
                FILE_STATUS.PENDING,
                FILE_STATUS.UPLOADED,
              ].includes(file.file_status)
            ),
        })}
        value={getValues("files")}
        setValue={(files: DatasetFormState["form"]["files"]) =>
          setValue("files", files)
        }
        versionUrl={props.versionUrl}
      />
      <ImageInput
        label="Image"
        name="image"
        register={register("image")}
        value={getValues("image")}
        color="pink"
      />
      <DatasetFormErrors errors={errors} />
      <DatasetCreateSubmitGroup
        btnName={props.submitButtonText}
        submitLoader={{ value: false, text: "" }}
        onCancel={props.onCancel}
      />
    </form>
  );
}

export type DatasetModifyDisplayProps = {
  submitButtonText: string;
  submitLoaderText: string;
};

function serverWarningMessageForMerge(
  remoteBranch: string,
  props: Pick<DatasetModifyProps, "defaultBranch" | "externalUrl">
) {
  return (
    <div>
      <p>
        The operation was successful, but{" "}
        <strong>
          this project requires use of merge requests to make changes.
        </strong>
      </p>
      <p>
        Create a merge request to bring the changes from{" "}
        <strong>{remoteBranch}</strong> into{" "}
        <strong>{props.defaultBranch}</strong> to see the dataset in your
        project.
      </p>
      <p>
        This can be done on the{" "}
        <ExternalLink
          className="btn-warning"
          size="sm"
          title="Merge Requests"
          url={`${props.externalUrl}/-/merge_requests`}
        />{" "}
        tab of the GitLab UI.
      </p>
    </div>
  );
}

function formatServerWarning(
  warning: ServerError,
  props: Pick<
    DatasetModifyProps,
    "defaultBranch" | "externalUrl" | "overviewCommitsUrl"
  >
) {
  if (warning.source === "remoteBranch") {
    return serverWarningMessageForMerge(warning.error.reason, props);
  }
  return null;
}

function formatServerError(error: ServerError) {
  if (error.source === "jobs") return null;
  if (error.source === "edit")
    return (
      <div>
        <p>
          Metadata changes were successfully applied, but some files could not
          be updated.
        </p>
        <p>
          {error.error.userMessage
            ? error.error.userMessage
            : error.error.reason}
        </p>
      </div>
    );
  return (
    <div>
      <p>Errors occurred while performing this operation.</p>
      <div>
        {error.error.userMessage ? error.error.userMessage : error.error.reason}
      </div>
    </div>
  );
}
export interface DatasetModifyProps extends DatasetModifyDisplayProps {
  apiVersion: string | undefined;
  client: DatasetPostClient;
  dataset: DatasetModifyFormProps["dataset"];
  defaultBranch: string;
  existingFiles: DatasetModifyFormProps["existingFiles"];
  externalUrl: string;
  fetchDatasets: PostSubmitProps["fetchDatasets"];
  history: ReturnType<typeof useHistory>;
  initialized: boolean;
  location: { pathname: string };
  metadataVersion: number | undefined;
  notifications: unknown;
  onCancel: () => void;
  overviewCommitsUrl: string;
  projectPathWithNamespace: string;
  setSubmitting: (value: boolean) => void;
  user: RenkuUser;
  versionUrl: string;
}
export default function DatasetModify(props: DatasetModifyProps) {
  const dispatch = useAppDispatch();
  const {
    apiVersion,
    client,
    dataset,
    defaultBranch,
    externalUrl,
    fetchDatasets,
    history,
    location,
    metadataVersion,
    overviewCommitsUrl,
    projectPathWithNamespace,
    setSubmitting,
    versionUrl,
  } = props;

  const edit = dataset != null;
  const slug = dataset?.slug;

  const formState = useAppSelector(({ datasetForm }) => datasetForm);

  const setError = React.useCallback(
    (error: ServerError) => {
      dispatch(setServerError(error));
    },
    [dispatch]
  );

  const setWarning = React.useCallback(
    (warning: ServerError) => {
      dispatch(setServerWarning(warning));
    },
    [dispatch]
  );

  const [postDatasetMutation] = usePostDatasetMutation();
  const [addFilesMutation] = useAddFilesMutation();

  // TODO: split the monolithic onSubmit function and use the mutation statuses
  const onSubmit: SubmitHandler<DatasetFormFields> = React.useCallback(
    async (data: DatasetFormFields) => {
      setSubmitting(true);
      dispatch(setFormValues(data));
      const submitData = { ...data };
      // Do not change the slug of an existing dataset
      if (slug) submitData.slug = slug;

      try {
        // step 1: prepare the dataset
        const groomedDataset = await createSubmitDataset(
          submitData,
          client,
          versionUrl
        );
        // ? "data" means that an error occurred
        if (
          "data" in groomedDataset ||
          (groomedDataset?.images && "data" in groomedDataset.images)
        ) {
          const reason =
            "data" in groomedDataset
              ? "Could not create dataset."
              : "Could not add dataset image";
          dispatch(
            setServerError({
              source: "general",
              error: {
                reason,
              },
            })
          );

          setSubmitting(false);
          return;
        }

        // step 2: create or modify the dataset metadata -- no files
        const datasetMutationParams: PostDatasetParams = {
          apiVersion,
          branch: defaultBranch,
          dataset: groomedDataset as PostDataset,
          edit,
          gitUrl: externalUrl,
          metadataVersion,
        };
        // ? this was a quick fix; we should _not_ use then/catch but rather rely on postDatasetStatus
        postDatasetMutation(datasetMutationParams)
          .then(async (response) => {
            if ("error" in response) {
              const coreError =
                "data" in response.error
                  ? (response.error.data as CoreErrorResponse).error
                  : null;
              const error = coreError
                ? { ...coreError, reason: coreError.devMessage }
                : { reason: response.error.toString() };
              setError({ source: "general", error });
              setSubmitting(false);
              return;
            }
            // ? this happens when the project's default branch is protected
            if (response.data.remoteBranch !== defaultBranch) {
              setWarning({
                source: "remoteBranch",
                error: { reason: response.data.remoteBranch },
              });
            }

            // return when there are no files to add and the branch is not protected
            if (!groomedDataset.files?.length) {
              if (response.data.remoteBranch === defaultBranch) {
                await redirectAfterSubmit({
                  datasetId: dataset?.slug ?? response.data.slug,
                  fetchDatasets,
                  history,
                  projectPathWithNamespace,
                  state: undefined,
                  dispatch,
                  versionUrl,
                });
              }

              setSubmitting(false);
              return;
            }

            // step 3: add the files (if any)
            const addFilesParams: AddFilesParams = {
              apiVersion,
              branch: response.data.remoteBranch ?? defaultBranch,
              files: groomedDataset.files,
              gitUrl: externalUrl,
              metadataVersion,
              slug: groomedDataset.slug,
            };
            addFilesMutation(addFilesParams)
              .then(async (filesResponse) => {
                if ("error" in filesResponse) {
                  const fileCoreError =
                    "data" in filesResponse.error
                      ? (filesResponse.error.data as CoreErrorResponse).error
                      : null;
                  const error = fileCoreError
                    ? { ...fileCoreError, reason: fileCoreError.devMessage }
                    : { reason: filesResponse.error.toString() };
                  dispatch(setFiles([]));
                  // ? redirect to the dataset page if dataset was created
                  if (!edit) {
                    await redirectAfterSubmit({
                      datasetId: response.data.slug,
                      fetchDatasets,
                      history,
                      projectPathWithNamespace,
                      state: { errorOnCreation: true },
                      dispatch,
                      versionUrl,
                    });
                  }
                  setError({ source: "edit", error });
                  setSubmitting(false);
                  return;
                }

                // ? Do not redirect if the dataset was created in another branch, we should display the warning
                if (response.data.remoteBranch === defaultBranch) {
                  await redirectAfterSubmit({
                    datasetId: dataset?.slug ?? response.data.slug,
                    fetchDatasets,
                    history,
                    projectPathWithNamespace,
                    state: undefined,
                    dispatch,
                    versionUrl,
                  });
                }

                setSubmitting(false);
                return;
              })
              // This _should_ never happen with the current implementation of addFilesMutation. Just in case...
              .catch((error) => {
                setError({
                  source: "general",
                  error: {
                    reason:
                      "Could not add files to dataset: " +
                      (error as Error).toString(),
                  },
                });

                dispatch(setFiles([]));
                setSubmitting(false);
                return;
              });
          })
          .catch((error) => {
            setSubmitting(false);
            setError({
              source: "general",
              error: {
                reason: "Could not create dataset: " + error.toString(),
              },
            });

            setSubmitting(false);
            return;
          });
      } catch (error) {
        setError({
          source: "general",
          error: {
            reason: "Could not create dataset.",
          },
        });
      }
    },
    [
      apiVersion,
      addFilesMutation,
      client,
      dataset?.slug,
      defaultBranch,
      dispatch,
      edit,
      externalUrl,
      fetchDatasets,
      history,
      metadataVersion,
      slug,
      postDatasetMutation,
      projectPathWithNamespace,
      setError,
      setSubmitting,
      setWarning,
      versionUrl,
    ]
  );

  React.useEffect(() => {
    // Warn the user if they navigate away from this page
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.returnValue = true;
      e.preventDefault();
      return;
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // Still waiting for the form to be initialized
  if (formState.context.location.pathname !== location.pathname) {
    return <Loader />;
  }

  if (formState.context.serverWarning) {
    return (
      <div className="mt-2">
        <UncontrolledAlert color="warning">
          {formatServerWarning(formState.context.serverWarning, {
            defaultBranch,
            externalUrl,
            overviewCommitsUrl,
          })}
        </UncontrolledAlert>
        <div>
          <Button
            className={cx("float-end", "mt-1", "me-1", "btn-outline-rk-pink")}
            onClick={() => props.onCancel()}
          >
            {edit ? "Go to dataset" : "Go to list"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DatasetModifyForm
        dataset={props.dataset}
        existingFiles={props.existingFiles}
        formState={formState}
        location={location}
        notifications={props.notifications}
        onCancel={props.onCancel}
        onSubmit={onSubmit}
        projectPathWithNamespace={props.projectPathWithNamespace}
        submitButtonText={props.submitButtonText}
        submitLoaderText={props.submitLoaderText}
        versionUrl={props.versionUrl}
      />
      {formState.context.serverError && (
        <div className="mt-2">
          <UncontrolledAlert color="danger">
            {formatServerError(formState.context.serverError)}
          </UncontrolledAlert>
        </div>
      )}
    </>
  );
}
