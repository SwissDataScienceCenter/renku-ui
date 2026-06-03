import cx from "classnames";
import {
  Database,
  FileCode,
  Gear,
  PlayCircle,
  QuestionCircle,
} from "react-bootstrap-icons";

import { EntityTypes } from "../entities/entities.types";

interface OffcanvasHeaderWithTypeProps {
  children?: React.ReactNode;
  entityIcon?: React.ReactNode;
  entityName?: string;
  entityType?: EntityTypes;
  title: string;
}

export default function OffcanvasHeaderWithType({
  children,
  entityIcon: _entityIcon,
  entityName: _entityName,
  entityType,
  title,
}: OffcanvasHeaderWithTypeProps) {
  const entityIcon = _entityIcon ? (
    _entityIcon
  ) : entityType === "data-connector" ? (
    <Database className="me-1" />
  ) : entityType === "session-launcher" ? (
    <PlayCircle className="me-1" />
  ) : entityType === "job-launcher" ? (
    <Gear className="me-1" />
  ) : entityType === "code-repository" ? (
    <FileCode className="me-1" />
  ) : (
    <QuestionCircle className="me-1" />
  );

  const entityName = _entityName
    ? _entityName
    : entityType === "data-connector"
    ? "Data connector"
    : entityType === "session-launcher"
    ? "Session launcher"
    : entityType === "code-repository"
    ? "Code repository"
    : "Unknown";

  return (
    <div>
      <div className={cx("small", "text-muted")}>
        {entityIcon}
        {entityName}
      </div>
      <h2
        className={cx("mb-0", "text-break")}
        data-cy={entityType ? `${entityType}-title` : undefined}
      >
        {children && <div className={cx("float-end", "ms-2")}>{children}</div>}
        {title}
      </h2>
    </div>
  );
}
