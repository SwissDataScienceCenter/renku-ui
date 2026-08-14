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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import { useEffect } from "react";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Button, FormText, Input, Label } from "reactstrap";

import { Loader } from "~/components/Loader";
import type {
  AddMemberToResourcePoolForm,
  BatchItemForm,
  MemberType,
} from "./addMemberToResourcePool.types";
import {
  BATCH_INPUT_HELP,
  BATCH_INPUT_PLACEHOLDER,
  MEMBER_TYPE_LABELS,
} from "./addMemberToResourcePool.utils";
import useResolveBatchItem from "./useResolveBatchItem.hook";

interface BatchInputSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddMemberToResourcePoolForm, any>;
  errors: { batchInput?: { type?: string } };
  fields: FieldArrayWithId<AddMemberToResourcePoolForm, "batchItems", "id">[];
  memberType: MemberType;
  onFind: () => void;
  setValue: UseFormSetValue<AddMemberToResourcePoolForm>;
  watch: UseFormWatch<AddMemberToResourcePoolForm>;
}

export default function BatchInputSection({
  control,
  errors,
  fields,
  memberType,
  onFind,
  setValue,
  watch,
}: BatchInputSectionProps) {
  if (fields.length === 0) {
    return (
      <div>
        <Label className="form-label" for="addMembersBatchInput">
          {MEMBER_TYPE_LABELS[memberType].plural}
        </Label>
        <FormText id="addMembersBatchInputHelp" tag="div">
          {BATCH_INPUT_HELP[memberType]}
        </FormText>
        <Controller
          control={control}
          name="batchInput"
          render={({ field }) => (
            <textarea
              aria-describedby="addMembersBatchInputHelp"
              className={cx("form-control", errors.batchInput && "is-invalid")}
              id="addMembersBatchInput"
              placeholder={BATCH_INPUT_PLACEHOLDER[memberType]}
              rows={10}
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a list</div>
        <Button className="mt-2" onClick={onFind}>
          Find {MEMBER_TYPE_LABELS[memberType].plural}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-label">{MEMBER_TYPE_LABELS[memberType].plural}</div>
      <ol className="list-group">
        {fields.map((item, index) => (
          <BatchItemRow
            key={item.id}
            className={cx(
              index === 0 && "rounded-top",
              index + 1 === fields.length && "rounded-bottom",
            )}
            control={control}
            index={index}
            item={item}
            memberType={memberType}
            setValue={setValue}
            watch={watch}
          />
        ))}
      </ol>
    </div>
  );
}

interface BatchItemRowProps {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddMemberToResourcePoolForm, any>;
  index: number;
  item: FieldArrayWithId<AddMemberToResourcePoolForm, "batchItems", "id">;
  memberType: MemberType;
  setValue: UseFormSetValue<AddMemberToResourcePoolForm>;
  watch: UseFormWatch<AddMemberToResourcePoolForm>;
}

export function BatchItemRow({
  className,
  control,
  index,
  item,
  memberType,
  setValue,
  watch,
}: BatchItemRowProps) {
  const batchItem = watch(`batchItems.${index}`) as BatchItemForm;
  const resolved = useResolveBatchItem(memberType, item.input);

  useEffect(() => {
    if (resolved.isFetching) {
      return;
    }

    setValue(`batchItems.${index}.isFetching`, false);
    setValue(`batchItems.${index}.found`, resolved.found);
    setValue(`batchItems.${index}.addToResourcePool`, resolved.found);
    setValue(`batchItems.${index}.id`, resolved.id ?? "");
    setValue(`batchItems.${index}.name`, resolved.name ?? "");
  }, [index, resolved, setValue]);

  return (
    <li
      className={cx(
        className,
        "list-group-item",
        "d-flex",
        "flex-row",
        "flex-wrap",
        "justify-content-between",
        "align-items-center",
        "bg-rk-white",
        !batchItem.isFetching && !batchItem.found && "text-danger",
      )}
    >
      {batchItem.isFetching ? (
        <span>
          <Loader className="me-1" inline size={16} />
          {batchItem.input}
        </span>
      ) : !batchItem.found ? (
        <span>
          <ExclamationCircleFill className={cx("bi", "me-1")} />
          {batchItem.input}
        </span>
      ) : (
        <div className="form-check">
          <Controller
            control={control}
            name={`batchItems.${index}.addToResourcePool`}
            render={({ field }) => (
              <Input
                className="form-check-input"
                id={`addMemberBatchItem-${item.id}`}
                type="checkbox"
                checked={field.value}
                innerRef={field.ref}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
          <Label
            className="form-check-label"
            for={`addMemberBatchItem-${item.id}`}
          >
            {batchItem.input}
          </Label>
        </div>
      )}
      {batchItem.isFetching ? (
        <span className="fst-italic">Fetching...</span>
      ) : batchItem.found ? (
        <span>{batchItem.name}</span>
      ) : (
        <span className="fst-italic">
          {MEMBER_TYPE_LABELS[memberType].singular} not found
        </span>
      )}
    </li>
  );
}
