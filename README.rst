..
  Copyright 2017 - Swiss Data Science Center (SDSC)
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

**Renga is currently undergoing a major restructuring effort. For a preview,
you can look at the development branch, but keep in mind it is highly
volatile.**

Renga's Web User Interface

Local
-----

Requirements:

- `Python 3 <https://www.python.org/>`_
- `Node.js (LTS) <https://nodejs.org/>`_

::

   $ pip install server/requirements.txt
   $ npm install
   $ npm run dev


Docker
------

Also required:

- `Docker <http://www.docker.com>`_

::

   $ npm install
   $ npm run build
   $ docker build --tag renga-ui:latest .
   $ docker run -p 5000:5000 renga-ui:latest


You can test it by pointing your browser to http://localhost:5000/
