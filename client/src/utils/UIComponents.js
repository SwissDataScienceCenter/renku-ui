
/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  UIComponents.js
 *  Utility UI components for the application.
 */

import _ from "lodash/util";
import human from "human-time";
import React, { Component, Fragment, useState, useEffect, useRef } from "react";
import { Link, NavLink as RRNavLink } from "react-router-dom";
import ReactPagination from "react-js-pagination";
import ReactClipboard from "react-clipboard.js";

import {
  FormFeedback, FormGroup, FormText, Input, Label, Alert, NavLink, Tooltip, Button,
  ButtonDropdown, DropdownToggle, DropdownMenu, UncontrolledTooltip, Col
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  faCheck, faExternalLinkAlt, faEllipsisV, faUser, faSyncAlt
} from "@fortawesome/free-solid-svg-icons";

import { sanitizedHTMLFromMarkdown, simpleHash } from "./HelperFunctions";
import FileExplorer, { getFilesTree } from "./FileExplorer";
import RenkuMarkdownWithPathTranslation from "./Markdown";
import ListDisplay from "./List";

/**
 * Show user avatar
 *
 * @param {string} size - image size (sm, md, lg). Default is 'lg'
 * @param {string} person - user data object, as returned by /user api.
 *   It must contain at least `avatar_url` and `username`
 */
class UserAvatar extends Component {
  computeWidgetSize() {
    const size = this.props.size || "lg";
    let widgetSize = { img: 36, fa: "2x" };
    switch (size) {
      case "sm": widgetSize = { img: 18, fa: null }; break;
      case "md": widgetSize = { img: 18 * 2, fa: "2x" }; break;
      case "lg": widgetSize = { img: 18 * 3, fa: "3x" }; break;
      case "xl": widgetSize = { img: 18 * 6, fa: "6x" }; break;
      default: break;
    }
    return widgetSize;
  }

  render() {
    let img, user;
    const widgetSize = this.computeWidgetSize();
    const person = this.props.person;
    if (person != null && person !== undefined) {
      img = person.avatar_url;
      user = person.username;
    }
    else {
      img = this.props.avatar;
      user = this.props.user;
    }
    return (img) ?
      <img width={widgetSize.img} src={img} alt={user} /> :
      <div style={{ minWidth: widgetSize.img, textAlign: "center" }}>
        <FontAwesomeIcon alt={user} icon={faUser} size={widgetSize.fa}
          style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }} /></div>;
  }
}

function ProjectAvatar(props) {

  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (props.avatar_url) setAvatarUrl(props.avatar_url);
  }, [props]);

  return props.avatar_url ? <UserAvatar avatar={avatarUrl} size="xl" /> : null;
}

class FieldGroup extends Component {
  render() {
    const label = this.props.label,
      help = this.props.help,
      feedback = this.props.feedback,
      props = this.props;
    const subProps = {};
    if (props.valid === true)
      subProps.valid = "true";
    if (props.invalid === true)
      subProps.invalid = "true";
    return <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
      {feedback && <FormFeedback {...subProps}>{feedback}</FormFeedback>}
      {help && <FormText color="muted">{help}</FormText>}
    </FormGroup>;
  }
}

function displayTimeFromDate(time) {
  if (time == null | time === "")
    return "at unknown time";

  const timeDiff = (new Date() - new Date(time)) / 1000;
  const displayTime = timeDiff < 3 ? "just now" : human(timeDiff);
  return displayTime;
}

class TimeCaption extends Component {
  // Take a time and caption and generate a span that shows it
  render() {
    const displayTime = displayTimeFromDate(this.props.time);
    let caption = (this.props.caption) ? this.props.caption : "Updated";
    const endCaption = (this.props.endCaption) ? " " + this.props.endCaption : "";
    const endPunctuation = (this.props.endPunctuation) ? this.props.endPunctuation : ".";
    let className = this.props.className || "";
    const noCaption = this.props.noCaption;
    if (noCaption)
      caption = "";
    else
      className = "time-caption " + className;
    return <span className={className}>{caption} {displayTime}{endCaption}{endPunctuation}</span>;
  }
}

