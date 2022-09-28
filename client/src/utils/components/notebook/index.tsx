// Code taken from https://github.com/sdobz/notebook-render/blob/master/src/index.tsx
import * as React from "react";
import {
  appendCellToNotebook,
  createCodeCell,
  emptyNotebook,
  fromJS,
  ImmutableNotebook,
} from "@nteract/commutable/lib";
import { Display } from "@nteract/display-area/lib";

import { Cell } from "@nteract/presentational-components/lib/components/cell";
import { Cells } from "@nteract/presentational-components/lib/components/cells";
import { Input } from "@nteract/presentational-components/lib/components/input";
import { Outputs } from "@nteract/presentational-components/lib/components/outputs";
import { Prompt } from "@nteract/presentational-components/lib/components/prompt";
import { Source } from "@nteract/presentational-components/lib/components/source";
//import { DarkTheme, LightTheme } from "@nteract/presentational-components/lib/styles";
import { displayOrder, transforms, Transforms } from "@nteract/transforms/lib";
import { BlockMath, InlineMath } from "react-katex";
import ReactMarkdown from "react-markdown";
import katex from "rehype-katex";
import stringify from "rehype-stringify";
import math from "remark-math";
import remark2rehype from "remark-rehype";
import styled from "styled-components";
import { useEffect, useState } from "react";

interface NotebookRenderProps {
  displayOrder: string[];
  notebook: ImmutableNotebook;
  transforms: Transforms;
  theme: "light" | "dark";
  showPrompt: Boolean;
  sourceClassName: string;
}

const ContentMargin = styled.div`
  padding-left: calc(var(--prompt-width, 50px) + 10px);
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 10px;
`;

const RawCell = styled.pre`
  background: repeating-linear-gradient(-45deg, transparent, transparent 10px, #efefef 10px, #f1f1f1 20px);
`;

// Converts style in string to JSON object
const toObj = (input: string) => {
  let value = input;
  if (value[value.length - 1] === ";") value = value.substr(0, value.length - 1);

  const result = {} as any;
  const attr = value.split(";");
  for (let i = 0; i < attr.length; i++) {
    const entry = attr[i].split(":");
    let key = entry.splice(0, 1)[0];
    key = key
      .split("-")
      .map((el, i) => {
        if (i === 0) return el;
        return el.charAt(0).toUpperCase() + el.slice(1);
      })
      .join("");
    result[key] = entry.join(":").trim();
  }
  return result;
};

export default function NotebookRender(props: NotebookRenderProps) {
  const defaultProps = {
    displayOrder,
    notebook: appendCellToNotebook(emptyNotebook, createCodeCell().set("source", "# where's the content?")),
    theme: "light",
    transforms,
    showPrompt: true,
  };
  const [notebook, setNotebook] = useState<ImmutableNotebook>(defaultProps.notebook);

  useEffect(()=> {
    const content = fromJS(props?.notebook);
    setNotebook(content);
  }, [props?.notebook]); // eslint-disable-line

  // Propagated from the hide_(all)_input nbextension
  const allSourceHidden = (notebook?.getIn(["metadata", "hide_input"]) as boolean) || false;

  const language =
    (notebook.getIn(["metadata", "language_info", "codemirror_mode", "name"]) as string) ||
    (notebook.getIn(["metadata", "language_info", "codemirror_mode"]) as string) ||
    (notebook.getIn(["metadata", "language_info", "name"]) as string) ||
    "text";

  const cellOrder = notebook.get("cellOrder");
  const cellMap = notebook.get("cellMap");

  let sourceHidden: boolean | undefined = undefined;
  let outputHidden: boolean | undefined = undefined;
  let remarkPlugins: any[] = [];
  let remarkRenderers = {};

  return (
    <div className="notebook-render">
      <Cells>
        {cellOrder.map((cellId: string) => {
          const cell = cellMap.get(cellId)!;
          const cellType: string = cell.get("cell_type", "");
          const source = cell.get("source", "");

          switch (cell.cell_type) {
            case "code":
              sourceHidden =
                allSourceHidden ||
                (cell.getIn(["metadata", "inputHidden"]) as boolean) ||
                (cell.getIn(["metadata", "hide_input"]) as boolean);

              outputHidden = cell.get("outputs").size === 0 || (cell.getIn(["metadata", "outputHidden"]) as boolean);

              return (
                <Cell key={cellId} className="cell">
                  <Input hidden={sourceHidden} className="input-container">
                    {props.showPrompt && <Prompt className="prompt" counter={cell.get("execution_count")} />}
                    <Source language={language} theme={props.theme} className={props.sourceClassName}>
                      {source}
                    </Source>
                  </Input>
                  <Outputs
                    hidden={outputHidden}
                    expanded={(cell.getIn(["metadata", "outputExpanded"]) as boolean) || true}
                  >
                    <Display
                      displayOrder={props.displayOrder}
                      outputs={cell.get("outputs").toJS()}
                      transforms={props.transforms}
                      expanded={true}
                    />
                  </Outputs>
                </Cell>
              );

            case "markdown":
              remarkPlugins = [math, remark2rehype, katex, stringify];
              remarkRenderers = {
                math: function blockMath({ node, props }: { node: unknown; props: { value: string } }) {
                  return <BlockMath>{props?.value}</BlockMath>;
                },
                inlineMath: function inlineMath({ node, props }: { node: unknown; props: { value: string } }) {
                  return <InlineMath>{props?.value}</InlineMath>;
                },
                element: function remarkElement(node: { tagName: string; properties: any; children: any }) {
                  if (node.tagName === "math") return node.children;

                  if (node.tagName === "img") return React.createElement(node.tagName, node.properties);

                  if (node.tagName === "br") return React.createElement(node.tagName, node.properties);

                  // Separate properties known to cause bugs and handle them separately
                  let { ariaHidden, style, ...props } = node.properties;

                  // aria-hidden should be in the normal format
                  if (ariaHidden) props["aria-hidden"] = ariaHidden;

                  // Style must be an object
                  if (typeof style === "string") props["style"] = toObj(style);
                  else if (typeof style === "object") props["style"] = style;

                  return React.createElement(node.tagName, props, node.children);
                },
              } as any;
              return (
                <Cell key={cellId} className="cell">
                  <ContentMargin className="markdown">
                    <ReactMarkdown skipHtml={false} remarkPlugins={remarkPlugins} components={remarkRenderers}>
                      {source}
                    </ReactMarkdown>
                  </ContentMargin>
                </Cell>
              );

            case "raw":
              return (
                <Cell key={cellId} className="cell">
                  <RawCell className="raw">{source}</RawCell>
                </Cell>
              );

            default:
              return (
                <Cell key={cellId} className="cell">
                  <Outputs>
                    <pre>{`Cell Type "${cellType}" is not implemented`}</pre>
                  </Outputs>
                </Cell>
              );
          }
        })}
      </Cells>
      {/* TS problems with this code
      {this.props.theme === "dark" ? <DarkTheme /> : <LightTheme />}
      */}
    </div>
  );
}
