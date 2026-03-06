import cx from "classnames";
import { CircleFill } from "react-bootstrap-icons";
import { Link, useLocation } from "react-router";

import { ErrorAlert, WarnAlert } from "~/components/Alert";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import {
  Connection,
  Provider,
} from "~/features/connectedServices/api/connectedServices.generated-api";
import {
  SEARCH_PARAM_ACTION_REQUIRED,
  SEARCH_PARAM_PROVIDER,
  SEARCH_PARAM_SOURCE,
} from "~/features/connectedServices/connectedServices.constants";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { PROVIDER_OPTIONS } from "./deposits.const";

interface DepositIntegrationInfoProps {
  connection?: Connection;
  isError?: boolean;
  isLoading?: boolean;
  provider?: Provider;
}
export default function DepositIntegrationInfo({
  connection,
  isError,
  isLoading,
  provider,
}: DepositIntegrationInfoProps) {
  const { pathname, hash } = useLocation();
  if (isLoading) return null;

  const link = provider && (
    <Link
      to={{
        pathname: ABSOLUTE_ROUTES.v2.integrations,
        search: new URLSearchParams({
          [SEARCH_PARAM_PROVIDER]: provider.id,
          [SEARCH_PARAM_SOURCE]: `${pathname}${hash}`,
          [SEARCH_PARAM_ACTION_REQUIRED]: "true",
        }).toString(),
      }}
    >
      {PROVIDER_OPTIONS.find((option) => option.value === provider.kind)
        ?.label || provider.display_name}
    </Link>
  );

  if (isError) {
    return (
      <ErrorAlert>
        <h3>Fatal error</h3>
        <p className="mb-0">
          Error loading connection information for the deposit provider. Try
          again later.
        </p>
      </ErrorAlert>
    );
  }
  if (!provider) {
    return (
      <ErrorAlert>
        <h3>Admin action required</h3>
        <p className="mb-0">
          The deposit provider is not available. Please contact a Renku
          administrator.
        </p>
      </ErrorAlert>
    );
  }
  if (!connection || connection.status !== "connected") {
    return (
      <WarnAlert>
        <h3>Action required</h3>
        <p className="mb-0">
          Please connect with the {link} Renku integration first.
        </p>
      </WarnAlert>
    );
  }
  return (
    <div className={cx("align-items-center", "d-flex", "gap-2")}>
      <span>Provider connection:</span>
      <RenkuBadge
        className={cx("align-items-center", "d-flex", "fw-semibold", "gap-1")}
        color="success"
      >
        <CircleFill />
        active
      </RenkuBadge>
    </div>
  );
}
