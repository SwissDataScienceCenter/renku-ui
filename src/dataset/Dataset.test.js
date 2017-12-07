import React from 'react';
import ReactDOM from 'react-dom';
import Dataset, { displayIdFromTitle } from './Dataset';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Dataset.New />, div);
});

it('computes display Id correctly', () => {
  expect(displayIdFromTitle("This is my Dataset")).toEqual("this-is-my-dataset");
});
