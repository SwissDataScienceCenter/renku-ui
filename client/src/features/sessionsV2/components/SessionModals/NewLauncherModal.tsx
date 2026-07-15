/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useState } from "react";
import type { KeyboardEvent } from "react";
import { RocketTakeoff } from "react-bootstrap-icons";
import { useParams } from "react-router";
import {
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";

import { LauncherCategoryIcon } from "~/features/sessionsV2/components/SessionForm/LauncherCategoryIcon";
import { getLauncherCategoryDefinition } from "~/features/sessionsV2/session.utils";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import { LAUNCHER_OPTIONS } from "../../session.constants";
import type { LauncherCategory } from "../../sessionsV2.types";
import NewLauncherCreateModal from "./NewLauncherCreateModal";

import styles from "./NewLauncherModal.module.scss";

interface NewLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function NewLauncherModal({
  isOpen,
  toggle,
}: NewLauncherModalProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<LauncherCategory | null>(null);

  // Apps are gated by a deployment-level config value (APPS_ENABLED), delivered
  // via /config.json → AppParams, and driven by the `apps.enabled` value of the
  // renku Helm chart (the same value that sets APPS_ENABLED on the backend
  // data-service). This keeps the UI and backend gate in sync per-deployment,
  // rather than relying on a per-browser localStorage flag.
  const { params } = useContext(AppContext);
  const appsEnabled = params?.APPS_ENABLED ?? DEFAULT_APP_PARAMS.APPS_ENABLED;

  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: project } = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken,
  );
  // Apps can only be created in public projects (enforced by the backend).
  const isProjectPublic = project?.visibility === "public";

  // The apps feature is gated behind a feature flag until it is released.
  const launcherOptions = appsEnabled
    ? LAUNCHER_OPTIONS
    : LAUNCHER_OPTIONS.filter((category) => category !== "app");

  // Lay every option out on a single row: split the 12-column grid evenly, so
  // three options are 4 wide (3-up) and two options stay 6 wide (2-up).
  const optionColMd = Math.max(1, Math.floor(12 / launcherOptions.length));

  const isCategoryDisabled = useCallback(
    (category: LauncherCategory) => category === "app" && !isProjectPublic,
    [isProjectPublic],
  );

  const handleGoBack = () => {
    setSelectedCategory(null);
  };

  const handleCloseAll = useCallback(() => {
    setSelectedCategory(null);
    toggle();
  }, [toggle]);

  const handleSelectCategory = useCallback(
    (category: LauncherCategory) => {
      if (isCategoryDisabled(category)) {
        return;
      }
      setSelectedCategory(category);
    },
    [isCategoryDisabled],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, category: LauncherCategory) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelectCategory(category);
      }
    },
    [handleSelectCategory],
  );

  const showChooser = isOpen && selectedCategory == null;

  return (
    <>
      <Modal
        backdrop="static"
        centered
        data-cy="launcher-type-selector-modal"
        isOpen={showChooser}
        size="lg"
        toggle={handleCloseAll}
      >
        <ModalHeader tag="h2" toggle={handleCloseAll}>
          <RocketTakeoff className="me-1" />
          Select the type of launcher to create
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            {launcherOptions.map((category) => {
              const definition = getLauncherCategoryDefinition(category);
              const OptionIcon = definition.icon;
              const disabled = isCategoryDisabled(category);
              return (
                <Col key={category} xs={12} md={optionColMd}>
                  <Card
                    className={cx(
                      styles.LauncherOptionCard,
                      "h-100",
                      "border",
                      "shadow-none",
                      disabled
                        ? ["border-dark-subtle", "text-body-secondary"]
                        : ["border-primary", "cursor-pointer", "text-primary"],
                    )}
                    data-cy={`launcher-option-${category}`}
                    onClick={() => handleSelectCategory(category)}
                    onKeyDown={(event) => handleKeyDown(event, category)}
                    role="button"
                    aria-disabled={disabled || undefined}
                    aria-label={`Create ${definition.text.inline} launcher`}
                    tabIndex={disabled ? -1 : 0}
                  >
                    <CardBody className={cx("d-flex", "flex-column", "gap-2")}>
                      <div
                        className={cx(
                          "d-flex",
                          "flex-column",
                          "align-items-center",
                          "gap-2",
                        )}
                      >
                        <div className={cx("d-flex", "align-items-center")}>
                          <div className="fs-3">
                            <OptionIcon size={32} className="me-2" />
                          </div>
                          <div>
                            <span className={cx("fw-bold")}>
                              {definition.text.display}
                            </span>{" "}
                            Launcher
                          </div>
                        </div>
                        <LauncherCategoryIcon type={category} />
                        <p className={cx("mb-0", "text-center")}>
                          {definition.description}
                        </p>
                        {disabled && (
                          <p
                            className={cx(
                              "mb-0",
                              "text-center",
                              "fst-italic",
                              "small",
                            )}
                            data-cy="launcher-option-app-disabled"
                          >
                            Apps can only be created in public projects. Make
                            this project public to publish an app.
                          </p>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </ModalBody>
      </Modal>
      {selectedCategory != null && (
        <NewLauncherCreateModal
          isOpen={isOpen}
          launcherCategory={selectedCategory}
          toggle={handleCloseAll}
          goBack={handleGoBack}
        />
      )}
    </>
  );
}
