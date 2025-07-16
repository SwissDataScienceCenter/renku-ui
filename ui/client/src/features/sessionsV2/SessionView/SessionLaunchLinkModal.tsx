/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ArrowClockwise, CheckCircle, Link45deg } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import {
  Button,
  Col,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  Row,
} from "reactstrap";
import { generatePath } from "react-router";

import { Clipboard } from "../../../components/clipboard/Clipboard";
import ChevronFlippedIcon from "../../../components/icons/ChevronFlippedIcon";
import ModalHeader from "../../../components/modal/ModalHeader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import AppContext from "../../../utils/context/appContext";

import { Project } from "../../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";

interface CustomizeLaunchLinkFormProps {
  control: ReturnType<typeof useForm<EnvVariablesCustomizationForm>>["control"];
  errors: FieldErrors<EnvVariablesCustomizationForm>;
  fields: FieldArrayWithId<
    EnvVariablesCustomizationForm,
    "envVariables",
    "id"
  >[];
  handleSubmit: ReturnType<
    typeof useForm<EnvVariablesCustomizationForm>
  >["handleSubmit"];
  register: UseFormRegister<EnvVariablesCustomizationForm>;
  resetField: ReturnType<
    typeof useForm<EnvVariablesCustomizationForm>
  >["resetField"];
  watch: ReturnType<typeof useForm<EnvVariablesCustomizationForm>>["watch"];
}

function CustomizeLaunchLinkForm({
  control,
  errors,
  fields,
  handleSubmit,
  register,
  resetField,
  watch,
}: CustomizeLaunchLinkFormProps) {
  const onSubmit = () => {};

  if (fields.length < 1) {
    return (
      <div className={cx("mt-2", "text-muted")}>
        To customize your launch link, first add environment variables by going
        to the Environment Variables section of the session launcher.
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <EditEnvVariablesCustomizationFormContent
            key={field.id} // important to include key with field's id
            errors={errors}
            index={index}
            control={control}
            register={register}
            resetField={resetField}
            watch={watch}
          />
        ))}
      </Form>
      <p className="text-muted">
        To modify or add environment variables, see the Environment Variables
        section of the session launcher.
      </p>
    </div>
  );
}

function CustomizeLaunchLink(props: CustomizeLaunchLinkFormProps) {
  const [isCustomizationFormOpen, setCustomizationFormOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setCustomizationFormOpen(
        (isCustomizationFormOpen) => !isCustomizationFormOpen
      ),
    []
  );
  return (
    <div className="w-100">
      <div>
        <button
          className={cx(
            "d-flex",
            "align-items-center",
            "w-100",
            "bg-transparent",
            "border-0",
            "fw-bold",
            "ps-0"
          )}
          type="button"
          data-cy="customize-launch-link-expand"
          onClick={toggleIsOpen}
        >
          <span className="me-1">Customize Launch Link</span>
          <ChevronFlippedIcon flipped={isCustomizationFormOpen} />
        </button>
      </div>
      <Collapse isOpen={isCustomizationFormOpen}>
        <div className="mt-2">
          Select the parameters to customize of your session launch link. These
          values will be available in the session as environment variables.
        </div>
        <div>
          <CustomizeLaunchLinkForm {...props} />
        </div>
      </Collapse>
    </div>
  );
}

interface EnvVariableCustomization {
  isCustomized: boolean;
  name: string;
  value: string;
}

interface EnvVariablesCustomizationForm {
  envVariables: EnvVariableCustomization[];
}

function getLauncherDefaultValues(
  launcher: SessionLauncher
): EnvVariablesCustomizationForm {
  if (launcher.env_variables == null) return { envVariables: [] };
  const envVariables = launcher.env_variables.map((env) => ({
    isCustomized: false,
    name: env.name,
    value: env.value ?? "",
  }));
  return { envVariables };
}

interface EnvVariablesCustomizationFormContentProps
  extends Pick<
    CustomizeLaunchLinkFormProps,
    "control" | "errors" | "register" | "resetField" | "watch"
  > {
  index: number;
}

function EditEnvVariablesCustomizationFormContent({
  control,
  errors,
  index,
  resetField,
  watch,
}: EnvVariablesCustomizationFormContentProps) {
  const error = errors.envVariables ? errors.envVariables[index] : undefined;
  const isCustomized = watch(`envVariables.${index}.isCustomized`);
  return (
    <Row className={cx("align-items-baseline", "mb-3")}>
      <Col xs={4}>
        <FormGroup check>
          <Controller
            control={control}
            name={`envVariables.${index}.isCustomized`}
            render={({ field }) => {
              const { ref, value, ...fieldProps } = field;
              return (
                <Input
                  type="checkbox"
                  checked={value}
                  data-cy={`env-variables-input_${index}-customized`}
                  {...fieldProps}
                  innerRef={ref}
                />
              );
            }}
          />
          <Controller
            control={control}
            name={`envVariables.${index}.name`}
            render={({ field }) => {
              const { value } = field;
              return (
                <Label check className="text-break">
                  {value}
                </Label>
              );
            }}
          />
        </FormGroup>
      </Col>
      <Col xs={7}>
        <Controller
          control={control}
          name={`envVariables.${index}.value`}
          render={({ field }) => {
            const { ref, ...fieldProps } = field;
            return isCustomized ? (
              <Input
                bsSize="sm"
                className={cx(error?.value && "is-invalid")}
                disabled={!isCustomized}
                placeholder="value"
                type="text"
                data-cy={`env-variables-input_${index}-value`}
                {...fieldProps}
                innerRef={ref}
              />
            ) : (
              <Label>{fieldProps.value}</Label>
            );
          }}
          rules={{
            maxLength: {
              message: "Value can be at most 500 characters.",
              value: 500,
            },
          }}
        />
        <div className="invalid-feedback">
          {error?.value?.message ?? "Please input valid value."}
        </div>
      </Col>
      <Col xs={1}>
        <Button
          data-cy={`env-variables-input_${index}-reset`}
          color="outline-danger"
          onClick={() => {
            resetField(`envVariables.${index}.value`);
          }}
          size="sm"
        >
          <ArrowClockwise className="bi" />
        </Button>
      </Col>
    </Row>
  );
}

