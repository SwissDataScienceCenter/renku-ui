## FORM FRAMEWORK

The form framework was created to generate forms from schemas.

### FIELDS INSIDE THE FORM

A form is defined using a schema (see "Generating a form"), the schema contains fields. Each field has diferent properties that can be set inside the form schema definition or after this is cloned to be used. In particular, the **value** property of each field will be updated on every change of the field using the setInputs function.

Currently the form has 9 fields:

- Text: single line text input.
- TextArea: multiple line text input
- CKEditorTextArea: wysiwyg editor, outputs markdown or HTML
- Creators: field used at the moment in datasets to define a creator person with name, email and affiliation.
- File(s): used to input files, at the moment this was created to work with the core-service. Accepts local files upload and link upload (i.e dropbox). Can uncompress files, display progress, errors per file, ...
- Image: used to upload images. 
- Keywords: used to input keywords. You need to write a kewyord and press enter for the keyword to be inputed, you can delete keywords with a click.
- SelectAutosuggest: this field is used inside the "add dataset to project" form, is used to suggest the user project paths where the dataset can be added.
- Select: classic dropdown input.

Field properties (shared):

- initial: "", initial value
- name: "name", name of the field
- label: "Name", label of the field
- edit: false, if it can be edited when the form is on edit mode
- required: true, if it's required
- type: FormGenerator.FieldTypes.TEXT, field type
- parseFun: expression => FormGenerator.Parsers.slugFromTitle(expression), // parser function invoked after a change in the form
- validators: [{
    id: "name-length",
    isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
    alert: "Name is too short"
  }], //list of validator functions for the field, if they return false they display the alert message
- help: "Help text", help text for the field

The fields can have properties that are not shared, like:
- editOnClick (TEXT) used in text fields, a text field can be automatically filled (like the slug) and edited only on request.
- outputType: used in the ckeditorfield, can be "markdown" or "html"
- inside the file uploader: uploadFileFunction (call to the client to upload a file), filesOnUploader (initial files on uploader), notifyFunction (function to send a notification, used when a file upload returns an error), internalValues (several internal values that are stored in redux in case the user leaves and goes back to a form)
- inside the image uploader: maxSize and format
- options list of options used on the select field


### GENERATING A FORM

In order to generate a form we need to:

1. Define a schema inside RenkuModels.js and export it

```
const singleFieldForm = new Schema({
  title: {
    initial: "",
    name: "title",
    label: "Title",
    required: true,
    type: FormGenerator.FieldTypes.TEXT,
    validators: [{
      id: "title-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Title is too short"
    }],
    help: "The title is displayed in listings of datasets."
  });
```

2. Import and clone the schema that we want to use

```let dsFormSchema = _.cloneDeep(datasetFormSchema);```

3. Define the following functions
	- initializeFunction(formSchema): in case something inside some field needs to set up when the form is initialized, we receive the parameter formSchem when it's called so we can initialize fields as needed.
	- onCancell(e, handlers): this is used when we want to cancell the current operation. Usually we need to call `handlers.removeDraft()` in order to remove the current draft from the redux store.
	- submitCallback(e, mappedInputs, handlers): this function receives as a parameter the event, the mappedInputs and the handlers. It should call the backend(client) and perform the operation. mappedInputs is a map that has field name and value, when doing `mappedInput.fieldName` we get the value of fieldName. This is usefull for us to format the data before we call the client. The handlers can be used to: `setServerErrors`, `setServerWarnings`, `setDisableAll`(this disables all fields), `setSubmitLoader`(sets a loader and message when the submit operation is happening), `removeDraft`(when the operation is successfull we need to remove the draft from the redux store) otherwise we leave it so that the user can access it.
	- formatServerErrorsAndWarnings(errorOrWarning, isError): this function is optional, it can be used to format the errors and warnings in a custom way. It was created to handle the cases when the error returned by 	different endpoints are formated in a different way or when we want to make some processing of this errors. It has two parameters, errorOrWarning is the body of the error or warning. Is error is a boolean value that says if we received an error or a warning (mostly used to define the color of the background of the alert).

4. Use the FormGenerator component in the following way:

```
 <FormGenerator
    title={"Form Title"} // optional, we can have a form with no title
    btnName={"Create Element"} // submit button name
    submitCallback={submitCallback} // previously defined submit function
    model={singleFieldForm} // previously cloned schema
    onCancel={onCancel} // previously defined onCancel function
    edit={false} // boolean value that determins weather the operation is create or edit
    modelTop={props.model} // comes from top (this.props.model in Project.js). Provides access to the redux store
    initializeFunction={props.initializeFunction} // previously defined initialize function
    formatServerErrorsAndWarnings={formatServerErrorsAndWarnings} // previously defined
		formLocation={props.formLocation} // this is the url in which the form is located, used as id to store and 
		// retrieve the form in the redux store example: /projects/virginia.friedrich/test-project/datasets/new
  />;
```

5. All is set to use the generated form


### FORM DRAFTS

The redux store stores a list of form drafts to allow the user to leave the form page, come back and finish filling the form. The form draft is created when the user enters a form page, and **should be deleted** when they press cancell or the operation finishes succesfully (they are redirected to a new page) this can, this is done inside the client.submitForm.then(response => handlers.removeDraft()), it could be usefull to move this to the FormGenerator.container class, at least for the cases where this is generic (cancel, redirect after success).

The form draft has the following form, if a form is not generated using the form generator it could still
be adapted to be stored inside the form draft store.

```
locationHash : {
	location
	currentFormModel:[ //--> array of fields
		{
			name,
			value,
			type,
			internalValues //--> here we store the internal state of a field (used in file uploader at the moment)
		}
		]
	],
	submitLoader: {value: boolean, text: "Submitting form..."},
	serverErrors,
	serverWarnings,
	...
}
```
