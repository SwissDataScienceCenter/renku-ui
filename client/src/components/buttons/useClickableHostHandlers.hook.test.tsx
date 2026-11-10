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

import { act } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { Modal, ModalBody } from "reactstrap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useClickableHostHandlers from "./useClickableHostHandlers.hook";

interface HostProps {
  onActivate: () => void;
  withPortal?: boolean;
  withModal?: boolean;
}

function Host({ onActivate, withPortal, withModal }: HostProps) {
  const handlers = useClickableHostHandlers(onActivate);
  return (
    <div data-cy="host" {...handlers}>
      <span data-cy="host-content">Host content</span>
      <button type="button" data-cy="nested-button">
        Nested button
      </button>
      {withPortal &&
        createPortal(
          <span data-cy="portal-content">Portal content</span>,
          document.body,
        )}
      {withModal && (
        <Modal isOpen fade={false} toggle={() => {}}>
          <ModalBody data-cy="modal-body">
            <pre>
              <span data-cy="log-line">Log line</span>
            </pre>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

function getByDataCy(dataCy: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-cy="${dataCy}"]`);
  if (element == null) {
    throw new Error(`Element with data-cy="${dataCy}" not found`);
  }
  return element;
}

function fireMouseEvent(
  type: "click" | "mousedown" | "mouseup",
  element: HTMLElement,
) {
  act(() => {
    element.dispatchEvent(new MouseEvent(type, { bubbles: true }));
  });
}

describe("useClickableHostHandlers", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderHost(props: HostProps) {
    act(() => {
      root.render(<Host {...props} />);
    });
  }

  it("activates when clicking on the host content", () => {
    const onActivate = vi.fn();
    renderHost({ onActivate });
    fireMouseEvent("click", getByDataCy("host-content"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("does not activate when clicking on a nested button", () => {
    const onActivate = vi.fn();
    renderHost({ onActivate });
    fireMouseEvent("click", getByDataCy("nested-button"));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate on clicks from content rendered in a portal", () => {
    const onActivate = vi.fn();
    renderHost({ onActivate, withPortal: true });
    fireMouseEvent("click", getByDataCy("portal-content"));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate when a text selection in a modal ends outside the text", () => {
    const onActivate = vi.fn();
    renderHost({ onActivate, withModal: true });
    // Selecting text: press the mouse on the text and release it outside. The
    // browser then dispatches the click on the common ancestor.
    fireMouseEvent("mousedown", getByDataCy("log-line"));
    fireMouseEvent("mouseup", getByDataCy("modal-body"));
    fireMouseEvent("click", getByDataCy("modal-body"));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
