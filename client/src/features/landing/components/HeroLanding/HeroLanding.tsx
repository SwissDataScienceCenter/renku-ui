import cx from "classnames";
import { Link } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { useLoginUrl } from "../../../../authentication/useLoginUrl.hook";
import { HomeHeader } from "../../AnonymousHome";
import heroGraphic from "../../assets/heroBoxes.svg";
import { AnonymousHomeConfig } from "../../anonymousHome.types";
import { useCustomHomePageProjectUrl } from "../../hooks/useCustomHomePageProjectUrl.hook";

export default function HeroLanding(props: AnonymousHomeConfig) {
  const loginUrl = useLoginUrl();
  const projectUrl = useCustomHomePageProjectUrl();

  return (
    <div id="rk-anon-home-hero" className="bg-navy">
      <HomeHeader {...props} />
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
                className={cx("w-100", "d-block", "d-lg-none", "my-5")}
              />
              <h2 className={cx("text-white", "py-4")}>
                One seamless platform powering collaboration in your project,
                team, and community.
              </h2>
              <div
                className={cx(
                  "d-flex",
                  "gap-3",
                  "pt-5",
                  "pt-md-3",
                  "flex-sm-row",
                  "flex-column"
                )}
              >
                <a
                  className={cx("btn", "btn-primary", "fs-5")}
                  id="hero_link-sign_up"
                  href={loginUrl.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Create an account
                </a>
                <Link
                  className={cx(
                    "btn",
                    "btn-outline-light",
                    "text-decoration-none",
                    "fs-5"
                  )}
                  to={projectUrl}
                  data-cy={`explore-a-project-hero-btn`}
                  target="_blank"
                >
                  Explore a project
                </Link>
              </div>
            </div>
          </Col>
          <Col
            xs={12}
            lg={5}
            className={cx("text-center", "text-lg-end", "ps-5")}
          >
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
