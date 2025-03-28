/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import cx from "classnames";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useCallback, useEffect, useState } from "react";
import {
  Database,
  Link45deg,
  NodePlus,
  PlusLg,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Badge,
  Button,
  ButtonGroup,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import ModalHeader from "../../../../components/modal/ModalHeader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";

import {
  dataConnectorsApi,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
} from "../../../dataConnectorsV2/api/data-connectors.enhanced-api";
import DataConnectorModal, {
  DataConnectorModalBodyAndFooter,
} from "../../../dataConnectorsV2/components/DataConnectorModal/index";
import styles from "../../../dataConnectorsV2/components/DataConnectorModal/DataConnectorModal.module.scss";
import dataConnectorFormSlice from "../../../dataConnectorsV2/state/dataConnectors.slice";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";

import type { Project } from "../../../projectsV2/api/projectV2.api";
import { projectV2Api } from "../../../projectsV2/api/projectV2.enhanced-api";
import { usePostDataConnectorsMutation } from "../../../dataConnectorsV2/api/data-connectors.api";

interface ProjectConnectDataConnectorsModalProps
  extends Omit<
    Parameters<typeof DataConnectorModal>[0],
    "dataConnector" | "projectId"
  > {
  project: Project;
}

type ProjectConnectDataConnectorMode = "create" | "link" | "doi";

export default function ProjectConnectDataConnectorsModal({
  isOpen,
  namespace,
  project,
  toggle: originalToggle,
}: ProjectConnectDataConnectorsModalProps) {
  const [mode, setMode] = useState<ProjectConnectDataConnectorMode>("link");
  const dispatch = useAppDispatch();
  const toggle = useCallback(() => {
    dispatch(dataConnectorFormSlice.actions.resetTransientState());
    originalToggle();
  }, [dispatch, originalToggle]);
  return (
    <Modal
      backdrop="static"
      centered
      className={styles.modal}
      data-cy="project-data-connector-connect-modal"
      fullscreen="lg"
      id={"connect-project-data-connector"}
      isOpen={isOpen}
      scrollable
      size="lg"
      unmountOnClose={false}
      toggle={toggle}
    >
      <ModalHeader
        modalTitle={<ProjectConnectDataConnectorModalTitle />}
        toggle={toggle}
        data-cy="project-data-connector-connect-header"
      >
        <ProjectConnectDataConnectorModeSwitch mode={mode} setMode={setMode} />
      </ModalHeader>
      {mode === "create" ? (
        <ProjectCreateDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      ) : mode === "link" ? (
        <ProjectLinkDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      ) : (
        <ProjectDoiDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      )}
    </Modal>
  );
}

function ProjectConnectDataConnectorModalTitle() {
  const { flatDataConnector, cloudStorageState } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  const doiPage = useAppSelector(({ display }) => display.doiPage);

  const title =
    cloudStorageState?.step > 1
      ? `${flatDataConnector?.schema ?? ""} ${
          flatDataConnector?.provider ?? ""
        }`
      : "";
  return (
    <>
      <Database className={cx("bi", "me-1")} />
      Link or create data connector {title.trim()}
      <Badge color="info">{doiPage}</Badge>
    </>
  );
}

function ProjectConnectDataConnectorModeSwitch({
  mode,
  setMode,
}: {
  mode: ProjectConnectDataConnectorMode;
  setMode: (mode: ProjectConnectDataConnectorMode) => void;
}) {
  const doiPage = useAppSelector(({ display }) => display.doiPage);
  return (
    <ButtonGroup>
      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-link"
        value="link"
        checked={mode === "link"}
        onChange={() => {
          setMode("link");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-link"
        for="project-data-controller-mode-link"
        className={cx("btn", "btn-outline-primary", "mb-0")}
      >
        <NodePlus className={cx("bi", "me-1")} />
        Link a data connector
      </Label>
      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-create"
        value="create"
        checked={mode === "create"}
        onChange={() => {
          setMode("create");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-create"
        for="project-data-controller-mode-create"
        className={cx("btn", "btn-outline-primary", "mb-0")}
      >
        <PlusLg className={cx("bi", "me-1")} />
        Create a data connector
      </Label>

      {doiPage === "separate" && (
        <>
          <Input
            type="radio"
            className="btn-check"
            id="project-data-controller-mode-doi"
            value="create"
            checked={mode === "doi"}
            onChange={() => {
              setMode("doi");
            }}
          />
          <Label
            data-cy="project-data-controller-mode-doi"
            for="project-data-controller-mode-doi"
            className={cx("btn", "btn-outline-primary", "mb-0")}
          >
            <Link45deg className={cx("bi", "me-1")} />
            Link a DOI
          </Label>
        </>
      )}
    </ButtonGroup>
  );
}

function ProjectCreateDataConnectorBodyAndFooter({
  isOpen,
  namespace,
  project,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  return (
    <DataConnectorModalBodyAndFooter
      dataConnector={null}
      {...{
        isOpen,
        namespace,
        project,
        toggle,
      }}
    />
  );
}

interface DataConnectorLinkFormFields {
  dataConnectorIdentifier: string;
}

function ProjectLinkDataConnectorBodyAndFooter({
  project,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  const dispatch = useAppDispatch();
  const [lookupDataConnectorError, setLookupDataConnectorError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);
  const [
    linkDataConnector,
    { error: linkDataConnectorError, isLoading, isSuccess },
  ] = usePostDataConnectorsByDataConnectorIdProjectLinksMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<DataConnectorLinkFormFields>({
    defaultValues: {
      dataConnectorIdentifier: "",
    },
  });

  const doiPage = useAppSelector(({ display }) => display.doiPage);
  const allowPaste = doiPage === "link";

  const [createDataConnector, createResult] = usePostDataConnectorsMutation();
  const [createProjectLink, createProjectLinkResult] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const randomString = () => {
    return Math.random().toString(20).substring(2, 8).toLowerCase();
  };
  useEffect(() => {
    if (createResult.isSuccess) {
      createProjectLink({
        dataConnectorId: createResult.data.id,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    }
  }, [
    createResult.isSuccess,
    createProjectLink,
    project.id,
    createResult.data,
  ]);

  useEffect(() => {
    if (createProjectLinkResult.isSuccess) {
      toggle();
    }
  }, [createProjectLinkResult.isSuccess, toggle]);

  const onSubmit = useCallback(
    async (values: DataConnectorLinkFormFields) => {
      if (values.dataConnectorIdentifier.includes("zenodo.")) {
        const localSlug = randomString();
        createDataConnector({
          dataConnectorPost: {
            name: "DOI test",
            namespace: `${project.namespace}/${project.slug}`,
            slug: localSlug,
            visibility: "public",
            storage: {
              configuration: {
                type: "doi",
                doi: "10.5281/zenodo.15081377",
              },
              readonly: true,
              source_path: "/",
              target_path: localSlug,
            },
          },
        });
        return;
      }

      const [namespace, slug] = values.dataConnectorIdentifier.split("/");
      const dataConnectorPromise = dispatch(
        dataConnectorsApi.endpoints.getNamespacesByNamespaceDataConnectorsAndSlug.initiate(
          { namespace, slug }
        )
      );
      const {
        data: dataConnector,
        isSuccess,
        error,
      } = await dataConnectorPromise;
      dataConnectorPromise.unsubscribe();
      if (!isSuccess || dataConnector == null) {
        setLookupDataConnectorError(error);
        return false;
      }
      linkDataConnector({
        dataConnectorId: dataConnector.id,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    },
    [
      dispatch,
      linkDataConnector,
      project.id,
      project.namespace,
      project.slug,
      createDataConnector,
    ]
  );

  useEffect(() => {
    if (isSuccess) {
      dispatch(projectV2Api.util.invalidateTags(["DataConnectors"]));
      reset();
      toggle();
    }
  }, [dispatch, isSuccess, reset, toggle]);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ModalBody data-cy="data-connector-edit-body">
        <div className="mb-3">
          <Label className="form-label" for="data-connector-identifier">
            Data connector identifier{allowPaste && " or DOI"}
          </Label>
          <Controller
            control={control}
            name="dataConnectorIdentifier"
            render={({ field }) => (
              <Input
                className={cx(
                  "form-control",
                  errors.dataConnectorIdentifier && "is-invalid"
                )}
                id="data-connector-identifier"
                placeholder={"namespace/slug" + (allowPaste ? " or DOI" : "")}
                type="text"
                {...field}
              />
            )}
            rules={{
              required: true,
              // pattern: /^(.+)\/(.+)$/,
            }}
          />
          <div className="form-text">
            Copy a data connector identifier from the data connector&apos;s side
            panel
            {allowPaste && (
              <span>
                , or paste a DOI (E.G: <code>10.5281/zenodo.15081377</code>)
              </span>
            )}
          </div>
          <div className="invalid-feedback">
            {errors.dataConnectorIdentifier == null
              ? undefined
              : errors.dataConnectorIdentifier.message != null &&
                errors.dataConnectorIdentifier.message.length > 0
              ? errors.dataConnectorIdentifier.message
              : "Please provide an identifier for the data connector"}
          </div>
        </div>
        {isSuccess != null && !isSuccess && (
          <RtkOrNotebooksError error={linkDataConnectorError} />
        )}
        {lookupDataConnectorError != null && (
          <RtkOrNotebooksError error={lookupDataConnectorError} />
        )}
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="link-data-connector-button"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <NodePlus className={cx("bi", "me-1")} />
          )}
          Link data connector
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface DataConnectorDoiFormFields {
  doi: string;
}

function ProjectDoiDataConnectorBodyAndFooter({
  project,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<DataConnectorDoiFormFields>({
    defaultValues: {
      doi: "",
    },
  });

  const [createDataConnector, createResult] = usePostDataConnectorsMutation();
  const [createProjectLink, createProjectLinkResult] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const randomString = () => {
    return Math.random().toString(20).substring(2, 8).toLowerCase();
  };
  const slug = randomString();

  const onSubmit = () => {
    createDataConnector({
      dataConnectorPost: {
        name: "DOI test",
        namespace: `${project.namespace}/${project.slug}`,
        slug,
        visibility: "public",
        storage: {
          configuration: {
            type: "doi",
            doi: "10.5281/zenodo.15081377",
          },
          readonly: true,
          source_path: "/",
          target_path: slug,
        },
      },
    });
  };

  useEffect(() => {
    if (createResult.isSuccess) {
      createProjectLink({
        dataConnectorId: createResult.data.id,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    }
  }, [
    createResult.isSuccess,
    createProjectLink,
    project.id,
    createResult.data,
  ]);

  useEffect(() => {
    if (createProjectLinkResult.isSuccess) {
      toggle();
    }
  }, [createProjectLinkResult.isSuccess, toggle]);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ModalBody data-cy="data-connector-edit-body">
        <div className="mb-3">
          <Label className="form-label" for="data-connector-identifier">
            DOI identifier or URL
          </Label>
          <Controller
            control={control}
            name="doi"
            render={({ field }) => (
              <Input
                className={cx("form-control", errors.doi && "is-invalid")}
                id="doi"
                placeholder="DOI"
                type="text"
                {...field}
              />
            )}
            rules={{
              required: true,
              // pattern: /^(.+)\/(.+)$/,
            }}
          />
          <div className="form-text">
            Copy a DOI identifier (E.G. <code>10.5281/zenodo.15081377</code>) or
            the full URL.
          </div>
          <div className="invalid-feedback">
            {errors.doi == null
              ? undefined
              : errors.doi.message != null && errors.doi.message.length > 0
              ? errors.doi.message
              : "Please provide a DOI"}
          </div>
        </div>
        {/* {isSuccess != null && !isSuccess && (
          <RtkOrNotebooksError error={linkDataConnectorError} />
        )}
        {lookupDataConnectorError != null && (
          <RtkOrNotebooksError error={lookupDataConnectorError} />
        )} */}
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="link-data-connector-button"
          disabled={createResult.isLoading || createProjectLinkResult.isLoading}
          type="submit"
        >
          {createResult.isLoading || createProjectLinkResult.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Link45deg className={cx("bi", "me-1")} />
          )}
          Link DOI
        </Button>
      </ModalFooter>
    </Form>
  );
}
