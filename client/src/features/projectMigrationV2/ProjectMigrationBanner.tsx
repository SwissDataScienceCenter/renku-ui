/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useCallback, useMemo, useState } from "react";
import { BoxArrowInUp, XLg } from "react-bootstrap-icons";
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { SuccessAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import {
  useGetUserPreferencesQuery,
  usePostUserPreferencesDismissProjectMigrationBannerMutation,
  UserPreferences,
} from "../usersV2/api/users.api";
import style from "./ProjectMigrationBanner.module.scss";
import MigrationV2Modal from "./MigrationV2Modal";

export default function ProjectMigrationBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenDismissMigration, setIsOpenDismissMigration] = useState(false);

  const [dismissProjectMigrationBanner, result] =
    usePostUserPreferencesDismissProjectMigrationBannerMutation();

  const { data: dataUserPreferences, isLoading: isLoadingUserPreferences } =
    useGetUserPreferencesQuery();

  const showProjectMigrationBanner = useMemo(() => {
    if (isLoadingUserPreferences) return true;
    return dataUserPreferences
      ? dataUserPreferences.show_project_migration_banner
      : true;
  }, [isLoadingUserPreferences, dataUserPreferences]);

  const toggle = useCallback(() => {
    setIsOpenModal((open) => !open);
  }, []);

  const onToggleDismissAlert = useCallback(() => {
    setIsOpenDismissMigration((open) => !open);
  }, []);

  const onDismissBanner = useCallback(() => {
    dismissProjectMigrationBanner();
  }, [dismissProjectMigrationBanner]);

  return (
    showProjectMigrationBanner && (
      <Alert
        className={cx(
          style.ProjectMigrationBanner,
          "rounded-3",
          "pt-3",
          "border-0",
          "card"
        )}
        toggle={onToggleDismissAlert}
      >
        <div
          className={cx(
            "d-flex",
            "flex-row",
            "justify-content-between",
            "align-items-center",
            "p-0"
          )}
        >
          <p className={cx("text-primary", "mb-0")}>
            Looking for your Renku Legacy projects?
          </p>
          <Button size="sm" color="outline-primary" onClick={toggle}>
            <BoxArrowInUp size={20} className={cx("me-1")} /> Migrate from Renku
            Legacy
          </Button>
        </div>
        <MigrationV2Modal isOpen={isOpenModal} toggle={toggle} />
        <DismissMigrationConfirmationModal
          onDismissBanner={onDismissBanner}
          toggle={onToggleDismissAlert}
          isOpen={isOpenDismissMigration}
          result={result?.data}
        />
      </Alert>
    )
  );
}

function DismissMigrationConfirmationModal({
  isOpen,
  toggle,
  onDismissBanner,
  result,
}: {
  isOpen: boolean;
  toggle: () => void;
  onDismissBanner: () => void;
  result?: UserPreferences;
}) {
  const isLoadingDismissMigration = false;
  return (
    <Modal isOpen={isOpen} centered size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle} className="text-danger">
        Are you sure?
      </ModalHeader>
      <ModalBody className="p-4">
        {!result && (
          <p>
            Are you sure you want to hide this banner?{" "}
            <span className="fw-bold">
              It won&apos;t display on the dashboard anymore
            </span>
            , but you will still be able to migrate your project from the Renku
            legacy project page.
          </p>
        )}
        {result && !result?.show_project_migration_banner && (
          <SuccessAlert>Banner dismissed successfully</SuccessAlert>
        )}
      </ModalBody>
      <ModalFooter>
        {!result && (
          <>
            <Button color="outline-danger" onClick={toggle}>
              <XLg className={cx("bi", "me-1")} /> Cancel
            </Button>
            <Button color="danger" onClick={onDismissBanner}>
              {isLoadingDismissMigration ? (
                <Loader className="me-1" inline size={16} />
              ) : (
                "Yes, dismiss banner"
              )}
            </Button>
          </>
        )}
        {!result?.show_project_migration_banner && (
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} /> Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
