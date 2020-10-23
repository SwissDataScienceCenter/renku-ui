
import React, { Component } from "react";

import { Link } from "react-router-dom";
import { Row, Col, Alert, Button, Spinner, Card, CardBody, CardHeader } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { ExternalLink, Loader } from "../../utils/UIComponents";
import { ACCESS_LEVELS } from "../../api-client";
import { MigrationStatus } from "../Project";

class ProjectVersionStatus extends Component {
  render() {
    const loading = this.props.isLoading;
    const migration_required = this.props.migration.migration_required;
    const project_supported = this.props.migration.project_supported;
    const docker_update_possible = this.props.migration.docker_update_possible;
    const latest_version = this.props.migration.latest_version;
    const project_version = this.props.migration.project_version;
    const template_update_possible = this.props.migration.template_update_possible;
    const latest_template_version = this.props.migration.latest_template_version;
    const current_template_version = this.props.migration.current_template_version;
    const migration_status = this.props.migration.migration_status;
    const check_error = this.props.migration.check_error;
    const migration_error = this.props.migration.migration_error;
    const maintainer = this.props.visibility.accessLevel >= ACCESS_LEVELS.MAINTAINER;


    const pleaseContactTheDevelopmentTeam = <span>please contact the development team on &nbsp;
      <a href="https://gitter.im/SwissDataScienceCenter/renku"
        target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
      <a href="https://github.com/SwissDataScienceCenter/renku/issues"
        target="_blank" rel="noreferrer noopener">GitHub</a>.</span>;

    const migrationErrorMessage = migration_error ? <div>
      There was an error while trying to upgrade your project.&nbsp;
      You can try again, if the problem persists {pleaseContactTheDevelopmentTeam}
      <br /><br />
      <strong>Error: </strong>{migration_error.reason}
    </div> : null;

    const templateMigrationErrorMessage = migration_error ? <div>
      There was an error while trying to upgrade your project template.&nbsp;
      You can try again, if the problem persists {pleaseContactTheDevelopmentTeam}
      <br /><br />
      <strong>Error: </strong>{migration_error.reason}
    </div> : null;

    const migrationRequiredMessage = <div><FontAwesomeIcon icon={faExclamationTriangle} /> A new
      version of < strong > renku</strong > is availabe.<br/> <br/>
      This project is currently using an older version of renku.
      A migration is necessary to make changes to datasets and is recommended for all projects.<br/><br/></div>;

    const templateMigrationRequiredMessage = <div><FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;
      A new version of the <strong>project template</strong> is available.
      You can learn more about the changes in the template repository.
      <br /><br /></div>;

    const updateProjectButton = <Col align="right">
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
    </Col>;

    //check if this is correct... maybe we can use the other button instead
    const updateOnlyTemplateButton = <Col align="right">
      <Button
        color="warning"
        disabled={migration_status === MigrationStatus.MIGRATING}
        onClick={()=>this.props.onMigrateProject({ skip_migrations: true, skip_docker_update: true })}>
        {migration_status === MigrationStatus.MIGRATING ?
          <span>
            <Spinner size="sm" /> Updating...
          </span>
          :
          "Update"
        }
      </Button>
    </Col>;

    const maintainerMessage = <strong>You do not have sufficient rights to upgrade this project, but&nbsp;
      a project maintainer can do this. <ExternalLink role="text" size="sm"
      title="Contact a maintainer" url={`${this.props.externalUrl}/project_members`} />
      .</strong>;

    const updateTheProjectManually = <span>
      update the project manually by launching&nbsp;
      an < Link to = {this.props.launchNotebookUrl} > interactive environment</Link > and follow the
      {/* eslint-disable-next-line max-len */ }
      <a href="https://renku.readthedocs.io/en/latest/user/upgrading_renku.html#upgrading-your-image-to-use-the-latest-renku-cli-version">
			&nbsp;instructions for upgrading</a>.
      When finished, you will need to run < i > renku migrate</i >.&nbsp;
      If you encounter any problems or have any questions, {pleaseContactTheDevelopmentTeam}
    </span>;

    if (loading || (migration_required === null && migration_error === null))
      return <Loader />;

    return <Card key="storage-stats" className="border-0">
      <CardHeader>Renku Version</CardHeader>
      <CardBody>
        <Col md={10} sm={12}>
          <Row>
            <Col>
              <p>
                <strong>Project Version:</strong> {project_version}<br />
                <strong>Latest Renku Version:</strong> {latest_version}
              </p>
              { migration_required ?
                <Alert color="warning">
                  {migrationRequiredMessage}
                  {migration_status === MigrationStatus.ERROR
									&& (migration_error.dockerfile_update_failed || migration_error.migrations_failed) ?
                    migrationErrorMessage : null
                  }
                  { !maintainer ? maintainerMessage
                    : project_supported && docker_update_possible ?
                      <div>
                        {updateProjectButton}
                        <br /><br />
                        Or, if you prefer, you can {updateTheProjectManually}
                      </div>
                      : <span>
                        <strong>This project&apos;s renku version cannot be upgraded automatically</strong>.
                        <br /><br />
                        You will need to {updateTheProjectManually}
                      </span>
                  }
                </Alert>
                :
                check_error ?
                  <Alert color="danger">
                    There was an error while performing the migration check, you can&nbsp;
                    <Button color="danger" size="sm" onClick={() => window.location.reload()}>
                      reload</Button> the page and try again.
                    If the problem persists {pleaseContactTheDevelopmentTeam}
                    <br></br>
                    <br></br>
                    <strong>Error Message: </strong> {check_error}
                  </Alert>
                  : migration_required === false ?
                    null //do we need this null here?
                    : <Loader />
              }
            </Col>
          </Row>
        </Col>
      </CardBody>
      <CardHeader key="templateHeader">Project Template</CardHeader>
      <CardBody key="templateBody">
        <Col md={10} sm={12}>
          <Row>
            <Col>
              <p>
                <strong>Template Version:</strong>&nbsp;
                {current_template_version === null ? "null" : current_template_version}<br />
                <strong>Latest Template Version:</strong>&nbsp;
                {latest_template_version === null ? "null" : latest_template_version}
              </p>
              { template_update_possible === true ?
                <Alert color="warning">
                  {templateMigrationRequiredMessage}
                  {
                    !project_supported || !docker_update_possible ?
                      maintainer ? updateOnlyTemplateButton : maintainerMessage
                      : <span>Upgrading the Renku Version automatically will also upgrade the template.</span>
                  }
                  {
                    migration_status === MigrationStatus.ERROR && migration_error.template_update_failed ?
                      templateMigrationErrorMessage : null
                  }
                </Alert>
                :
                check_error ?
                  <Alert color="danger">
                    There was an error while performing the template version check, you can&nbsp;
                    <Button color="danger" size="sm" onClick={() => window.location.reload()}>
                      reload</Button> the page and try again.
                    If the problem persists {pleaseContactTheDevelopmentTeam}
                    <br></br>
                    <br></br>
                    <strong>Error Message: </strong> {check_error}
                  </Alert>
                  : current_template_version === null ?
                    <p>This project&apos;s template can&apos;t be updated because it has no template version,
                      this project was created before migrations where available.</p>
                    : current_template_version !== undefined ? null //do we need this here???
                      : <Loader />
              }
            </Col>
          </Row>
        </Col>
      </CardBody>
    </Card>;
  }
}
export default ProjectVersionStatus;
