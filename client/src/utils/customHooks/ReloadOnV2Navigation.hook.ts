import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const useV2PageReload = () => {
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState("");

  useEffect(() => {
    if (
      prevPathname.startsWith("/v2") &&
      !location.pathname.startsWith("/v2")
    ) {
      // Reload the page if the previous URL starts with /v2 and the current URL does not
      window.location.reload();
    }
    // Update the previous pathname
    setPrevPathname(location.pathname);
  }, [location, prevPathname]);

  return null;
};

export default useV2PageReload;
