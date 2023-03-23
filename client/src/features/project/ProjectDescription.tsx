import React from "react";
import { Form, FormGroup, FormText, Input, Label } from "reactstrap";

import { useProjectMetadataQuery } from "../projects/ProjectKgApi";
import { InlineSubmitButton } from "../../components/buttons/Button";

// class Nothing {
//   constructor(props) {
//     super(props);
//     this.state = ProjectDescription.getDerivedStateFromProps(props, {});
//     this.onValueChange = this.handleChange.bind(this);
//     this.onSubmit = this.handleSubmit.bind(this);
//   }

//   static getDerivedStateFromProps(nextProps, prevState) {
//     const update = { value: nextProps.metadata.description, pristine: true };
//     return { ...update, ...prevState };
//   }

//   handleChange(e) {
//     if (e.target.values !== this.state.value)
//       this.setState({ value: e.target.value, updated: false, pristine: false });
//   }

//   handleSubmit(e) {
//     e.preventDefault();
//     this.setState({ value: this.state.value, updating: true });
//     this.props.onProjectDescriptionChange(this.state.value)
//       .then(() => {
//         this.setState({ value: this.state.value, updated: true, updating: false });
//       });
//   }
// }

type ProjectDescriptionProps = {
  projectPath?: string;
  settingsReadOnly: boolean;
};

function ProjectDescription({ projectPath, settingsReadOnly }: ProjectDescriptionProps) {
  const { data: kgData, isLoading } = useProjectMetadataQuery({ projectPath }, { skip: !projectPath });
  const [isUpdating, setUpdating] = React.useState(false);
  const [isUpdated, setUpdated] = React.useState(false);
  const [isPristine, setPristine] = React.useState(false);
  const [value, setValue] = React.useState(kgData?.description ?? "");

  const inputField =
    settingsReadOnly || isUpdating ? (
      <Input id="projectDescription" readOnly value={value} />
    ) : (
      <Input
        id="projectDescription"
        onChange={(event) => setValue(event.currentTarget.value)}
        data-cy="description-input"
        value={value}
      />
    );

  const submitButton = settingsReadOnly ? null : (
    <InlineSubmitButton
      className="updateProjectSettings"
      doneText="Updated"
      id="update-desc"
      isDone={isUpdated}
      isMainButton={true}
      isReadOnly={isUpdating || isPristine}
      isSubmitting={isUpdating}
      onSubmit={() => {}}
      pristine={isPristine}
      text="Update"
      tooltipPristine="Modify description to update value"
    />
  );
  return (
    <Form
      onSubmit={(e) => {
        console.log("submit");
      }}
    >
      <FormGroup>
        <Label for="projectDescription">Project Description</Label>
        <div className="d-flex">
          {inputField}
          {submitButton}
        </div>
        <FormText>A short description for the project</FormText>
      </FormGroup>
    </Form>
  );
}

export default ProjectDescription;
