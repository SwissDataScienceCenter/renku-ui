import { NewProjectFormFields } from "../projectKg.types";
import { FieldErrors } from "react-hook-form";
import { Namespace } from "../../projects/projects.api";
import { Templates } from "../../templates/templates.api";

export type ProjectFormFieldKey = keyof NewProjectFormFields;
export type ProjectFormErrorsProps = {
  errors: FieldErrors<NewProjectFormFields>;
};

export type ProjectDisplayProps = {
  submitButtonText: string;
  submitLoaderText: string;
};

export interface CustomUserTemplate {
  url: string;
  reference: string;
}
export interface UserTemplateVariables {
  name: string;
  value: unknown;
  type: string;
  description: string;
}

export interface TemplateVariable {
  description: string;
  default_value?: any;
}

export type NewProjectFormState = {
  form: {
    avatar?: File;
    description: string;
    keywords: string[];
    namespace?: Namespace;
    slug: string;
    isCustomTemplate: boolean;
    template?: Templates;
    templateVariables?: Record<string, any>;
    name: string;
    userTemplate?: CustomUserTemplate;
    visibility: "public" | "internal" | "private";
  };
};
