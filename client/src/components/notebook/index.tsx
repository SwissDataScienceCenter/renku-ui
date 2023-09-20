// Code taken from https://github.com/sdobz/notebook-render/blob/master/src/index.tsx

import { IpynbRenderer } from "react-ipynb-renderer";
import type { BaseProps, CellType, LanguageType } from "react-ipynb-renderer";

type BaseIpynb = BaseProps["ipynb"];
interface IIpynb extends BaseIpynb {
  metadata?: {
    hide_input?: boolean;
    inputHidden?: boolean;
    kernelspec?: {
      language?: string;
    };
  };
}

interface CellWithMetadata extends CellType {
  metadata?: {
    hide_input?: boolean;
    inputHidden?: boolean;
  };
}

interface NotebookRenderProps {
  displayOrder: string[];
  notebook: IIpynb;
  theme: "light" | "dark";
  showPrompt: boolean;
  sourceClassName: string;
}

function processedNotebook(notebook: IIpynb): IIpynb {
  const allInputHidden = notebook.metadata?.hide_input || false;
  const cells = notebook.cells.map((cell) => {
    const c = { ...cell } as unknown as CellWithMetadata;
    const inputHidden =
      allInputHidden || c.metadata?.inputHidden || c.metadata?.hide_input;
    if (inputHidden) {
      if (c.cell_type === "code") {
        delete c["input"];
        delete c["source"];
      }
    }
    c.outputs = c.outputs?.map((o) => {
      const oCopy = { ...o };
      if (Object.keys(oCopy.data ?? {}).length == 0) oCopy.data = undefined;
      return oCopy;
    });

    return c;
  });
  const result = { ...notebook, cells };
  return result;
}

// Converts style in string to JSON object

export default function NotebookRender(props: NotebookRenderProps) {
  const notebook = props.notebook as unknown as IIpynb;
  const language = notebook.metadata?.kernelspec?.language ?? "python";

  return (
    <IpynbRenderer
      ipynb={processedNotebook(notebook)}
      syntaxTheme="prism"
      language={language as LanguageType}
      bgTransparent={false}
      markdownOptions={{
        mathjaxOptions: {
          // https://docs.mathjax.org/en/v3.0-latest/options/input/tex.html
          tex: {
            tags: "ams",
          },
        },
      }}
    />
  );
}
