import cx from "classnames";
import React, { Component, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileEarmark, FolderFill, Folder2Open } from "react-bootstrap-icons";
import { Loader } from "./Loader";

type HashElt = {
  name: string;
  selected: boolean;
  childrenOpen: boolean;
  path: string;
  isLeaf: boolean;
};

export type FileTreeNode = {
  atLocation: string;
  name: string;
  id: string;
};

type TreeNodeElt = {
  name: string;
  children: TreeNodeElt[];
  id: string;
  jsonObj: FileTreeNode | null;
  path: string;
  text?: string;
};

function buildTree(
  parts: string[],
  treeNode: TreeNodeElt[],
  jsonObj: FileTreeNode,
  hash: Record<string, HashElt>,
  currentPathCandidate: string,
  foldersOpenOnLoad = 0
) {
  if (parts.length === 0) return;
  const currentPath =
    currentPathCandidate === ""
      ? parts[0]
      : currentPathCandidate + "/" + parts[0];

  for (let i = 0; i < treeNode.length; i++) {
    if (parts[0] === treeNode[i].text) {
      buildTree(
        parts.splice(1, parts.length),
        treeNode[i].children,
        jsonObj,
        hash,
        currentPath + "/" + parts[0]
      );
      return;
    }
  }

  const newNode =
    parts[0] === jsonObj.name
      ? {
          name: parts[0],
          children: [],
          jsonObj: jsonObj,
          path: currentPath,
          id: jsonObj.id,
        }
      : {
          name: parts[0],
          children: [],
          jsonObj: null,
          path: currentPath,
          id: jsonObj.id,
        };

  const currentNode = treeNode.filter((node) => node.name === newNode.name);

  if (currentNode.length === 0) {
    treeNode.push(newNode);
    hash[newNode.path] = {
      name: parts[0],
      selected: false,
      childrenOpen: foldersOpenOnLoad > 0,
      path: currentPath,
      isLeaf: parts.length === 1,
    };
    buildTree(
      parts.splice(1, parts.length),
      newNode.children,
      jsonObj,
      hash,
      currentPath,
      foldersOpenOnLoad > 0 ? foldersOpenOnLoad - 1 : 0
    );
  } else {
    for (let j = 0; j < newNode.children.length; j++)
      currentNode[0].children.push(newNode.children[j]);

    buildTree(
      parts.splice(1, parts.length),
      currentNode[0].children,
      jsonObj,
      hash,
      currentPath,
      foldersOpenOnLoad > 0 ? foldersOpenOnLoad - 1 : 0
    );
  }
}

type FilesTree = {
  tree: TreeNodeElt[];
  hash: Record<string, HashElt>;
  leafs: HashElt[];
};
function getFilesTree(
  files: FileTreeNode[],
  foldersOpenOnLoad: number | undefined
): FilesTree {
  const list = files;
  const tree: TreeNodeElt[] = [];
  const hash: Record<string, HashElt> = {};
  for (let i = 0; i < list.length; i++) {
    const dir = list[i].atLocation.split("/");
    buildTree(dir, tree, list[i], hash, "", foldersOpenOnLoad);
  }
  const treeObj = {
    tree: tree,
    hash: hash,
    leafs: Object.values(hash).filter((file) => file.isLeaf),
  };
  return treeObj;
}

type FileDisplayProps = {
  className: string;
  icon: React.ReactNode;
  insideProject: boolean;
  linkUrl?: string;
  node: TreeNodeElt;
};
function FileDisplay({
  className,
  icon,
  insideProject,
  linkUrl,
  node,
}: FileDisplayProps) {
  const eltClassName = cx("fs-element", className);
  if (insideProject && linkUrl && node.jsonObj)
    return (
      <div className={eltClassName} data-cy="dataset-fs-element">
        <Link to={`${linkUrl}/${node.jsonObj.atLocation}`}>
          {icon} {node.name}
        </Link>
      </div>
    );
  return (
    <div
      className={eltClassName}
      data-cy="dataset-fs-element"
      style={{ cursor: "default" }}
    >
      <a>
        {icon} {node.name}
      </a>
    </div>
  );
}

type TreeNodeProps = {
  path: string;
  node: TreeNodeElt;
  childrenOpen: boolean;
  projectUrl?: string;
  linkUrl?: string;
  setOpenFolder: (path: string) => void;
  hash: Record<string, HashElt>;
  insideProject: boolean;
};

type TreeNodeState = {
  isSelected: boolean;
  childrenOpen: boolean;
};

