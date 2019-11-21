/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renku-ui
 *
 *  FormGenerator
 *  Components for the new form generator
 *
 * 	In order to use the form generator you need to
 * 	1- Define a model in Renku Models with the field configurations
 * 	2- Create handlers to change the state of variables (you can use "useState")
 * 	3- Create a submit function (what happens when the user clicks to submit the form)
 *  4- Import the model (step 1) and the FormPanel (here)
 * 	5- Add the FormPanel component using the model(step 1), submitCallback (step 3) :
 * 				<FormPanel
 *      	   title="Title of the form"
 *    	     btnName="Text in the button"
 *  	       submitCallback={submitCallback}
 *	         model={props.datasetFormSchema} />
 *
 */

import FormPanel from './FormPanel';
import Parsers from './services/InputParser';
import Validators from './services/InputValidator';
import Fields from './fields';

export default {
  FormPanel,
  Parsers,
  Validators,
  FieldTypes: Fields.FieldTypes
}

export { FormPanel };
