import cx from "classnames";
import { PlusLg } from "react-bootstrap-icons";
import type {
  Control,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button, FormText, Label } from "reactstrap";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import type { ProjectV2MetadataWithKeyword } from "../../settings/projectSettings.types";

interface ProjectKeywordsFormFieldProps {
  control: Control<Required<ProjectV2MetadataWithKeyword>>;
  getValues: UseFormGetValues<Required<ProjectV2MetadataWithKeyword>>;
  setValue: UseFormSetValue<Required<ProjectV2MetadataWithKeyword>>;
}

export default function ProjectKeywordsFormField({
  control,
  getValues,
  setValue,
}: ProjectKeywordsFormFieldProps) {
  const setKeywords = (fieldValue: string) => {
    const newValue = fieldValue.trim();
    const currentKeywords = getValues("keywords");
    if (!currentKeywords.includes(newValue)) {
      const newKeywords = [...currentKeywords, newValue];
      setValue("keywords", newKeywords);
    }
    setValue("keyword", "");
  };

  return (
    <div>
      <Label className="form-label" for="project-keyword">
        Keywords
      </Label>
      <div className={cx("input-group", "input-group-sm", "mb-2")}>
        <Controller
          control={control}
          name="keyword"
          render={({ field, fieldState }) => (
            <>
              <input
                id="project-keyword"
                placeholder="Add new keyword"
                type="string"
                {...field}
                className={cx("form-control", fieldState.error && "is-invalid")}
                data-cy="project-settings-keyword-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && field.value) {
                    e.preventDefault();
                    setKeywords(field.value);
                  }
                }}
              />
              <Button
                color={field.value ? "primary" : "outline-primary"}
                disabled={!field.value}
                data-cy="project-settings-keyword-button"
                onClick={() => {
                  if (field.value) {
                    setKeywords(field.value);
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
        render={({ field, formState }) => (
          <>
            {field.value && field.value.length > 0 && (
              <KeywordContainer data-cy="project-settings-keywords">
                {field.value
                  .sort((a, b) => a.localeCompare(b))
                  .map((keyword, index) => (
                    <KeywordBadge
                      data-cy="project-settings-keyword"
                      key={index}
                      highlighted={
                        !(formState.defaultValues?.keywords ?? []).includes(
                          keyword
                        )
                      }
                      remove={() => {
                        const newKeywords = field.value.filter(
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
