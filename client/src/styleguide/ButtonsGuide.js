/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Fragment, useState } from "react";

import { Button, ButtonGroup, DropdownItem, Table } from "reactstrap";
import { Loader } from "../utils/components/Loader";
import { ErrorAlert, InfoAlert, SuccessAlert, WarnAlert } from "../utils/components/Alert";
import { Clipboard } from "../utils/components/Clipboard";
import { ButtonWithMenu, GoBackButton } from "../utils/components/buttons/Button";
import { ExternalLink } from "../utils/components/ExternalLinks";

function Switch(props) {
  const [mode, setMode] = useState(0);
  function toggleMode() {
    if (mode === 0)
      setMode(1);
    else setMode(0);
  }

  return <ButtonGroup key="controls" className="rk-btn-group-light mt-2" size="sm">
    <Button
      color="rk-white" className="btn-rk-white-dark-active"
      onClick={toggleMode}
      active={mode === 0}>
      State 1
    </Button>
    <Button
      color="rk-white" className="btn-rk-white-dark-active"
      onClick={toggleMode}
      active={mode === 1}>
      State 2
    </Button>
  </ButtonGroup>;
}


function ButtonsGuide(props) {

  const defaultButton = <Button size="sm" color="primary">Default</Button>;
  const menuItem = <DropdownItem onClick={() => { }}>Menu Item</DropdownItem>;
  const buttonWithMenu = <ButtonWithMenu size="sm" default={defaultButton}>{menuItem}</ButtonWithMenu>;

  return <Fragment>
    <h2>Buttons and Elements</h2>
    <h3 className="pt-5">Buttons</h3>
    <Table>
      <thead>
        <tr>
          <th scope="col">Use</th>
          <th scope="col">Tag</th>
          <th scope="col">Appearance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Primary Action</th>
          <td>Button color=&quot;secondary&quot;</td>
          <td><Button size="sm" color="secondary">Primary</Button></td>
        </tr>
        <tr>
          <th scope="row">Secondary Action / Cancel / Neutral</th>
          <td>Button color=&quot;primary&quot;</td>
          <td><Button size="sm" color="primary">Cancel</Button></td>
        </tr>
        <tr>
          <th scope="row">Primary Action, muted appearance</th>
          <td>Button color=&quot;secondary&quot; outline</td>
          <td><Button size="sm" color="secondary" outline>Primary</Button></td>
        </tr>
        <tr>
          <th scope="row">Secondary Action, muted app</th>
          <td>Button color=&quot;primary&quot; outline</td>
          <td><Button size="sm" color="primary" outline>Cancel</Button></td>
        </tr>
        <tr>
          <th scope="row">Link outside app</th>
          <td>ExternalLink</td>
          <td><ExternalLink size="sm" url="https://renkulab.io/"
            title="Link outside RenkuLab instance" showLinkIcon={true} />
          </td>
        </tr>
        <tr>
          <th scope="row">Back button</th>
          <td>GoBackButton</td>
          <td><GoBackButton label="Back to previous" /></td>
        </tr>
        <tr>
          <th scope="row">Button with menu</th>
          <td>ButtonWithMenu</td>
          <td>{buttonWithMenu}</td>
        </tr>
        <tr>
          <th scope="row">Switch</th>
          <td>ButtonGroup className=&ldquo;rk-btn-group-light&rdquo;</td>
          <td><Switch /></td>
        </tr>
      </tbody>
    </Table>

    <h3 className="pt-5">Alert</h3>
    <div className="overflow-auto">
      <Table>
        <thead>
          <tr>
            <th scope="col">Use</th>
            <th scope="col">Tag</th>
            <th scope="col">Appearance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Info</th>
            <td>InfoAlert</td>
            <td><InfoAlert timeout={0}>Some information for you.</InfoAlert></td>
          </tr>
          <tr>
            <th scope="row">Success</th>
            <td>SuccessAlert</td>
            <td><SuccessAlert timeout={0}>Your action was successful!</SuccessAlert></td>
          </tr>
          <tr>
            <th scope="row">Warning</th>
            <td>WarnAlert</td>
            <td><WarnAlert>Something that you should look out for.</WarnAlert></td>
          </tr>
          <tr>
            <th scope="row">Failure</th>
            <td>ErrorAlert</td>
            <td><ErrorAlert>Your action failed.</ErrorAlert></td>
          </tr>
        </tbody>
      </Table>
    </div>

    <h3 className="pt-5">Other Elements</h3>
    <Table>
      <thead>
        <tr>
          <th scope="col">Use</th>
          <th scope="col">Tag</th>
          <th scope="col">Appearance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Copy to clipboard</th>
          <td>Clipboard</td>
          <td>Text to copy<Clipboard clipboardText="Text to copy" /></td>
        </tr>
        <tr>
          <th scope="row">Loader (big)</th>
          <td>Loader</td>
          <td><Loader /></td>
        </tr>
        <tr>
          <th scope="row">Loader (small)</th>
          <td>Loader size &lt; 100</td>
          <td><Loader size={32} /></td>
        </tr>
      </tbody>
    </Table>
  </Fragment>;
}

export default ButtonsGuide;
