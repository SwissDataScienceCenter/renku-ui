import cx from "classnames";
import { ArrowRight, BoxArrowUpRight } from "react-bootstrap-icons";
import { Link } from "react-router";
import { WarnAlert } from "../../../components/Alert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import SunsetV1Button from "./SunsetV1Button";

export default function SunsetBanner() {
  return (
    <WarnAlert>
      <h4>Feature Unavailable</h4>
      <p>
        You won’t be able to create new projects or datasets in Renku Legacy
        after July 15, 2025. This is in preparation for Renku Legacy being fully
        discontinued in October 2025. Our transition guide will help walk you
        through migrating to Renku 2.0 for enhanced features and continued
        access to your work.
      </p>
      <Link
        to={ABSOLUTE_ROUTES.v2.root}
        className={cx("btn", "btn-sm", "btn-warning", "me-2")}
      >
        Go to Renku 2.0
        <ArrowRight className={cx("bi", "ms-1")} />
      </Link>
      <SunsetV1Button outline color="warning">
        View transition guide
        <BoxArrowUpRight className="bi ms-1" />
      </SunsetV1Button>
    </WarnAlert>
  );
}
