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
 *  DatasetImportForm.present.js
 *  Presentational components.
 */

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Alert, Button, Col, UncontrolledAlert } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import AddDatasetButtons from "../../../components/addDatasetButtons/AddDatasetButtons";
import TextInput from "../../../components/form-field/TextInput";
import FormSchema from "../../../components/formschema/FormSchema";
import ProgressIndicator, {
  ProgressStyle,
  ProgressType,
} from "../../../components/progress/Progress";
import { useCoreSupport } from "../../../features/project/useProjectCoreSupport";
import { ImportStateMessage } from "../../../utils/constants/Dataset";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";

type DatasetImportClient = {
  datasetImport: (
    httpProjectUrl: string,
    uri: string,
    versionUrl: string
  ) => Promise<DatasetImportResult>;
  getJobStatus: (job_id: string, versionUrl: string) => Promise<JobStatus>;
};

type DatasetInputFormFields = {
  uri: string;
};

type DatasetImportFormProps = {
  accessLevel: number;
  formLocation: string;
  onCancel: () => void;
  serverErrors: string | undefined;
  submitCallback: SubmitHandler<DatasetInputFormFields>;
  submitLoader: { value: boolean; text: string };
  toggleNewDataset: () => void;
};

type DatasetInputSubmitGroupProps = Pick<
  DatasetImportFormProps,
  "submitLoader" | "onCancel"
>;

type DatasetImportResult =
  | {
      data: {
        error: undefined;
        result: {
          job_id: string;
        };
      };
    }
  | {
      data: { error: { userMessage?: string; reason: string } };
    };

type JobStatus =
  | {
      state: "ENQUEUED" | "IN_PROGRESS" | "COMPLETED";
    }
  | {
      state: "FAILED";
      extras: {
        error: string;
      };
    };

function DatasetInputSubmitGroup({
  onCancel,
  submitLoader,
}: DatasetInputSubmitGroupProps) {
  const buttonColor = "rk-pink";

  return (
    <div>
      <Button
        data-cy="submit-button"
        type="submit"
        disabled={submitLoader.value}
        className="float-end mt-1"
        color={buttonColor}
      >
        Import Dataset
      </Button>
      <Button
        disabled={submitLoader.value}
        className={`float-end mt-1 me-1 btn-outline-${buttonColor}`}
        onClick={() => onCancel()}
      >
        Cancel
      </Button>
    </div>
  );
}

