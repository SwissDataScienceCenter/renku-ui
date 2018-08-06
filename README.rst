..
  Copyright 2017-2018 - Swiss Data Science Center (SDSC)
  A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
  Eidgenössische Technische Hochschule Zürich (ETHZ).

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

================
 Renku-UI
================

**The Renku platform is under very active development and should be considered highly
volatile.**

Quickstart
----------

The Renku ui depends on a running instance of Renku being present (more precisely,
it relies on a running instance of the Renku API gateway). Clone the main Renku
repository and follow these instructions_ to get Renku up and running.

.. _instructions: https://renku.readthedocs.io/en/latest/developer/minikube.html

Developing the UI
-----------------
Once you have a instance of Renku running locally, you could modify the ui code
and restart the platform through the `make minikube-deploy` command. However,
this will make for a very poor development experience as the build process of the
ui is optimized for production.
Instead we recommend installing telepresence_ on your system. Once telepresence
is installed, type:

.. _telepresence: https://www.telepresence.io/reference/install

::

    $ npm install
    $ make dev


Note that the :code:`npm install` step is only necessary the first time you are running the ui
locally or after the dependencies specified in `package.json` have changes. The command
:code:`make dev` launches telepresence which swaps the renku-ui service in your minikube
deployment with a locally running version of the ui served by a development server
which watches your code for changes and performs live updates.

The ui in dev setting is now available under the ip-address of your minikube
cluster (:code:`minikube ip`).


Tests
-----

You can run tests with

::

    $ make test/renku-ui

or

::

    $ docker run -e CI=true renku/renku-ui:latest npm test
