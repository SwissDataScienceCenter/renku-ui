import cx from "classnames";
import {
  ChatSquareDots,
  FileEarmarkText,
  Github,
  JournalText,
  Share,
} from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import {
  NEW_DOCS_COMMUNITY_PORTAL,
  NEW_DOCS_DOCUMENTATION,
} from "~/utils/constants/NewDocs";
import { Links } from "../../utils/constants/Docs";

import helpV2Styles from "./HelpV2.module.scss";

export default function GettingHelp() {
  const cardClasses = cx("h-100", helpV2Styles.linkBgAction);
  return (
    <div>
      <p>
        There are several channels available for getting help with RenkuLab.
        Depending on your needs, one or another may be better for you.
      </p>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Card className={cardClasses}>
            <CardHeader>
              <h2 className="mb-0">
                <ExternalLink icon={null} href={NEW_DOCS_DOCUMENTATION}>
                  <FileEarmarkText className={cx("bi", "me-1")} />
                  RenkuLab Documentation
                </ExternalLink>
              </h2>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={NEW_DOCS_DOCUMENTATION}>
                <p className="mb-0">
                  Find tutorials, how-to guides, and reference materials for
                  learning how to use Renku.
                </p>
              </HelpCardBodyContent>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className={cardClasses}>
            <CardHeader>
              <h2 className="mb-0">
                <ExternalLink icon={null} href={NEW_DOCS_COMMUNITY_PORTAL}>
                  <Share className={cx("bi", "me-1")} />
                  Renku Community Portal
                </ExternalLink>
              </h2>
            </CardHeader>
            <CardBody>
              <HelpCardBodyContent url={NEW_DOCS_COMMUNITY_PORTAL}>
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
          <Card className={cardClasses}>
            <CardHeader>
              <h2 className="mb-0">
                <ExternalLink icon={null} href={Links.DISCOURSE}>
                  <JournalText className={cx("bi", "me-1")} />
                  Forum
                </ExternalLink>
              </h2>
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
          <Card className={cardClasses}>
            <CardHeader>
              <h2 className="mb-0">
                <ExternalLink icon={null} href={Links.GITTER}>
                  <ChatSquareDots className={cx("bi", "me-1")} />
                  Gitter
                </ExternalLink>
              </h2>
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
          <Card className={cardClasses}>
            <CardHeader>
              <h2 className="mb-0">
                <ExternalLink icon={null} href={Links.GITHUB}>
                  <Github className={cx("bi", "me-1")} />
                  GitHub
                </ExternalLink>
              </h2>
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
