..
  Copyright 2017-2020 - Swiss Data Science Center (SDSC)
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
  
.. image:: https://github.com/SwissDataScienceCenter/renku-ui/workflows/Test%20and%20CI/badge.svg
    :target: https://github.com/SwissDataScienceCenter/renku-ui/actions?query=branch%3Amaster+workflow%3A%22Test+and+CI%22
    :alt: Test and CI
   
.. image:: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square
    :alt: Conventional Commits
    :target: https://conventionalcommits.org
   
.. image:: https://pullreminders.com/badge.svg
    :target: https://pullreminders.com?ref=badge
    :alt: Pull reminders
    :align: right

================
 Renku-UI
================

*The Renku platform is under very active development and should be considered highly
volatile.*

Quickstart
----------

The Renku ui depends on a running instance of Renku being present. More precisely,
it relies on a running instance of the
`Renku Gateway <https://github.com/SwissDataScienceCenter/renku-gateway>`_
that acts as an interface to all backend services APIs, handling authentication
and exchanging access tokens.
Clone the main Renku repository and follow these instructions_ to get Renku up
and running.
You can also deploy an environment in a remote development cluster.

.. _instructions: https://renku.readthedocs.io/en/latest/developer/setup.html

Developing the UI
-----------------
Once you have a development instance of Renku running locally or in the cloud,
you can install telepresence_ locally and run the ``run-telepresence.sh`` script
in the `client` or the `server` folder. Don't forget to run `npm install` before
running telepresence for the first time or after any package change.

::

    $ cd client   # or server if you need to work there
    $ npm install
    $ ./run-telepresence.sh

Telepresence replaces the selected UI pod in the target Kubernetes instance. All the
traffic is then redirected to a local process, making all the changes to files almost
immediately available in your development RenkuLab instance.

The ``run-telepresence.sh`` scripts support out-of-the-box telepresence_ minikube and
the Renku team `switch-dev` cloud. You need to properly set the environment variable
``CURRENT_CONTEXT`` to either ``"minikube"`` or ``"switch-dev"``.

There are a few other environment variables you may want to set when starting telepresence
if you are going to to take advantage of the Renku team internal development infrastructure:

- SENTRY: set to `1` to redirect the exceptions to the dev sentry_ deployment
- PR: set to the target PR number in the renku-ui_ repo to work in the corresponding CI deployment

::

    $ SENTRY=0 PR=1166 ./run-telepresence.sh

There are other variables used in the ``run-telepresence.sh`` script. For specific use
cases, you may want to modify some values manually.

Tests
-----

We use jest_ as our default testing framework and eslint_ as linter.
Mind that we require both commands to terminate without warnings before we merge a PR.
You can manually run tests using the following commands:

::

    $ cd client   # or server if you need to work there
    $ npm test
    $ npm run lint

Some linting errors can be automatically fixed by running ``npm run lint-fix``. We suggest
using an IDE that supports eslint (like vscode_ or similar) to get realtime feedback
when modifying the code.

.. _minikube: https://minikube.sigs.k8s.io
.. _telepresence: https://www.telepresence.io/reference/install
.. _sentry: https://sentry.dev.renku.ch
.. _renku-ui: https://github.com/SwissDataScienceCenter/renku-ui/pulls
.. _jest: https://jestjs.io
.. _eslint: https://eslint.org/
.. _vscode: https://code.visualstudio.com
