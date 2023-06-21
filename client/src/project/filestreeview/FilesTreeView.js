import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFolder as faFolderClosed,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonGroup } from "reactstrap";

import "./treeviewstyle.css";

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: this.props.nodeInsideIsSelected,
      childrenOpen: this.props.childrenOpen,
    };
    this.handleIconClick = this.handleIconClick.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
  }

  handleFileClick() {
    const treeElem = document.getElementById("tree-content");
    if (treeElem) {
      this.props.savePosition({
        path: this.props.node.path,
        scrollTop: treeElem.scrollTop,
      });
    }
  }

  handleIconClick() {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
  }

  componentDidUpdate(previousProps) {
    if (previousProps.childrenOpen !== this.props.childrenOpen)
      this.setState({ childrenOpen: this.props.childrenOpen });
  }

  render() {
    const children = this.props.node.children
      ? this.props.node.children.map((node) => {
          return (
            <TreeNode
              path={node.path}
              key={node.path}
              node={node}
              childrenOpen={this.props.hash[node.path].childrenOpen}
              projectUrl={this.props.projectUrl}
              lineageUrl={this.props.lineageUrl}
              setOpenFolder={this.props.setOpenFolder}
              hash={this.props.hash}
              fileView={this.props.fileView}
              isLfs={this.props.hash[node.path].isLfs}
              nodeInsideIsSelected={this.props.currentUrl.endsWith(node.path)}
              currentUrl={this.props.currentUrl}
              savePosition={this.props.savePosition}
              history={this.props.history}
            />
          );
        })
      : null;

    const icon =
      this.props.node.type === "tree" ? (
        this.state.childrenOpen === false ? (
          <FontAwesomeIcon className="link-primary" icon={faFolderClosed} />
        ) : (
          <FontAwesomeIcon className="link-primary" icon={faFolderOpen} />
        )
      ) : (
        <FontAwesomeIcon className="link-rk-text" icon={faFile} />
      );

    const order =
      this.props.node.type === "tree" ? "order-second" : "order-third";
    const hidden = this.props.node.name.startsWith(".") ? "rk-opacity-50" : "";
    const selected = this.props.nodeInsideIsSelected ? "selected-file" : "";

    const urlPrefix = this.props.fileView
      ? this.props.projectUrl
      : this.props.lineageUrl;
    const targetUrl = `${urlPrefix}/${this.props.node.jsonObj.path}`;

    const clickHandler =
      this.props.node.type === "tree"
        ? this.handleIconClick
        : this.handleFileClick;

    const childrenOpen =
      children && this.state.childrenOpen ? (
        <div className="ps-3">{children}</div>
      ) : null;

    return (
      <div className={`${order} ${hidden} ${selected}`}>
        <div className="fs-element" onClick={clickHandler}>
          <Link to={targetUrl}>
            {icon} {this.props.node.name}
          </Link>
        </div>
        {childrenOpen}
      </div>
    );
  }
}

function TreeContainer(props) {
  const { style, fileView, toLineage, toFile, tree } = props;

  const togglePage = () => {
    if (fileView) props.history.push(toLineage);
    else props.history.push(toFile);
  };

  return (
    <div className="d-flex flex-column" style={style}>
      <div className="d-block form-rk-green">
        <ButtonGroup className="d-flex">
          <Button onClick={togglePage} active={fileView}>
            Contents
          </Button>
          <Button onClick={togglePage} active={!fileView}>
            Lineage
          </Button>
        </ButtonGroup>
      </div>
      <div id="tree-content" className="mb-3 p-2">
        {tree}
      </div>
    </div>
  );
}

class FilesTreeView extends Component {
  savePosition(data) {
    if (!this.props.limitHeight) return;
    this.props.setLastNode(data);
  }

  render() {
    const fileView = !this.props.currentUrl.startsWith(this.props.lineageUrl);
    const treeStructure = this.props.data;
    const emptyView =
      this.props.projectUrl.startsWith(this.props.currentUrl) ||
      this.props.lineageUrl.startsWith(this.props.currentUrl);
    let redirectURL = "";
    if (!emptyView) {
      redirectURL = fileView
        ? this.props.currentUrl.replace(this.props.projectUrl, "")
        : this.props.currentUrl.replace(this.props.lineageUrl, "");
    }
    const toFile = emptyView
      ? this.props.projectUrl.replace("/blob", "") + redirectURL
      : this.props.projectUrl + redirectURL;
    const toLineage = this.props.lineageUrl + redirectURL;

    const tree =
      treeStructure.tree && treeStructure.loaded
        ? treeStructure.tree.map((node) => {
            return (
              <TreeNode
                key={node.path}
                node={node}
                childrenOpen={treeStructure.hash[node.path].childrenOpen}
                projectUrl={this.props.projectUrl}
                lineageUrl={this.props.lineageUrl}
                setOpenFolder={this.props.setOpenFolder}
                path={node.path}
                hash={this.props.data.hash}
                fileView={fileView}
                isLfs={treeStructure.hash[node.path].isLfs}
                nodeInsideIsSelected={this.props.currentUrl.endsWith(node.path)}
                currentUrl={this.props.currentUrl}
                savePosition={this.savePosition.bind(this)}
                history={this.props.history}
              />
            );
          })
        : null;

    const { limitHeight } = this.props;
    const treeProps = { fileView, toLineage, toFile, tree };

    // return the plain component if there is no need to limit the height
    if (!limitHeight)
      return (
        <TreeContainer history={this.props.history} {...treeProps} style={{}} />
      );

    // on small devices, the file tree is positioned on top, therefore it's better to limit
    // the height based on the display size
    if (window.innerWidth <= 768) {
      return (
        <TreeContainer
          history={this.props.history}
          {...treeProps}
          style={{ maxHeight: Math.floor((window.innerHeight * 2) / 3) }}
        />
      );
    }

    return (
      <div className="tree-container">
        <TreeContainer history={this.props.history} {...treeProps} />
      </div>
    );
  }
}
export default FilesTreeView;
