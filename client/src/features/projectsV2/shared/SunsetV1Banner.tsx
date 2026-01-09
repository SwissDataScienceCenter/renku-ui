import cx from "classnames";
import { ArrowRight, BoxArrowUpRight } from "react-bootstrap-icons";
import { Link } from "react-router";

import useLegacySelector from "~/utils/customHooks/useLegacySelector.hook";
import { WarnAlert } from "../../../components/Alert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import SunsetV1Button from "./SunsetV1Button";

export default function SunsetBanner() {
  const user = useLegacySelector((state) => state.stateModel.user);
  const userLoggedIn = !!user?.data?.name;

  const migrateProjectsMessage = userLoggedIn && (
    <p className="mb-2">
      Migrate your projects to Renku 2.0 to continue creating and managing your
      work.
    </p>
  );

  return (
    <WarnAlert data-cy="sunset-banner">
      <h4>Renku Legacy will be discontinued in October 2025</h4>
      {migrateProjectsMessage}
      <p>
        In preparation for Renku Legacy being discontinued, project/dataset
        creation and sessions are no longer available in Renku Legacy.
      </p>
      <Link
        to={ABSOLUTE_ROUTES.v2.root}
        className={cx("btn", "btn-sm", "btn-warning", "me-2")}
      >
        Go to Renku 2.0
        <ArrowRight className={cx("bi", "ms-1")} />
      </Link>
      <SunsetV1Button outline color="warning">
        Learn more
        <BoxArrowUpRight className="bi ms-1" />
      </SunsetV1Button>
    </WarnAlert>
  );
}
