import React, { useEffect, useState, useRef, useCallback } from "react";
import { sanitizedHTMLFromMarkdown } from "./HelperFunctions";
import { CardBody, Card } from "reactstrap";
import ReactDOMServer from "react-dom/server";
import { FilePreview } from "../file";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

const patterns = {
  fileRefFull: /!\[(.*?)\]\((.*?)\)/g, //with !
  fileRefTrigger: /(!?\[[^\])]+])\(([^)]*$)/,
  urlFilesRef: /https?: \/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
  urlRef: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "tiff", "pdf", "gif", "svg"];

const STIFFNESS = 290;
const DAMPING = 20;

const REF_TYPES = {
  LINK: "link",
  IMAGE_PREV: "image",
  FILE_PREV: "file", // with ! in the front
};

const getFileExtension = (file_path) => {
  if (!file_path)
    return null;

  if (file_path.match(/\.(.*)/) === null)
    return null;
  return file_path.split(".").pop().toLowerCase();
};

const fileIsImage = (file_path) => IMAGE_EXTENSIONS.indexOf(getFileExtension(file_path)) >= 0;

const getFilesRefs = (markdownHTML, filePathArray) => {
  let filesRefs = [];
  let blockCounter = 0;

  const previewFiles = markdownHTML.getElementsByTagName("img");

  for (let file of previewFiles) {
    let src = fixRelativePath(file.getAttribute("src"), filePathArray);

    if (!file.src.match(patterns.urlFilesRef)) {
      filesRefs.push({
        type: fileIsImage(src) ? REF_TYPES.IMAGE_PREV : REF_TYPES.FILE_PREV,
        refPath: src,
        data: null,
        iBlock: blockCounter,
        error: false
      });
      blockCounter++;
    }
  }
  return filesRefs;
};

/**
 * Return a base64 string to be used as search parameter in the img tags
 *
 * @param {string} name - file name with extension
 * @param {string} data - base64 encoded image data
 */
function encodeImageBase64(name, data) {
  const subType = name.endsWith(".svg") ?
    "/svg+xml" :
    "";
  return `data:image${subType};base64,${data}`;
}

function FileAndWrapper(props) {
  /**
   * We are using a checkbox here because the onclick event doesn't work with the
   * React server side rendering, the checkbox helps us fake the toggleing
   *
   * We need to generate a random id here for the file preview to work on the
   * issues, in case there is more than one file preview
   * If we want a more sophisticated solution we can use a library like uuid
   */
  const randomId = Math.floor(Math.random() * 1000);
  const togglerId = props.block.iBlock + randomId + "toggler";
  return <div>
    <Card>
      <CardBody className="p-2">
        <label className="mb-0 p-1">
          <FontAwesomeIcon className="icon-gray me-1" icon={faFile} />
          {props.block.data.file_name}
        </label>
        <label className="mb-0 p-1 float-right btn btn-primary btn-sm" htmlFor={togglerId}>
          Preview File
        </label>
        <input type="checkbox" id={togglerId} className="visually-hidden fake-toggle" />
        <div className="hide-show-me">
          <FilePreview
            file={props.file}
            {...props}
            springConfig={props.springConfig}
          />
        </div>
      </CardBody>
    </Card>
  </div>;
}

function fixRelativePath(pathToFix, filePathArray) {
  const fixPath = pathToFix.split("/");
  let acc = fixPath[fixPath.length - 1];
  const fileArray = fixPath.slice(0, -1).reverse();
  let dots = 0;

  for (let elem of fileArray) {
    if (elem === "..") dots++;
    else if (elem === ".")
      continue;
    else
      acc = elem + "/" + acc;
  }

  if (dots < filePathArray.length) {
    for (let i = dots ; i < filePathArray.length; i++)
      acc = filePathArray[i] + "/" + acc;
  }
  return acc;
}


/**
 * Safely render markdown.
 * @param {string} markdownText the markdown text to display
 * @param {boolean} singleLine if true, render the output as a single line without line breaks
 * @param {object} style any styles to apply
 */
