import cx from "classnames";
import { Link } from "react-router-dom";
import { HomeHeader } from "../AnonymousHome";
import heroGraphic from "../Graphics/hero_graph.svg";
import { AnonymousHomeConfig } from "../anonymousHome.types";
import styles from "./HeroLanding.module.scss";

export default function HeroLanding(props: AnonymousHomeConfig) {
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
            <h3 className="text-white">
              The research ecosystem is fragmented.
              <span className={cx(["d-lg-block", "d-sm-inline"])}>
                {" "}
                Renku is where it comes together.
              </span>
            </h3>
            <p>Data, Code, and Compute all under one roof.</p>
            <div
              className={cx([
                "d-flex",
                "gap-3",
                "pt-5",
                "pt-md-3",
                "flex-md-row",
                "flex-sm-row",
                "flex-column",
              ])}
            >
              <Link
                className={cx([
                  "btn",
                  "btn-rk-green",
                  "heroBtn",
                  styles.heroBtn,
                ])}
                role="button"
                id="link-try-it-out"
                to="#rk-anon-home-get-started"
              >
                Try it out
              </Link>
              <Link
                className={cx([
                  "btn",
                  "btn-outline-secondary",
                  "heroBtn",
                  styles.heroBtn,
                ])}
                role="button"
                id="link-sign_up"
                to="/login"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
