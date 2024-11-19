import type {
  FieldErrors,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

export interface GenericProjectFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  compact?: boolean;
  errors: FieldErrors<T>;
  isDirty?: boolean;
  helpText?: string | JSX.Element;
}

export interface GenericFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  compact?: boolean;
  entityName: string;
  errors: FieldErrors<T>;
  isDirty?: boolean;
  helpText?: string | JSX.Element;
}

export interface GenericFormFieldPropsWithReset<T extends FieldValues>
  extends GenericFormFieldProps<T> {
  resetFunction?: () => void;
}

export interface GenericProjectFormFieldPropsWithReset<T extends FieldValues>
  extends GenericProjectFormFieldProps<T> {
  resetFunction?: () => void;
}
