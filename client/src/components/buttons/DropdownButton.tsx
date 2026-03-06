import cx from "classnames";
import { Button, ButtonGroup, DropdownMenu } from "reactstrap";

interface DropdownButtonProps {
  children?: React.ReactNode;
  color?: string;
  dataCy?: string;
  primaryButtonContent: React.ReactNode;
  primaryButtonOnclick: () => void;
  size?: "sm" | "lg";
}

// ? This component can replace ButtonWithMenuV2 but it should support a Link/ExternalLink instead of forcing a Button as primary action
export default function DropdownButton({
  children,
  color = "outline-primary",
  dataCy = "dropdown-button",
  primaryButtonContent,
  primaryButtonOnclick,
  size,
}: DropdownButtonProps) {
  return (
    <ButtonGroup data-cy={dataCy}>
      <Button
        color={color}
        data-cy={`${dataCy}-main`}
        size={size}
        onClick={primaryButtonOnclick}
      >
        {primaryButtonContent}
      </Button>

      <Button
        aria-expanded="false"
        className={cx(
          "border-start-0",
          "dropdown-toggle",
          "dropdown-toggle-split"
        )}
        color={color}
        data-bs-toggle="dropdown"
        data-cy={`${dataCy}-toggle`}
        size={size}
      >
        <span className="visually-hidden">Toggle Dropdown</span>
      </Button>

      <DropdownMenu tag="ul" data-cy={`${dataCy}-menu`}>
        {children}
      </DropdownMenu>
    </ButtonGroup>
  );
}
