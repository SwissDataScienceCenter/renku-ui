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
 Renga-UI
================

**This is the development branch of Renga-UI, and should be considered highly
volatile.**

The development branch of the Renga user interface contains a complete rewrite
of the old ui which reflects the redesign of the Renga platform in general.

Quickstart
----------

The new Renga ui depends on a running instace of the development
version of Renga being present (more precisely, it relies on  correctly
preconfigured instances of gitlab and keycloak). Clone the main renga
repository, checkout the development branch  and run `make start`. The ui
should now be available under `http://localhost`.


Developing the UI
-----------------

For a proper development setting run the following two commands after checking out the development branch of the
renga-ui repository:

::

    $ npm install
    $ make dev


This will run the ui outside of docker and make it available under
`http://localhost:3000` (a browser tab should open automatically). Note that
also the development setting relies on a running instace of renga for gitlab
and keycloak.

As long as you have executed `npm install` in your environment, you will have
other commands defined in `package.json`, such as `npm run lint`, etc.,
available to you.


Docker
------

Alternatively, the UI can also be run from a docker container:

::

    $ make tag/renga-ui
    $ docker run -d -p 3000:80 -e GITLAB_URL=http://gitlab.renga.build rengahub/renga-ui:development


Tests
-----

You can run tests with

::

    $ make test/renga-ui

or

::

    $ docker run -e CI=true rengahub/renga-ui:development npm test
