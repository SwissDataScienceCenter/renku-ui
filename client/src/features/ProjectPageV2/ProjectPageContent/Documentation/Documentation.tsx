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
 * limitations under the License.
 */

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";

import { FileEarmarkText, Markdown, Pencil, XLg } from "react-bootstrap-icons";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Form,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "reactstrap";
import { useForm } from "react-hook-form";

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import ScrollableModal from "../../../../components/modal/ScrollableModal";

import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

import useProjectPermissions from "../../utils/useProjectPermissions.hook";

import DocumentationInput from "./DocumentationInput";
import styles from "./Documentation.module.scss";

// Taken from src/features/projectsV2/api/projectV2.openapi.json
const DESCRIPTION_MAX_LENGTH = 5000;

interface DocumentationForm {
  documentation: string;
}

interface DocumentationProps {
  project: Project;
}

export default function Documentation({ project }: DocumentationProps) {
  const permissions = useProjectPermissions({ projectId: project.id });
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);

  return (
    <>
      <Card data-cy="project-documentation-card">
        <CardHeader>
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "justify-content-between"
            )}
          >
            <h4 className="m-0">
              <FileEarmarkText className={cx("me-1", "bi")} />
              Documentation
            </h4>
            <div className="my-auto">
              <PermissionsGuard
                disabled={null}
                enabled={
                  <Button
                    data-cy="project-documentation-edit"
                    color="outline-primary"
                    onClick={toggleOpen}
                    size="sm"
                  >
                    <Pencil className="bi" />
                    <span className="visually-hidden">Edit</span>
                  </Button>
                }
                requestedPermission="write"
                userPermissions={permissions}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div data-cy="project-documentation-text">
            {project.documentation ? (
              <LazyRenkuMarkdown markdownText={project.documentation} />
            ) : (
              <p className={cx("m-0", "text-muted", "fst-italic")}>
                Describe your project, so others can understand what it does and
                how to use it.
              </p>
            )}
          </div>
        </CardBody>
      </Card>
      <DocumentationModal
        isOpen={isModalOpen}
        project={project}
        toggle={toggleOpen}
      />
    </>
  );
}

interface DocumentationModalProps extends DocumentationProps {
  isOpen: boolean;
  toggle: () => void;
}

type DocumentationModalDisplayMode = "edit" | "preview";

function DocumentationModal({
  isOpen,
  project,
  toggle,
}: DocumentationModalProps) {
  const [updateProject, result] = usePatchProjectsByProjectIdMutation();
  const [displayMode, setDisplayMode] =
    useState<DocumentationModalDisplayMode>("edit");
  const { isLoading } = result;

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<DocumentationForm>({
    defaultValues: {
      documentation: project.documentation || "",
    },
  });

  const safeToggle = useCallback(() => {
    if (!isDirty) toggle();
  }, [isDirty, toggle]);

  const onClose = useCallback(() => {
    toggle();
  }, [toggle]);

  useEffect(() => {
    reset({
      documentation: project.documentation || "",
    });
  }, [project.documentation, reset]);

  const onSubmit = useCallback(
    (data: DocumentationForm) => {
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: { documentation: data.documentation },
      });
    },
    [project.etag, project.id, updateProject]
  );

  useEffect(() => {
    if (!isOpen) {
      reset({ documentation: project.documentation || "" });
      result.reset();
      setDisplayMode("edit");
    }
  }, [isOpen, project.documentation, reset, result]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  const documentationField = register("documentation", {
    maxLength: {
      message: `Documentation is limited to ${DESCRIPTION_MAX_LENGTH} characters.`,
      value: DESCRIPTION_MAX_LENGTH,
    },
  });
  return (
    <ScrollableModal
      backdrop="static"
      centered
      data-cy="project-documentation-modal"
      isOpen={isOpen}
      size="lg"
      toggle={safeToggle}
    >
      <ModalHeader toggle={toggle} data-cy="project-documentation-modal-header">
        <div>
          <FileEarmarkText className={cx("me-1", "bi")} />
          Documentation
        </div>
      </ModalHeader>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalBody
          data-cy="project-documentation-modal-body"
          className={styles.modalBody}
        >
          <div className={cx("d-flex", "gap-4")}>
            <ButtonGroup size="sm">
              <Button
                active={displayMode === "edit"}
                data-cy="documentation-display-mode-edit"
                onClick={() => setDisplayMode("edit")}
                color={displayMode === "edit" ? "primary" : "outline-primary"}
              >
                Edit
              </Button>
              <Button
                active={displayMode === "preview"}
                data-cy="documentation-display-mode-preview"
                onClick={() => setDisplayMode("preview")}
                color={
                  displayMode === "preview" ? "primary" : "outline-primary"
                }
              >
                Preview
              </Button>
            </ButtonGroup>
          </div>
          <div className={cx("mb-1", "position-relative")}>
            <div
              className={cx(
                "position-relative",
                "z-1",
                displayMode !== "edit" && "invisible"
              )}
            >
              <DocumentationInput<DocumentationForm>
                control={control}
                value={watch("documentation")}
                name="documentation"
                register={documentationField}
              />
            </div>
            <div
              className={cx(
                "pt-2",
                "mt-4",
                "mb-5",
                "position-absolute",
                "top-0",
                "start-0",
                "z-0",
                displayMode !== "preview" && "invisible"
              )}
            >
              <LazyRenkuMarkdown markdownText={watch("documentation")} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          className="border-top"
          data-cy="project-documentation-modal-footer"
        >
          <div
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-between",
              "w-100"
            )}
          >
            <div>
              {errors.documentation ? (
                <div className="text-danger">
                  {errors.documentation.message ? (
                    <>{errors.documentation.message}</>
                  ) : (
                    <>Documentation text is invalid</>
                  )}
                </div>
              ) : (
                <MarkdownHelp />
              )}
              {result.error && <RtkOrNotebooksError error={result.error} />}
            </div>
            <div className={cx("d-flex", "align-items-center", "gap-2")}>
              <DocumentationWordCount watch={watch} />
              <Button color="outline-primary" onClick={onClose}>
                <XLg className={cx("bi", "me-1")} />
                Close
              </Button>
              <Button
                color="primary"
                disabled={isLoading || !isDirty}
                type="submit"
              >
                {isLoading ? (
                  <Loader className="me-1" inline size={16} />
                ) : (
                  <Pencil className={cx("bi", "me-1")} />
                )}
                Save
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Form>
    </ScrollableModal>
  );
}

function DocumentationWordCount({
  watch,
}: {
  watch: ReturnType<typeof useForm<DocumentationForm>>["watch"];
}) {
  const documentation = watch("documentation");
  const charCount = documentation.length;
  const isCloseToLimit = charCount >= DESCRIPTION_MAX_LENGTH - 10;
  return (
    <div>
      <span
        className={cx(
          isCloseToLimit && "text-danger",
          isCloseToLimit && "fw-bold"
        )}
      >
        {charCount}
      </span>{" "}
      of {DESCRIPTION_MAX_LENGTH} characters
    </div>
  );
}

function MarkdownHelp() {
  return (
    <div>
      <Markdown className="bi me-1" /> Markdown supported
    </div>
  );
}
