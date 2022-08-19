import React from "react";
import { Link } from "react-router-dom";

import { WarnAlert } from "../../utils/components/Alert";
import { NotebooksHelper } from "../index";

interface LaunchErrorProps {
  launchError: {
    frontendError: boolean;
    errorMessage: string;
    pipelineError: boolean;
  };
}

interface AutosavesProps {
  autosaves: { error: object | null };
}

interface CiProps extends LaunchErrorProps {
  ci: object;
}

interface CiStatus {
  available: boolean;
}

interface LaunchErrorAlertProps extends AutosavesProps, CiProps {}

function LaunchErrorBackendAlert({ launchError }: LaunchErrorProps) {
  return (
    <WarnAlert>
      The attempt to start a session failed with the following error:
      <div>
        <code>{launchError}</code>
      </div>
      This could be an intermittent issue, so you should try a second time, and
      the session will hopefully start. If the problem persists, you can{" "}
      <Link to="/help">contact us for assistance</Link>.
    </WarnAlert>
  );
}

function LaunchErrorFrontendAlert({ launchError, ci }: CiProps) {
  const ciStatus = NotebooksHelper.checkCiStatus(ci) as CiStatus;
  if (launchError.pipelineError && ciStatus.available) return null;
  return <WarnAlert>{launchError.errorMessage}</WarnAlert>;
}

function AutosavesErrorAlert({ autosaves }: AutosavesProps) {
  if (autosaves.error == null) return null;
  return (
    <WarnAlert>
      <p>Autosaves are currently unavailable.</p>
      <p className="mb-0">
        If you recently worked on the project, any previous unsaved work cannot
        be recovered.
      </p>
    </WarnAlert>
  );
}

function LaunchErrorAlert({
  autosaves,
  launchError,
  ci,
}: LaunchErrorAlertProps) {
  let launchErrorElement = null;
  if (launchError != null) {
    if (launchError.frontendError === true) {
      launchErrorElement = (
        <LaunchErrorFrontendAlert launchError={launchError} ci={ci} />
      );
    }
    else {
      launchErrorElement = (
        <LaunchErrorBackendAlert launchError={launchError} />
      );
    }
  }

  let autosavesErrorElement = null;
  if (autosaves.error != null)
    autosavesErrorElement = <AutosavesErrorAlert autosaves={autosaves} />;
  return (
    <>
      {launchErrorElement}
      {autosavesErrorElement}
    </>
  );
}

export default LaunchErrorAlert;