function DatasetImportForm(
  props: DatasetImportFormProps & { formValues: DatasetInputFormFields }
) {
  const desc = (
    <span>
      Import a published dataset from Zenodo, Dataverse, or from another Renku
      project. Use&nbsp;
      <Button
        className="p-0"
        style={{ verticalAlign: "baseline" }}
        color="link"
        onClick={props.toggleNewDataset}
      >
        <small>Create Dataset</small>
      </Button>
      &nbsp;to make a new dataset.
    </span>
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<DatasetInputFormFields>({
    defaultValues: {
      uri: props.formValues.uri,
    },
  });

  return (
    <FormSchema showHeader={true} title="Import Dataset" description={desc}>
      <div className="form-rk-pink d-flex flex-column">
        <AddDatasetButtons
          optionSelected="importDataset"
          toggleNewDataset={props.toggleNewDataset}
        />
      </div>
      <form
        className="form-rk-pink"
        onSubmit={handleSubmit(props.submitCallback)}
      >
        <TextInput
          error={errors.uri}
          dataCy="input-uri"
          help={
            <span>
              Renku dataset URL; Dataverse or Zenodo dataset URL or DOI
            </span>
          }
          label="Dataset URI"
          name="uri"
          required={true}
          register={register("uri", { required: "A dataset URI is required" })}
        />
        <DatasetInputSubmitGroup
          onCancel={props.onCancel}
          submitLoader={props.submitLoader}
        />
      </form>
      {props.serverErrors ? (
        <UncontrolledAlert color="danger">
          <div>
            <p>Errors occurred while performing this operation.</p>
            <p>{props.serverErrors}</p>
          </div>
        </UncontrolledAlert>
      ) : null}
    </FormSchema>
  );
}

type ImportDatasetArgs = {
  client: DatasetImportClient;
  externalUrl: string;
  formValues: DatasetInputFormFields;
  handlers: {
    setSubmitLoader: React.Dispatch<
      React.SetStateAction<{
        value: boolean;
        text: string;
      }>
    >;
    setServerErrors: React.Dispatch<React.SetStateAction<string | undefined>>;
  };
  redirectUser: () => void;
  versionUrl: string;
};
async function importDatasetAndWaitForResult({
  client,
  externalUrl,
  formValues,
  handlers,
  redirectUser,
  versionUrl,
}: ImportDatasetArgs) {
  const response = await client.datasetImport(
    externalUrl,
    formValues.uri,
    versionUrl
  );
  if (response.data.error !== undefined) {
    const error = response.data.error;
    handlers.setSubmitLoader({ value: false, text: "" });
    handlers.setServerErrors(
      error.userMessage ? error.userMessage : error.reason
    );
    return;
  }

  const job_id = response.data.result.job_id;

  // Monitor job status
  await new Promise<void>((resolve) => {
    let pollCount = 0;
    const monitorJob = setInterval(() => {
      client
        .getJobStatus(job_id, versionUrl)
        .then((job) => {
          if (job == null) return;
          switch (job.state) {
            case "ENQUEUED":
              handlers.setSubmitLoader({
                value: true,
                text: ImportStateMessage.ENQUEUED,
              });
              break;
            case "IN_PROGRESS":
              handlers.setSubmitLoader({
                value: true,
                text: ImportStateMessage.IN_PROGRESS,
              });
              break;
            case "COMPLETED":
              handlers.setSubmitLoader({ value: false, text: "" });
              clearInterval(monitorJob);
              redirectUser();
              resolve();
              break;
            case "FAILED":
              handlers.setSubmitLoader({ value: false, text: "" });
              handlers.setServerErrors(
                ImportStateMessage.FAILED + job.extras.error
              );
              clearInterval(monitorJob);
              resolve();
              break;
            default:
              handlers.setSubmitLoader({
                value: false,
                text: ImportStateMessage.FAILED_NO_INFO,
              });
              handlers.setServerErrors(ImportStateMessage.FAILED_NO_INFO);
              clearInterval(monitorJob);
              resolve();
              break;
          }
        })
        .finally(() => {
          pollCount++;
          if (pollCount >= 50) {
            handlers.setSubmitLoader({ value: false, text: "" });
            handlers.setServerErrors(ImportStateMessage.TOO_LONG);
            clearInterval(monitorJob);
            resolve();
            return;
          }
        });
    }, 5_000);
  });
}

function DatasetImportContainer(
  props: DatasetImportProps & { versionUrl: string }
) {
  const {
    externalUrl,
    fetchDatasets,
    history,
    projectPathWithNamespace,
    versionUrl,
  } = props;
  const formLocation = props.location.pathname + "/import";
  const [submitLoader, setSubmitLoader] = useState<
    DatasetImportFormProps["submitLoader"]
  >({ value: false, text: "Please wait..." });
  const [uri, setUri] = useState("");
  const [serverErrors, setServerErrors] = useState<string | undefined>();

  const onCancel = React.useCallback(() => {
    history.push({
      pathname: `/projects/${projectPathWithNamespace}/datasets`,
    });
  }, [history, projectPathWithNamespace]);

  const redirectUser = React.useCallback(() => {
    fetchDatasets(true, versionUrl);
    history.push({
      //we should do the redirect to the new dataset
      //but for this we need the dataset name in the response of the dataset.import operation :(
      pathname: `/projects/${projectPathWithNamespace}/datasets`,
    });
  }, [history, projectPathWithNamespace, fetchDatasets, versionUrl]);

  const client = props.client;
  const submitCallback = React.useCallback(
    async (formValues: DatasetInputFormFields) => {
      // remember the URI
      setUri(formValues.uri);
      // clear the information from previous submissions
      setServerErrors(undefined);
      setSubmitLoader({
        value: true,
        text: ImportStateMessage.ENQUEUED,
      });
      const handlers = {
        setServerErrors,
        setSubmitLoader,
      };
      try {
        await importDatasetAndWaitForResult({
          client,
          externalUrl,
          formValues,
          handlers,
          redirectUser,
          versionUrl,
        });
      } catch (e) {
        setServerErrors(ImportStateMessage.FAILED_NO_INFO);
        setSubmitLoader({ value: false, text: "" });
      }
    },
    [
      externalUrl,
      client,
      redirectUser,
      setServerErrors,
      setSubmitLoader,
      versionUrl,
    ]
  );

  if (submitLoader.value) {
    return (
      <ProgressIndicator
        type={ProgressType.Indeterminate}
        style={ProgressStyle.Dark}
        title="Creating Dataset..."
        description="We've received your dataset information. This may take a while."
        currentStatus=""
        feedback="You'll be redirected to the new dataset page when the creation is completed"
      />
    );
  }

  return (
    <DatasetImportForm
      accessLevel={props.accessLevel}
      formLocation={formLocation}
      formValues={{ uri }}
      onCancel={onCancel}
      serverErrors={serverErrors}
      submitCallback={submitCallback}
      submitLoader={submitLoader}
      toggleNewDataset={props.toggleNewDataset}
    />
  );
}

type DatasetImportProps = {
  accessLevel: number;
  client: DatasetImportClient;
  externalUrl: string;
  fetchDatasets: (force: boolean, versionUrl: string) => void;
  history: ReturnType<typeof useHistory>;
  projectPathWithNamespace: string;
  location: { pathname: string };
  toggleNewDataset: DatasetImportFormProps["toggleNewDataset"];
};
function DatasetImport(props: DatasetImportProps) {
  const { defaultBranch, externalUrl } = useLegacySelector(
    (state) => state.stateModel.project.metadata
  );
  const {
    coreSupport: { versionUrl },
  } = useCoreSupport({
    gitUrl: externalUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });

  if (props.accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return (
      <Col sm={12} md={10} lg={8}>
        <Alert timeout={0} color="primary">
          You do not have access level necessary to import datasets into this
          project.
          <br />
          <br />
          <FontAwesomeIcon icon={faInfoCircle} /> If you were recently given
          access to this project, you might need to{" "}
          <Button
            size="sm"
            color="primary"
            onClick={() => window.location.reload()}
          >
            refresh the page
          </Button>{" "}
          first.
        </Alert>
      </Col>
    );
  }

  if (versionUrl == null) {
    // I do not think this branch will ever be hit, but just in case...
    return (
      <Col sm={12} md={10} lg={8}>
        <Alert timeout={0} color="primary">
          This project needs to be upgraded before datasets can be created in
          the UI.
        </Alert>
      </Col>
    );
  }

  return <DatasetImportContainer {...props} versionUrl={versionUrl} />;
}

export default DatasetImport;
export type { DatasetImportClient, DatasetImportProps };
