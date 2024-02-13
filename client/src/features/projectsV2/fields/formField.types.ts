import type {
  FieldErrors,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

export interface GenericProjectFormFieldProps<T extends FieldValues>
  extends UseControllerProps<T> {
  errors: FieldErrors<T>;
}
