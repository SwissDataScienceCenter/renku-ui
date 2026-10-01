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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import type { CSSProperties, ReactNode } from "react";
import {
  Database,
  Folder,
  Journals,
  People,
  Person,
} from "react-bootstrap-icons";
import { Link } from "react-router";

import ExternalLink from "~/components/ExternalLink";
import { Loader } from "~/components/Loader";
import type {
  BreadcrumbEntityType,
  BreadcrumbLevel,
} from "./entityBreadcrumb.utils";
import {
  useEntityBreadcrumb,
  type EntityBreadcrumbProps,
} from "./useEntityBreadcrumb.hook";

import styles from "./entityBreadcrumb.module.scss";

const LINK_CLASS_NAME = cx(styles.link, "text-primary");

const BREADCRUMB_STYLE = {
  ["--bs-breadcrumb-divider"]: "'›'",
} as CSSProperties;

function BreadcrumbIcon({ type }: { type?: BreadcrumbEntityType }) {
  if (type == null) return null;
  const className = cx("flex-shrink-0", "me-1");
  switch (type) {
    case "group":
      return <People className={className} />;
    case "user":
      return <Person className={className} />;
    case "project":
      return <Folder className={className} />;
    case "dataConnector":
      return <Database className={className} />;
    case "source":
      return <Journals className={className} />;
  }
}

function isExternalHref(to: string): boolean {
  return /^https?:\/\//.test(to);
}

function AncestorLink({
  children,
  isPreviousPath,
  level,
}: {
  children: ReactNode;
  isPreviousPath: boolean;
  level: BreadcrumbLevel;
}) {
  if (!level.to) return children;
  const ariaLabel = isPreviousPath ? undefined : level.label;
  if (isExternalHref(level.to)) {
    return (
      <ExternalLink
        aria-label={ariaLabel}
        className={LINK_CLASS_NAME}
        href={level.to}
        icon={null}
      >
        {children}
      </ExternalLink>
    );
  }
  return (
    <Link aria-label={ariaLabel} className={LINK_CLASS_NAME} to={level.to}>
      {children}
    </Link>
  );
}

function BreadcrumbLabel({
  collapseToEllipsis,
  label,
}: {
  collapseToEllipsis: boolean;
  label: string;
}) {
  return (
    <>
      <span
        className={cx(styles.label, collapseToEllipsis && styles.fullLabel)}
        title={label}
      >
        {label}
      </span>
      {collapseToEllipsis && (
        <span aria-hidden="true" className={styles.ellipsis} title={label}>
          ...
        </span>
      )}
    </>
  );
}

function AncestorBreadcrumbLevel({
  isPreviousPath,
  level,
}: {
  isPreviousPath: boolean;
  level: BreadcrumbLevel;
}) {
  return (
    <li
      className={cx(
        "align-items-center",
        "breadcrumb-item",
        "d-flex",
        "flex-nowrap",
        "text-primary",
        styles.level,
        !isPreviousPath && styles.collapsed,
      )}
    >
      <AncestorLink isPreviousPath={isPreviousPath} level={level}>
        <BreadcrumbIcon type={level.type} />
        <BreadcrumbLabel
          collapseToEllipsis={!isPreviousPath}
          label={level.label}
        />
      </AncestorLink>
    </li>
  );
}

function CurrentBreadcrumbLevel({ level }: { level: BreadcrumbLevel }) {
  return (
    <li
      aria-current="page"
      className={cx(
        "active",
        "align-items-center",
        "breadcrumb-item",
        "d-flex",
        "flex-nowrap",
        "text-muted",
        styles.level,
      )}
    >
      <BreadcrumbIcon type={level.type} />
      <span className={cx(styles.label, "me-1")} title={level.label}>
        {level.label}
      </span>
    </li>
  );
}

function EntityBreadcrumbTrail({ levels }: { levels: BreadcrumbLevel[] }) {
  const lastIndex = levels.length - 1;
  const previousPath = levels.length - 2;
  return (
    <ol
      className={cx(
        "align-items-center",
        "breadcrumb",
        "d-flex",
        "flex-nowrap",
        "m-0",
        "min-w-0",
        "w-100",
      )}
    >
      {levels.map((level, index) =>
        index === lastIndex ? (
          <CurrentBreadcrumbLevel
            key={`${level.type}-${level.label}`}
            level={level}
          />
        ) : (
          <AncestorBreadcrumbLevel
            key={`${level.type}-${level.label}`}
            level={level}
            isPreviousPath={index === previousPath}
          />
        ),
      )}
    </ol>
  );
}

interface EntityBreadcrumbViewProps {
  isReady: boolean;
  levels: BreadcrumbLevel[];
}

export function EntityBreadcrumbView({
  isReady,
  levels,
}: EntityBreadcrumbViewProps) {
  return (
    <nav
      aria-busy={!isReady}
      aria-label="breadcrumb"
      className={cx(styles.nav, "min-w-0", "w-100")}
      data-cy="entity-breadcrumb"
      style={BREADCRUMB_STYLE}
    >
      {isReady ? (
        <EntityBreadcrumbTrail levels={levels} />
      ) : (
        <>
          <Loader inline size={16} />
          <span className="visually-hidden">Loading</span>
        </>
      )}
    </nav>
  );
}

export default function EntityBreadcrumb(props: EntityBreadcrumbProps) {
  const viewProps = useEntityBreadcrumb(props);
  return <EntityBreadcrumbView {...viewProps} />;
}
