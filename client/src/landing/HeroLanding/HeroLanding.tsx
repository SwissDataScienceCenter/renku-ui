import cx from "classnames";
import { Button, Col, Row } from "reactstrap";

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import { HomeHeader } from "../AnonymousHome";
import heroGraphic from "../Graphics/heroBoxes.svg";
import { AnonymousHomeConfig } from "../anonymousHome.types";

import styles from "./HeroLanding.module.scss";

interface HeroLandingProps extends AnonymousHomeConfig {
  scrollToGetStarted: () => void;
}
export default function HeroLanding(props: HeroLandingProps) {
  const { scrollToGetStarted } = props;

  const loginUrl = useLoginUrl();

  return (
    <div id="rk-anon-home-hero" className="bg-navy">
      <HomeHeader {...props} />
      <div className={cx("container", "py-5")}>
        <Row>
          <Col xs={12} lg={6}>
            <h1 className="text-white">
              Connecting data, code, compute, <br />
              and people.
            </h1>
            <img
              src={heroGraphic}
              alt="Renku"
              className={cx("w-100", "d-block", "d-lg-none", "my-5")}
            />
            <h2 className={cx("text-white", "py-4")}>
              One seamless platform powering <br />
              collaboration in your project, team, <br />
              and community.
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
              <Button
                className={cx("btn", styles.heroBtn)}
                color="primary"
                role="button"
                id="link-try-it-out"
                onClick={scrollToGetStarted}
              >
                Explore a project
              </Button>
              <a
                className={cx("btn", "btn-outline-primary", styles.heroBtn)}
                id="hero_link-sign_up"
                href={loginUrl.href}
              >
                Create an account
              </a>
            </div>
          </Col>
          <Col
            xs={12}
            lg={6}
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
