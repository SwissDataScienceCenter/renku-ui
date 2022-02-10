
import React, { Component, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "./Loader";

function buildTree(parts, treeNode, jsonObj, hash, currentPath, foldersOpenOnLoad) {
  if (parts.length === 0)
    return;
  currentPath = currentPath === "" ? parts[0] : currentPath + "/" + parts[0];

  for (let i = 0; i < treeNode.length; i++) {
    if (parts[0] === treeNode[i].text) {
      buildTree(parts.splice(1, parts.length), treeNode[i].children, jsonObj, hash, currentPath + "/" + parts[0]);
      return;
    }
  }

  let newNode;
  if (parts[0] === jsonObj.name)
    newNode = { "name": parts[0], "children": [], "jsonObj": jsonObj, "path": currentPath, "id": jsonObj.id };
  else
    newNode = { "name": parts[0], "children": [], "jsonObj": null, "path": currentPath, "id": jsonObj.id };

  const currentNode = treeNode.filter(node => node.name === newNode.name);

  if (currentNode.length === 0) {
    treeNode.push(newNode);
    hash[newNode.path] = {
      "name": parts[0],
      "selected": false,
      "childrenOpen": foldersOpenOnLoad > 0,
      "path": currentPath,
      "isLeaf": parts.length === 1
    };
    buildTree(parts.splice(1, parts.length), newNode.children, jsonObj, hash, currentPath,
      foldersOpenOnLoad > 0 ? foldersOpenOnLoad - 1 : 0);
  }
  else {
    for (let j = 0; j < newNode.children.length; j++)
      currentNode[0].children.push(newNode.children[j]);

    buildTree(parts.splice(1, parts.length), currentNode[0].children, jsonObj, hash, currentPath,
      foldersOpenOnLoad > 0 ? foldersOpenOnLoad - 1 : 0);
  }
}


function getFilesTree(files, foldersOpenOnLoad) {
  let list = files;
  let tree = [];
  let hash = {};
  for (let i = 0; i < list.length; i++) {
    const dir = list[i].atLocation.split("/");
    buildTree(dir, tree, list[i], hash, "", foldersOpenOnLoad);
  }
  const treeObj = { tree: tree, hash: hash, leafs: Object.values(hash).filter(file => file.isLeaf) };
  return treeObj;
}

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,
      childrenOpen: this.props.childrenOpen
    };
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  handleIconClick(e) {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
  }

  render() {
    const icon = this.props.node.children.length ?
      (this.state.childrenOpen === false ?
        <FontAwesomeIcon className="link-primary" icon={faFolder} />
        : <FontAwesomeIcon className="link-primary" icon={faFolderOpen} />)
      : <FontAwesomeIcon className="link-rk-text" icon={faFile} />;

    const order = this.props.node.children.length ? "order-second" : "order-third";
    const hidden = this.props.node.name.startsWith(".") ? " hidden-folder " : "";

    const children = this.props.node.children ?
      this.props.node.children.map((node, index) => {
        return <TreeNode
          path={node.path}
          key={node.path}
          node={node}
          childrenOpen={this.props.hash[node.path].childrenOpen}
          projectUrl={this.props.projectUrl}
          lineageUrl={this.props.lineageUrl}
          setOpenFolder={this.props.setOpenFolder}
          hash={this.props.hash}
          insideProject={this.props.insideProject}
        />;
      })
      : null;

    let elementToRender;
    const eltClassName = order + " " + hidden;
    if (this.props.node.jsonObj !== null) {
      elementToRender = this.props.insideProject ?
        <div className={eltClassName}>
          <Link to= {`${this.props.lineageUrl}/${this.props.node.jsonObj.atLocation}`} >
            <div className="fs-element" data-cy="dataset-fs-element">
              {icon} {this.props.node.name}
            </div>
          </Link>
        </div>
        :
        <div className={eltClassName}>
          <div className="fs-element" data-cy="dataset-fs-element" style={{ cursor: "default" }}>
            {icon} {this.props.node.name}
          </div>
        </div>
      ;
    }
    else {
      elementToRender = this.state.childrenOpen ?
        <div className={eltClassName} >
          <div className="fs-element" data-cy="dataset-fs-folder" onClick={this.handleIconClick} >
            {icon} {this.props.node.name}
          </div>
          <div className="ps-3">
            {children}
          </div>
        </div>
        :
        <div className={eltClassName} >
          <div className="fs-element" data-cy="dataset-fs-folder" onClick={this.handleIconClick}>
            {icon} {this.props.node.name}
          </div>
        </div>;
    }
    return elementToRender;
  }
}

function FilesTreeView(props) {

  const [tree, setTree] = useState(undefined);

  useEffect(()=>{
    if (props.data.tree && tree === undefined) {
      setTree(
        props.data.tree.map((node, index) => {
          return <TreeNode
            key={node.path}
            node={node}
            childrenOpen={props.data.hash[node.path].childrenOpen}
            setOpenFolder={props.setOpenFolder}
            path={node.path}
            hash={props.data.hash}
            lineageUrl={props.lineageUrl}
            insideProject={props.insideProject}
          />;
        })
      );
    }
  }, [props.data, tree, props.setOpenFolder, props.lineageUrl, props.insideProject]);

  if (props.data.tree === undefined)
    return <Loader />;

  return (
    <div className="tree-container">
      {tree}
    </div>
  );
}

/**
 * Generic files tree generator.
 * Some things are left to do to make it more generic.
 *
 * @param {*} props.files - This is a list of files with atLocation containing the file path (this is optional)
 * @param {*} props.filesTree - This is the already built fileTree (optional)
 * @param {*} props.foldersOpenOnLoad - Number of folders that should appear open already when displaying the tree
 * @param {*} props.lineageUrl - Should be replaced for URL, this is the link for the file (when clicked) (optional)
 * @param {*} props.insideProject - Boolean to be set true if the display is inside a project
 */
function FileExplorer(props) {
  const [filesTree, setFilesTree] = useState(undefined);

  useEffect(() => {
    if (props.filesTree !== undefined)
      setFilesTree(props.filesTree);
    else if (props.files !== undefined)
      setFilesTree(getFilesTree(props.files, props.foldersOpenOnLoad));
  }, [props.files, props.filesTree, props.foldersOpenOnLoad]);

  const setOpenFolder = (filePath) => {
    filesTree.hash[filePath].childrenOpen = !filesTree.hash[filePath].childrenOpen;
    setFilesTree(filesTree);
  };

  const loading = filesTree === undefined;

  if (loading)
    return <Loader />;

  return <FilesTreeView
    data={filesTree}
    setOpenFolder={setOpenFolder}
    hash={filesTree.hash}
    lineageUrl={props.lineageUrl}
    insideProject={props.insideProject}
  />;
}

export default FileExplorer;
export { getFilesTree };
