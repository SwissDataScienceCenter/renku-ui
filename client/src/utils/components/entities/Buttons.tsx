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

import React, { useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { CardButton } from "../buttons/Button";
import { faPen, faPlay, faCog, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ThrottledTooltip } from "../Tooltip";
import { EntityType } from "./Entities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, UncontrolledTooltip } from "../../ts-wrappers";
import { stylesByItemType } from "../../helpers/HelperFunctions";

/**
 *  renku-ui
 *
 *  Entity Buttons.tsx
 *  Entity Button component
 */

export interface EntityButtonProps {
  type: EntityType;
  slug: string;
}

function EntityButton({ type, slug }: EntityButtonProps) {
  const history = useHistory();
  const carButtonRef = useRef(null);
  let handleClick;

  switch (type) {
    case "project":
      handleClick = (e: any) => {
        e.preventDefault();
        history.push(`/projects/${slug}/sessions/new?autostart=1`);
      };
      return (
        <>
          <div ref={carButtonRef} className="card-button">
            <CardButton color="rk-green" icon={faPlay} handleClick={handleClick} />
          </div>
          <ThrottledTooltip
            target={carButtonRef}
            tooltip="Start a session of this project" />
        </>
      );
    case "dataset":
      return null; // no defined yet
    default:
      return null;
  }
}

export interface EntityDeleteButtonProps {
  itemType: "project" | "dataset";
  action: Function
}

function EntityDeleteButtonButton({ itemType, action }: EntityDeleteButtonProps) {
  const styles = stylesByItemType(itemType);
  return <>
    <Button id="deleteButton"
      onClick={action} className="icon-button btn-rk-white text-rk-pink">
      <FontAwesomeIcon icon={faTrash} className={styles.colorText} />
    </Button>
    <UncontrolledTooltip key="tooltip-delete-entity" placement="top" target="deleteButton">
      Delete {itemType}
    </UncontrolledTooltip>
  </>;
}

export interface EntityModifyButtonProps {
  url: string;
  itemType: "project" | "dataset";
}
function EntityModifyButton({ url, itemType }: EntityModifyButtonProps) {
  const styles = stylesByItemType(itemType);

  switch (itemType) {
    case "project":
      return (<>
        <Link id="modifyButton" key="modify-button" to={`${url}/settings`}
          className="link-rk-dark text-decoration-none">
          <FontAwesomeIcon icon={faCog} className={styles.colorText} />
        </Link>
        <UncontrolledTooltip key="tooltip-modify-entity" placement="top" target="modifyButton">
          Settings
        </UncontrolledTooltip>
      </>);
    case "dataset":
      return (<>
        <Link id="modifyButton" key="modify-button" to={`${url}/settings`}
          className="link-rk-dark text-decoration-none">
          <FontAwesomeIcon icon={faPen} className={styles.colorText} />
        </Link>
        <UncontrolledTooltip key="tooltip-modify-entity" placement="top" target="modifyButton">
          Modify Dataset
        </UncontrolledTooltip>
      </>);
    default:
      return null;
  }
}

export { EntityButton, EntityModifyButton, EntityDeleteButtonButton };
