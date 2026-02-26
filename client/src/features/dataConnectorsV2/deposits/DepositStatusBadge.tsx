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
    status === "complete"
      ? "info"
      : status === "in_progress"
      ? "warning"
      : status === "cancelled" || status === "missing"
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
      {startCase(status)}
    </RenkuBadge>
  );
}
