import { Label } from "reactstrap";
import { InputLabel } from "../formlabels/FormLabels";

type FormLabelProps = {
  name: string;
  label: string;
  required?: boolean;
};

function FormLabel({ name, label, required }: FormLabelProps) {
  return (
    <Label htmlFor={name} required={required}>
      <InputLabel text={label} isRequired={required} />
    </Label>
  );
}

export default FormLabel;
