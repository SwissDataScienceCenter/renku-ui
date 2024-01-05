import {
  ProjectFormErrorsProps,
  ProjectFormFieldKey,
} from "./NewProject.types";
import { FormErrorFields } from "../../../project/new/components/FormValidations";

export default function ProjectFormErrors({ errors }: ProjectFormErrorsProps) {
  function fieldNameToLabel(fieldName: string) {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
  const formFields = Object.keys(errors) as unknown as ProjectFormFieldKey[];
  const errorFields = formFields
    .filter((field) => errors[field])
    .map(fieldNameToLabel);
  if (errorFields.length == 0) return null;
  return (
    <div className="mb-2">
      <FormErrorFields errorFields={errorFields} />
    </div>
  );
}