/**
 * Provide a react-router-compatible link to a URL. Show the link as active
 * if it matches either the to or alternate URL.
 */
class RenkuNavLink extends Component {

  constructor() {
    super();
    this.isActive = this.testActive.bind(this);
  }

  testActive(match, location) {
    const altArray = this.props.alternate ?
      Array.isArray(this.props.alternate) ?
        this.props.alternate : [this.props.alternate] : undefined;


    if (this.props.matchPath === true) {
      let haveMatch = (match != null || location.pathname.startsWith(this.props.to));
      if (!altArray) return haveMatch;
      return haveMatch || altArray.find(alt => location.pathname.startsWith(alt)) !== undefined;
    }
    let haveMatch = match != null;
    if (!altArray) return haveMatch;
    if (this.props.noSubPath)
      return haveMatch || altArray.find(alt => location.pathname.endsWith(alt)) !== undefined;
    return haveMatch || altArray.find(alt => location.pathname.startsWith(alt)) !== undefined;
  }

  render() {
    const { previous, title } = this.props;
    const to = previous ?
      { "pathname": this.props.to, "state": { previous } } :
      this.props.to;
    const exact = (this.props.exact != null) ? this.props.exact : true;
    return (
      <NavLink exact={exact} to={to} isActive={this.isActive} tag={RRNavLink}
        id={this.props.id} className={this.props.className}>{title}</NavLink>
    );
  }
}


class Pagination extends Component {
  render() {

    // We do not display the pagination footer when there are no pages or only one page
    if (this.props.totalItems == null
      || this.props.totalItems < 1
      || this.props.totalItems <= this.props.perPage)
      return null;

    const className = `pagination ${this.props.className ? this.props.className : null}`;
    return <ReactPagination
      activePage={this.props.currentPage}
      itemsCountPerPage={this.props.perPage}
      totalItemsCount={this.props.totalItems}
      onChange={this.props.onPageChange}
      innerClass={className}

      // Some defaults for the styling
      itemClass={"page-item"}
      linkClass={"page-link"}
      activeClass={"page-item active"}
      hideFirstLastPages={false}
      hideDisabled={true}
    />;
  }
}

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
    <a role="button" target="_blank" rel="noreferrer noopener"
      href={props.url}
      className={className}
      {...otherProps}
    >
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
    <a target="_blank" rel="noreferrer noopener"
      href={props.url}
      className={className}
      {...otherProps}
    >
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

function LoaderSpinner(props) {
  const size = props.size || 120;
  const d = `${size}px`;
  // Inspired from https://www.w3schools.com/howto/howto_css_loader.asp
  const border = `${size / 10}px solid #f3f3f3`;
  const borderTop = `${size / 10}px solid #01192D`; // Use Renku Blue
  const borderRight = borderTop; // Added a borderRight to make a half-circle
  const borderRadius = "50%";
  const animation = "spin 2s linear infinite";
  const left = props.inline ? "" : "40%", right = left;
  const display = props.inline ? "inline-block" : "";
  const verticalAlign = props.inline ? "middle" : "";
  const margin = `m-${props.margin ? props.margin : 0}`;
  return <div className={`${margin} ${props.className}`} style={{
    width: d, height: d,
    border, borderTop, borderRight, borderRadius, animation, left, right, display, verticalAlign,
    position: "relative",
  }}></div>;
}

