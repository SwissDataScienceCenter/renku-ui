import { BoxArrowUpRight } from "react-bootstrap-icons";
import { WarnAlert } from "../../../components/Alert.jsx";
import SunsetV1Button from "./SunsetV1Button.tsx";

export default function SunsetBanner() {
  return (
    <WarnAlert>
      <h4>Feature Unavailable</h4>
      <p>
        Adding new projects and datasets is no longer supported in the legacy
        Renku interface. Please switch to the new Renku platform for an improved
        experience.{" "}
        <SunsetV1Button>
          Learn more
          <BoxArrowUpRight className="bi ms-1" />
        </SunsetV1Button>
      </p>
    </WarnAlert>
  );
}
