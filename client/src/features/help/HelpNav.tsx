import { useContext } from "react";
import { Nav, NavItem } from "reactstrap";

import RenkuNavLinkV2 from "../../components/RenkuNavLinkV2";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";

interface HelpNavProps {
  statuspageId: string;
}

export default function HelpNav({ statuspageId }: HelpNavProps) {
  const { params } = useContext(AppContext);
  if (params == null) return null;
  const privacyPolicyConfigured = params.TERMS_PAGES_ENABLED;
  const termsConfigured = privacyPolicyConfigured;
  return (
    <Nav tabs className="mb-3">
      <NavItem>
        <RenkuNavLinkV2 end to={ABSOLUTE_ROUTES.v2.help.root}>
          Getting Help
        </RenkuNavLinkV2>
      </NavItem>
      {statuspageId && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.status}>
            Status
          </RenkuNavLinkV2>
        </NavItem>
      )}
      <NavItem>
        <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.release}>
          Release and License
        </RenkuNavLinkV2>
      </NavItem>
      {termsConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.tos}>
            Terms of Use
          </RenkuNavLinkV2>
        </NavItem>
      )}
      {privacyPolicyConfigured && (
        <NavItem>
          <RenkuNavLinkV2 to={ABSOLUTE_ROUTES.v2.help.privacy}>
            Privacy Policy
          </RenkuNavLinkV2>
        </NavItem>
      )}
    </Nav>
  );
}
