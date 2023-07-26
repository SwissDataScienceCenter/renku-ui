import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Card, CardBody } from "reactstrap";
import { FilePreview } from "../../file";
import type { FilePreviewProps } from "../../file/FilePreview";
import { Url } from "../../utils/helpers/url";

import "katex/dist/katex.min.css";

const patterns = {
  fileRefFull: /!\[(.*?)\]\((.*?)\)/g, //with !
  fileRefTrigger: /(!?\[[^\])]+])\(([^)]*$)/,
  urlFilesRef:
    /https?: \/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
  urlRef:
    /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/,
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "tiff", "pdf", "gif", "svg"];

const STIFFNESS = 290;
const DAMPING = 20;

const REF_TYPES = {
  LINK: "link",
  IMAGE_PREV: "image",
  FILE_PREV: "file", // with ! in the front
};

type FileReference = {
  data?: { content: string; file: File; file_name: string };
  error: boolean;
  filePreview?: boolean;
  iBlock: number;
  isOpened?: boolean;
  refPath?: string;
  type: string;
};

type RenkuMarkdownWithPathTranslationProps = {
  /** The branch used to retrieve the file contents */
  branch: string;
  /** The GitLab client */
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** The file path to render */
  filePath: string;
  /** Is the file inside a project? */
  insideProject: boolean;
  /** The markdown text to display */
  markdownHtml: string;
  /** Sizes at which the UI shows a preview or not */
  previewThreshold: FilePreviewProps["previewThreshold"];
  /** The project id */
  projectId: number;
  /** The project path */
  projectPathWithNamespace: string;
  /** If true, render the output as a single line without line breaks */
  singleLine?: boolean;
  /** Any styles to apply */
  style?: object;
};

const getFileExtension = (file_path: string | undefined) => {
  if (file_path == null) return undefined;

  if (file_path.match(/\.(.*)/) === null) return undefined;
  const components = file_path.split(".");
  // if there is no extension, return undefined
  if (components.length < 2) return undefined;
  return components.pop()?.toLowerCase();
};

const fileIsImage = (file_path: string | undefined) => {
  if (file_path == null) return false;
  const ext = getFileExtension(file_path);
  if (ext == null) return false;
  IMAGE_EXTENSIONS.includes(ext);
};

const getFilesRefs = (
  markdownHTML: HTMLDivElement,
  filePathArray: string[]
) => {
  const previewFiles = markdownHTML.getElementsByTagName("img");
  const filesRefs: FileReference[] = [...previewFiles]
    .filter((file) => !file.src.match(patterns.urlFilesRef))
    .map((file, index) => {
      const src = fixRelativePath(file.getAttribute("src"), filePathArray);
      return {
        type: fileIsImage(src) ? REF_TYPES.IMAGE_PREV : REF_TYPES.FILE_PREV,
        refPath: src,
        data: undefined,
        iBlock: index,
        error: false,
      };
    });
  return filesRefs;
};

/**
 * Return a base64 string to be used as search parameter in the img tags
 *
 * @param {string} name - file name with extension
 * @param {string} data - base64 encoded image data
 */
function encodeImageBase64(name: string, data: string) {
  const subType = name.endsWith(".svg") ? "/svg+xml" : "";
  return `data:image${subType};base64,${data}`;
}

