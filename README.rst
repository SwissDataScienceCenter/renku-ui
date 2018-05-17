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

**This is the development branch of Renku-UI, and should be considered highly
volatile.**

The development branch of the Renku user interface contains a complete rewrite
of the old ui which reflects the redesign of the Renku platform in general.

Quickstart
----------

The new Renku ui depends on a running instace of the development
version of Renku being present (more precisely, it relies on  correctly
preconfigured instances of gitlab and keycloak). Clone the main renku
repository, checkout the development branch  and run `make start`. The ui
should now be available under `http://localhost`.


Developing the UI
-----------------

For a proper development setting run the following two commands after checking out the development branch of the
renku-ui repository:

::

    $ npm install
    $ make dev


This will run the ui outside of docker and make it available under
`http://localhost:3000` (a browser tab should open automatically). Note that
also the development setting relies on a running instace of renku for gitlab
and keycloak.

As long as you have executed `npm install` in your environment, you will have
other commands defined in `package.json`, such as `npm run lint`, etc.,
available to you.


Docker
------

Alternatively, the UI can also be run from a docker container:

::

    $ make tag/renku-ui
    $ docker run -d -p 3000:80 -e GITLAB_URL=http://gitlab.renku.build renku/renku-ui:development


Tests
-----

You can run tests with

::

    $ make test/renku-ui

or

::

    $ docker run -e CI=true renku/renku-ui:development npm test
