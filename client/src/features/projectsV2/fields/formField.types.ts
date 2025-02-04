import type {
  FieldErrors,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

export interface GenericProjectFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  errors: FieldErrors<T>;
  helpText?: React.ReactNode;
}

export interface GenericFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  entityName: string;
  errors: FieldErrors<T>;
  helpText?: React.ReactNode;
}

export interface SlugFormFieldProps<T extends FieldValues>
  extends GenericFormFieldProps<T> {
  compact?: boolean;
  url?: string;
  resetFunction?: () => void;
}

export interface SlugPreviewFormFieldProps<T extends FieldValues>
  extends GenericProjectFormFieldProps<T> {
  compact?: boolean;
  resetFunction?: () => void;
  parentPath: string;
  slug: string;
  label: string;
  entityName: "project" | "group";
  dirtyFields: Partial<
    Readonly<{
      name?: boolean | undefined;
      namespace?: boolean | undefined;
      slug?: boolean | undefined;
    }>
  >;
}