interface FileAndWrapperProps extends RenkuMarkdownWithPathTranslationProps {
  block: FileReference;
  file: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  springConfig: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
function FileAndWrapper(props: FileAndWrapperProps) {
  /**
   * We are using a checkbox here because the onclick event doesn't work with the
   * React server side rendering, the checkbox helps us fake the toggling
   *
   * We need to generate a random id here for the file preview to work on the
   * issues, in case there is more than one file preview
   * If we want a more sophisticated solution we can use a library like uuid
   */
  const randomId = Math.floor(Math.random() * 1000);
  const togglerId = props.block.iBlock + randomId + "toggler";
  return (
    <div>
      <Card>
        <CardBody className="p-2">
          <label className="mb-0 p-1">
            <FontAwesomeIcon className="icon-gray me-1" icon={faFile} />
            {props.block.data?.file_name}
          </label>
          <label
            className="mb-0 p-1 float-right btn btn-primary btn-sm"
            htmlFor={togglerId}
          >
            Preview File
          </label>
          <input
            type="checkbox"
            id={togglerId}
            className="visually-hidden fake-toggle"
          />
          <div className="hide-show-me">
            <FilePreview
              {...props}
              file={props.file}
              springConfig={props.springConfig}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function fixRelativePath(pathToFix: string | null, filePathArray: string[]) {
  if (pathToFix == null) return undefined;
  const fixPath = pathToFix.split("/");
  let acc = fixPath[fixPath.length - 1];
  const fileArray = fixPath.slice(0, -1).reverse();
  let dots = 0;

  for (const elem of fileArray) {
    if (elem === "..") dots++;
    else if (elem === ".") continue;
    else acc = elem + "/" + acc;
  }

  if (dots < filePathArray.length) {
    for (let i = dots; i < filePathArray.length; i++)
      acc = filePathArray[i] + "/" + acc;
  }
  return acc;
}

function RenkuMarkdownWithPathTranslation(
  props: RenkuMarkdownWithPathTranslationProps
) {
  const { singleLine, style, branch } = props;
  let className = "text-break renku-markdown";
  if (singleLine) className += " children-no-spacing";
  const filesPathArray = props.filePath.split("/").slice(0, -1).reverse();

  const markdownToHtml = props.markdownHtml;
  const divWithMarkdown = document.createElement("div");
  //can we do this with dangerously set inner html???
  divWithMarkdown.innerHTML = markdownToHtml;

  const [filesRefs, setFilesRefs] = useState(
    getFilesRefs(divWithMarkdown, filesPathArray)
  );
  const loaded = useRef(false);
  const loading = useRef(false);
  const isCancelled = React.useRef(false);

  const fetchRefs = useCallback(() => {
    const fetchedFiles: FileReference[] = [];
    filesRefs.forEach((block) => {
      if (block.refPath == null) return;
      if (
        block.type === REF_TYPES.IMAGE_PREV ||
        block.type === REF_TYPES.FILE_PREV
      ) {
        if (
          !block.refPath.startsWith("https://") &&
          !block.refPath.startsWith("http://")
        ) {
          const cleanPath =
            block.refPath && block.refPath.startsWith("/")
              ? block.refPath.substring(1)
              : block.refPath;
          fetchedFiles.push(
            props.client
              .getRepositoryFile(props.projectId, cleanPath, branch, "base64")
              .then((d: FileReference["data"]) => {
                block.data = d;
                return block;
              })
              .catch(() => {
                block.isOpened = false;
                block.filePreview = false;
                return block;
              })
          );
        }
      }
    });
    return Promise.all(fetchedFiles).then((filesRefsWithFiles) => {
      if (!isCancelled.current) {
        setFilesRefs((prevFilesRefs) =>
          //eslint-disable-next-line max-nested-callbacks
          prevFilesRefs.map((pb) => {
            const newBlock = filesRefsWithFiles.find(
              //eslint-disable-next-line max-nested-callbacks
              (bf) => bf.iBlock === pb.iBlock
            );
            return newBlock !== undefined ? newBlock : pb;
          })
        );
        loaded.current = true;
        loading.current = false;
      }
    });
  }, [filesRefs, props.client, props.projectId, branch]);

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

  for (const file of previewFiles) {
    const currentBlock = filesRefs.find((block) =>
      block.refPath == null ? false : file.src.endsWith(block.refPath)
    );
    if (!currentBlock || !currentBlock.data) continue;

    if (currentBlock.type === REF_TYPES.IMAGE_PREV) {
      file.src = encodeImageBase64(
        currentBlock.data.file_name,
        currentBlock.data.content
      );
      file.setAttribute("class", "image-preview");
    } else {
      const temp = document.createElement("div");
      const p = file.parentElement;
      if (p == null) continue;
      if (p.textContent == null) continue;
      p.style.display = "none";
      const text = document.createElement("div");
      text.innerText = p.textContent;
      p.appendChild(text);
      p.appendChild(temp);
      const renderedFile = (
        <FileAndWrapper
          file={currentBlock.data}
          {...props}
          block={currentBlock}
          springConfig={{ STIFFNESS, DAMPING }}
        />
      );
      temp.innerHTML = ReactDOMServer.renderToString(renderedFile);
    }
  }

  const previewLinks = divWithMarkdown.getElementsByTagName("a");
  const fullBaseUrl =
    Url.get(Url.pages.projects) +
    "/" +
    props.projectPathWithNamespace +
    "/files/blob/";

  for (const link of previewLinks) {
    const href = link.getAttribute("href");
    if (href && !href.match(patterns.urlRef)) {
      const newHref = fixRelativePath(
        link.getAttribute("href"),
        filesPathArray
      );
      link.href = fullBaseUrl + newHref;
    }
  }

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: divWithMarkdown.innerHTML }}
    ></div>
  );
}

function GuardedRenkuMarkdownWithPathTranslation(
  props: RenkuMarkdownWithPathTranslationProps
) {
  // Return null if markdownHtml is null, otherwise there are problems with the hooks
  if (props.markdownHtml == null) return null;

  return <RenkuMarkdownWithPathTranslation {...props} />;
}

export default GuardedRenkuMarkdownWithPathTranslation;
export { encodeImageBase64, fixRelativePath };
