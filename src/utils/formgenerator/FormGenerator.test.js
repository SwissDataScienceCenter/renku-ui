import React from 'react';
import ReactDOM from 'react-dom';
import { Schema } from '../../model/Model'
import { parseOnlyLetterAndSpace } from './services/InputParser';
import { checkAtLeastLength, checkIsfilled } from './services/InputValidator';
import FormPanel from './FormPanel';


let schema = new Schema({
	name: {
		initial: "",
		name: 'text',
		label: 'Text',
		type: 'text',
		parseFun: parseOnlyLetterAndSpace,
		help: "Help text",
		validators: [{
			id: 'text-length',
			isValidFun: expression => checkAtLeastLength(expression, 3),
			alert: 'Text is too short'
		}]
	},
	description: {
		initial: "",
		name: 'textarea',
		label: 'TextArea',
		type: 'cktextarea',
		validators: [{
			id: 'textarea-length',
			isValidFun: expression => checkIsfilled(expression, 3),
			alert: 'TextArea can\'t be emtpy'
		}]
	},
	files: {
		initial: [],
		name: 'files',
		label: 'Files',
		type: 'filepond',
		validators:[{
			id: 'files-length',
			isValidFun: expression => checkIsfilled(expression, 1),
			alert: 'File length should be more than 1.'
		}]
	}
})


describe('rendering', () => {
  it('renders form without crashing', () => {
		const div = document.createElement('div');
		
		const submitCallback = e => 
    alert(Object.values(schema)
      .map(m => m.label + ': ' + m.value + ',\n')
      .join(''));

    ReactDOM.render(<FormPanel
			title="Create Dataset" 
			btnName="Create Dataset" 
			submitCallback={submitCallback} 
			model={schema} />
		, div);
	});
});

describe('validators', () => {
  it('checks at least length true', () => {
    expect(checkAtLeastLength("Hello World", 3)).toEqual(true);
	});
	it('checks at least length false', () => {
    expect(checkAtLeastLength("He", 3)).toEqual(false);
	});
	it('checks that is filled true', () => {
    expect(checkIsfilled("asdfasdf")).toEqual(true);
	});
	it('checks that is filled false', () => {
    expect(checkIsfilled([])).toEqual(false);
	});
});
