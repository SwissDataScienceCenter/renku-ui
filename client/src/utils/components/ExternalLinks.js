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
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import _ from "lodash/util";
import { ThrottledTooltip } from "./Tooltip";

/**
 *  renku-ui
 *
 *  ExternalLinks.js
 *  ExternalLinks code and presentation.
 */

function ExternalLinkButton(props) {
  let className = "btn";
  if (props.size != null)
    className += ` btn-${props.size}`;
  if (props.disabled)
    className += " disabled";
  if (props.color)
    className += ` btn-${props.color}`;
  else
    className += ` btn-primary`;
  if (props.className)
    className += ` ${props.className}`;

  let otherProps = {};
  if (props.id)
    otherProps.id = props.id;
  if (props.onClick)
    otherProps.onClick = props.onClick;

  return (
    <a role="button" target="_blank" rel="noreferrer noopener" href={props.url} className={className}{...otherProps} >
      {props.title}
    </a>
  );
}

function ExternalLinkText(props) {
  let className = "";
  if (props.disabled)
    className += " disabled";
  if (props.className)
    className += ` ${props.className}`;

  let otherProps = {};
  if (props.id)
    otherProps.id = props.id;
  if (props.onClick)
    otherProps.onClick = props.onClick;

  return (
    <a target="_blank" rel="noreferrer noopener" href={props.url} className={className} {...otherProps} >
      {props.title}
    </a>
  );
}

/**
 * Link to external URL.
 *
 * @param {string} url - The URL to link to
 * @param {string} title - The text to show for the link
 * @param {string} [role] - "link" or "text" to be shown as a link, null for a button (default null)
 * @param {string} [className] - Any classes to add, e.g., 'nav-link' or 'dropdown-item'
 * @param {boolean} [showLinkIcon] - Show the icon to indicate an external link if true (default false)
 * @param {string} [iconSize] - icon size modifier ("lg", "2x", ...)
 * @param {boolean} [iconSup] - Position the icon as superscript when true (default false)
 * @param {boolean} [iconAfter] - Position the icon after the text when true (default false)
 * @param {string} [id] - main element's id
 * @param {object} [customIcon] - custom icon
 */
function ExternalLink(props) {
  const role = props.role;
  const showLinkIcon = props.showLinkIcon || props.iconSup || props.iconAfter || props.iconSize ?
    true :
    false;
  let displayTitle = props.title;
  if (showLinkIcon) {
    const iconType = props.customIcon ?
      props.customIcon :
      faExternalLinkAlt;
    const icon = props.iconSup ?
      (<sup><FontAwesomeIcon icon={iconType} size={props.iconSize} color="dark" /></sup>) :
      (<FontAwesomeIcon icon={iconType} size={props.iconSize} color="dark" />);
    displayTitle = props.iconAfter ?
      (<span>{props.title} {icon}</span>) :
      (<span>{icon} {props.title}</span>);
  }
  const myProps = { ...props, title: displayTitle };
  if (role === "link" || role === "text")
    return ExternalLinkText(myProps);
  return ExternalLinkButton(myProps);
}

/**
 * Link to external URL, with the role as text.
 *
 * @param {string} [url] - The URL to link to
 * @param {string} [title] - The text to show for the link
 * @param {string?} [className] - [Optional] Any classes to add, e.g., 'nav-link' or 'dropdown-item'
 * @param {boolean} [showLinkIcon] - Show the icon to indicate an external link if true (default false)
 */
function ExternalDocsLink(props) {
  const role = "link";
  return ExternalLink({ role, ...props });
}

/**
 * IconLink
 * Internal application link that is shown as a font-awesome icon
 *
 * @param {string} [to] - path of link
 * @param {icon} [icon] - font-awesome icon to display
 * @param {string} [tooltip] - the text of the tooltip
 */
function IconLink(props) {
  const [uniqueId, ] = useState(`icon-link-${_.uniqueId()}`);

  return <span>
    <Link to={props.to} id={uniqueId} >
      <FontAwesomeIcon className="icon-link" icon={props.icon} />
    </Link>
    <ThrottledTooltip target={uniqueId} tooltip={props.tooltip} />
  </span>;
}

function ExternalIconLinkWithTooltip(props) {
  const [uniqueId, ] = useState(`external-icon-link-${_.uniqueId()}`);

  let className = "icon-link";
  if (props.className)
    className += ` ${props.className}`;

  return <span>
    <a href={props.url} role="button" target="_blank" rel="noreferrer noopener">
      <FontAwesomeIcon className={className} icon={props.icon} id={uniqueId} />
    </a>
    <ThrottledTooltip target={uniqueId} tooltip={props.tooltip} />
  </span>;
}

function ExternalIconLinkWithoutTooltip(props) {
  let className = "";
  if (props.className)
    className += ` ${props.className}`;
  return <a href={props.url} target="_blank" rel="noreferrer noopener" className={className}>
    <FontAwesomeIcon icon={props.icon} /> {props.title}
  </a>;
}

/**
 * ExternalIconLink
 * External application link that is shown as a font-awesome icon
 *
 * @param {string} [to] - url of link
 * @param {string} [url] - alternative for 'to' -- takes precedence over to
 * @param {icon} [icon] - font-awesome icon to display
 * @param {string} [tooltip] - the text of the tooltip or null for no tooltip
 * @param {string?} [className] - [Optional] Any classes to add, e.g., 'nav-link' or 'dropdown-item'
 */
function ExternalIconLink(props) {
  const url = (props.url) ? props.url : props.to;
  const myProps = { url, ...props };
  return (props.tooltip) ?
    ExternalIconLinkWithTooltip(myProps) :
    ExternalIconLinkWithoutTooltip(myProps);
}

export { ExternalLink, ExternalDocsLink, ExternalIconLink, IconLink };
