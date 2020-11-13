/**
 * pod-info.tsx
 *
 * The pod-info component
 */

import { ReactWidget, MainAreaWidget } from "@jupyterlab/apputils";
import React, { useState } from "react";

import { renkuIcon } from "../icons";

/**
 * The Renku menu
 */
const PodInfo = (): JSX.Element => {
  const [counter, setCounter] = useState(0);
  return (
    <div>
      <h3>Pod Info</h3>
      <p>You clicked {counter} times!</p>
      <button
        onClick={(): void => {
          setCounter(counter + 1);
        }}
      >
        Increment
      </button>
    </div>
  );
};

/**
 * Wrapper on the Menu
 */
class PodInfoWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    [
      "jp-RenkuPodInfo",
      "jp-scrollbar-tiny"
    ].forEach(c => this.addClass(c));
  }

  render(): JSX.Element {
    return <PodInfo />;
  }
}

function CreatePodInfoWidget(): MainAreaWidget {
  // Create a blank content widget inside of a MainAreaWidget
  const content = new PodInfoWidget();
  const widget = new MainAreaWidget({ content });
  widget.id = "jl-renku-pod_info";

  widget.title.label = "Pod Info";
  widget.title.closable = true;
  widget.title.caption = "Renku Pod Info";
  widget.title.icon = renkuIcon;

  return widget;
}

export { CreatePodInfoWidget };
