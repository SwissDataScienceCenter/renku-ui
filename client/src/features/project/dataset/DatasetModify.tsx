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

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import cx from "classnames";

import { Button, UncontrolledAlert } from "reactstrap";

import { Loader } from "../../../components/Loader";
import CreatorsInput, {
  validateCreators,
} from "../../../components/form-field/CreatorsInput";
import { ExternalLink } from "../../../components/ExternalLinks";
import ImageInput from "../../../components/form-field/ImageInput";
import KeywordsInput from "../../../components/form-field/KeywordsInput";
import FileUploaderInput, {
  FILE_STATUS,
} from "../../../components/form-field/FileUploaderInput";
import TextInput from "../../../components/form-field/TextInput";
import TextAreaInput from "../../../components/form-field/TextAreaInput";
import type { RenkuUser } from "../../../model/RenkuModels";
import { FormErrorFields } from "../../../project/new/components/FormValidations";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";

import { DatasetCore, IDatasetFiles } from "../../project/Project";

import {
  reset,
  setFormValues,
  setServerError,
  setServerWarning,
  useDatasetFormSelector,
} from "./datasetForm.slice";
import type { DatasetFormState, ServerError } from "./datasetForm.slice";
import { pollForDatasetCreation, postDataset } from "./datasetCore.api";
import type {
  DatasetFormFields,
  DatasetPostClient,
  FileUploadJob,
} from "./datasetCore.api";

function formatJobsStatsWarning(
  jobsStats: FileUploadJob[],
  overviewCommitsUrl: string
) {
  const failedJobs = jobsStats.filter((j) => j.job_status === "FAILED");
  const ongoingJobs = jobsStats.filter((j) => j.job_status !== "FAILED");
  const failed = failedJobs.map((job) => (
    <div key={"warn-" + job.file_url} className="pl-2">
      - {job.file_url}
      <br />
    </div>
  ));
  const inProgress = ongoingJobs.map((job) => (
    <div key={"warn-" + job.file_url} className="pl-2">
      - {job.file_url}
      <br />
    </div>
  ));
  return (
    <div>
      <p className="mb-2">
        <strong>
          The operation was successful, but some warnings were raised during the
          process.
        </strong>
      </p>
      {ongoingJobs.length > 0 && (
        <div>
          This operation is taking too long and it will continue being processed
          in the background.
          <br />
          Please check the datasets list later to make sure that the changes are
          visible in the project. <br />
          You can also check the{" "}
          <Link to={overviewCommitsUrl}>commits list</Link> in the project to
          see if commits for the new dataset appear there.
          <br />
          <br />
        </div>
      )}
      {failed.length > 0 && (
        <div>
          <strong>Some files had errors on upload:</strong>
          <br />
          {failed}
        </div>
      )}
      {inProgress.length > 0 && (
        <div>
          <strong>Uploads in progress:</strong>
          <br />
          {inProgress}
        </div>
      )}
      <br />
      <br />
    </div>
  );
}

