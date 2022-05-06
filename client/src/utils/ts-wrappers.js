/**
 * Some nonsense to temporarily work around typescript issues.
 */
import React from "react";

import {
  Alert as WrappedAlert,
  Button as WrappedButton,
  ButtonGroup as WrappedButtonGroup,
  Col as WrappedCol,
  DropdownItem as WrappedDropdownItem,
  Fade as WrappedFade,
  FormFeedback as WrappedFormFeedback,
  FormText as WrappedFormText,
  Label as WrappedLabel,
  Modal as WrappedModal,
  ModalBody as WrappedModalBody,
  ModalHeader as WrappedModalHeader,
  Row as WrappedRow,
} from "reactstrap/lib";


import {
  Card as WrappedCard,
  CardBody as WrappedCardBody,
  CardText as WrappedCardText,
  CardFooter as WrappedCardFooter,
  PopoverHeader as WrappedPopoverHeader,
  PopoverBody as WrappedPopoverBody,
  UncontrolledPopover as WrappedUncontrolledPopover,
  UncontrolledTooltip as WrappedUncontrolledTooltip
} from "reactstrap/lib";


import { FormGroup as WrappedFormGroup, Input as WrappedInput } from "reactstrap/lib";

function Alert(props) {
  return <WrappedAlert {...props} />;
}

function Button(props) {
  return <WrappedButton {...props} />;
}

function ButtonGroup(props) {
  return <WrappedButtonGroup {...props} />;
}

function Col(props) {
  return <WrappedCol {...props} />;
}

function Card(props) {
  return <WrappedCard {...props} />;
}

function CardBody(props) {
  return <WrappedCardBody {...props} />;
}

function CardText(props) {
  return <WrappedCardText {...props} />;
}

function CardFooter(props) {
  return <WrappedCardFooter {...props} />;
}

function PopoverHeader(props) {
  return <WrappedPopoverHeader {...props} />;
}

function PopoverBody(props) {
  return <WrappedPopoverBody {...props} />;
}


function UncontrolledPopover(props) {
  return <WrappedUncontrolledPopover {...props} />;
}

function UncontrolledTooltip(props) {
  return <WrappedUncontrolledTooltip {...props} />;
}

function DropdownItem(props) {
  return <WrappedDropdownItem {...props} />;
}

function Fade(props) {
  return <WrappedFade {...props} />;
}

function FormFeedback(props) {
  return <WrappedFormFeedback {...props} />;
}


function FormText(props) {
  return <WrappedFormText {...props} />;
}

function FormGroup(props) {
  return <WrappedFormGroup {...props} />;
}

function Input(props) {
  return <WrappedInput {...props} />;
}

function Label(props) {
  return <WrappedLabel {...props} />;
}

function Modal(props) {
  return <WrappedModal {...props} />;
}

function ModalBody(props) {
  return <WrappedModalBody {...props} />;
}

function ModalHeader(props) {
  return <WrappedModalHeader {...props} />;
}

function Row(props) {
  return <WrappedRow {...props} />;
}


export { Alert, Button, ButtonGroup };
export { Card, CardBody, CardText, CardFooter, Col, DropdownItem };
export { FormFeedback, FormText, Fade, FormGroup, Input, Label };
export { PopoverHeader, PopoverBody };
export { Modal, ModalBody, ModalHeader, Row };
export { UncontrolledPopover, UncontrolledTooltip };
