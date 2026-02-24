import cx from "classnames";
import { Link } from "react-router";
import { Col, Row } from "reactstrap";

import { useLoginUrl } from "../../../../authentication/useLoginUrl.hook";
import { HomeHeader } from "../../AnonymousHome";
import heroGraphic from "../../assets/heroBoxes.svg";
import { useCustomHomePageProjectUrl } from "../../hooks/useCustomHomePageProjectUrl.hook";

export default function HeroLanding() {
  const loginUrl = useLoginUrl();
  const projectUrl = useCustomHomePageProjectUrl();

  return (
    <div id="rk-anon-home-hero" className="bg-navy">
      <HomeHeader />
      <div className={cx("container", "py-5", "px-3")}>
        <Row>
          <Col xs={12} lg={7}>
            <div className={cx("pe-0", "pe-lg-5")}>
              <h1 className="text-white">
                Connecting data, code, compute, and{" "}
                <span className="fst-italic">people</span>.
              </h1>
              <img
                src={heroGraphic}
                alt="Renku"
                className={cx("w-100", "d-block", "d-lg-none", "my-4")}
              />
              <p className={cx("fs-2", "text-white", "my-4")}>
                One seamless platform powering collaboration in your project,
                team, and community.
              </p>
              <div
                className={cx(
                  "d-flex",
                  "gap-3",
                  "mt-3",
                  "mt-md-4",
                  "flex-sm-row",
                  "flex-column"
                )}
              >
                <a
                  className={cx("btn", "btn-primary", "btn-lg")}
                  id="hero_link-sign_up"
                  href={loginUrl.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Create an account
                </a>
                <Link
                  className={cx("btn", "btn-outline-light", "btn-lg")}
                  to={projectUrl}
                  data-cy={`explore-a-project-hero-btn`}
                  target="_blank"
                >
                  Explore a project
                </Link>
              </div>
            </div>
          </Col>
          <Col xs={12} lg={5} className={cx("text-center", "text-lg-end")}>
            <img
              src={heroGraphic}
              alt="Renku"
              className={cx("w-100", "d-none", "d-lg-block")}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
