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

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { Modal, ModalBody } from "reactstrap";
import { afterEach, describe, expect, it, vi } from "vitest";

import useClickableHostHandlers from "./useClickableHostHandlers.hook";

interface HostProps {
  onActivate: () => void;
  withPortal?: boolean;
  withModal?: boolean;
}

function Host({ onActivate, withPortal, withModal }: HostProps) {
  const handlers = useClickableHostHandlers(onActivate);
  return (
    <div data-testid="host" {...handlers}>
      <span>Host content</span>
      <button type="button">Nested button</button>
      {withPortal && createPortal(<span>Portal content</span>, document.body)}
      {withModal && (
        <Modal isOpen fade={false} toggle={() => {}}>
          <ModalBody data-testid="modal-body">
            <pre>
              <span>Log line</span>
            </pre>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

describe("useClickableHostHandlers", () => {
  afterEach(() => {
    cleanup();
  });

  it("activates when clicking on the host content", () => {
    const onActivate = vi.fn();
    render(<Host onActivate={onActivate} />);
    fireEvent.click(screen.getByText("Host content"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("does not activate when clicking on a nested button", () => {
    const onActivate = vi.fn();
    render(<Host onActivate={onActivate} />);
    fireEvent.click(screen.getByRole("button", { name: "Nested button" }));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate on clicks from content rendered in a portal", () => {
    const onActivate = vi.fn();
    render(<Host onActivate={onActivate} withPortal />);
    fireEvent.click(screen.getByText("Portal content"));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate when a text selection in a modal ends outside the text", () => {
    const onActivate = vi.fn();
    render(<Host onActivate={onActivate} withModal />);
    // Selecting text, pressing the mouse on the text and releasing it outside.
    fireEvent.mouseDown(screen.getByText("Log line"));
    fireEvent.mouseUp(screen.getByTestId("modal-body"));
    fireEvent.click(screen.getByTestId("modal-body"));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
