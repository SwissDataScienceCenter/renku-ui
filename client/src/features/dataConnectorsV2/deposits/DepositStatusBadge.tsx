import cx from "classnames";
import { startCase } from "lodash-es";
import { CircleFill } from "react-bootstrap-icons";

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { DepositStatus } from "../api/data-connectors.api";

interface DepositStatusBadgeProps {
  status?: DepositStatus;
}
export default function DepositStatusBadge({
  status,
}: DepositStatusBadgeProps) {
  const badgeColor =
    status === "complete" || status === "upload_complete"
      ? "info"
      : status === "in_progress"
      ? "warning"
      : status === "failed"
      ? "danger"
      : "light";

  return (
    <RenkuBadge
      className="fw-normal"
      color={badgeColor}
      data-cy="code-repository-permission-badge"
      pill
    >
      <CircleFill className={cx("me-1", "bi")} />
      {status ? startCase(status) : "Unknown"}
    </RenkuBadge>
  );
}
