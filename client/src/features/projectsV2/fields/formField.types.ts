import type {
  FieldErrors,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

export interface GenericProjectFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  compact?: boolean;
  errors: FieldErrors<T>;
  helpText?: string | JSX.Element;
}

export interface GenericFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  compact?: boolean;
  entityName: string;
  errors: FieldErrors<T>;
  helpText?: string | JSX.Element;
}
