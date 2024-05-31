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
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";

type ExternalLinkButtonProps = Pick<
  ExternalLinkProps,
  | "children"
  | "className"
  | "color"
  | "disabled"
  | "id"
  | "onClick"
  | "size"
  | "title"
  | "url"
>;

function ExternalLinkButton({
  children,
  className,
  color,
  disabled,
  id,
  onClick,
  size,
  title,
  url,
}: ExternalLinkButtonProps) {
  return (
    <a
      id={id}
      onClick={onClick}
      role="button"
      target="_blank"
      rel="noreferrer noopener"
      href={url}
      className={cx(
        "btn",
        color ? `btn-${color}` : "btn-primary",
        disabled && disabled,
        size && `btn-${size}`,
        className
      )}
    >
      {title}
      {children}
    </a>
  );
}

function ExternalLinkText({
  children,
  className,
  disabled,
  id,
  onClick,
  title,
  url,
}: Omit<ExternalLinkButtonProps, "color" | "size">) {
  return (
    <a
      id={id}
      onClick={onClick}
      target="_blank"
      rel="noreferrer noopener"
      href={url}
      className={cx(disabled && disabled, className)}
    >
      {title}
      {children}
    </a>
  );
}

export type ExternalLinkRole = "button" | "link" | "text";

interface ExternalLinkProps {
  children?: React.ReactNode | null;
  /** Any classes to add, e.g., 'nav-link' or 'dropdown-item' */
  className?: string;
  color?: string;
  /** Custom icon */
  customIcon?: React.ReactNode;
  disabled?: boolean;
  /** Position the icon after the text when true (default false) */
  iconAfter?: boolean;
  /** Icon size modifier ("lg", "2x", ...) */
  iconSize?: string;
  /** Position the icon as superscript when true (default false) */
  iconSup?: boolean;
  /** Main element's id */
  id?: string;
  onClick?: () => void;
  /** "link" or "text" to be shown as a link, undefined/null for a button (default undefined) */
  role?: ExternalLinkRole | undefined | null;
  /** Show the icon to indicate an external link if true (default false) */
  showLinkIcon?: boolean;
  size?: string;
  /** The text to show for the link */
  title?: string | React.ReactNode;
  /** The URL to link to */
  url: string;
}
export function ExternalLink({
  iconAfter,
  iconSize,
  iconSup,
  role,
  title,
  ...props
}: ExternalLinkProps) {
  const showLinkIcon =
    props.showLinkIcon || iconSup || iconAfter || iconSize ? true : false;
  let displayTitle = title;
  if (showLinkIcon) {
    const iconNode = props.customIcon ? (
      props.customIcon
    ) : (
      <BoxArrowUpRight className={cx("bi", "me-1")} />
    );
    const icon = iconSup ? <sup>{iconNode}</sup> : <>{iconNode}</>;
    displayTitle = iconAfter ? (
      <span className="btn-icon-text-after">
        {title}
        {icon}
      </span>
    ) : (
      <span className="btn-icon-text">
        {icon}
        {title}
      </span>
    );
  }
  const myProps = { ...props, title: displayTitle };
  if (role === "link" || role === "text")
    return <ExternalLinkText {...myProps} />;
  return <ExternalLinkButton {...myProps} />;
}

interface ExternalDocsLinkProps {
  children?: React.ReactNode | null;
  /** [Optional] Any classes to add, e.g., 'nav-link' or 'dropdown-item' */
  className?: string;
  /** Show the icon to indicate an external link if true (default false) */
  showLinkIcon?: boolean;
  /** The text to show for the link */
  title: string;
  /** The URL to link to */
  url: string;
}
/**
 * Link to external URL, with the role as text.
 */
export function ExternalDocsLink(props: ExternalDocsLinkProps) {
  const role = "link";
  return <ExternalLink role={role} {...props} />;
}

interface IconLinkProps {
  /** An icon to display */
  icon: React.ReactNode;
  /** The URL to link to */
  to: string;
  /** The text of the tooltip */
  tooltip: string;
}
/**
 * IconLink
 * Internal application link that is shown as a font-awesome icon
 */
export function IconLink(props: IconLinkProps) {
  const ref = useRef(null);

  return (
    <span>
      <Link ref={ref} to={props.to}>
        {props.icon}
      </Link>
      <UncontrolledTooltip target={ref}>{props.tooltip}</UncontrolledTooltip>
    </span>
  );
}

function ExternalIconLinkWithTooltip(props: ExternalIconLinkProps) {
  const ref = useRef(null);

  return (
    <span>
      <a
        href={props.url}
        role="button"
        className={cx("btn-icon-text", "icon-link", props.className)}
        ref={ref}
        target="_blank"
        rel="noreferrer noopener"
      >
        {props.icon}
        {props.title}
      </a>
      <UncontrolledTooltip target={ref}>{props.tooltip}</UncontrolledTooltip>
    </span>
  );
}

function ExternalIconLinkWithoutTooltip({
  className,
  icon,
  title,
  url,
}: ExternalIconLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={cx("btn-icon-text", className)}
    >
      {icon}
      {title}
    </a>
  );
}

interface ExternalIconLinkProps {
  /** [Optional] Any classes to add, e.g., 'nav-link' or 'dropdown-item' */
  className?: string;
  /** An icon to display */
  icon: ReactNode;
  /** The text to show for the link */
  title: ReactNode;
  /** The text of the tooltip */
  tooltip?: ReactNode;
  /** The URL to link to */
  url: string;
}
export function ExternalIconLink({
  className,
  icon,
  title,
  tooltip,
  url,
}: ExternalIconLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <a
        href={url}
        role="button"
        className={cx("btn-icon-text", "icon-link", className)}
        ref={ref}
        target="_blank"
        rel="noreferrer noopener"
      >
        {icon}
        {title}
      </a>
      {tooltip && (
        <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
      )}
    </>
  );
}
