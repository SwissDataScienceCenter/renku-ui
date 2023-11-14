import cx from "classnames";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { HomeHeader } from "../AnonymousHome";
import heroGraphic from "../Graphics/hero_graph.svg";
import { AnonymousHomeConfig } from "../anonymousHome.types";
import styles from "./HeroLanding.module.scss";

interface HeroLandingProps extends AnonymousHomeConfig {
  scrollToGetStarted: () => void;
}
export default function HeroLanding(props: HeroLandingProps) {
  const { scrollToGetStarted } = props;

  return (
    <div id="rk-anon-home-hero" className="rk-bg-shaded-dark">
      <HomeHeader {...props} />
      <div className="rk-anon-home-section-content">
        <div id={styles.heroContainer}>
          <div className={styles.heroTitle}>
            <h1 className="text-white">Connecting the research ecosystem</h1>
          </div>
          <div className={styles.heroGraphic}>
            <img src={heroGraphic} alt="Renku" className="graphicHero" />
          </div>
          <div className={styles.heroDescription}>
            <h2 className="text-white">
              The research ecosystem is fragmented.
              <span className={cx(["d-lg-block", "d-sm-inline"])}>
                {" "}
                Renku is where it comes together.
              </span>
            </h2>
            <p>Data, Code, and Compute all under one roof.</p>
            <div
              className={cx([
                "d-flex",
                "gap-3",
                "pt-5",
                "pt-md-3",
                "flex-sm-row",
                "flex-column",
              ])}
            >
              <Button
                className={cx(["btn", "btn-rk-green", styles.heroBtn])}
                role="button"
                id="link-try-it-out"
                onClick={scrollToGetStarted}
              >
                Try it out
              </Button>
              <Link
                className={cx(["btn", "btn-outline-secondary", styles.heroBtn])}
                role="button"
                id="hero_link-sign_up"
                to="/login"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
