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
  Form as WrappedForm,
  FormText as WrappedFormText,
  Label as WrappedLabel,
  Modal as WrappedModal,
  ModalBody as WrappedModalBody,
  ModalHeader as WrappedModalHeader,
  ModalFooter as WrappedModalFooter,
  Row as WrappedRow,
  Table as WrappedTable,
} from "reactstrap";


import {
  Card as WrappedCard,
  CardBody as WrappedCardBody,
  CardText as WrappedCardText,
  CardFooter as WrappedCardFooter,
  PopoverHeader as WrappedPopoverHeader,
  PopoverBody as WrappedPopoverBody,
  UncontrolledPopover as WrappedUncontrolledPopover,
  UncontrolledTooltip as WrappedUncontrolledTooltip
} from "reactstrap";


import { FormGroup as WrappedFormGroup, Input as WrappedInput } from "reactstrap";

import {
  Carousel as WrappedCarousel,
  CarouselItem as WrappedCarouselItem,
  CarouselControl as WrappedCarouselControl,
  CarouselIndicators as WrappedCarouselIndicators,
  CarouselCaption as WrappedCarouselCaption,
} from "reactstrap";

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

function Form(props) {
  return <WrappedForm {...props} />;
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

function ModalFooter(props) {
  return <WrappedModalFooter {...props} />;
}

function Row(props) {
  return <WrappedRow {...props} />;
}

function Table(props) {
  return <WrappedTable {...props} />;
}

function Carousel(props) {
  return <WrappedCarousel {...props} />;
}
function CarouselItem(props) {
  return <WrappedCarouselItem {...props} />;
}

function CarouselControl(props) {
  return <WrappedCarouselControl {...props} />;
}

function CarouselIndicators(props) {
  return <WrappedCarouselIndicators {...props} />;
}

function CarouselCaption(props) {
  return <WrappedCarouselCaption {...props} />;
}


export { Alert, Button, ButtonGroup };
export { Card, CardBody, CardText, CardFooter, Col, DropdownItem };
export { FormFeedback, FormText, Fade, Form, FormGroup, Input, Label };
export { PopoverHeader, PopoverBody };
export { Modal, ModalBody, ModalHeader, ModalFooter, Row, Table };
export { UncontrolledPopover, UncontrolledTooltip };
export {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
};
