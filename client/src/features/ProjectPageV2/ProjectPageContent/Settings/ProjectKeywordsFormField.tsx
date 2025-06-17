import cx from "classnames";
import { Controller } from "react-hook-form";
import { Button, FormText, Label } from "reactstrap";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import { PlusLg } from "react-bootstrap-icons";
import type {
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import type { ProjectV2MetadataWithKeyword } from "../../settings/projectSettings.types";

interface ProjectKeywordsFormFieldProps {
  control: Control<Required<ProjectV2MetadataWithKeyword>>;
  errors: FieldErrors<Required<ProjectV2MetadataWithKeyword>>;
  getValues: UseFormGetValues<Required<ProjectV2MetadataWithKeyword>>;
  oldKeywords?: string[];
  setValue: UseFormSetValue<Required<ProjectV2MetadataWithKeyword>>;
}

export default function ProjectKeywordsFormField({
  control,
  errors,
  getValues,
  oldKeywords,
  setValue,
}: ProjectKeywordsFormFieldProps) {
  return (
    <div>
      <Label className="form-label" for="project-keywords">
        Keywords
      </Label>
      <div className={cx("input-group", "input-group-sm", "mb-2")}>
        <Controller
          name="keyword"
          control={control}
          render={({ field }) => (
            <>
              <input
                id="keyword"
                placeholder="Add new keyword"
                type="string"
                {...field}
                className={cx("form-control", errors.keyword && "is-invalid")}
                data-cy="project-settings-keyword-input"
                onChange={(e) => {
                  field.onChange(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && field.value) {
                    e.preventDefault();
                    const newValue = field.value.trim();
                    const currentKeywords = getValues("keywords");
                    if (!currentKeywords.includes(newValue)) {
                      const newKeywords = [...currentKeywords, newValue];
                      setValue("keywords", newKeywords);
                    }
                    setValue("keyword", "");
                  }
                }}
              />
              <Button
                color={field.value ? "primary" : "outline-primary"}
                disabled={!field.value}
                data-cy="project-settings-keyword-button"
                onClick={() => {
                  if (field.value) {
                    const newValue = field.value.trim();
                    const currentKeywords = getValues("keywords");
                    if (!currentKeywords.includes(newValue)) {
                      const newKeywords = [...currentKeywords, newValue];
                      setValue("keywords", newKeywords);
                    }
                    setValue("keyword", "");
                  }
                }}
                type="button"
              >
                <PlusLg className={cx("bi", "me-1")} />
                Add
              </Button>
            </>
          )}
        />
      </div>
      <Controller
        name="keywords"
        control={control}
        render={({ field }) => (
          <>
            {field.value && field.value.length > 0 && (
              <KeywordContainer data-cy="project-settings-keywords">
                {getValues("keywords")
                  .sort((a, b) => a.localeCompare(b))
                  .map((keyword, index) => (
                    <KeywordBadge
                      data-cy="project-settings-keyword"
                      key={index}
                      highlighted={!oldKeywords?.includes(keyword)}
                      removeHandler={() => {
                        const newKeywords = getValues("keywords").filter(
                          (k) => k !== keyword
                        );
                        setValue("keywords", newKeywords);
                      }}
                    >
                      {keyword}
                    </KeywordBadge>
                  ))}
              </KeywordContainer>
            )}
          </>
        )}
      />
      <FormText id="projectKeywordsHelp" className="input-hint">
        Add keywords to help categorize and search for this project.
      </FormText>
    </div>
  );
}