function RenkuMarkdownWithPathTranslation(props) {

  const { singleLine, style } = props;
  let className = "text-break renku-markdown";
  if (singleLine)
    className += " children-no-spacing";
  let filesPathArray = props.filePath.split("/").slice(0, -1).reverse();

  const markdownToHtml = sanitizedHTMLFromMarkdown(props.markdownText, singleLine);
  const divWithMarkdown = document.createElement("div");
  //can we do this with dangerously set inner html???
  divWithMarkdown.innerHTML = markdownToHtml;

  const [filesRefs, setFilesRefs] = useState(getFilesRefs(divWithMarkdown, filesPathArray));
  const loaded = useRef(false);
  const loading = useRef(false);
  const isCancelled = React.useRef(false);

  const fetchRefs = useCallback(() =>{
    const fetchedFiles = [];
    filesRefs.forEach(block => {
      if (block.type === REF_TYPES.IMAGE_PREV || block.type === REF_TYPES.FILE_PREV) {
        if (!block.refPath.startsWith("https://") && !block.refPath.startsWith("http://")) {
          const cleanPath = block.refPath && block.refPath.startsWith("/") ?
            block.refPath.substring(1) :
            block.refPath;
          fetchedFiles.push(
            props.client.getRepositoryFile(props.projectId, cleanPath, "master", "base64")
              .then(d => { block.data = d; return block; })
              .catch(error => { block.isOpened = false; block.filePreview = false; return block; })
          );
        }
      }
    });
    return Promise.all(fetchedFiles)
      .then(filesRefsWithFiles => {
        if (!isCancelled.current) {
          setFilesRefs(prevFilesRefs =>
            //eslint-disable-next-line
            prevFilesRefs.map(pb => {
              //eslint-disable-next-line
              let newBlock = filesRefsWithFiles.find(bf => bf.iBlock === pb.iBlock);
              return newBlock !== undefined ? newBlock : pb;
            }));
          loaded.current = true;
          loading.current = false;
        }
      });
  }, [filesRefs, props.client, props.projectId]);

  useEffect(() => {
    if (!loaded.current && !loading.current && filesRefs.length !== 0) {
      loading.current = true;
      fetchRefs();
    }
    return () => {
      isCancelled.current = true;
    };
  }, [filesRefs, fetchRefs]);

  const previewFiles = divWithMarkdown.getElementsByTagName("img");

  for (let file of previewFiles) {
    let currentBlock = filesRefs.find(block => file.src.endsWith(block.refPath));
    if (currentBlock && currentBlock.data) {
      if (currentBlock.type === REF_TYPES.IMAGE_PREV) {
        file.src = encodeImageBase64(currentBlock.data.file_name, currentBlock.data.content);
        file.setAttribute("class", "image-preview");
      }
      else {
        let temp = document.createElement("div");
        let p = file.parentNode;
        p.style.display = "none";
        let text = document.createElement("div");
        text.innerText = p.textContent;
        p.appendChild(text);
        p.appendChild(temp);
        let renderedFile = <FileAndWrapper
          file={currentBlock.data}
          {...props}
          block={currentBlock}
          springConfig={{ STIFFNESS, DAMPING }}
        />;
        temp.innerHTML = ReactDOMServer.renderToString(renderedFile);
      }
    }
  }

  const previewLinks = divWithMarkdown.getElementsByTagName("a");
  const fullBaseUrl = props.client.baseUrl.replace("/api", "/projects")
    + "/" + props.projectPathWithNamespace + "/files/blob/";

  for (let link of previewLinks) {
    if (link.getAttribute("href") && !link.getAttribute("href").match(patterns.urlRef)) {
      const newHref = fixRelativePath(link.getAttribute("href"), filesPathArray) ;
      link.href = fullBaseUrl + newHref ;
    }
  }

  return <div className={className} style={style}
    dangerouslySetInnerHTML={{ __html: divWithMarkdown.innerHTML }}>
  </div>;

}
export default RenkuMarkdownWithPathTranslation;
export { encodeImageBase64, fixRelativePath };