type SessionLaunchLinkProps = Required<
  Pick<SessionLaunchLinkModalProps, "launcher" | "project">
> &
  SessionLaunchLinkCustomizationInfoProps;

function SessionLaunchLink({
  fields,
  launcher,
  project,
  watch,
}: SessionLaunchLinkProps) {
  const startPath = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace: project.namespace,
      slug: project.slug,
    }
  );
  const { params } = useContext(AppContext);
  const baseUrl = params?.BASE_URL ?? window.location.href;
  const customized = fields.map(
    (_f, i) => `envVariables.${i}.isCustomized`
  ) as `envVariables.${number}.isCustomized`[];
  const values = fields.map(
    (_f, i) => `envVariables.${i}.value`
  ) as `envVariables.${number}.value`[];
  const isCustomizedValues = watch(customized);
  const fieldValues = watch(values);

  const urlWithParams = useMemo(() => {
    const url = new URL(startPath, baseUrl);
    const searchParams = new URLSearchParams();
    fields.forEach((field, i) => {
      if (isCustomizedValues[i]) {
        searchParams.append(field.name, fieldValues[i]);
      }
    });
    const urlWithParams = new URL(url.toString());
    urlWithParams.search = searchParams.toString();
    return urlWithParams;
  }, [baseUrl, fields, fieldValues, isCustomizedValues, startPath]);

  const markdown = `[![launch - renku](${baseUrl}/renku-badge.svg)](${urlWithParams.toString()})`;
  return (
    <Row className="mb-2">
      <Col md={6}>
        <div className="fw-bold">Copy Session Launch Link URL</div>
        <p className="mb-2">
          Share a URL that directly launches a new Renku session with this
          launcher.
        </p>
        <div>
          <Clipboard
            className={cx(
              "btn",
              "btn-primary",
              "d-inline-block",
              "cursor-pointer"
            )}
            clipboardText={urlWithParams.toString()}
          >
            <span className="ms-2">Copy Launch Link</span>
          </Clipboard>
        </div>
      </Col>
      <Col md={6}>
        <div className={cx("fw-bold", "d-flex", "gap-2", "align-items-center")}>
          <div>Copy Launch Badge</div>
          <div>
            <img src="/renku-badge.svg" alt="renku-badge" />
          </div>
        </div>
        <p className="mb-2">
          Insert a click-able badge into a markdown file, such as a README, that
          launches a new session with this launcher.
        </p>
        <div>
          <Clipboard
            className={cx("btn", "btn-primary", "cursor-pointer")}
            clipboardText={markdown}
          >
            <span className="ms-2">Copy Badge</span>
          </Clipboard>
        </div>
      </Col>
    </Row>
  );
}

type SessionLaunchLinkCustomizationInfoProps = Pick<
  CustomizeLaunchLinkFormProps,
  "fields" | "watch"
>;
function SessionLaunchLinkCustomizationInfo({
  fields,
  watch,
}: SessionLaunchLinkCustomizationInfoProps) {
  const customized = fields.map(
    (_f, i) => `envVariables.${i}.isCustomized`
  ) as `envVariables.${number}.isCustomized`[];
  const isCustomizedValues = watch(customized);
  const shownFields = fields.filter((_f, i) => isCustomizedValues[i]);
  if (shownFields.length < 1) return null;
  return (
    <>
      <div className={cx("mt-3", "mb-2")}>
        The link and badge above include the following customizations:
      </div>
      {shownFields.map((field, index) => (
        <div key={index} data-cy={`env-variables-customized_${index}`}>
          <CheckCircle className={cx("bi", "me-2", "text-primary")} />
          {field.name}
        </div>
      ))}
    </>
  );
}

interface SessionLaunchLinkModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

export default function SessionLaunchLinkModal({
  isOpen,
  launcher,
  project,
  toggle,
}: SessionLaunchLinkModalProps) {
  const defaultValues = useMemo(
    () => getLauncherDefaultValues(launcher),
    [launcher]
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    resetField,
    watch,
  } = useForm<EnvVariablesCustomizationForm>({
    defaultValues,
  });
  const { fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "envVariables", // unique name for your Field Array
  });

  useEffect(() => {
    reset(defaultValues);
  }, [launcher, reset, defaultValues, isOpen]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
      scrollable
    >
      <ModalHeader
        modalTitle={
          <div className={cx("d-flex", "align-items-center")}>
            <Link45deg className={cx("bi", "me-1")} /> Share Session launch link
            for {launcher.name}
          </div>
        }
        toggle={toggle}
      ></ModalHeader>
      <ModalBody>
        <SessionLaunchLink
          fields={fields}
          launcher={launcher}
          project={project}
          watch={watch}
        />
        <SessionLaunchLinkCustomizationInfo fields={fields} watch={watch} />
      </ModalBody>
      <ModalFooter>
        <CustomizeLaunchLink
          control={control}
          errors={errors}
          fields={fields}
          handleSubmit={handleSubmit}
          register={register}
          resetField={resetField}
          watch={watch}
        />
      </ModalFooter>
    </Modal>
  );
}
