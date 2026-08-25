/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { Dropdown } from "~/utils/bootstrap/bootstrap.client";

// Mirrors Bootstrap's open state into React so re-renders, disabled, and focus
// restore cannot fight the Dropdown instance that actually owns the menu.
export function useBootstrapDropdown(
  toggleRef: RefObject<HTMLButtonElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
) {
  const [isOpen, setIsOpen] = useState(false);
  const instanceRef = useRef<Dropdown | null>(null);

  useEffect(() => {
    const el = toggleRef.current;
    if (!el || !Dropdown) return;

    const instance = Dropdown.getOrCreateInstance(el);
    instanceRef.current = instance;

    const onShown = () => setIsOpen(true);
    const onHidden = () => {
      setIsOpen(false);
      const active = document.activeElement;
      if (
        !active ||
        active === document.body ||
        menuRef.current?.contains(active)
      ) {
        toggleRef.current?.focus({ preventScroll: true });
      }
    };

    el.addEventListener("shown.bs.dropdown", onShown);
    el.addEventListener("hidden.bs.dropdown", onHidden);

    return () => {
      el.removeEventListener("shown.bs.dropdown", onShown);
      el.removeEventListener("hidden.bs.dropdown", onHidden);
      instance.dispose();
      instanceRef.current = null;
    };
  }, [toggleRef, menuRef]);

  const hide = useCallback(() => {
    instanceRef.current?.hide();
  }, []);

  return { isOpen, hide };
}
