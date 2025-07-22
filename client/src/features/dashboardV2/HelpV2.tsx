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
import cx from "classnames";
import { useContext } from "react";
import {
  ChatSquareDots,
  FileEarmarkText,
  Github,
  JournalText,
  Share,
} from "react-bootstrap-icons";
import { Route, Routes } from "react-router";
import { Card, CardBody, CardHeader, Col, Nav, NavItem, Row } from "reactstrap";
import { ExternalIconLink } from "../../components/ExternalLinks";
import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import HelpRelease from "../../help/HelpRelease";
import PrivacyPolicy from "../../help/PrivacyPolicy";
import TermsOfService from "../../help/TermsOfService";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
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
    <Nav tabs className="mb-3">
      <NavItem>
        <RenkuNavLinkV2 end to={ABSOLUTE_ROUTES.v2.help.root}>
          Getting Help
        </RenkuNavLinkV2>
      </NavItem>
      {isStatusConfigured(statuspageId) && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.status}>
            Status
          </RenkuNavLinkV2>
        </NavItem>
      )}
      <NavItem>
        <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.release}>
          Release Information
        </RenkuNavLinkV2>
      </NavItem>
      {termsConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.tos}>
            Terms of Use
          </RenkuNavLinkV2>
        </NavItem>
      )}
      {privacyPolicyConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.privacy}>
            Privacy Policy
          </RenkuNavLinkV2>
        </NavItem>
      )}
    </Nav>
  );
}

interface HelpCardBodyContentProps {
  children: React.ReactNode;
  url: string;
}
function HelpCardBodyContent({ children, url }: HelpCardBodyContentProps) {
  return (
    <a
      className={cx(
        "link-primary",
        "stretched-link",
        "text-body",
        "text-decoration-none"
      )}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  );
}

function HelpGetting() {
  return (
    <div>
      <p>
        There are several channels available for getting help with RenkuLab.
        Depending on your needs, one or another may be better for you.
      </p>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Card className="h-100">
            <CardHeader>
              <h4 className="mb-0">
                <ExternalIconLink
                  url={Links.RENKU_2_DOCUMENTATION}
                  icon={<FileEarmarkText className={cx("bi", "me-1")} />}
                  text="RenkuLab Documentation"
                />
              </h4>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={Links.RENKU_2_DOCUMENTATION}>
                <p className="mb-0">
                  Find tutorials, how-to guides, and reference materials for
                  learning how to use Renku.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="h-100">
            <CardHeader>
              <h4 className="mb-0">
                <ExternalIconLink
                  url={Links.RENKU_2_COMMUNITY_PORTAL}
                  icon={<Share className={cx("bi", "me-1")} />}
                  text="Renku Community Portal"
                />
              </h4>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={Links.RENKU_2_COMMUNITY_PORTAL}>
                <p className="mb-0">
                  Find dedicated best practices for teaching, research and
                  events with Renku, information about community events, how to
                  access dedicated compute resources, the Renku roadmap, and
                  much more.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="h-100">
            <CardHeader>
              <h4 className="mb-0">
                <ExternalIconLink
                  url={Links.DISCOURSE}
                  icon={<JournalText className={cx("bi", "me-1")} />}
                  text="Forum"
                />
              </h4>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={Links.DISCOURSE}>
                <p className="mb-0">
                  We maintain a help forum for discussion about Renku. This is a
                  good place to ask questions and find answers.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="h-100">
            <CardHeader>
              <h4 className="mb-0">
                <ExternalIconLink
                  url={Links.GITTER}
                  icon={<ChatSquareDots className={cx("bi", "me-1")} />}
                  text="Gitter"
                />
              </h4>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={Links.GITTER}>
                <p className="mb-0">
                  Want to reach out to the development team live? Contact us on
                  Gitter, we would be happy to chat with you.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="h-100">
            <CardHeader>
              <h4 className="mb-0">
                <ExternalIconLink
                  url={Links.GITHUB}
                  icon={<Github className={cx("bi", "me-1")} />}
                  text="GitHub"
                />
              </h4>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={Links.GITHUB}>
                <p className="mb-0">
                  Renku is open source and being developed on GitHub. This is
                  the best place to report issues and ask for new features, but
                  feel free to contact us with questions, comments, or any kind
                  of feedback.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
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
    <Row>
      <Col xs={12}>
        <h2>Help</h2>
      </Col>
      <Col xs={12}>
        <HelpNav statuspageId={statuspageId} />
      </Col>
      <Col xs={12}>
        <HelpContent />
      </Col>
    </Row>
  );
}
