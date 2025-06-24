declare module "sass-extract" {
  export interface ExtractOptions {
    file?: string;
    data?: string;
    includePaths?: string[];
  }

  export interface SassValue {
    type: string;
    value: any;
  }

  export interface ExtractedVariables {
    global: Record<string, SassValue>;
  }

  export function renderSync(options: ExtractOptions): ExtractedVariables;
}
