import { Helmet } from "react-helmet";
import { useLocation } from "react-router";
import "bootstrap";
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import v1Styles from "~/styles/index.scss?inline";
import v2Styles from "~/styles/renku_bootstrap.scss?inline";
import { isRenkuLegacy } from "~/utils/helpers/HelperFunctionsV2";

interface StyleHandlerProps {
  forceV2Style: boolean;
}
export default function StyleHandler({ forceV2Style }: StyleHandlerProps) {
  const location = useLocation();
  if (forceV2Style) {
    return (
      <Helmet>
        <style type="text/css">{v2Styles}</style>
      </Helmet>
    );
  }
  return (
    <Helmet>
      <style type="text/css">
        {isRenkuLegacy(location.pathname) ? v1Styles : v2Styles}
      </style>
    </Helmet>
  );
}