function LoaderBouncer(props) {
  return (
    <div className={`bouncer ${props.className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function Loader(props) {
  const size = props.size || 120;
  const inline = props.inline;
  return (inline || size < 100) ? LoaderSpinner(props) : LoaderBouncer(props);
}

/**
 * Display a alert that can be dismissed.
 *
 * @param {number} [timeout] - define how many seconds the component should be visible.
 *   10 is default. 0 for unlimited.
 * @param {boolean} [hidden] - hide the alert if true.
 * @param {boolean} [open] - manually pilot visibility.
 * @param {function} [dismissCallback] - function to be invoked when the alert is dismissed.
 */
class RenkuAlert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
      timeout: null,
    };

    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    this.addTimeout();
  }

  componentWillUnmount() {
    this.removeTimeout();
  }

  addTimeout() {
    // add the timeout and keep track of the timeout variable to clear it when the alert
    // is manually closed
    if (this.props.timeout === 0)
      return;

    const timeout = this.props.timeout ? this.props.timeout : 10;
    const timeoutController = setTimeout(() => {
      this.onDismiss();
    }, timeout * 1000);
    this.setState({ timeout: timeoutController });
  }

  removeTimeout() {
    // remove the timeout when component is closed to avoid double firing callback function
    if (this.state.timeout !== null)
      clearTimeout(this.state.timeout);
  }

  onDismiss() {
    this.setState({ open: false });
    this.removeTimeout();
    if (this.props.dismissCallback)
      this.props.dismissCallback();
  }

  render() {
    if (this.props.hidden || this.state.hidden) return null;
    const isOpen = this.props.open ? this.props.open : this.state.open;
    return (
      <Alert color={this.props.color} isOpen={isOpen} toggle={this.onDismiss}>
        {this.props.children}
      </Alert>
    );
  }
}

class InfoAlert extends Component {
  render() {
    return (
      <RenkuAlert color="info" {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

class SuccessAlert extends Component {
  render() {
    return (
      <RenkuAlert color="success" {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

class WarnAlert extends Component {
  render() {
    return (
      <RenkuAlert color="warning" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

class ErrorAlert extends Component {
  render() {
    return (
      <RenkuAlert color="danger" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

/**
 * Safely render markdown.
 * @param {string} markdownText the markdown text to display
 * @param {boolean} singleLine if true, render the output as a single line without line breaks
 * @param {object} style any styles to apply
 */
class RenkuMarkdown extends Component {
  render() {
    const { singleLine, style, fixRelativePaths } = this.props;
    if (fixRelativePaths)
      return <RenkuMarkdownWithPathTranslation {...this.props} />;

    let className = "text-break renku-markdown";
    if (singleLine)
      className += " children-no-spacing";
    if (this.props.className)
      className += " " + this.props.className;

    return <div className={className} style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHTMLFromMarkdown(this.props.markdownText, singleLine) }}>
    </div>;
  }
}

/**
 * This component converts markdown to text. It is meant to be used when an extract of
 * a description in markdown should be be displayed.
 * @param {string} markdownText is the markdown text that wants to be displayed
 * @param {integer} charsLimit is the number of characters that will be displayed
 */
function MarkdownTextExcerpt(props) {
  // Alternative implementation to strip styling.
  // const temp = document.createElement("div");
  // temp.innerHTML = sanitizedHTMLFromMarkdown(this.props.markdownText, false);
  // const innerText = temp.textContent || temp.innerText || "";
  // return this.props.charsLimit !== undefined && innerText.length > this.props.charsLimit ?
  //   innerText.substr(0, this.props.charsLimit) + "..." : innerText;
  const style = props.heightLimit ?
    { maxHeight: `${props.heightLimit}ch` }
    : { maxWidth: `${props.charsLimit}ch` };
  const text = props.charsLimit && (props.markdownText.length > props.charsLimit) ?
    props.markdownText.slice(0, props.charsLimit) + "..." : props.markdownText;
  return <RenkuMarkdown markdownText={text} singleLine={props.singleLine || false} style={style} />;
}

/**
 * Jupyter icon
 *
 * @param {boolean} [grayscale] - show the grayscale version of the logo
 * @param {string} [svgClass] - class to apply on the svg element
 */
class JupyterIcon extends Component {
  render() {
    const style = { "mixBlendMode": "normal" };
    const Colors = {
      GREY: "#767677",
      ORANGE: this.props.grayscale ?
        "#767677" :
        "#F37726"
    };

    /* eslint-disable max-len */
    return (
      <svg width="44" height="51" viewBox="0 0 44 51" version="2.0" xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink" className={this.props.svgClass}>

        <g id="Canvas" transform="translate(-1640 -2453)">
          <g id="Group" style={style}>
            <g id="Group" style={style}>
              <g id="g" style={style}>
                <g id="path" style={style}>
                  <g id="path16 fill" style={style}>
                    <use xlinkHref="#path7_fill" transform="translate(1673.48 2453.69)" fill={Colors.GREY}
                      style={style} />
                  </g>
                </g>
                <g id="path" style={style}>
                  <g id="path17 fill" style={style}>
                    <use xlinkHref="#path8_fill" transform="translate(1643.21 2484.27)" fill={Colors.ORANGE}
                      style={style} />
                  </g>
                </g>
                <g id="path" style={style}>
                  <g id="path18 fill" style={style}>
                    <use xlinkHref="#path9_fill" transform="translate(1643.21 2457.88)" fill={Colors.ORANGE}
                      style={style} />
                  </g>
                </g>
                <g id="path" style={style}>
                  <g id="path19 fill" style={style}>
                    <use xlinkHref="#path10_fill" transform="translate(1643.28 2496.09)" fill={Colors.GREY}
                      style={style} />
                  </g>
                </g>
                <g id="path" style={style}>
                  <g id="path20 fill" style={style}>
                    <use xlinkHref="#path11_fill" transform="translate(1641.87 2458.43)" fill={Colors.GREY}
                      style={style} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
        <defs>
          <path id="path0_fill"
            d="M 1.74498 5.47533C 1.74498 7.03335 1.62034 7.54082 1.29983 7.91474C 0.943119 8.23595 0.480024 8.41358 0 8.41331L 0.124642 9.3036C 0.86884 9.31366 1.59095 9.05078 2.15452 8.56466C 2.45775 8.19487 2.6834 7.76781 2.818 7.30893C 2.95261 6.85005 2.99341 6.36876 2.93798 5.89377L 2.93798 0L 1.74498 0L 1.74498 5.43972L 1.74498 5.47533Z" />
          <path id="path1_fill"
            d="M 5.50204 4.76309C 5.50204 5.43081 5.50204 6.02731 5.55545 6.54368L 4.496 6.54368L 4.42478 5.48423C 4.20318 5.85909 3.88627 6.16858 3.50628 6.38125C 3.12628 6.59392 2.69675 6.70219 2.26135 6.69503C 1.22861 6.69503 0 6.13415 0 3.84608L 0 0.0445149L 1.193 0.0445149L 1.193 3.6057C 1.193 4.84322 1.57583 5.67119 2.65309 5.67119C 2.87472 5.67358 3.09459 5.63168 3.29982 5.54796C 3.50505 5.46424 3.69149 5.34039 3.84822 5.18366C 4.00494 5.02694 4.1288 4.84049 4.21252 4.63527C 4.29623 4.43004 4.33813 4.21016 4.33575 3.98853L 4.33575 0L 5.52874 0L 5.52874 4.72748L 5.50204 4.76309Z" />
          <path id="path2_fill"
            d="M 0.0534178 2.27264C 0.0534178 1.44466 0.0534178 0.768036 0 0.153731L 1.06836 0.153731L 1.12177 1.2666C 1.3598 0.864535 1.70247 0.534594 2.11325 0.311954C 2.52404 0.0893145 2.98754 -0.0176786 3.45435 0.00238095C 5.03908 0.00238095 6.23208 1.32892 6.23208 3.30538C 6.23208 5.63796 4.7987 6.79535 3.24958 6.79535C 2.85309 6.81304 2.45874 6.7281 2.10469 6.54874C 1.75064 6.36937 1.44888 6.10166 1.22861 5.77151L 1.22861 5.77151L 1.22861 9.33269L 0.0534178 9.33269L 0.0534178 2.29935L 0.0534178 2.27264ZM 1.22861 4.00872C 1.23184 4.17026 1.24972 4.33117 1.28203 4.48948C 1.38304 4.88479 1.61299 5.23513 1.93548 5.48506C 2.25798 5.735 2.65461 5.87026 3.06262 5.86944C 4.31794 5.86944 5.05689 4.8456 5.05689 3.3588C 5.05689 2.05897 4.36246 0.946096 3.10714 0.946096C 2.61036 0.986777 2.14548 1.20726 1.79965 1.5662C 1.45382 1.92514 1.25079 2.3979 1.22861 2.89585L 1.22861 4.00872Z" />
          <path id="path3_fill"
            d="M 1.31764 0.0178059L 2.75102 3.85499C 2.90237 4.28233 3.06262 4.7987 3.16946 5.18153C 3.2941 4.7898 3.42764 4.29123 3.5879 3.82828L 4.88773 0.0178059L 6.14305 0.0178059L 4.36246 4.64735C 3.47216 6.87309 2.92908 8.02158 2.11 8.71601C 1.69745 9.09283 1.19448 9.35658 0.649917 9.48166L 0.356119 8.48453C 0.736886 8.35942 1.09038 8.16304 1.39777 7.90584C 1.8321 7.55188 2.17678 7.10044 2.4038 6.5882C 2.45239 6.49949 2.48551 6.40314 2.50173 6.3033C 2.49161 6.19586 2.46457 6.0907 2.42161 5.9917L 0 0L 1.29983 0L 1.31764 0.0178059Z" />
          <path id="path4_fill"
            d="M 2.19013 0L 2.19013 1.86962L 3.8995 1.86962L 3.8995 2.75992L 2.19013 2.75992L 2.19013 6.26769C 2.19013 7.06896 2.42161 7.53191 3.08043 7.53191C 3.31442 7.53574 3.54789 7.5088 3.77486 7.45179L 3.82828 8.34208C 3.48794 8.45999 3.12881 8.51431 2.76882 8.50234C 2.53042 8.51726 2.29161 8.48043 2.06878 8.39437C 1.84595 8.30831 1.64438 8.17506 1.47789 8.00377C 1.11525 7.51873 0.949826 6.91431 1.01494 6.31221L 1.01494 2.75102L 0 2.75102L 0 1.86072L 1.03274 1.86072L 1.03274 0.275992L 2.19013 0Z" />
          <path id="path5_fill"
            d="M 1.17716 3.57899C 1.153 3.88093 1.19468 4.18451 1.29933 4.46876C 1.40398 4.75301 1.5691 5.01114 1.78329 5.22532C 1.99747 5.43951 2.2556 5.60463 2.53985 5.70928C 2.8241 5.81393 3.12768 5.85561 3.42962 5.83145C 4.04033 5.84511 4.64706 5.72983 5.21021 5.49313L 5.41498 6.38343C 4.72393 6.66809 3.98085 6.80458 3.23375 6.78406C 2.79821 6.81388 2.36138 6.74914 1.95322 6.59427C 1.54505 6.43941 1.17522 6.19809 0.869071 5.88688C 0.562928 5.57566 0.327723 5.2019 0.179591 4.79125C 0.0314584 4.38059 -0.0260962 3.94276 0.0108748 3.50777C 0.0108748 1.54912 1.17716 0 3.0824 0C 5.21911 0 5.75329 1.86962 5.75329 3.06262C 5.76471 3.24644 5.76471 3.43079 5.75329 3.61461L 1.15046 3.61461L 1.17716 3.57899ZM 4.66713 2.6887C 4.70149 2.45067 4.68443 2.20805 4.61709 1.97718C 4.54976 1.74631 4.43372 1.53255 4.2768 1.35031C 4.11987 1.16808 3.92571 1.0216 3.70739 0.920744C 3.48907 0.81989 3.25166 0.767006 3.01118 0.765656C 2.52201 0.801064 2.06371 1.01788 1.72609 1.37362C 1.38847 1.72935 1.19588 2.19835 1.18607 2.6887L 4.66713 2.6887Z" />
          <path id="path6_fill"
            d="M 0.0534178 2.19228C 0.0534178 1.42663 0.0534178 0.767806 0 0.162404L 1.06836 0.162404L 1.06836 1.43553L 1.12177 1.43553C 1.23391 1.04259 1.4656 0.694314 1.78468 0.439049C 2.10376 0.183783 2.4944 0.034196 2.90237 0.0110538C 3.01466 -0.00368459 3.12839 -0.00368459 3.24068 0.0110538L 3.24068 1.12393C 3.10462 1.10817 2.9672 1.10817 2.83114 1.12393C 2.427 1.13958 2.04237 1.30182 1.7491 1.58035C 1.45583 1.85887 1.27398 2.23462 1.23751 2.63743C 1.20422 2.8196 1.18635 3.00425 1.1841 3.18941L 1.1841 6.65267L 0.00890297 6.65267L 0.00890297 2.20118L 0.0534178 2.19228Z" />
          <path id="path7_fill"
            d="M 6.03059 2.83565C 6.06715 3.43376 5.92485 4.02921 5.6218 4.54615C 5.31875 5.0631 4.86869 5.47813 4.32893 5.73839C 3.78917 5.99864 3.18416 6.09233 2.59097 6.00753C 1.99778 5.92272 1.44326 5.66326 0.998048 5.26219C 0.552837 4.86113 0.23709 4.33661 0.0910307 3.75546C -0.0550287 3.17431 -0.0247891 2.56283 0.177897 1.99893C 0.380583 1.43503 0.746541 0.944221 1.22915 0.589037C 1.71176 0.233853 2.28918 0.0303686 2.88784 0.00450543C 3.28035 -0.0170932 3.67326 0.0391144 4.04396 0.169896C 4.41467 0.300677 4.75587 0.503453 5.04794 0.766561C 5.34 1.02967 5.57718 1.34792 5.74582 1.70301C 5.91446 2.0581 6.01124 2.44303 6.03059 2.83565L 6.03059 2.83565Z" />
          <path id="path8_fill"
            d="M 18.6962 7.12238C 10.6836 7.12238 3.64131 4.24672 0 0C 1.41284 3.82041 3.96215 7.1163 7.30479 9.44404C 10.6474 11.7718 14.623 13.0196 18.6962 13.0196C 22.7695 13.0196 26.745 11.7718 30.0877 9.44404C 33.4303 7.1163 35.9796 3.82041 37.3925 4.0486e-13C 33.7601 4.24672 26.7445 7.12238 18.6962 7.12238Z" />
          <path id="path9_fill"
            d="M 18.6962 5.89725C 26.7089 5.89725 33.7512 8.77291 37.3925 13.0196C 35.9796 9.19922 33.4303 5.90333 30.0877 3.57559C 26.745 1.24785 22.7695 4.0486e-13 18.6962 0C 14.623 4.0486e-13 10.6474 1.24785 7.30479 3.57559C 3.96215 5.90333 1.41284 9.19922 0 13.0196C 3.64131 8.76401 10.648 5.89725 18.6962 5.89725Z" />
          <path id="path10_fill"
            d="M 7.59576 3.56656C 7.64276 4.31992 7.46442 5.07022 7.08347 5.72186C 6.70251 6.3735 6.13619 6.89698 5.45666 7.22561C 4.77713 7.55424 4.01515 7.67314 3.26781 7.56716C 2.52046 7.46117 1.82158 7.13511 1.26021 6.63051C 0.698839 6.12591 0.300394 5.46561 0.115637 4.73375C -0.0691191 4.00188 -0.0318219 3.23159 0.222777 2.52099C 0.477376 1.8104 0.93775 1.19169 1.54524 0.743685C 2.15274 0.295678 2.87985 0.0386595 3.63394 0.00537589C 4.12793 -0.0210471 4.62229 0.0501173 5.08878 0.214803C 5.55526 0.37949 5.98473 0.63447 6.35264 0.965179C 6.72055 1.29589 7.01971 1.69584 7.233 2.1422C 7.4463 2.58855 7.56957 3.07256 7.59576 3.56656L 7.59576 3.56656Z" />
          <path id="path11_fill"
            d="M 2.25061 4.37943C 1.81886 4.39135 1.39322 4.27535 1.02722 4.04602C 0.661224 3.81668 0.371206 3.48424 0.193641 3.09052C 0.0160762 2.69679 -0.0411078 2.25935 0.0292804 1.83321C 0.0996686 1.40707 0.294486 1.01125 0.589233 0.695542C 0.883981 0.37983 1.2655 0.158316 1.68581 0.0588577C 2.10611 -0.0406005 2.54644 -0.0135622 2.95143 0.136572C 3.35641 0.286707 3.70796 0.553234 3.96186 0.902636C 4.21577 1.25204 4.3607 1.66872 4.37842 2.10027C 4.39529 2.6838 4.18131 3.25044 3.78293 3.67715C 3.38455 4.10387 2.83392 4.35623 2.25061 4.37943Z" />
        </defs>
      </svg>
    );
    /* eslint-enable max-len */
  }
}

/**
 * Clipboard
 *
 * A component that copies text to the clipboard
 * @param {string} [clipboardText] - Text to copy to the clipboard
 */
function Clipboard(props) {
  const [copied, setCopied] = useState(false);
  const timeoutDur = 3000;

  // keep track of mounted state
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  let className = "";
  if (props.className)
    className += ` ${props.className}`;

  return (
    <ReactClipboard component="a"
      data-clipboard-text={props.clipboardText}
      onSuccess={
        () => { setCopied(true); setTimeout(() => { if (isMounted.current) setCopied(false); }, timeoutDur); }
      }
      className={className}
      style={{ textDecoration: "none" }}
    > {
        (copied) ?
          <FontAwesomeIcon icon={faCheck} color="success" /> :
          <FontAwesomeIcon icon={faCopy} />
      }
    </ReactClipboard>
  );
}

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

  return <Tooltip placement="top" target={props.target} isOpen={tooltipOpen} toggle={toggle}
    delay={{ show: 25, hide: 250 }}>
    {props.tooltip}
  </Tooltip>;
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

/**
 * A button with a menu (dropdown button)
 *
 * @param {component} [default] - The main, default item to show
 * @param {[DropdownItem]} [children] - The items to show in the menu
 */
function ButtonWithMenu(props) {
  const [dropdownOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!dropdownOpen);
  const size = (props.size) ? props.size : "md";

  return <ButtonDropdown
    className={props.className}
    size={size}
    isOpen={dropdownOpen}
    toggle={toggleOpen}
    color={props.color || "primary"}
    direction={props.direction}
    disabled={props.disabled}
  >
    {props.default}
    <DropdownToggle color={props.color || "primary"}>
      <FontAwesomeIcon icon={faEllipsisV}/>
    </DropdownToggle>
    <DropdownMenu end>
      {props.children}
    </DropdownMenu>
  </ButtonDropdown>;
}

/**
 * Refresh button with spinning icon.
 *
 * @param {function} props.action - function to trigger when clicking on the button
 * @param {boolean} [props.updating] - pilot the spin, should be true when performing the action
 * @param {boolean} [props.message] - tooltip message to trigger on hover
 */
function RefreshButton(props) {
  const id = "button_" + simpleHash(props.action.toString());
  const tooltip = props.message ?
    (<UncontrolledTooltip key="tooltip" placement="top" target={id}>{props.message}</UncontrolledTooltip>) :
    null;

  return (
    <Fragment>
      <Button key="button" className="ms-2 p-0" color="link" size="sm" id={id} onClick={() => props.action()}>
        <FontAwesomeIcon icon={faSyncAlt} spin={props.updating} />
      </Button>
      {tooltip}
    </Fragment>
  );
}

/**
 *
 * @param {string} props.url url to go back to
 * @param {string} props.label text next to the arrow
 */
function GoBackButton(props) {
  return <Col md={12} className="pb-4 pl-0">
    <Link className={props.className + " link-rk-text text-decoration-none"} to={props.url}>
      <span className="arrow-left">  </span>{props.label}
    </Link>
  </Col>;
}

export {
  UserAvatar, TimeCaption, FieldGroup, RenkuNavLink, Pagination, RenkuMarkdown, ExternalLink, ExternalDocsLink,
  ExternalIconLink, IconLink, RefreshButton, Loader, InfoAlert, SuccessAlert, WarnAlert, ErrorAlert, JupyterIcon,
  Clipboard, ThrottledTooltip, TooltipToggleButton, ProjectAvatar, ButtonWithMenu, FileExplorer, getFilesTree,
  MarkdownTextExcerpt, GoBackButton, ListDisplay
};
