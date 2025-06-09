import { BoxArrowUpRight } from "react-bootstrap-icons";
import { WarnAlert } from "../../../components/Alert.jsx";
import SunsetV1Button from "./SunsetV1Button.tsx";

export default function SunsetBanner() {
  return (
    <WarnAlert>
      <h4>Deprecation Notice</h4>
      <p>
        As of July 15, 2025, creating new projects and datasets in the Legacy
        Renku interface will be discontinued. We encourage you to transition to
        the new Renku platform, which offers enhanced features and a more modern
        user experience.{" "}
        <SunsetV1Button>
          Learn more
          <BoxArrowUpRight className="bi ms-1" />
        </SunsetV1Button>
      </p>
    </WarnAlert>
  );
}
