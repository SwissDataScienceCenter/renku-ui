import cx from "classnames";
import { ArrowRight, BoxArrowUpRight } from "react-bootstrap-icons";
import { Link } from "react-router";
import { WarnAlert } from "../../../components/Alert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import SunsetV1Button from "./SunsetV1Button";

export default function SunsetBanner() {
  return (
    <WarnAlert>
      <h4>Project creation no longer available</h4>
      <p>
        You can no longer create new projects or datasets in Renku Legacy.
        Switch to Renku 2.0 to continue creating and managing your work.
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
