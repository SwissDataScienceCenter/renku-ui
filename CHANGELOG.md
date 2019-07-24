# Changes

## [0.6.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.6.1...0.6.2) (released 2019-07-24)

### Bug Fixes
* **lineage:** Fix the navigation of nodes with long paths ([#550](https://github.com/SwissDataScienceCenter/renku-ui/pull/550), [#546](https://github.com/SwissDataScienceCenter/renku-ui/issues/546))


## [0.6.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.6.0...0.6.1) (released 2019-07-23)

### Bug Fixes
* **lineage:** Fix the output while checking files without lineage ([#539](https://github.com/SwissDataScienceCenter/renku-ui/pull/539))
* **notebook:** Propagate correctly the user selected options to the JupyterLab environment ([#540](https://github.com/SwissDataScienceCenter/renku-ui/issues/540), [#541](https://github.com/SwissDataScienceCenter/renku-ui/pull/541))

### Features
* **lineage:** Enable zoom in and out on the Knowledge Graph ([#534](https://github.com/SwissDataScienceCenter/renku-ui/issues/534), [#539](https://github.com/SwissDataScienceCenter/renku-ui/pull/539))


## [0.6.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.5.2...0.6.0) (released 2019-07-22)

### Bug Fixes
* **notebook:** Avoid overlapping multiple API calls ([#500](https://github.com/SwissDataScienceCenter/renku-ui/pull/500))
* **notebook:** Fix navigation for anonymous users trying to start notebooks ([#510](https://github.com/SwissDataScienceCenter/renku-ui/issues/510), [#531](https://github.com/SwissDataScienceCenter/renku-ui/pull/531))
* Fix typos ([#478](https://github.com/SwissDataScienceCenter/renku-ui/issues/478), [#479](https://github.com/SwissDataScienceCenter/renku-ui/pull/479))

### Features
* **notebook:** Support autosaved branches ([#507](https://github.com/SwissDataScienceCenter/renku-ui/issues/507) [#429](https://github.com/SwissDataScienceCenter/renku-ui/issues/429), [#517](https://github.com/SwissDataScienceCenter/renku-ui/pull/517))
* **notebook:** Start JupyterLab servers from any branch and commit ([#416](https://github.com/SwissDataScienceCenter/renku-ui/issues/416), [#472](https://github.com/SwissDataScienceCenter/renku-ui/pull/472))
* **notebook:** Improve user feedback when stopping a notebook ([#513](https://github.com/SwissDataScienceCenter/renku-ui/issues/513), [#530](https://github.com/SwissDataScienceCenter/renku-ui/pull/530))
* **lineage:** Opt-out from Knowledge Graph for private projects ([#469](https://github.com/SwissDataScienceCenter/renku-ui/pull/469))
* **lineage:** Add navigability to the Knowledge Graph ([#256](https://github.com/SwissDataScienceCenter/renku-ui/issues/256), [#519](https://github.com/SwissDataScienceCenter/renku-ui/pull/519))
* **lineage:** Style Knowledge Graph node according to their type ([#502](https://github.com/SwissDataScienceCenter/renku-ui/issues/502), [#533](https://github.com/SwissDataScienceCenter/renku-ui/pull/533))
* Allow anonymous users to navigate and search through the project list ([#532](https://github.com/SwissDataScienceCenter/renku-ui/pull/532), [#426](https://github.com/SwissDataScienceCenter/renku-ui/issues/426))
* Allow users to fork projects ([#316](https://github.com/SwissDataScienceCenter/renku-ui/issues/316), [#508](https://github.com/SwissDataScienceCenter/renku-ui/issues/508), [#511](https://github.com/SwissDataScienceCenter/renku-ui/issues/511), [#486](https://github.com/SwissDataScienceCenter/renku-ui/pull/486), [#509](https://github.com/SwissDataScienceCenter/renku-ui/pull/509), [#512](https://github.com/SwissDataScienceCenter/renku-ui/pull/512))
* Display "page not found" error on wrong url ([#488](https://github.com/SwissDataScienceCenter/renku-ui/issues/488), [#505](https://github.com/SwissDataScienceCenter/renku-ui/pull/505))
* Allow users to select from different project templates when creating a new project ([#473](https://github.com/SwissDataScienceCenter/renku-ui/issues/473), [#504](https://github.com/SwissDataScienceCenter/renku-ui/pull/504), [#480](https://github.com/SwissDataScienceCenter/renku-ui/pull/480), [#506](https://github.com/SwissDataScienceCenter/renku-ui/pull/506))
* Allow users to order project listing in different ways ([#475](https://github.com/SwissDataScienceCenter/renku-ui/issues/475), [#501](https://github.com/SwissDataScienceCenter/renku-ui/pull/501))

### BREAKING CHANGES
* **notebook:** Adapt UI to the new backend API ([#494](https://github.com/SwissDataScienceCenter/renku-ui/issues/494), [#498](https://github.com/SwissDataScienceCenter/renku-ui/pull/498), [#514](https://github.com/SwissDataScienceCenter/renku-ui/pull/514))


## 0.5.2 (released 2019-07-02)
* Add a project visibility label to the project page [#470](https://github.com/SwissDataScienceCenter/renku-ui/issues/470) [#497](https://github.com/SwissDataScienceCenter/renku-ui/pull/497)
* Display files with extension `ran.ipynb` [#483](https://github.com/SwissDataScienceCenter/renku-ui/issues/483) [#496](https://github.com/SwissDataScienceCenter/renku-ui/pull/496)
* Let anonymous users view projects [#491](https://github.com/SwissDataScienceCenter/renku-ui/pull/491)


## 0.5.1 (released 2019-06-06)
* Lower the rate of polling to prevent taxing JupyterHub [#485](https://github.com/SwissDataScienceCenter/renku-ui/pull/485)


## 0.5.0 (released 2019-05-22)

* New top-level Notebooks and project Notebook Servers interfaces with more features [#415](https://github.com/SwissDataScienceCenter/renku-ui/issues/415), [#425](https://github.com/SwissDataScienceCenter/renku-ui/pull/425)
* Full-featured file browsing within a project [#191](https://github.com/SwissDataScienceCenter/renku-ui/issues/191), [#400](https://github.com/SwissDataScienceCenter/renku-ui/issues/400), [#420](https://github.com/SwissDataScienceCenter/renku-ui/pull/420), [#435](https://github.com/SwissDataScienceCenter/renku-ui/pull/435), [#437](https://github.com/SwissDataScienceCenter/renku-ui/pull/437), [#447](https://github.com/SwissDataScienceCenter/renku-ui/pull/447), [#455](https://github.com/SwissDataScienceCenter/renku-ui/pull/455)
* Lineage display uses information provided by new Knowledge Graph service [#362](https://github.com/SwissDataScienceCenter/renku-ui/issues/362), [#392](https://github.com/SwissDataScienceCenter/renku-ui/pull/392), [#464](https://github.com/SwissDataScienceCenter/renku-ui/pull/464)
* Added tools for configuration and status of integration with new Knowledge Graph service [#369](https://github.com/SwissDataScienceCenter/renku-ui/issues/369), [#374](https://github.com/SwissDataScienceCenter/renku-ui/pull/374), [#419](https://github.com/SwissDataScienceCenter/renku-ui/pull/419), [#453](https://github.com/SwissDataScienceCenter/renku-ui/pull/453)
* Improved landing page [#383](https://github.com/SwissDataScienceCenter/renku-ui/issues/383), [#398](https://github.com/SwissDataScienceCenter/renku-ui/issues/398), [#423](https://github.com/SwissDataScienceCenter/renku-ui/pull/423)
* Fixed project page for non-accessible projects [#389](https://github.com/SwissDataScienceCenter/renku-ui/issues/389), [#406](https://github.com/SwissDataScienceCenter/renku-ui/issues/406), [#421](https://github.com/SwissDataScienceCenter/renku-ui/pull/421)
* Redirect user back to currently-displayed page after login [#438](https://github.com/SwissDataScienceCenter/renku-ui/pull/438)
* Fixed crash when previewing a notebook as an anonymous user [#422](https://github.com/SwissDataScienceCenter/renku-ui/pull/422)
* Fixed bug in projects page that created multiple calls to backend [#441](https://github.com/SwissDataScienceCenter/renku-ui/issues/441), [#442](https://github.com/SwissDataScienceCenter/renku-ui/pull/442)

A full list of changes is available for [milestone 0.5.0](https://github.com/SwissDataScienceCenter/renku-ui/issues?q=is%3Aclosed+milestone%3A0.5.0).


## 0.4.1 (released 2019-04-02)

* Fixed bug that prevented launching a Jupyter server in certain situations [#370](https://github.com/SwissDataScienceCenter/renku-ui/issues/370)
* Run nginx as an unprivileged user [#396](https://github.com/SwissDataScienceCenter/renku-ui/issues/396)
* Added help page to Renku [#382](https://github.com/SwissDataScienceCenter/renku-ui/issues/382)
* Present errors if project creation fails [#387](https://github.com/SwissDataScienceCenter/renku-ui/issues/387), [#391](https://github.com/SwissDataScienceCenter/renku-ui/pull/391)
* Added Notebook Server tab to project page [#380](https://github.com/SwissDataScienceCenter/renku-ui/pull/380)
* Added more control options to project search [#377](https://github.com/SwissDataScienceCenter/renku-ui/issues/377)

A full list of changes is available for [milestone 0.4.1](https://github.com/SwissDataScienceCenter/renku-ui/issues?q=is%3Aclosed+milestone%3A0.4.1).


## 0.4.0 (released 2019-03-06)

* Improved the functioning of the quick nav/search bar and project search [#379](https://github.com/SwissDataScienceCenter/renku-ui/pull/379), [#353](https://github.com/SwissDataScienceCenter/renku-ui/issues/353)
* Streamline the display of the project overview [#365](https://github.com/SwissDataScienceCenter/renku-ui/pull/365), [#364](https://github.com/SwissDataScienceCenter/renku-ui/issues/364)
* Display the pending changes notification in the Pending Changes tab [#363](https://github.com/SwissDataScienceCenter/renku-ui/pull/363), [#364](https://github.com/SwissDataScienceCenter/renku-ui/issues/364)
* Show the original parent of a forked project [#365](https://github.com/SwissDataScienceCenter/renku-ui/pull/365), [#364](https://github.com/SwissDataScienceCenter/renku-ui/issues/364)
* Show project stats in the overview tab [#365](https://github.com/SwissDataScienceCenter/renku-ui/pull/365), [#364](https://github.com/SwissDataScienceCenter/renku-ui/issues/364)
* Fix security issues detected by npm audit [#367](https://github.com/SwissDataScienceCenter/renku-ui/pull/367)

A full list of changes is available for [milestone 0.4.0](https://github.com/SwissDataScienceCenter/renku-ui/issues?q=is%3Aclosed+milestone%3A0.4.0).


## 0.3.0 (released 2018-11-27)

* Use pagination in the listing of projects [#327](https://github.com/SwissDataScienceCenter/renku-ui/pull/327)
* Allow specifying a namespace at project creation time [#320](https://github.com/SwissDataScienceCenter/renku-ui/pull/320)
* Specify server options when launching a Jupyter Notebook [#335](https://github.com/SwissDataScienceCenter/renku-ui/pull/335)
* Support markdown content in Ku descriptions and contributions [#341](https://github.com/SwissDataScienceCenter/renku-ui/pull/341)

A full list of changes is available for [milestone 0.3.0](https://github.com/SwissDataScienceCenter/renku-ui/issues?q=is%3Aclosed+milestone%3A0.3.0).


## 0.2.0 (released 2018-09-25)

Initial release as a part of the larger Renku release.
