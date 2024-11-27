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
  countAsDirty?: boolean;
  resetFunction?: () => void;
}

export interface SlugProjectFormFieldProps<T extends FieldValues>
  extends GenericProjectFormFieldProps<T> {
  compact?: boolean;
  countAsDirty?: boolean;
  resetFunction?: () => void;
}
