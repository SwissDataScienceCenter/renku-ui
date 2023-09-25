/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  Entity Buttons.tsx
 *  Entity Button component
 */

import { faCog, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Funnel, FunnelFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { Button, UncontrolledTooltip } from "reactstrap";
import SimpleSessionButton from "../../features/session/components/SimpleSessionButton";
import { stylesByItemType } from "../../utils/helpers/HelperFunctions";
import { EntityType } from "./Entities";

export interface EntityButtonProps {
  type: EntityType;
  slug: string;
}
function EntityButton({ type, slug }: EntityButtonProps) {
  switch (type) {
    case "project":
      return (
        <div className="card-button">
          <SimpleSessionButton fullPath={slug} />
        </div>
      );
    case "dataset":
      return null; // not defined yet
    default:
      return null;
  }
}

export interface EntityDeleteButtonProps {
  itemType: "project" | "dataset";
  action: () => void;
}
function EntityDeleteButtonButton({
  itemType,
  action,
}: EntityDeleteButtonProps) {
  const styles = stylesByItemType(itemType);
  return (
    <>
      <Button
        id="deleteButton"
        data-cy="delete-dataset-button"
        onClick={action}
        className="icon-button btn-rk-white"
        size="sm"
      >
        <FontAwesomeIcon icon={faTrash} className={styles.colorText} />
      </Button>
      <UncontrolledTooltip
        key="tooltip-delete-entity"
        placement="top"
        target="deleteButton"
      >
        Delete {itemType}
      </UncontrolledTooltip>
    </>
  );
}

export interface EntityModifyButtonProps {
  url: string;
  itemType: "project" | "dataset";
}
function EntityModifyButton({ url, itemType }: EntityModifyButtonProps) {
  const styles = stylesByItemType(itemType);

  switch (itemType) {
    case "project":
      return (
        <>
          <Link
            id="modifyButton"
            key="modify-button"
            to={`${url}/settings`}
            className="link-rk-dark text-decoration-none"
          >
            <FontAwesomeIcon icon={faCog} className={styles.colorText} />
          </Link>
          <UncontrolledTooltip
            key="tooltip-modify-entity"
            placement="top"
            target="modifyButton"
          >
            Settings
          </UncontrolledTooltip>
        </>
      );
    case "dataset":
      return (
        <>
          <Link
            id="modifyButton"
            key="modify-button"
            to={`${url}/settings`}
            className="link-rk-dark text-decoration-none"
          >
            <FontAwesomeIcon icon={faPen} className={styles.colorText} />
          </Link>
          <UncontrolledTooltip
            key="tooltip-modify-entity"
            placement="top"
            target="modifyButton"
          >
            Modify Dataset
          </UncontrolledTooltip>
        </>
      );
    default:
      return null;
  }
}

interface FilterButtonProps {
  isOpen: boolean;
  toggle: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
function FilterButton({ isOpen, toggle }: FilterButtonProps) {
  if (isOpen) {
    return (
      <div
        onClick={toggle}
        data-cy="filter-button-hide"
        className="button-filter-box text-rk-green d-flex align-items-center gap-2 cursor-pointer"
      >
        <FunnelFill /> Hide Filters
      </div>
    );
  }

  return (
    <div
      onClick={toggle}
      data-cy="filter-button-show"
      className="button-filter-box d-flex align-items-center gap-2 cursor-pointer"
    >
      <Funnel /> Show Filters
    </div>
  );
}

export {
  EntityButton,
  EntityDeleteButtonButton,
  EntityModifyButton,
  FilterButton,
};
