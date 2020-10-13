
import React, { Component } from "react";

import { Link } from "react-router-dom";
import { Row, Col, Alert, Button, Spinner, Card, CardBody, CardHeader } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ExternalLink, Loader } from "../../utils/UIComponents";
import { ACCESS_LEVELS } from "../../api-client";
import { MigrationStatus } from "../Project";


class ProjectViewVersion extends Component {
  render() {
    const loading = this.props.isLoading;
    const migration_required = this.props.migration.migration_required;
    const project_supported = this.props.migration.project_supported;
    const docker_update_possible = this.props.migration.docker_update_possible;
    const latest_version = this.props.migration.latest_version;
    const project_version = this.props.migration.project_version;
    const template_update_possible = this.props.migration.template_update_possible;
    const migration_status = this.props.migration.migration_status;
    const check_error = this.props.migration.check_error;
    const migration_error = this.props.migration.migration_error;
    const maintainer = this.props.visibility.accessLevel >= ACCESS_LEVELS.MAINTAINER;

    if (loading || (migration_required === null && migration_error === null))
      return <Loader />;

    return <Card key="storage-stats" className="border-0">
      <CardHeader>Renku Version</CardHeader>
      <CardBody>
        <Col md={10} sm={12}>
          <Row>
            <Col>
              {migration_required ?
                <Alert color="warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> A new
                  version of <strong>renku</strong> is availabe.
                  <br /><br />
                  This project is currently using an older version of renku.
                  A migration is necessary to make changes to datasets and is recommended for all projects.
                  <br /><br />
                  {
                    migration_status === MigrationStatus.ERROR ?
                      <div>
                        There was an error while trying to upgrade your project. Please try again,
                        if the problem persists you should contact the development team on&nbsp;
                        <a href="https://gitter.im/SwissDataScienceCenter/renku"
                          target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
                        <a href="https://github.com/SwissDataScienceCenter/renku/issues"
                          target="_blank" rel="noreferrer noopener">GitHub</a>.
                        <br /><br />
                        <strong>Error: </strong>{migration_error}
                      </div>
                      : null
                  }
                  {
                    project_supported ?
                      maintainer ?
                        <div>
                          <Col align="right">
                            <Button
                              color="warning"
                              disabled={migration_status === MigrationStatus.MIGRATING}
                              onClick={this.props.onMigrateProject}>
                              {migration_status === MigrationStatus.MIGRATING ?
                                <span>
                                  <Spinner size="sm" /> Updating...
                                </span>
                                :
                                "Update"
                              }
                            </Button>
                          </Col>
                          <br /><br />
                          Or, if you prefer, you can update the project manually by launching&nbsp;
                          an <Link to={this.props.launchNotebookUrl}>interactive environment</Link> and follow the
                          {/* eslint-disable-next-line max-len */}
                          <a href="https://renku.readthedocs.io/en/latest/user/upgrading_renku.html#upgrading-your-image-to-use-the-latest-renku-cli-version">
														&nbsp;instructions for upgrading</a>.
                          When finished, you will need to run <i>renku migrate</i>.&nbsp;
                          If you encounter any problems or have any questions,&nbsp;
                          please contact the development team on&nbsp;
                          <a href="https://gitter.im/SwissDataScienceCenter/renku"
                            target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
                          <a href="https://github.com/SwissDataScienceCenter/renku/issues"
                            target="_blank" rel="noreferrer noopener">GitHub</a>.

                        </div>
                        : <strong>You do not have sufficient rights to upgrade this project, but
                          a project maintainer can do this. <ExternalLink role="text" size="sm"
                          title="Contact a maintainer" url={`${this.props.externalUrl}/project_members`} />
                          .</strong>
                      : <span>
                        <strong>This project&apos;s renku version cannot be upgraded automatically</strong>.
                        <br /><br />
                        You can launch an <Link to={this.props.launchNotebookUrl}>
                          interactive environment</Link> and follow the&nbsp;
                        {/* eslint-disable-next-line max-len */}
                        <a href="https://renku.readthedocs.io/en/latest/user/upgrading_renku.html#upgrading-your-image-to-use-the-latest-renku-cli-version">
													&nbsp;instructions for upgrading</a>.&nbsp;
                        When finished, you will need to run <i>renku migrate</i>.&nbsp;
                        If you encounter any problems or have any questions,&nbsp;
                        please contact the development team on&nbsp;
                        <a href="https://gitter.im/SwissDataScienceCenter/renku"
                          target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
                        <a href="https://github.com/SwissDataScienceCenter/renku/issues"
                          target="_blank" rel="noreferrer noopener">GitHub</a>.
                      </span>
                  }
                </Alert>
                :
                check_error !== undefined ?
                  <Alert color="danger">
                    There was an error while performing the migration check, please reload the page and try again.
                    If the problem persists you should contact the development team on&nbsp;
                    <a href="https://gitter.im/SwissDataScienceCenter/renku"
                      target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
                    <a href="https://github.com/SwissDataScienceCenter/renku/issues"
                      target="_blank" rel="noreferrer noopener">GitHub</a>.
                    <br></br>
                    <br></br>
                    <strong>Error Message: </strong> {check_error}
                  </Alert>
                  : migration_required === false ?
                    <Alert color="success">
                      <FontAwesomeIcon icon={faCheck} /> The current renku version is compatible with RenkuLab.
                    </Alert>
                    : <Loader />
              }
            </Col>
          </Row>
        </Col>
      </CardBody>
    </Card>;
  }
}
export default ProjectViewVersion;
