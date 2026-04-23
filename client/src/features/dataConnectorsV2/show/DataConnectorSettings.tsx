import cx from "classnames";
import { PersonGear, Sliders } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader } from "reactstrap";

export default function DataConnectorSettings() {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <section>
        <Card data-cy="data-connector-general-settings">
          <CardHeader>
            <h2 className="mb-0">
              <Sliders className={cx("me-1", "bi")} />
              General settings
            </h2>
          </CardHeader>
          <CardBody>
            {/* <GroupMetadataForm group={group} /> */}
            WIP
          </CardBody>
        </Card>
      </section>

      <section>
        <Card data-cy="data-connector-members-settings">
          <CardHeader>
            <h2 className="mb-0">
              <PersonGear className={cx("me-1", "bi")} />
              Data Connector Members
            </h2>
          </CardHeader>
          <CardBody>
            {/* <GroupSettingsMembers group={group} /> */}
            WIP
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
