/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const payload = {
  'branch': 'master',
  'commit_message': 'init renku repository',
  'actions': [
    {
      'action': 'create',
      'file_path': '.gitlab-ci.yml',
      'content': "# renku: v1.dev20181906\n\nstages:\n  - build\n\nimage_build:\n  stage: build\n  image: python:3.6\n  before_script:\n    - curl -sSL https://get.docker.com/ | sh\n    - docker login -u gitlab-ci-token -p $CI_JOB_TOKEN http://$CI_REGISTRY\n  script:\n    - CI_COMMIT_SHA_7=$(echo $CI_COMMIT_SHA | cut -c1-7)\n    - docker build --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA_7 .\n    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA_7\n  tags:\n    - image-build\n\ndot:\n  stage: build\n  image: renku/renku-python:latest\n  script:\n    - python -c \"import renku, networkx; graph = renku.cli._graph.Graph(renku.LocalClient()); graph.build_status(); networkx.drawing.nx_pydot.write_dot(graph.G, 'graph.dot')\"\n  artifacts:\n    paths:\n      - graph.dot\n  environment:\n    name: dot/$CI_COMMIT_REF_NAME\n    url: $CI_PROJECT_URL/-/jobs/artifacts/$CI_COMMIT_REF_NAME/raw/graph.dot?job=$CI_JOB_NAME\n"
    },
    {
      'action': 'create',
      'file_path': '.gitignore',
      'content': '\n# Created by https://www.gitignore.io/api/macos,python,R,linux,vim,emacs\n\n### Emacs ###\n# -*- mode: gitignore; -*-\n*~\n\\#*\\#\n/.emacs.desktop\n/.emacs.desktop.lock\n*.elc\nauto-save-list\ntramp\n.\\#*\n\n# Org-mode\n.org-id-locations\n*_archive\n\n# flymake-mode\n*_flymake.*\n\n# eshell files\n/eshell/history\n/eshell/lastdir\n\n# elpa packages\n/elpa/\n\n# reftex files\n*.rel\n\n# AUCTeX auto folder\n/auto/\n\n# cask packages\n.cask/\ndist/\n\n# Flycheck\nflycheck_*.el\n\n# server auth directory\n/server/\n\n# projectiles files\n.projectile\nprojectile-bookmarks.eld\n\n# directory configuration\n.dir-locals.el\n\n# saveplace\nplaces\n\n# url cache\nurl/cache/\n\n# cedet\nede-projects.el\n\n# smex\nsmex-items\n\n# company-statistics\ncompany-statistics-cache.el\n\n# anaconda-mode\nanaconda-mode/\n\n### Linux ###\n\n# temporary files which can be created if a process still has a handle open of a deleted file\n.fuse_hidden*\n\n# KDE directory preferences\n.directory\n\n# Linux trash folder which might appear on any partition or disk\n.Trash-*\n\n# .nfs files are created when an open file is removed but is still being accessed\n.nfs*\n\n### macOS ###\n*.DS_Store\n.AppleDouble\n.LSOverride\n\n# Icon must end with two \\r\nIcon\n\n# Thumbnails\n._*\n\n# Files that might appear in the root of a volume\n.DocumentRevisions-V100\n.fseventsd\n.Spotlight-V100\n.TemporaryItems\n.Trashes\n.VolumeIcon.icns\n.com.apple.timemachine.donotpresent\n\n# Directories potentially created on remote AFP share\n.AppleDB\n.AppleDesktop\nNetwork Trash Folder\nTemporary Items\n.apdisk\n\n### Python ###\n# Byte-compiled / optimized / DLL files\n__pycache__/\n*.py[cod]\n*$py.class\n\n# C extensions\n*.so\n\n# Distribution / packaging\n.Python\nbuild/\ndevelop-eggs/\ndownloads/\neggs/\n.eggs/\nlib/\nlib64/\nparts/\nsdist/\nvar/\nwheels/\n*.egg-info/\n.installed.cfg\n*.egg\n\n# PyInstaller\n#  Usually these files are written by a python script from a template\n#  before PyInstaller builds the exe, so as to inject date/other infos into it.\n*.manifest\n*.spec\n\n# Installer logs\npip-log.txt\npip-delete-this-directory.txt\n\n# Unit test / coverage reports\nhtmlcov/\n.tox/\n.coverage\n.coverage.*\n.cache\n.pytest_cache/\nnosetests.xml\ncoverage.xml\n*.cover\n.hypothesis/\n\n# Translations\n*.mo\n*.pot\n\n# Flask stuff:\ninstance/\n.webassets-cache\n\n# Scrapy stuff:\n.scrapy\n\n# Sphinx documentation\ndocs/_build/\n\n# PyBuilder\ntarget/\n\n# Jupyter Notebook\n.ipynb_checkpoints\n\n# pyenv\n.python-version\n\n# celery beat schedule file\ncelerybeat-schedule.*\n\n# SageMath parsed files\n*.sage.py\n\n# Environments\n.env\n.venv\nenv/\nvenv/\nENV/\nenv.bak/\nvenv.bak/\n\n# Spyder project settings\n.spyderproject\n.spyproject\n\n# Rope project settings\n.ropeproject\n\n# mkdocs documentation\n/site\n\n# mypy\n.mypy_cache/\n\n### R ###\n# History files\n.Rhistory\n.Rapp.history\n\n# Session Data files\n.RData\n\n# Example code in package build process\n*-Ex.R\n\n# Output files from R CMD build\n/*.tar.gz\n\n# Output files from R CMD check\n/*.Rcheck/\n\n# RStudio files\n.Rproj.user/\n\n# produced vignettes\nvignettes/*.html\nvignettes/*.pdf\n\n# OAuth2 token, see https://github.com/hadley/httr/releases/tag/v0.3\n.httr-oauth\n\n# knitr and R markdown default cache directories\n/*_cache/\n/cache/\n\n# Temporary files created by R markdown\n*.utf8.md\n*.knit.md\n\n### Vim ###\n# swap\n.sw[a-p]\n.*.sw[a-p]\n# session\nSession.vim\n# temporary\n.netrwhist\n# auto-generated tag files\ntags\n\n\n# End of https://www.gitignore.io/api/macos,python,R,linux,vim,emacs\n\n.renku.lock\n'
    },
    {
      'action': 'create',
      'file_path': '.renku/metadata.yml',
      'content': "'@context':\n  created: http://schema.org/dateCreated\n  foaf: http://xmlns.com/foaf/0.1/\n  name: foaf:name\n  updated: http://schema.org/dateUpdated\n  version: http://schema.org/schemaVersion\n'@type': foaf:Project\ncreated: 2018-06-06 12:22:36.991066\nname: dummy\nupdated: 2018-06-06 12:22:36.991073\nversion: '1'\n"
    },
    {
      'action': 'create',
      'file_path': 'Dockerfile',
      'content': "FROM renku/singleuser:latest\n\n# Uncomment and adapt if code is to be included in the image\n# COPY src /code/src\n\n# install the python dependencies\nCOPY requirements.txt /tmp/requirements.txt\nUSER 0\nRUN pip install -r /tmp/requirements.txt\n\n# switch to the user that will be used in the notebook\nUSER 1000"
    },
    {
      'action': 'create',
      'file_path': 'requirements.txt',
      'content': ''
    }
  ]
}

export { payload }
