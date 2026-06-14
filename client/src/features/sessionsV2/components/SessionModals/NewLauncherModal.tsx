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

import cx from "classnames";
import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import { RocketTakeoff } from "react-bootstrap-icons";
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

  const handleGoBack = () => {
    setSelectedCategory(null);
  };

  const handleCloseAll = useCallback(() => {
    setSelectedCategory(null);
    toggle();
  }, [toggle]);

  const handleSelectCategory = useCallback((category: LauncherCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, category: LauncherCategory) => {
      if (event.key === "Enter") {
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
            {LAUNCHER_OPTIONS.map((category) => {
              const definition = getLauncherCategoryDefinition(category);
              const OptionIcon = definition.icon;
              return (
                <Col key={category} xs={12} md={6}>
                  <Card
                    className={cx(
                      styles.LauncherOptionCard,
                      "h-100",
                      "border",
                      "border-primary",
                      "shadow-none",
                      "cursor-pointer",
                      "text-primary",
                    )}
                    data-cy={`launcher-option-${category}`}
                    onClick={() => handleSelectCategory(category)}
                    onKeyDown={(event) => handleKeyDown(event, category)}
                    role="button"
                    aria-label={`Create ${definition.text.inline} launcher`}
                    tabIndex={0}
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
