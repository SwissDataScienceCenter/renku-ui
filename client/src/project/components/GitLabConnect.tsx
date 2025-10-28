import { UncontrolledTooltip } from "reactstrap";
import { ButtonWithMenu } from "../../components/buttons/Button";
import { ExternalLink } from "../../components/ExternalLinks";

function externalUrlToGitLabIdeUrl(externalUrl: string) {
  if (externalUrl.includes("/gitlab/"))
    return externalUrl.replace("/gitlab/", "/gitlab/-/ide/project/");
  const url = new URL(externalUrl);
  const pathname = url.pathname;
  const newPathname = `/-/ide/project${pathname}`;
  url.pathname = newPathname;
  return url.toString();
}

type GitLabLinkItemProps = {
  text: string;
  url: string;
};

function GitLabLinkItem({ text, url }: GitLabLinkItemProps) {
  return (
    <li>
      <ExternalLink
        className="dropdown-item"
        role="text"
        title={text}
        url={url}
      />
    </li>
  );
}

type GitLabConnectButtonProps = {
  externalUrl?: string;
  size: string;
  userLogged: boolean;
};
function GitLabConnectButton(props: GitLabConnectButtonProps) {
  const { externalUrl, userLogged } = props;
  if (!externalUrl) return null;
  const gitlabIdeUrl = externalUrlToGitLabIdeUrl(externalUrl);
  const size = props.size ? props.size : "1x";

  const gitLabIssuesUrl = `${props.externalUrl}/-/issues`;
  const gitLabMrUrl = `${props.externalUrl}/-/merge_requests`;

  const gitlabProjectButton = (
    <ExternalLink
      id="open-in-gitlab"
      className="btn-outline-rk-green"
      url={externalUrl}
      title="GitLab"
      showLinkIcon
      iconSize={size}
    />
  );

  const gitlabIDEButton =
    userLogged && gitlabIdeUrl ? (
      <GitLabLinkItem text="Web IDE" url={gitlabIdeUrl} />
    ) : null;

  return (
    <>
      <ButtonWithMenu
        color="rk-green"
        default={gitlabProjectButton}
        size={size}
      >
        <GitLabLinkItem text="Issues" url={gitLabIssuesUrl} />
        <GitLabLinkItem text="Merge Requests" url={gitLabMrUrl} />
        {gitlabIDEButton}
      </ButtonWithMenu>
      <UncontrolledTooltip target="open-in-gitlab" autohide={false}>
        Open in GitLab
      </UncontrolledTooltip>
    </>
  );
}

export default GitLabConnectButton;
export { externalUrlToGitLabIdeUrl };
