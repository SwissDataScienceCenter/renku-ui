import React from "react";
import { DropdownItem } from "reactstrap";
import { ExternalLink } from "../../components/ExternalLinks";
import { ButtonWithMenu } from "../../components/buttons/Button";
import { ThrottledTooltip } from "../../components/Tooltip";

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
  size: string;
  text: string;
  url: string;
};

function GitLabLinkItem({ size, text, url }: GitLabLinkItemProps) {
  return (
    <DropdownItem size={size}>
      <ExternalLink className="nav-link" role="text" title={text} url={url} />
    </DropdownItem>
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
  const size = props.size ? props.size : "md";

  const gitLabIssuesUrl = `${props.externalUrl}/-/issues`;
  const gitLabMrUrl = `${props.externalUrl}/-/merge_requests`;

  const gitlabProjectButton = (
    <ExternalLink
      id="open-in-gitlab"
      className="btn-outline-rk-green"
      url={props.externalUrl}
      title="GitLab"
      showLinkIcon
      iconSize={size}
    />
  );

  const gitlabIDEButton =
    userLogged && gitlabIdeUrl ? (
      <GitLabLinkItem size={size} text="Web IDE" url={gitlabIdeUrl} />
    ) : null;

  return (
    <>
      <ButtonWithMenu
        color="rk-green"
        default={gitlabProjectButton}
        size={size}
      >
        <GitLabLinkItem size={size} text="Issues" url={gitLabIssuesUrl} />
        <GitLabLinkItem size={size} text="Merge Requests" url={gitLabMrUrl} />
        {gitlabIDEButton}
      </ButtonWithMenu>
      <ThrottledTooltip
        target="open-in-gitlab"
        tooltip="Open in GitLab"
        autoHide={false}
      />
    </>
  );
}

export default GitLabConnectButton;
export { externalUrlToGitLabIdeUrl };
