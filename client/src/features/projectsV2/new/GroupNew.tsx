/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import { Button, Collapse, Form, FormText } from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import type { GroupPostRequest } from "../api/namespace.api";
import { usePostGroupsMutation } from "../api/projectV2.enhanced-api";
import DescriptionFormField from "../fields/DescriptionFormField";
import NameFormField from "../fields/NameFormField";
import SlugFormField from "../fields/SlugFormField";

export default function GroupNew() {
  const user = useLegacySelector((state) => state.stateModel.user);
  return (
    <div data-cy="create-new-group-page">
      <h2>Create a new group</h2>
      <p>
        Groups let you group together related projects and control who can
        access them.
      </p>
      {user.logged ? (
        <GroupV2CreationDetails />
      ) : (
        <LoginAlert
          logged={user.logged}
          textIntro="Only authenticated users can create new groups."
          textPost="to create a new group."
        />
      )}
    </div>
  );
}

function GroupV2CreationDetails() {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const [createGroup, result] = usePostGroupsMutation();
  const navigate = useNavigate();

  // Form initialization
  const {
    control,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
    watch,
  } = useForm<GroupPostRequest>({
    mode: "onChange",
    defaultValues: {
      description: "",
      name: "",
      slug: "",
    },
  });

  // We watch for changes in the name and derive the slug from it
  const currentName = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [currentName, setValue]);

  // Slug is use to show the projected URL
  const currentSlug = watch("slug");

  // Group creation utilities
  const onSubmit = useCallback(
    (groupPostRequest: GroupPostRequest) => {
      createGroup({ groupPostRequest });
    },
    [createGroup]
  );

  useEffect(() => {
    if (result.isSuccess) {
      const groupUrl = generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
        slug: currentSlug,
      });
      navigate(groupUrl);
    }
  }, [currentSlug, result, navigate]);

  const nameHelpText = (
    <FormText className="input-hint">
      The URL for this group will be{" "}
      <span className="fw-bold">
        renkulab.io/v2/groups/{currentSlug || "<Name>"}
      </span>
    </FormText>
  );

  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-1">
          <NameFormField
            control={control}
            entityName="group"
            errors={errors}
            helpText={nameHelpText}
            name="name"
          />
        </div>

        <div className="mb-3">
          <button
            className={cx("btn", "btn-link", "p-0", "text-decoration-none")}
            data-cy="group-slug-toggle"
            onClick={toggleCollapse}
            type="button"
          >
            Customize group URL <ChevronDown className="bi" />
          </button>
          <Collapse isOpen={isCollapseOpen}>
            <div
              className={cx(
                "align-items-center",
                "d-flex",
                "flex-wrap",
                "mb-0"
              )}
            >
              <span>renkulab.io/v2/groups/</span>
              <SlugFormField
                compact={true}
                control={control}
                entityName="group"
                errors={errors}
                name="slug"
              />
            </div>
          </Collapse>

          {errors.slug && touchedFields.slug && (
            <div className={cx("d-block", "invalid-feedback")}>
              <p className="mb-1">
                You can customize the slug only with lowercase letters, numbers,
                and hyphens.
              </p>

              {currentName ? (
                <Button color="danger" size="sm" onClick={resetUrl}>
                  Reset URL
                </Button>
              ) : (
                <p className="mb-0">
                  Mind the URL will be updated once you provide a name.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-3">
          <DescriptionFormField
            control={control}
            entityName="group"
            errors={errors}
            name="description"
          />
        </div>

        {result.error && (
          <div className="mb-3">
            <RtkOrNotebooksError error={result.error} />
          </div>
        )}
        <div>
          <Button color="primary" data-cy="group-create-button" type="submit">
            Create
          </Button>
        </div>
      </Form>
    </>
  );
}
