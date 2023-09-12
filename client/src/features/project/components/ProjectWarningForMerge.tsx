import { ExternalLink } from "../../../components/ExternalLinks";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { extractRkErrorRemoteBranch } from "../../../components/errors/RtkErrorAlert";
import { WarnAlert } from "../../../components/Alert";

interface ProjectWarningMessageForMergeProps {
  defaultBranch?: string;
  externalUrl?: string;
  changeDescription: string;
  error: FetchBaseQueryError | SerializedError;
}
function ProjectWarningForMerge({
  error,
  defaultBranch,
  externalUrl,
  changeDescription,
}: ProjectWarningMessageForMergeProps) {
  const remoteBranch = extractRkErrorRemoteBranch(error);

  if (!defaultBranch || !externalUrl || !remoteBranch) return null;

  return (
    <WarnAlert timeout={0} dismissible={false}>
      <p>
        The operation was successful, but{" "}
        <strong>
          this project requires use of merge requests to make changes.
        </strong>
      </p>
      <p>
        Create a merge request to bring the changes from{" "}
        <strong>{remoteBranch}</strong> into <strong>{defaultBranch}</strong> to
        see the {changeDescription} in your project.
      </p>
      <p>
        This can be done on the{" "}
        <ExternalLink
          className="btn-warning"
          size="sm"
          title="Merge Requests"
          url={`${externalUrl}/-/merge_requests`}
        />{" "}
        tab of the GitLab UI.
      </p>
    </WarnAlert>
  );
}

export default ProjectWarningForMerge;
