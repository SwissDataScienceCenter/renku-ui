#!/usr/bin/env sh
#
# Copyright 2023 - Swiss Data Science Center (SDSC)
# A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
# Eidgenössische Technische Hochschule Zürich (ETHZ).
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Usage: ./scripts/generate_sitemap.sh <path/to/sitemap.xml>

tee > "$1" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
  </url>
  <url>
    <loc>${BASE_URL}/search</loc>
  </url>
  <url>
    <loc>${BASE_URL}/projects</loc>
  </url>
  <url>
    <loc>${BASE_URL}/datasets</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/docs</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/features</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/status</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/changes</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/fonts</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/colors</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/buttons</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/nav</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/forms</loc>
  </url>
  <url>
    <loc>${BASE_URL}/style-guide/lists</loc>
  </url>
</urlset>
EOF
