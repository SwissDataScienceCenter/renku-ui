/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
import { faDiscourse, faGitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useContext } from "react";
import { Github } from "react-bootstrap-icons";
import { Route, Routes } from "react-router-dom-v5-compat";
import { Nav, NavItem } from "reactstrap";
import {
  ExternalDocsLink,
  ExternalIconLink,
} from "../../components/ExternalLinks";
import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import HelpRelease from "../../help/HelpRelease";
import PrivacyPolicy from "../../help/PrivacyPolicy";
import TermsOfService from "../../help/TermsOfService";
import { isStatusConfigured } from "../../statuspage";
import { Links } from "../../utils/constants/Docs";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import StatusSummary from "../platform/components/StatusSummary";

type HelpNavProps = {
  statuspageId: string;
};
function HelpNav({ statuspageId }: HelpNavProps) {
  const { params } = useContext(AppContext);
  if (params == null) return null;
  const privacyPolicyConfigured = params.TERMS_PAGES_ENABLED;
  const termsConfigured = privacyPolicyConfigured;
  return (
    <Nav
      pills
      className={cx(
        "d-flex",
        "flex-row",
        "flex-lg-column",
        "nav-pills-underline",
        "text-nowrap"
      )}
    >
      <h4 className={cx("d-none", "d-lg-block")}>Help</h4>
      <NavItem>
        <RenkuNavLinkV2 end to=".">
          Getting Help
        </RenkuNavLinkV2>
      </NavItem>
      {isStatusConfigured(statuspageId) && (
        <NavItem>
          <RenkuNavLinkV2 to="status">Status</RenkuNavLinkV2>
        </NavItem>
      )}
      <NavItem>
        <RenkuNavLinkV2 to="release">Release Information</RenkuNavLinkV2>
      </NavItem>
      {termsConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to="tos">Terms of Use</RenkuNavLinkV2>
        </NavItem>
      )}
      {privacyPolicyConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to="privacy">Privacy Policy</RenkuNavLinkV2>
        </NavItem>
      )}
    </Nav>
  );
}

function HelpGetting() {
  const flexBasis = "500px";
  return (
    <>
      <div key="intro" className={cx("d-flex", "mb-3")}>
        <div style={{ flex: "0 1", flexBasis }}>
          There are several channels available for getting help with RenkuLab.
          Depending on your needs, one or another may be better for you.
        </div>
      </div>
      <div key="main1" className={cx("d-flex", "mb-3", "flex-wrap")}>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.DISCOURSE}
              icon={<FontAwesomeIcon icon={faDiscourse} color="dark" />}
              text="Forum"
            />
          </h3>
          <p>
            We maintain a{" "}
            <ExternalDocsLink url={Links.DISCOURSE} title="help forum" /> for
            discussion about Renku. This is a good place to ask questions and
            find answers.
          </p>
        </div>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.GITTER}
              icon={<FontAwesomeIcon icon={faGitter} color="dark" />}
              text="Gitter"
            />
          </h3>
          <p>
            Want to reach out to the development team live? Contact us on{" "}
            <ExternalDocsLink url={Links.GITTER} title="Gitter" />, we would be
            happy to chat with you.
          </p>
        </div>
        <div className="me-4" style={{ flex: "0 1", flexBasis }}>
          <h3>
            <ExternalIconLink
              url={Links.GITHUB}
              icon={<Github className="bi" />}
              text="GitHub"
            />
          </h3>
          <p>
            Renku is open source and being developed on{" "}
            <ExternalDocsLink url={Links.GITHUB} title="GitHub" />. This is the
            best place to report issues and ask for new features, but feel free
            to contact us with questions, comments, or any kind of feedback.
          </p>
        </div>
      </div>
    </>
  );
}

function HelpContent() {
  return (
    <Routes>
      <Route path="/" element={<HelpGetting />} />
      <Route path="contact" element={<HelpGetting />} />
      <Route path="status" element={<StatusSummary />} />
      <Route path="release" element={<HelpRelease />} />
      <Route path="tos" element={<TermsOfService />} />
      <Route path="privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default function Help() {
  const { params } = useContext(AppContext);
  const statuspageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  return (
    <div className={cx("d-flex", "flex-column", "flex-lg-row")}>
      <div className="me-lg-5">
        <HelpNav statuspageId={statuspageId} />
      </div>
      <div className={cx("mt-4", "mt-lg-0")}>
        <HelpContent />
      </div>
    </div>
  );
}
