import cx from "classnames";
import { Link, useLocation } from "react-router";
import LearnAboutV2Button from "../../features/projectsV2/shared/LearnAboutV2Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AnnounceV2 from "./Graphics/AnnounceV2.svg";

export default function AnnounceV2Banner() {
  const location = useLocation();
  if (
    location.pathname !== ABSOLUTE_ROUTES.v1.root &&
    location.pathname !== `${ABSOLUTE_ROUTES.v1.root}/`
  )
    return;
  return (
    <div
      data-cy="announce-v2-banner"
      className={cx(
        "bg-white",
        "d-flex",
        "align-items-center",
        "justify-content-center",
        "mb-3",
        "p-3"
      )}
    >
      <div className={cx("me-4", "d-none", "d-xxl-block")}>
        <img src={AnnounceV2} alt="announcement for v2" />
      </div>
      <div className={cx("fs-5", "fw-medium", "me-3")}>
        Connecting data, code, compute, and{" "}
        <b>
          <i>people</i>
        </b>
        .
      </div>
      <div className="me-3">
        <Link to={ABSOLUTE_ROUTES.root} className={cx("btn", "btn-primary")}>
          Explore Renku 2.0
        </Link>
      </div>
      <div>
        <LearnAboutV2Button />
      </div>
    </div>
  );
}
