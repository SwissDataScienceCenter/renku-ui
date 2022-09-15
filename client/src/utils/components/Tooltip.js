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
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "reactstrap";
import _ from "lodash";

/**
 *  renku-ui
 *
 *  Tooltip.js
 *  Tooltip code and presentation.
 */

// Throttle toggling -- added to work around a bug that appears in Chrome only
// commenting out but leaving here in case we need it again.
// function throttledToggler(tooltipOpen, setTooltipOpen, lastToggleTime, setLastToggleTime) {
//   return () => {
//     const now = Date.now();
//     const sinceLast = now - lastToggleTime;
//     if (!tooltipOpen && sinceLast > 100) {
//       setLastToggleTime(now);
//       return setTooltipOpen(!tooltipOpen);
//     }
//     else if (tooltipOpen) {
//       return setTooltipOpen(!tooltipOpen);
//     }
//   };
// }


// Non-throttled toggling
function standardToggler(tooltipOpen, setTooltipOpen, lastToggleTime, setLastToggleTime) {
  return () => {
    return setTooltipOpen(!tooltipOpen);
  };
}

/**
 * ThrottledTooltip
 * Tooltip that limits how quickly open requests are processed
 *
 * @param {string} [target] - id of the element on which the tooltip should be shown
 * @param {string} [tooltip] - the text of the tooltip
 */
function ThrottledTooltip(props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [lastToggleTime, setLastToggleTime] = useState(Date.now());

  const toggle = standardToggler(tooltipOpen, setTooltipOpen, lastToggleTime, setLastToggleTime);

  return <Tooltip placement="top" target={props.target} isOpen={tooltipOpen} toggle={toggle} autohide={false}
    delay={{ show: 25, hide: 250 }}>
    {props.tooltip}
  </Tooltip>;
}

/**
 * TooltipToggleButton
 * Toggle button that is displayed as a font-awesome icon
 *
 * @param {function} [onClick] - onClick handler
 * @param {icon} [activeIcon] - font-awesome icon to display when active
 * @param {string} [activeClass] - css class to apply to icon when when active
 * @param {icon} [inactiveIcon] - font-awesome icon to display when inactive
 * @param {string} [inactiveClass] - css class to apply to icon when when inactive
 * @param {string} [tooltip] - the text of the tooltip
 */
function TooltipToggleButton(props) {
  const [uniqueId, ] = useState(`tooltip-toggle-${_.uniqueId()}`);

  return <span onClick={props.onClick}>
    {props.active ?
      <FontAwesomeIcon id={uniqueId} className={`icon-link ${props.activeClass}`} icon={props.activeIcon}/>
      :
      <FontAwesomeIcon id={uniqueId} className={`icon-link ${props.inactiveClass}`} icon={props.inactiveIcon}/>
    }
    <ThrottledTooltip target={uniqueId} tooltip={props.tooltip} />
  </span>;
}

export { ThrottledTooltip, TooltipToggleButton };
