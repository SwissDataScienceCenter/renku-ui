// Loads Bootstrap Dropdown on the client only. Import from this module so
// every caller shares one Dropdown registry.
//
// Do not switch back to `import "bootstrap"` (the full JS bundle). The only
// `data-bs-toggle` in the app is dropdown; modal/offcanvas `data-bs-dismiss`
// buttons already have React onClick handlers.

import { Dropdown } from "bootstrap";

export { Dropdown };
