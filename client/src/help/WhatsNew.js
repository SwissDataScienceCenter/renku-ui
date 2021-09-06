import React from "react";

import { Row, Col } from "reactstrap";

import Look from "./Graphics/Look.jpg";
import Sessions from "./Graphics/Sessions.jpg";
import Context from "./Graphics/Context.jpg";

function WhatsNew1_0_0({ className = "mt-5" }) {
  return <Row className={className}>
    <Col className="d-md-flex rk-home-gallery">
      <div>
        <div className="text-center"><img alt="new look" src={Look} width="100%" /></div>
        <h3 className="rk-pt-s">New Look</h3>
        <p>
          The change you will most immediately notice is the new look. There is a new logo, a new color
          palette, and a cleaner visual style. We think you will like the new appearance of RenkuLab.
        </p>
      </div>
      <div>
        <div className="text-center"><img alt="better sessions" src={Sessions} width="100%" /></div>
        <h3 className="rk-pt-s">Better Sessions</h3>
        <p>
          Sessions (previously &ldquo;Interactive Environments&rdquo;) have been dramatically redesigned.
          You can now start sessions at the click of a button, and we have made it easier to access
          information and documentation while working within a session.
        </p>
      </div>
      <div>
        <div className="text-center"><img alt="clearer context" src={Context} width="100%" /></div>
        <h3 className="rk-pt-s">Clearer Context</h3>
        <p>
          RenkuLab has always integrated GitLab, and we have made it easier and more intuitive to access. Take
          full advantage of the power of GitLab without losing track of the RenkuLab context.
        </p>
      </div>
    </Col>
  </Row>;
}

export { WhatsNew1_0_0 };