class TreeNode extends Component<TreeNodeProps, TreeNodeState> {
  constructor(props: TreeNodeProps) {
    const childrenOpen = props.childrenOpen as boolean;
    super(props);
    this.state = {
      isSelected: false,
      childrenOpen,
    };
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  handleIconClick() {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
  }

  render() {
    const icon = this.props.node.children.length ? (
      this.state.childrenOpen === false ? (
        <FolderFill className={cx("bi", "link-primary")} />
      ) : (
        <Folder2Open className={cx("bi", "link-primary")} />
      )
    ) : (
      <FileEarmark className={cx("bi", "link-rk-text")} />
    );

    const children = this.props.node.children
      ? this.props.node.children.map((node) => {
          return (
            <TreeNode
              path={node.path}
              key={node.path}
              node={node}
              childrenOpen={this.props.hash[node.path].childrenOpen}
              projectUrl={this.props.projectUrl}
              linkUrl={this.props.linkUrl}
              setOpenFolder={this.props.setOpenFolder}
              hash={this.props.hash}
              insideProject={this.props.insideProject}
            />
          );
        })
      : null;

    const order = this.props.node.children.length
      ? "order-second"
      : "order-third";
    const hidden = { "hidden-folder": this.props.node.name.startsWith(".") };
    const className = cx(order, hidden);
    if (this.props.node.jsonObj !== null) {
      return (
        <FileDisplay
          className={className}
          icon={icon}
          insideProject={this.props.insideProject}
          linkUrl={this.props.linkUrl}
          node={this.props.node}
        />
      );
    }

    return (
      <>
        <div
          className={cx("fs-element", className)}
          data-cy="dataset-fs-folder"
          onClick={this.handleIconClick}
        >
          <a>
            {icon} {this.props.node.name}
          </a>
        </div>
        {this.state.childrenOpen ? (
          <div className="ps-3">{children}</div>
        ) : null}
      </>
    );
  }
}

type FilesTreeViewProps = {
  data: FilesTree;
  hash: Record<string, HashElt>;
  setOpenFolder: (path: string) => void;
  linkUrl?: string;
  insideProject: boolean;
};

function FilesTreeView(props: FilesTreeViewProps) {
  const [tree, setTree] = useState<React.ReactNode>(undefined);

  useEffect(() => {
    if (props.data.tree && tree === undefined) {
      setTree(
        props.data.tree.map((node) => {
          return (
            <TreeNode
              key={node.path}
              node={node}
              childrenOpen={props.data.hash[node.path].childrenOpen}
              setOpenFolder={props.setOpenFolder}
              path={node.path}
              hash={props.data.hash}
              linkUrl={props.linkUrl}
              insideProject={props.insideProject}
            />
          );
        })
      );
    }
  }, [
    props.data,
    tree,
    props.setOpenFolder,
    props.linkUrl,
    props.insideProject,
  ]);

  if (props.data.tree === undefined) return <Loader />;

  return <div className="tree-container">{tree}</div>;
}

type FileExplorerProps = {
  /**  This is a list of files with atLocation containing the file path (this is optional) */
  files?: FileTreeNode[];
  /** This is the already built fileTree (optional) */
  filesTree?: FilesTree;
  /** Number of folders that should appear open already when displaying the tree */
  foldersOpenOnLoad: number;
  /** Should be replaced for URL, this is the link for the file (when clicked) (optional) */
  linkUrl?: string;
  /** Set true if the display is inside a project */
  insideProject: boolean;
};

function FileExplorer(props: FileExplorerProps) {
  const [filesTree, setFilesTree] = useState<
    ReturnType<typeof getFilesTree> | undefined
  >(undefined);

  useEffect(() => {
    if (props.filesTree !== undefined) setFilesTree(props.filesTree);
    else if (props.files !== undefined)
      setFilesTree(getFilesTree(props.files, props.foldersOpenOnLoad));
  }, [props.files, props.filesTree, props.foldersOpenOnLoad]);

  const setOpenFolder = React.useCallback(
    (filePath: string) => {
      if (filesTree == null) return;
      const updatedFilesTree = {
        ...filesTree,
        hash: {
          ...filesTree.hash,
          [filePath]: {
            ...filesTree.hash[filePath],
            childrenOpen: !filesTree.hash[filePath].childrenOpen,
          },
        },
      };

      setFilesTree(updatedFilesTree);
    },
    [filesTree]
  );

  const loading = filesTree === undefined;

  if (loading) return <Loader />;

  return (
    <FilesTreeView
      data={filesTree}
      setOpenFolder={setOpenFolder}
      hash={filesTree.hash}
      linkUrl={props.linkUrl}
      insideProject={props.insideProject}
    />
  );
}

export default FileExplorer;
export { getFilesTree };