export type PostSubmitProps = {
  datasetId: string;
  dispatch: ReturnType<typeof useDispatch>;
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
    pathname: `/projects/${projectPathWithNamespace}/datasets/${datasetId}/`,
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
    <div>
      {submitButton}
      {cancelButton}
    </div>
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
  const title = watch("title");
  React.useEffect(() => {
    // only update the name if the dataset does not already exist
    if (props.dataset == null && title)
      setValue("name", slugFromTitle(title, true));
  }, [props.dataset, setValue, title]);
  const [areKeywordsDirty, setKeywordsDirty] = React.useState(false);
  return (
    <form className="form-rk-pink" onSubmit={handleSubmit(props.onSubmit)}>
      <TextInput
        error={errors.title}
        dataCy="input-title"
        help={
          <span>
            The title is displayed in listings of datasets. The <b>name</b> is
            automatically derived from the title, but can be changed.
          </span>
        }
        label="Title"
        name="title"
        required={true}
        register={register("title", { required: "A title is required" })}
      />
      <TextInput
        error={errors.name}
        help="Name is used as an identifier in renku commands."
        label="Name"
        name="name"
        required={true}
        register={register("name", {
          disabled: props.dataset != null,
          required:
            "A name is required; a default is derived from the title, but it can be modified",
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
              [FILE_STATUS.ADDED, FILE_STATUS.UPLOADED].includes(
                file.file_status
              )
            ),
        })}
        value={getValues("files")}
        setValue={(files: DatasetFormState["form"]["files"]) =>
          setValue("files", files)
        }
      />
      <ImageInput
        label="Image"
        name="image"
        register={register("image")}
        value={getValues("image")}
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
  if (warning.source === "jobs") {
    return formatJobsStatsWarning(
      warning.context.problemJobs as FileUploadJob[],
      props.overviewCommitsUrl
    );
  }
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
  client: DatasetPostClient;
  dataset: DatasetModifyFormProps["dataset"];
  defaultBranch: string;
  existingFiles: DatasetModifyFormProps["existingFiles"];
  externalUrl: string;
  fetchDatasets: PostSubmitProps["fetchDatasets"];
  history: ReturnType<typeof useHistory>;
  httpProjectUrl: string;
  initialized: boolean;
  location: { pathname: string };
  notifications: unknown;
  onCancel: () => void;
  overviewCommitsUrl: string;
  projectPathWithNamespace: string;
  setSubmitting: (value: boolean) => void;
  user: RenkuUser;
  versionUrl: string;
}
export default function DatasetModify(props: DatasetModifyProps) {
  const dispatch = useDispatch();
  const {
    client,
    dataset,
    defaultBranch,
    externalUrl,
    fetchDatasets,
    history,
    httpProjectUrl,
    location,
    overviewCommitsUrl,
    projectPathWithNamespace,
    setSubmitting,
    versionUrl,
  } = props;

  const edit = dataset != null;
  const name = dataset?.name;

  const formState = useDatasetFormSelector();

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

  const onSubmit: SubmitHandler<DatasetFormFields> = React.useCallback(
    async (data: DatasetFormFields) => {
      setSubmitting(true);
      dispatch(setFormValues(data));
      const submitData = { ...data };
      // Do not change the name of an existing dataset
      if (name) submitData.name = name;

      try {
        const { dataset, response } = await postDataset(submitData, {
          client,
          defaultBranch,
          edit,
          httpProjectUrl,
          versionUrl,
        });
        if (response.data.error != null) {
          const error = response.data.error;
          setSubmitting(false);
          if (!error.errorOnFileAdd) {
            setError({ source: "general", error });
            return;
          }
          if (!edit) {
            // Go to the new dataset page and show the error there
            await redirectAfterSubmit({
              datasetId: dataset?.name ?? "", // dataset is not null here
              fetchDatasets: fetchDatasets,
              history: history,
              projectPathWithNamespace: projectPathWithNamespace,
              state: { errorOnCreation: true },
              dispatch,
              versionUrl,
            });
            return;
          }
          setServerError({ source: "edit", error });
          return;
        }
        if (dataset == null) {
          setSubmitting(false);
          setServerError({
            source: "general",
            error: {
              reason: "Could not create dataset.",
            },
          });
          return;
        }

        const result = response.data.result;
        if (result.remote_branch !== defaultBranch) {
          setSubmitting(false);
          setWarning({
            source: "remoteBranch",
            error: { reason: response.data.result.remote_branch },
          });
          return;
        }

        const postCreationResponse = await pollForDatasetCreation(
          result,
          client,
          versionUrl
        );
        setSubmitting(false);
        if (postCreationResponse.problemJobs.length === 0) {
          await redirectAfterSubmit({
            datasetId: dataset.name ?? props.dataset?.name ?? "",
            fetchDatasets,
            history,
            projectPathWithNamespace,
            state: undefined,
            dispatch,
            versionUrl,
          });
          return;
        }
        setWarning({
          source: "jobs",
          context: { problemJobs: postCreationResponse.problemJobs },
        });
        setSubmitting(false);
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
      client,
      defaultBranch,
      dispatch,
      edit,
      fetchDatasets,
      history,
      httpProjectUrl,
      name,
      projectPathWithNamespace,
      props.dataset?.name,
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
