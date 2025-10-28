import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import useLegacySelector from "~/utils/customHooks/useLegacySelector.hook";
import cx from "classnames";
import { useContext } from "react";
import { ArrowRight, BoxArrowUpRight } from "react-bootstrap-icons";
import { Link } from "react-router";
import { WarnAlert } from "../../../components/Alert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import SunsetV1Button from "./SunsetV1Button";

export default function SunsetBanner() {
  const user = useLegacySelector((state) => state.stateModel.user);
  const userLoggedIn = !!user?.data?.name;
  const { params } = useContext(AppContext);
  const supportLegacySessions =
    params?.LEGACY_SUPPORT.supportLegacySessions ??
    DEFAULT_APP_PARAMS.LEGACY_SUPPORT.supportLegacySessions;

  const migrateProjectsMessage = userLoggedIn && (
    <p className="mb-2">
      Migrate your projects to Renku 2.0 to continue creating and managing your
      work.
    </p>
  );
  const preparationMessage = supportLegacySessions ? (
    <p>
      In preparation for Renku Legacy being discontinued, project and dataset
      creation are no longer available. Starting on August 2025, you won{"'"}t
      be able to start new sessions in Renku Legacy.
    </p>
  ) : (
    <p>
      In preparation for Renku Legacy being discontinued, project/dataset
      creation and sessions are no longer available in Renku Legacy.
    </p>
  );

  return (
    <WarnAlert data-cy="sunset-banner">
      <h4>Renku Legacy will be discontinued in October 2025</h4>
      {migrateProjectsMessage}
      {preparationMessage}
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
