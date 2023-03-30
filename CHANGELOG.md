# Changes

## [3.4.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/3.4.0...3.4.1) (2023-03-30)

### Features

* retrieve project metadata from KG on project access ([#2337](https://github.com/SwissDataScienceCenter/renku-ui/issues/2337), [#2414](https://github.com/SwissDataScienceCenter/renku-ui/issues/2414))

### Bug Fixes

* fix the session URL on the dashboard ([#2444](https://github.com/SwissDataScienceCenter/renku-ui/issues/2444))


## [3.4.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/3.3.0...3.4.0) (2023-03-21)

### Features

* unify dashboard and headers session buttons ([#2401](https://github.com/SwissDataScienceCenter/renku-ui/issues/2401), [#2393](https://github.com/SwissDataScienceCenter/renku-ui/issues/2393)
* make components sticky when scrolling long files on the file viewer ([#2406](https://github.com/SwissDataScienceCenter/renku-ui/issues/2406), [#2412](https://github.com/SwissDataScienceCenter/renku-ui/issues/2412))
* always re-sort equal results by descending date ([#2373](https://github.com/SwissDataScienceCenter/renku-ui/issues/2373))
* improve the display of session error information ([#2396](https://github.com/SwissDataScienceCenter/renku-ui/issues/2396), [#2411](https://github.com/SwissDataScienceCenter/renku-ui/issues/2411))
* convert the projects coordinator -- projects stars from GitLab will not be usable anymore ([#2384](https://github.com/SwissDataScienceCenter/renku-ui/issues/2384))

### Bug Fixes

* prevent listing projects twice on the dashboard ([#2316](https://github.com/SwissDataScienceCenter/renku-ui/issues/2316), [#2408](https://github.com/SwissDataScienceCenter/renku-ui/issues/2408))
* start sessions with base images when pinned images are missing ([#2410](https://github.com/SwissDataScienceCenter/renku-ui/issues/2410))


## [3.3.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/3.2.0...3.3.0) (2023-02-27)

### Features

* show instructions on how to connect via SSH on deployments supporting it ([#2324](https://github.com/SwissDataScienceCenter/renku-ui/issues/2324), [#2376](https://github.com/SwissDataScienceCenter/renku-ui/issues/2376))

### Bug Fixes

* fetch sessions early to prevent flashing the the dashboard after a few seconds ([#2400](https://github.com/SwissDataScienceCenter/renku-ui/issues/2400))
* show and use timezone aware dates ([#2388](https://github.com/SwissDataScienceCenter/renku-ui/issues/2388))


## [3.2.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/3.1.0...3.2.0) (2023-02-16)


### Features

* ⭐ add a new dashboard for logged-in users, showing running sessions, last accessed projects, and own datasets ([#2286](https://github.com/SwissDataScienceCenter/renku-ui/issues/2286), [#2332](https://github.com/SwissDataScienceCenter/renku-ui/issues/2332), [#2302](https://github.com/SwissDataScienceCenter/renku-ui/issues/2302), [#2307](https://github.com/SwissDataScienceCenter/renku-ui/issues/2307), [#2303](https://github.com/SwissDataScienceCenter/renku-ui/issues/2303), [#2320](https://github.com/SwissDataScienceCenter/renku-ui/issues/2320), [#2304](https://github.com/SwissDataScienceCenter/renku-ui/issues/2304), [#2330](https://github.com/SwissDataScienceCenter/renku-ui/issues/2330), [#2305](https://github.com/SwissDataScienceCenter/renku-ui/issues/2305), [#2333](https://github.com/SwissDataScienceCenter/renku-ui/issues/2333), [#2305](https://github.com/SwissDataScienceCenter/renku-ui/issues/2305), [#2350](https://github.com/SwissDataScienceCenter/renku-ui/issues/2350))
* show commit messages on the dropdown when starting a session ([#2240](https://github.com/SwissDataScienceCenter/renku-ui/issues/2240), [#2362](https://github.com/SwissDataScienceCenter/renku-ui/issues/2362))
* allow creating a new project with an avatar ([#2181](https://github.com/SwissDataScienceCenter/renku-ui/issues/2181), [#2331](https://github.com/SwissDataScienceCenter/renku-ui/issues/2331))
* remove the collaboration tab and add links to GitLab's issues and merge requests pages ([#2256](https://github.com/SwissDataScienceCenter/renku-ui/issues/2256), [#2365](https://github.com/SwissDataScienceCenter/renku-ui/issues/2365))
* make searches sharable by storing parameters in the URL ([#2257](https://github.com/SwissDataScienceCenter/renku-ui/issues/2257), [#2351](https://github.com/SwissDataScienceCenter/renku-ui/issues/2351))

### Bug Fixes

* fix markdown to HTML conversion problems with underscores in links and math formulas ([#1719](https://github.com/SwissDataScienceCenter/renku-ui/issues/1719), [#2308](https://github.com/SwissDataScienceCenter/renku-ui/issues/2308), [#2371](https://github.com/SwissDataScienceCenter/renku-ui/issues/2371), [#2374](https://github.com/SwissDataScienceCenter/renku-ui/issues/2374))
* restore auto-starting a session when previewing a notebook ([#2344](https://github.com/SwissDataScienceCenter/renku-ui/issues/2344))
* prevent failures when accessing datasets from the project header links ([#2357](https://github.com/SwissDataScienceCenter/renku-ui/issues/2357))
* align elements correctly in the datasets file browser ([#2318](https://github.com/SwissDataScienceCenter/renku-ui/issues/2318))
* sort commits to prevent random order ([#2347](https://github.com/SwissDataScienceCenter/renku-ui/issues/2347))

### Notices

**We have upgraded the tooling we use to render notebooks, and this may affect how math expressions appear.** Please take a look at the [3.2.0 Release Notes in GitHub](https://github.com/SwissDataScienceCenter/renku-ui/releases/tag/3.2.0) for details.



## [3.1.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/3.0.0...3.1.0) (2023-01-24)

### Features

* change text on the quickstart session button from "start" to "connect" when a session is running ([#1381](https://github.com/SwissDataScienceCenter/renku-ui/issues/1381), [#2268](https://github.com/SwissDataScienceCenter/renku-ui/issues/2268))

### Bug Fixes

* restrict visibility options to be compatible with namespace and parent project in fork dialog ([#2296](https://github.com/SwissDataScienceCenter/renku-ui/issues/2296), [#2299](https://github.com/SwissDataScienceCenter/renku-ui/issues/2299))

## [3.0.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.16.0...3.0.0) (2023-01-17)

### Features

* ⭐ introduce a new cross entity search page, phasing out the projects and datasets pages ([#1894](https://github.com/SwissDataScienceCenter/renku-ui/issues/1894))
* add a simple image editor for dataset avatars ([#2180](https://github.com/SwissDataScienceCenter/renku-ui/issues/2180), [#2246](https://github.com/SwissDataScienceCenter/renku-ui/issues/2246))
* disable action button in sessions when stopping ([#2278](https://github.com/SwissDataScienceCenter/renku-ui/issues/2278), [#2284](https://github.com/SwissDataScienceCenter/renku-ui/issues/2284))
* update documentation links and target the stable release ([#2276](https://github.com/SwissDataScienceCenter/renku-ui/issues/2276))
* add object store input validation ([#2210](https://github.com/SwissDataScienceCenter/renku-ui/issues/2210), [#2287](https://github.com/SwissDataScienceCenter/renku-ui/issues/2287))

### Bug Fixes

* handle errors on sessions interaction ([#2269](https://github.com/SwissDataScienceCenter/renku-ui/issues/2269), [#2169](https://github.com/SwissDataScienceCenter/renku-ui/issues/2169))
* remove idle time when moving to step two on the starting session page ([#2279](https://github.com/SwissDataScienceCenter/renku-ui/issues/2279), [#2282](https://github.com/SwissDataScienceCenter/renku-ui/issues/2282))

## [2.16.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.15.0...2.16.0) (2023-01-09)

### Features

* update realtime the KG status indexing percentage ([#2255](https://github.com/SwissDataScienceCenter/renku-ui/issues/2255))
* refresh the developer documentation ([#2165](https://github.com/SwissDataScienceCenter/renku-ui/issues/2165), [#2275](https://github.com/SwissDataScienceCenter/renku-ui/issues/2275))

### BREAKING CHANGES

* Requires renku-graph v2.26.0 or greater


## [2.15.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.14.0...2.15.0) (2023-01-04)

### Bug Fixes

* **client:** improve layout of entity headers and cards ([#2265](https://github.com/SwissDataScienceCenter/renku-ui/issues/2265))

### Features

* improve styling of button with menu and group button ([#2200](https://github.com/SwissDataScienceCenter/renku-ui/issues/2200), [#2243](https://github.com/SwissDataScienceCenter/renku-ui/issues/2243))
* retrieve namespaces owned only when forking a project ([#2027](https://github.com/SwissDataScienceCenter/renku-ui/issues/2027), [#2187](https://github.com/SwissDataScienceCenter/renku-ui/issues/2187))
* improve source highlighting in file preview ([#2175](https://github.com/SwissDataScienceCenter/renku-ui/issues/2175), [#2233](https://github.com/SwissDataScienceCenter/renku-ui/issues/2233))
* restore projects and datasets images  ([#2179](https://github.com/SwissDataScienceCenter/renku-ui/issues/2179), [#2231](https://github.com/SwissDataScienceCenter/renku-ui/issues/2231))


## [2.14.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.13.0...2.14.0) (2022-12-16)

### Bug Fixes

* improve layout on project creation page ([#2077](https://github.com/SwissDataScienceCenter/renku-ui/issues/2077), [#2214](https://github.com/SwissDataScienceCenter/renku-ui/issues/2214))
* prevent resetting inputs when forking a project ([#2157](https://github.com/SwissDataScienceCenter/renku-ui/issues/2157))
* update links to documentation ([#2207](https://github.com/SwissDataScienceCenter/renku-ui/issues/2207), [#2199](https://github.com/SwissDataScienceCenter/renku-ui/issues/2199))
* fix glitches on start session page ([#2199](https://github.com/SwissDataScienceCenter/renku-ui/issues/2199))
* use project slug for local links ([#2209](https://github.com/SwissDataScienceCenter/renku-ui/issues/2209))
* prevent overflowing content on file browser ([#2132](https://github.com/SwissDataScienceCenter/renku-ui/issues/2132), [#2213](https://github.com/SwissDataScienceCenter/renku-ui/issues/2213))


### Features

* make "stop" the default action for failed sessions ([#1892](https://github.com/SwissDataScienceCenter/renku-ui/issues/1892), [#2211](https://github.com/SwissDataScienceCenter/renku-ui/issues/2211))
* receive notifications through websocket when sessions change ([#2016](https://github.com/SwissDataScienceCenter/renku-ui/issues/2016), [#2145](https://github.com/SwissDataScienceCenter/renku-ui/issues/2145), [#2189](https://github.com/SwissDataScienceCenter/renku-ui/issues/2189))


## [2.13.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.12.0...2.13.0) (2022-11-28)

### Bug Fixes

* correctly handle log download in all places in the UI ([#2160](https://github.com/SwissDataScienceCenter/renku-ui/issues/2160))


### Features

* switch to REST endpoint for lineage from KG ([#1857](https://github.com/SwissDataScienceCenter/renku-ui/issues/1857), [#2122](https://github.com/SwissDataScienceCenter/renku-ui/issues/2122))

* unify display of session logs in all places in the UI ([#2139](https://github.com/SwissDataScienceCenter/renku-ui/issues/2139), [#2160](https://github.com/SwissDataScienceCenter/renku-ui/issues/2160))


## [2.12.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.11.1...2.12.0) (2022-11-21)

### Bug Fixes

**projects:**
* fix bug in project name entry field of fork dialog ([#2144](https://github.com/SwissDataScienceCenter/renku-ui/issues/2144))

### Features

**sessions**
* improve explanation when a session link does not work ([#2141](https://github.com/SwissDataScienceCenter/renku-ui/issues/2141), [#1777](https://github.com/SwissDataScienceCenter/renku-ui/issues/1777))
* improve UX of server session logs ([#1743](https://github.com/SwissDataScienceCenter/renku-ui/issues/1743), [#2137](https://github.com/SwissDataScienceCenter/renku-ui/issues/2137))
* unify flow for starting sessions ([#2131](https://github.com/SwissDataScienceCenter/renku-ui/issues/2131), [#2115](https://github.com/SwissDataScienceCenter/renku-ui/issues/2115))

**misc**
* add static files for other RenkuLab components ([#2126](https://github.com/SwissDataScienceCenter/renku-ui/issues/2126))
* update or swap outdated client components ([#2156](https://github.com/SwissDataScienceCenter/renku-ui/issues/2156), [#2159](https://github.com/SwissDataScienceCenter/renku-ui/issues/2159))


## [2.11.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.11.0...2.11.1) (2022-11-09)


### Bug Fixes

**sessions**
* do not disable no-code pull/push buttons in situations where they will actually work ([#2100](https://github.com/SwissDataScienceCenter/renku-ui/issues/2100), [#2103](https://github.com/SwissDataScienceCenter/renku-ui/issues/2103))


### Features

**sessions**
* generate cheatsheet based on spec from renku-python ([#1920](https://github.com/SwissDataScienceCenter/renku-ui/issues/1920),   [#2112](https://github.com/SwissDataScienceCenter/renku-ui/issues/2112))


## [2.11.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.10.1...2.11.0) (2022-11-07)


### Bug Fixes

**sessions**
* handle corrupted autosaves and improve warnings ([#2086](https://github.com/SwissDataScienceCenter/renku-ui/issues/2086), [#2088](https://github.com/SwissDataScienceCenter/renku-ui/issues/2088))
* fix progress updates on session start ([#2095](https://github.com/SwissDataScienceCenter/renku-ui/issues/2095),  [#2098](https://github.com/SwissDataScienceCenter/renku-ui/issues/2098))

**projects**
* display shared link values in the new project form ([#2026](https://github.com/SwissDataScienceCenter/renku-ui/issues/2026), [#2089](https://github.com/SwissDataScienceCenter/renku-ui/issues/2089))
* correctly cache response from KG endpoint ([#2096](https://github.com/SwissDataScienceCenter/renku-ui/issues/2096), [#2097](https://github.com/SwissDataScienceCenter/renku-ui/issues/2097))


### Features

**sessions**
* add refresh button to session ([#1986](https://github.com/SwissDataScienceCenter/renku-ui/issues/1986),  [#2091](https://github.com/SwissDataScienceCenter/renku-ui/issues/2091))
* use the same component for session preparation and start progress ([#2064](https://github.com/SwissDataScienceCenter/renku-ui/issues/2064), [#2104](https://github.com/SwissDataScienceCenter/renku-ui/issues/2104))

**workflows**
* initial workflow support on project page ([#2038](https://github.com/SwissDataScienceCenter/renku-ui/issues/2038), [#2041](https://github.com/SwissDataScienceCenter/renku-ui/issues/2041), [#2050](https://github.com/SwissDataScienceCenter/renku-ui/issues/2050),  [#2065](https://github.com/SwissDataScienceCenter/renku-ui/issues/2065), [#2071](https://github.com/SwissDataScienceCenter/renku-ui/issues/2071),  [#2082](https://github.com/SwissDataScienceCenter/renku-ui/issues/2082), [#2087](https://github.com/SwissDataScienceCenter/renku-ui/issues/2087), [#2092](https://github.com/SwissDataScienceCenter/renku-ui/issues/2092), [#2102](https://github.com/SwissDataScienceCenter/renku-ui/issues/2102), [#2105](https://github.com/SwissDataScienceCenter/renku-ui/issues/2105), [#2099](https://github.com/SwissDataScienceCenter/renku-ui/issues/2099))

**misc**
* add gitlab logo in landing page  ([#1955](https://github.com/SwissDataScienceCenter/renku-ui/issues/1955), [#2106](https://github.com/SwissDataScienceCenter/renku-ui/issues/2106))

### BREAKING CHANGES

* Requires renku-python v1.9.0 or greater


## [2.10.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.10.0...2.10.1) (2022-10-20)


### Bug Fixes

* do not show session loader when values other than session status change ([#2083](https://github.com/SwissDataScienceCenter/renku-ui/issues/2083))



## [2.10.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.9.0...2.10.0) (2022-10-17)


### Bug Fixes

* load notebook preview ([#2052](https://github.com/SwissDataScienceCenter/renku-ui/issues/2052))
* prevent sending repeated queries to GitLab graphql ([#2072](https://github.com/SwissDataScienceCenter/renku-ui/issues/2072))
* **server:** use the correct redis namespace ([#2053](https://github.com/SwissDataScienceCenter/renku-ui/issues/2053))
* show namespace name when there is no owner data ([#2051](https://github.com/SwissDataScienceCenter/renku-ui/issues/2051))
* set the size of the image on the Not Found page to full screen ([#2051](https://github.com/SwissDataScienceCenter/renku-ui/issues/2051))


### Features

* save session button ([#1957](https://github.com/SwissDataScienceCenter/renku-ui/issues/1957), [#1985](https://github.com/SwissDataScienceCenter/renku-ui/issues/1985), [#2040](https://github.com/SwissDataScienceCenter/renku-ui/issues/2040), [#1985](https://github.com/SwissDataScienceCenter/renku-ui/issues/1985), [#1957](https://github.com/SwissDataScienceCenter/renku-ui/issues/1957))
* add environment variables when starting a session ([#2058](https://github.com/SwissDataScienceCenter/renku-ui/issues/2058), [#2066](https://github.com/SwissDataScienceCenter/renku-ui/issues/2066))
* add progress indicator when starting a session ([#1879](https://github.com/SwissDataScienceCenter/renku-ui/issues/1879), [#2054](https://github.com/SwissDataScienceCenter/renku-ui/issues/2054))
* **server:** keep some cookies when proxying ([#2018](https://github.com/SwissDataScienceCenter/renku-ui/issues/2018), [#2029](https://github.com/SwissDataScienceCenter/renku-ui/issues/2029))

### BREAKING CHANGES

* Requires renku-notebook v1.12.0 or greater

## [2.9.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.8.2...2.9.0) (2022-09-15)

### Features

* reduce unnecessary 'project locked' notifications ([#1982](https://github.com/SwissDataScienceCenter/renku-ui/issues/1982), [#2025](https://github.com/SwissDataScienceCenter/renku-ui/issues/2025))
* expose project metadata as JSON-LD ([#1867](https://github.com/SwissDataScienceCenter/renku-ui/issues/1867), [#2022](https://github.com/SwissDataScienceCenter/renku-ui/issues/2022))

### BREAKING CHANGES

* Requires renku-core v1.7.0 or greater
* Introduces changes to the helm chart which should have no impact on most deployments

## [2.8.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.8.1...2.8.2) (2022-09-15)

### Bug Fixes

* **server:** unique ids for each anonymous user ([#2031](https://github.com/SwissDataScienceCenter/renku-ui/issues/2031))

### Features

* **server:** prevent gateway from setting anon users cookies ([#2032](https://github.com/SwissDataScienceCenter/renku-ui/issues/2032))

## [2.8.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.8.0...2.8.1) (2022-09-09)

### Features

* update styling of entity header ([#1984](https://github.com/SwissDataScienceCenter/renku-ui/issues/1984), [#2001](https://github.com/SwissDataScienceCenter/renku-ui/issues/2001), [#2005](https://github.com/SwissDataScienceCenter/renku-ui/issues/2005))
* improve use of real estate in session view ([#1988](https://github.com/SwissDataScienceCenter/renku-ui/issues/1988), [#2009](https://github.com/SwissDataScienceCenter/renku-ui/issues/2009))
* update styling of project and dataset cards ([#1964](https://github.com/SwissDataScienceCenter/renku-ui/issues/1964), [#1978](https://github.com/SwissDataScienceCenter/renku-ui/issues/1978))

## [2.8.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.7.0...2.8.0)  (2022-09-06)

### Features

**sessions**
* improve session start flow ([#1990](https://github.com/SwissDataScienceCenter/renku-ui/issues/1990), [#2003](https://github.com/SwissDataScienceCenter/renku-ui/issues/2003))

**misc**
* setup WebSocket communications channel ([#1338](https://github.com/SwissDataScienceCenter/renku-ui/issues/1338),  [#2004](https://github.com/SwissDataScienceCenter/renku-ui/issues/2004), [#2012](https://github.com/SwissDataScienceCenter/renku-ui/issues/2012)  [#2013](https://github.com/SwissDataScienceCenter/renku-ui/issues/2013))
* handle anon-id cookies and headers ([#1601](https://github.com/SwissDataScienceCenter/renku-ui/issues/1601), [#2002](https://github.com/SwissDataScienceCenter/renku-ui/issues/2002))

### Bug Fixes

**project**
* fix file tree display when changing to original project from fork ([#1907](https://github.com/SwissDataScienceCenter/renku-ui/issues/1907), [#2015](https://github.com/SwissDataScienceCenter/renku-ui/issues/2015))
* prevent repeated queries to projects API ([#2017](https://github.com/SwissDataScienceCenter/renku-ui/issues/2017))

**anonymous navigation**
* render star project button for anon users ([#2014](https://github.com/SwissDataScienceCenter/renku-ui/issues/2014))
* restore back button navigation on projects for anon users ([#2017](https://github.com/SwissDataScienceCenter/renku-ui/issues/2017))

### BREAKING CHANGES

* requires renku-gateway >= 0.15.0

## [2.7.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.6.0...2.7.0) (2022-08-12)

### Features

* adapt notebook server error response format ([#1710](https://github.com/SwissDataScienceCenter/renku-ui/issues/1710), [#1989](https://github.com/SwissDataScienceCenter/renku-ui/issues/1989))
* add styles for form elements ([#1964](https://github.com/SwissDataScienceCenter/renku-ui/issues/1964), [#1979](https://github.com/SwissDataScienceCenter/renku-ui/issues/1979))

### Bug Fixes

* host the Inter typeface on Renku ([#1981](https://github.com/SwissDataScienceCenter/renku-ui/issues/1981), [#1996](https://github.com/SwissDataScienceCenter/renku-ui/issues/1996))
* **sessions** show the correct dialog when starting a session on an autosave branch ([#1947](https://github.com/SwissDataScienceCenter/renku-ui/issues/1947),  [#2000](https://github.com/SwissDataScienceCenter/renku-ui/issues/2000))

### BREAKING CHANGES

* requires renku-notebooks >= 1.9.2


## [2.6.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.5.0...2.6.0) (2022-07-26)

### Features

* add confirmation when changing a value in the project settings ([#1922](https://github.com/SwissDataScienceCenter/renku-ui/issues/1922), [#1945](https://github.com/SwissDataScienceCenter/renku-ui/issues/1945))
* add visibility tooltip on the project card ([#1916](https://github.com/SwissDataScienceCenter/renku-ui/issues/1916), [#1940](https://github.com/SwissDataScienceCenter/renku-ui/issues/1940))
* add support for mermaid format in markdown view ([#1807](https://github.com/SwissDataScienceCenter/renku-ui/issues/1807), [#1941](https://github.com/SwissDataScienceCenter/renku-ui/issues/1941))
* update layout: buttons, cards, font, colors ([#1885](https://github.com/SwissDataScienceCenter/renku-ui/issues/1885), [#1953](https://github.com/SwissDataScienceCenter/renku-ui/issues/1953))
* include renku social media links in landing page ([#1923](https://github.com/SwissDataScienceCenter/renku-ui/issues/1923), [#1938](https://github.com/SwissDataScienceCenter/renku-ui/issues/1938))
* update cheatsheet ([#1961](https://github.com/SwissDataScienceCenter/renku-ui/issues/1961))


### BREAKING CHANGES

* requires renku >= 0.15.0

## [2.5.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.4.1...2.5.0) (2022-07-01)

### Features

**dataset**

* add dropzone component for large files ([#1830](https://github.com/SwissDataScienceCenter/renku-ui/issues/1830), [#1882](https://github.com/SwissDataScienceCenter/renku-ui/issues/1882))

**misc**

* set page title to project or dataset title ([#1881](https://github.com/SwissDataScienceCenter/renku-ui/issues/1881))
* add custom error 404 page ([#1910](https://github.com/SwissDataScienceCenter/renku-ui/issues/1910),  [#1915](https://github.com/SwissDataScienceCenter/renku-ui/issues/1915))


### Bug Fixes

* **dataset** use git_url instead of project_id to import dataset ([#1925](https://github.com/SwissDataScienceCenter/renku-ui/issues/1925))
* **notebook** add validation when opening a notebook ([#1906](https://github.com/SwissDataScienceCenter/renku-ui/issues/1906), [#1926](https://github.com/SwissDataScienceCenter/renku-ui/issues/1926))


### BREAKING CHANGES

* requires renku-python >= 1.5.0

## [2.4.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.4.0...2.4.1) (2022-06-24)

### Features

* **sessions** allow specifying files in auto start links ([#1781](https://github.com/SwissDataScienceCenter/renku-ui/issues/1781),   [#1905](https://github.com/SwissDataScienceCenter/renku-ui/issues/1905))
* **home page** remove unwanted sections of home page ([#1886](https://github.com/SwissDataScienceCenter/renku-ui/issues/1886), [#1896](https://github.com/SwissDataScienceCenter/renku-ui/issues/1896))

### Bug Fixes

* **sessions** validate that the autosave commit is in the project commit list  ([#1921](https://github.com/SwissDataScienceCenter/renku-ui/issues/1921))

## [2.4.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.3.2...2.4.0) (2022-06-13)


### Bug Fixes

* edit datasets without images works as expected ([1899](https://github.com/SwissDataScienceCenter/renku-ui/issues/1899))

* support new server resources format ([#1825](https://github.com/SwissDataScienceCenter/renku-ui/issues/1825), [#1791](https://github.com/SwissDataScienceCenter/renku-ui/issues/1791))


### BREAKING CHANGES

* requires renku-notebooks >= v1.8.0


## [2.3.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.3.1...2.3.2) (2022-06-10)

### Bug Fixes

* do not show download button for folders in lineage view  ([#1893](https://github.com/SwissDataScienceCenter/renku-ui/issues/1893))
* retain dataset image when updating a dataset ([#1861](https://github.com/SwissDataScienceCenter/renku-ui/issues/1861), [#1887](https://github.com/SwissDataScienceCenter/renku-ui/issues/1887))


## [2.3.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.3.0...2.3.1) (2022-05-31)
### Features

* updated content of anonymous home page ([#1849](https://github.com/SwissDataScienceCenter/renku-ui/issues/1849), [#1850](https://github.com/SwissDataScienceCenter/renku-ui/issues/1850), [#1851](https://github.com/SwissDataScienceCenter/renku-ui/issues/1851), [#1852](https://github.com/SwissDataScienceCenter/renku-ui/issues/1852), [#1853](https://github.com/SwissDataScienceCenter/renku-ui/issues/1853), [#1859](https://github.com/SwissDataScienceCenter/renku-ui/issues/1859), [#1868](https://github.com/SwissDataScienceCenter/renku-ui/issues/1868))

* add action button to datasets page for anonymous users ([#1836](https://github.com/SwissDataScienceCenter/renku-ui/issues/1836), [#1873](https://github.com/SwissDataScienceCenter/renku-ui/issues/1873))

## [2.3.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.2.0...2.3.0) (2022-05-23)


### Bug Fixes

* correct listing of projects on datasets ([#1842](https://github.com/SwissDataScienceCenter/renku-ui/issues/1842), [#1843](https://github.com/SwissDataScienceCenter/renku-ui/issues/1843))
* prevent wrong feedback on session pages ([#1797](https://github.com/SwissDataScienceCenter/renku-ui/issues/1797), [#1796](https://github.com/SwissDataScienceCenter/renku-ui/issues/1796))
* update link to GitLab user profile ([#1822](https://github.com/SwissDataScienceCenter/renku-ui/issues/1822), [#1820](https://github.com/SwissDataScienceCenter/renku-ui/issues/1820))
* prevent unnecessary queries to check project lock status ([#1860](https://github.com/SwissDataScienceCenter/renku-ui/issues/1860), [#1858](https://github.com/SwissDataScienceCenter/renku-ui/issues/1858))


### Features

* speed up checking docker images availability ([#1839](https://github.com/SwissDataScienceCenter/renku-ui/issues/1839), [#1742](https://github.com/SwissDataScienceCenter/renku-ui/issues/1742))
* support legacy dataset URLs ([#1824](https://github.com/SwissDataScienceCenter/renku-ui/issues/1824), [#1819](https://github.com/SwissDataScienceCenter/renku-ui/issues/1819))
* ux improvements to project creation ([#1734](https://github.com/SwissDataScienceCenter/renku-ui/issues/1734), [#1760](https://github.com/SwissDataScienceCenter/renku-ui/issues/1760), [#1736](https://github.com/SwissDataScienceCenter/renku-ui/issues/1736), [#1770](https://github.com/SwissDataScienceCenter/renku-ui/issues/1770), [#1802](https://github.com/SwissDataScienceCenter/renku-ui/issues/1802))
* ux improvements to dataset creation ([#1747](https://github.com/SwissDataScienceCenter/renku-ui/issues/1747), [#1733](https://github.com/SwissDataScienceCenter/renku-ui/issues/1733), [#1738](https://github.com/SwissDataScienceCenter/renku-ui/issues/1738), [#1827](https://github.com/SwissDataScienceCenter/renku-ui/issues/1827), [#1739](https://github.com/SwissDataScienceCenter/renku-ui/issues/1739), [#1815](https://github.com/SwissDataScienceCenter/renku-ui/issues/1815), [#1828](https://github.com/SwissDataScienceCenter/renku-ui/issues/1828), [#1829](https://github.com/SwissDataScienceCenter/renku-ui/issues/1829), [#1854](https://github.com/SwissDataScienceCenter/renku-ui/issues/1854), [#1740](https://github.com/SwissDataScienceCenter/renku-ui/issues/1740))
* ux improvements to progress indicator ([#1761](https://github.com/SwissDataScienceCenter/renku-ui/issues/1761), [#1735](https://github.com/SwissDataScienceCenter/renku-ui/issues/1735), [#1774](https://github.com/SwissDataScienceCenter/renku-ui/issues/1774), [#1775](https://github.com/SwissDataScienceCenter/renku-ui/issues/1775))


## [2.2.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.1.2...2.2.0) (2022-04-12)

### Features

**sessions**
* improve error handling on missing pipelines ([#1778](https://github.com/SwissDataScienceCenter/renku-ui/issues/1778))
* improve starting new sessions ([#1730](https://github.com/SwissDataScienceCenter/renku-ui/issues/1730), [#1408](https://github.com/SwissDataScienceCenter/renku-ui/issues/1408), [#1679](https://github.com/SwissDataScienceCenter/renku-ui/issues/1679))
* use new api for pinned images ([#1769](https://github.com/SwissDataScienceCenter/renku-ui/issues/1769), [#1767](https://github.com/SwissDataScienceCenter/renku-ui/issues/1767))

**core**
* use versions endpoint to detect core-service versions
* handle new renku-core api errors ([#1757](https://github.com/SwissDataScienceCenter/renku-ui/issues/1757),  [#1709](https://github.com/SwissDataScienceCenter/renku-ui/issues/1709))
* adapt to new name of core-service version endpoint ([#1714](https://github.com/SwissDataScienceCenter/renku-ui/issues/1714))

### Bug Fixes

**misc**
* fix link to download files so it works for all default-branch names ([#1750](https://github.com/SwissDataScienceCenter/renku-ui/issues/1750), [#1753](https://github.com/SwissDataScienceCenter/renku-ui/issues/1753))
* do not flash "RenkuLab down" when the user's auth token has expired ([#1759](https://github.com/SwissDataScienceCenter/renku-ui/issues/1759), [#1788](https://github.com/SwissDataScienceCenter/renku-ui/issues/1788))
* fix the update project template button ([#1745](https://github.com/SwissDataScienceCenter/renku-ui/issues/1745))

### BREAKING CHANGES

* Requires renku-core/renku-python >= v1.2.0

## [2.1.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.1.1...2.1.2) (2022-04-05)

### Bug Fixes

**sessions**
* fix problems starting projects with pinned images ( [#1769](https://github.com/SwissDataScienceCenter/renku-ui/issues/1769), [#1767](https://github.com/SwissDataScienceCenter/renku-ui/issues/1767))

## [2.1.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.1.0...2.1.1) (2022-03-24)

### Features

**sessions**
* improve feedback while starting sessions ([#1730](https://github.com/SwissDataScienceCenter/renku-ui/issues/1730), [#1408](https://github.com/SwissDataScienceCenter/renku-ui/issues/1408), [#1679](https://github.com/SwissDataScienceCenter/renku-ui/issues/1679))
### Bug Fixes

* correctly support updating project templates ([#1745](https://github.com/SwissDataScienceCenter/renku-ui/issues/1745))

## [2.1.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.0.2...2.1.0) (2022-03-15)
### Features

* support creating a new project and importing a dataset into it as one action ([#1604](https://github.com/SwissDataScienceCenter/renku-ui/issues/1604), [#1703](https://github.com/SwissDataScienceCenter/renku-ui/issues/1703))
* show project visibility in projects list ([#1637](https://github.com/SwissDataScienceCenter/renku-ui/issues/1637), [#1711](https://github.com/SwissDataScienceCenter/renku-ui/issues/1711))
* generate links with badge to "Start on renku" ([#1678](https://github.com/SwissDataScienceCenter/renku-ui/issues/1678), [#1706](https://github.com/SwissDataScienceCenter/renku-ui/issues/1706))
* redirect Notebook connect button to file in session ([#1613](https://github.com/SwissDataScienceCenter/renku-ui/issues/1613), [#1725](https://github.com/SwissDataScienceCenter/renku-ui/issues/1725))
* display recently accessed projects on the home page ([#1628](https://github.com/SwissDataScienceCenter/renku-ui/issues/1628), [#1708](https://github.com/SwissDataScienceCenter/renku-ui/issues/1708))
* show session logs for sub containers ([#1647](https://github.com/SwissDataScienceCenter/renku-ui/issues/1647), [#1713](https://github.com/SwissDataScienceCenter/renku-ui/issues/1713))
* move documentation links to utility class ([#1724](https://github.com/SwissDataScienceCenter/renku-ui/issues/1724))
* support mounting cloud storage in sessions ([#1499](https://github.com/SwissDataScienceCenter/renku-ui/issues/1499), [#1518](https://github.com/SwissDataScienceCenter/renku-ui/issues/1518))


### Bug Fixes

* set project name in GitLab after project creation ([#1685](https://github.com/SwissDataScienceCenter/renku-ui/issues/1685), [#1722](https://github.com/SwissDataScienceCenter/renku-ui/issues/1722))
* reformat dataset identifiers from old projects to be consistent with current format ([#1694](https://github.com/SwissDataScienceCenter/renku-ui/issues/1694), [#1716](https://github.com/SwissDataScienceCenter/renku-ui/issues/1716))
* do not show project star status until it is available ([#1657](https://github.com/SwissDataScienceCenter/renku-ui/issues/1657), [#1723](https://github.com/SwissDataScienceCenter/renku-ui/issues/1723))
* update old documentation links ([#1704](https://github.com/SwissDataScienceCenter/renku-ui/issues/1704))


### BREAKING CHANGES

* requires renku-notebooks >=1.5.0

## [2.0.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.0.1...2.0.2) (2022-02-15)

Minor internal changes, not relevant to users.


## [2.0.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/2.0.0...2.0.1) (2022-02-10)
### Features

* support custom CA certificates ([#1537](https://github.com/SwissDataScienceCenter/renku-ui/issues/1537))

### Bug Fixes

* use the new usedIn field to get dataset projects ([#1684](https://github.com/SwissDataScienceCenter/renku-ui/issues/1684))


## [2.0.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.3.0...2.0.0) (2022-02-04)


### Features

**markdown**
* display math formulas ([#1600](https://github.com/SwissDataScienceCenter/renku-ui/issues/1600), [#1622](https://github.com/SwissDataScienceCenter/renku-ui/issues/1622))

**project templates**
* support template-defined parameter validation ([#1579](https://github.com/SwissDataScienceCenter/renku-ui/issues/1579), [#1320](https://github.com/SwissDataScienceCenter/renku-ui/issues/1320))
* support icons and description for templates ([#1530](https://github.com/SwissDataScienceCenter/renku-ui/issues/1530), [#1467](https://github.com/SwissDataScienceCenter/renku-ui/issues/1467), [#1487](https://github.com/SwissDataScienceCenter/renku-ui/issues/1487))

**repo support**
* support multiple versions of renku core ([#1620](https://github.com/SwissDataScienceCenter/renku-ui/issues/1620), [#1630](https://github.com/SwissDataScienceCenter/renku-ui/issues/1630), [#1507](https://github.com/SwissDataScienceCenter/renku-ui/issues/1507))
* improve presentation of migration suggestions ([#1621](https://github.com/SwissDataScienceCenter/renku-ui/issues/1621), [#1602](https://github.com/SwissDataScienceCenter/renku-ui/issues/1602), [#1422](https://github.com/SwissDataScienceCenter/renku-ui/issues/1422), [#1233](https://github.com/SwissDataScienceCenter/renku-ui/issues/1233), [#1651](https://github.com/SwissDataScienceCenter/renku-ui/issues/1651), [#1659](https://github.com/SwissDataScienceCenter/renku-ui/issues/1659))

**server**
* improve error logging in ui-server ([#1523](https://github.com/SwissDataScienceCenter/renku-ui/issues/1523), [#1658](https://github.com/SwissDataScienceCenter/renku-ui/issues/1658))

**sessions**
* more robust autosave infrastructure ([#1645](https://github.com/SwissDataScienceCenter/renku-ui/issues/1645), [#1345](https://github.com/SwissDataScienceCenter/renku-ui/issues/1345), [#789](https://github.com/SwissDataScienceCenter/renku-ui/issues/789))
* improve options for missing pipelines ([#1671](https://github.com/SwissDataScienceCenter/renku-ui/issues/1671), [#1667](https://github.com/SwissDataScienceCenter/renku-ui/issues/1667))

### Bug Fixes

**datasets**
*  fix problems with dataset "add to project" button ([#1656](https://github.com/SwissDataScienceCenter/renku-ui/issues/1656))

**projects**
* restore error handling on forks ([#1674](https://github.com/SwissDataScienceCenter/renku-ui/issues/1674), [#1665](https://github.com/SwissDataScienceCenter/renku-ui/issues/1665))

**markdown**
* handle links and images specified by relative path ([#1655](https://github.com/SwissDataScienceCenter/renku-ui/issues/1655), [#1673](https://github.com/SwissDataScienceCenter/renku-ui/issues/1673))

### BREAKING CHANGES

* requires renku-python >=1.0.4
* requires renku-graph >=2.0.0


## [1.3.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.2.2...1.3.0) (2022-01-07)

### Bug Fixes

* show the correct session status on notebooks preview ([#1610](https://github.com/SwissDataScienceCenter/renku-ui/issues/1610), [#1606](https://github.com/SwissDataScienceCenter/renku-ui/issues/1606))
* correct links to migration documentation  ([#1591](https://github.com/SwissDataScienceCenter/renku-ui/issues/1591), [#1588](https://github.com/SwissDataScienceCenter/renku-ui/issues/1588))
* order scheduled maintenances to show the next one first  ([#1612](https://github.com/SwissDataScienceCenter/renku-ui/issues/1612), [#1609](https://github.com/SwissDataScienceCenter/renku-ui/issues/1609))
* sanitize Jupyter notebooks to remove problematic HTML  ([#1629](https://github.com/SwissDataScienceCenter/renku-ui/issues/1629))

### Features

* show suggestions for things to do on new projects  ([#1512](https://github.com/SwissDataScienceCenter/renku-ui/issues/1512), [#1578](https://github.com/SwissDataScienceCenter/renku-ui/issues/1578))
* support links for sharing sessions with options  ([#1596](https://github.com/SwissDataScienceCenter/renku-ui/issues/1596), [#1608](https://github.com/SwissDataScienceCenter/renku-ui/issues/1608))
* add visibility open when forking a project  ([#1272](https://github.com/SwissDataScienceCenter/renku-ui/issues/1272), [#1617](https://github.com/SwissDataScienceCenter/renku-ui/issues/1617))
* allow stopping a session that is not fully started  ([#787](https://github.com/SwissDataScienceCenter/renku-ui/issues/787), [#1605](https://github.com/SwissDataScienceCenter/renku-ui/issues/1605))
* handle Enter key on project search bar  ([#1576](https://github.com/SwissDataScienceCenter/renku-ui/issues/1576), [#1595](https://github.com/SwissDataScienceCenter/renku-ui/issues/1595))
* updates to style of alerts, menus, and tables  ([#1571](https://github.com/SwissDataScienceCenter/renku-ui/issues/1571),  [#1589](https://github.com/SwissDataScienceCenter/renku-ui/issues/1589))
* improve UX when GitLab does not allow iframes  ([#1584](https://github.com/SwissDataScienceCenter/renku-ui/issues/1584), [#1572](https://github.com/SwissDataScienceCenter/renku-ui/issues/1572))


## [1.2.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.2.1...1.2.2) (2021-12-20)

### Bug Fixes

* order maintenance by schedule date asc ([#1612](https://github.com/SwissDataScienceCenter/renku-ui/issues/1612))

## [1.2.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.2.0...1.2.1) (2021-11-29)

### Bug Fixes

* adjust the build pipeline to prevent showing version update popups when unnecessary ([#1594](https://github.com/SwissDataScienceCenter/renku-ui/issues/1594))

## [1.2.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.1.0...1.2.0) (2021-11-26)

### Features

**Server**

* improve stability when external stores are temporarily unavailable ([#1583](https://github.com/SwissDataScienceCenter/renku-ui/issues/1583), [#1521](https://github.com/SwissDataScienceCenter/renku-ui/issues/1521))

**Client**

* add PDF file viewer ([#998](https://github.com/SwissDataScienceCenter/renku-ui/issues/998), [#1566](https://github.com/SwissDataScienceCenter/renku-ui/issues/1566))
* render LaTeX math ([#1552](https://github.com/SwissDataScienceCenter/renku-ui/issues/1552), [#1557](https://github.com/SwissDataScienceCenter/renku-ui/issues/1557), [#946](https://github.com/SwissDataScienceCenter/renku-ui/issues/946))
* improve performance when loading user's projects ([#1553](https://github.com/SwissDataScienceCenter/renku-ui/issues/1553), closes [#1529](https://github.com/SwissDataScienceCenter/renku-ui/issues/1529))
* update Renku commands cheat sheet ([#1582](https://github.com/SwissDataScienceCenter/renku-ui/issues/1582), [#1558](https://github.com/SwissDataScienceCenter/renku-ui/issues/1558))

### BREAKING CHANGES

* requires renku-gateway version >= 0.10.2


## [1.1.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.2...1.1.0) (2021-11-12)


* allow canceling a dataset search before before it completes ([#1352](https://github.com/SwissDataScienceCenter/renku-ui/issues/1352), [#1549](https://github.com/SwissDataScienceCenter/renku-ui/issues/1549))
* use ui server for authentication ([#1519](https://github.com/SwissDataScienceCenter/renku-ui/issues/1519), [#1337](https://github.com/SwissDataScienceCenter/renku-ui/issues/1337))

* highlight code syntax in markdown files ([#1534](https://github.com/SwissDataScienceCenter/renku-ui/issues/1534), [#1358](https://github.com/SwissDataScienceCenter/renku-ui/issues/1358))
* improve performance of landing page ([#1529](https://github.com/SwissDataScienceCenter/renku-ui/issues/1529), [#1546](https://github.com/SwissDataScienceCenter/renku-ui/issues/1546))
* notify user when a new renkulab version is available ([#1544](https://github.com/SwissDataScienceCenter/renku-ui/issues/1544), [#819](https://github.com/SwissDataScienceCenter/renku-ui/issues/819))
* rearrange session menu options ([#1545](https://github.com/SwissDataScienceCenter/renku-ui/issues/1545), [#1548](https://github.com/SwissDataScienceCenter/renku-ui/issues/1548))
* preview matlab files ([#1543](https://github.com/SwissDataScienceCenter/renku-ui/issues/1543))

### Bug Fixes

* filter out the internal loud component when checking RenkuLab health ([#1541](https://github.com/SwissDataScienceCenter/renku-ui/issues/1541))


## [1.0.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.1..1.0.2) (2021-10-29)


### Bug Fixes

* add missing headers to graphql queries ([#1525](https://github.com/SwissDataScienceCenter/renku-ui/issues/1525), [#1520](https://github.com/SwissDataScienceCenter/renku-ui/issues/1520))
* check the image status properly when quickstarting sessions ([#1526](https://github.com/SwissDataScienceCenter/renku-ui/issues/1526), [#1031](https://github.com/SwissDataScienceCenter/renku-ui/issues/1031))
* use proper components for navbar dropdown links ([#1532](https://github.com/SwissDataScienceCenter/renku-ui/issues/1532))


### Features

* add 'loud' option to statuspage display ([#1524](https://github.com/SwissDataScienceCenter/renku-ui/issues/1524),  [#1531](https://github.com/SwissDataScienceCenter/renku-ui/issues/1531))


## [1.0.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0..1.0.1) (2021-10-11)

### Bug Fixes

* prevent users without fork rights from trying to fork ([#1494](https://github.com/SwissDataScienceCenter/renku-ui/issues/1494), [#1431](https://github.com/SwissDataScienceCenter/renku-ui/issues/1431))
* reactivate configurable home page ([#1513](https://github.com/SwissDataScienceCenter/renku-ui/issues/1513), [#1515](https://github.com/SwissDataScienceCenter/renku-ui/issues/1515))
* correct column width in markdown tables ([#1501](https://github.com/SwissDataScienceCenter/renku-ui/issues/1501), [#1496](https://github.com/SwissDataScienceCenter/renku-ui/issues/1496))
* show titles in landing page Your Projects sections ([#1508](https://github.com/SwissDataScienceCenter/renku-ui/issues/1508))

### Features

* support creating and editing datasets when the default branch is protected ([#1013](https://github.com/SwissDataScienceCenter/renku-ui/issues/1013), [#1502](https://github.com/SwissDataScienceCenter/renku-ui/issues/1502))

## [1.0.0 🎉](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0-beta5...1.0.0) (2021-09-20)

The 1.0.0 UI! The biggest changes compared to the earlier 0.11.x version are explained on the RenkuLab home page
and include:

* New aesthetics, look and feel
* Sessions (formerly "interactive environments") shown in the UI within their RenkuLab context
* Issues and Merge Requests shown in the UI within RenkuLab context

Changes compared to 1.0.0-beta5 follow below.

### Features

**collaboration**

* add fork tab to collaboration page ([#1468](https://github.com/SwissDataScienceCenter/renku-ui/issues/1468), [#1479](https://github.com/SwissDataScienceCenter/renku-ui/issues/1479))
* add "open in tab button" to collaboration pages ([#1468](https://github.com/SwissDataScienceCenter/renku-ui/issues/1468), [#1479](https://github.com/SwissDataScienceCenter/renku-ui/issues/1479))

**dataset**
* provide ui to add and display dataset marquee image in projects ([#1142](https://github.com/SwissDataScienceCenter/renku-ui/issues/1142),  [#1444](https://github.com/SwissDataScienceCenter/renku-ui/issues/1444))

**files**
* make file browser width adjustable ([#1441](https://github.com/SwissDataScienceCenter/renku-ui/issues/1441), [#1423](https://github.com/SwissDataScienceCenter/renku-ui/issues/1423))

**sessions**
* improve visiblity of "open in new tab" button in sessions ([#1491](https://github.com/SwissDataScienceCenter/renku-ui/issues/1491), [#1400](https://github.com/SwissDataScienceCenter/renku-ui/issues/1400))
* added cheat sheet to session page ([#1380](https://github.com/SwissDataScienceCenter/renku-ui/issues/1380), [#1466](https://github.com/SwissDataScienceCenter/renku-ui/issues/1466))

**general**
* add help page for UI changes ([#1469](https://github.com/SwissDataScienceCenter/renku-ui/issues/1469))
* show initial 1.0.0 home page ([#1425](https://github.com/SwissDataScienceCenter/renku-ui/issues/1425), [#1426](https://github.com/SwissDataScienceCenter/renku-ui/issues/1426), [#1425](https://github.com/SwissDataScienceCenter/renku-ui/issues/1425))
* show new logged-in landing page ([#1447](https://github.com/SwissDataScienceCenter/renku-ui/issues/1447), [#1360](https://github.com/SwissDataScienceCenter/renku-ui/issues/1360))
* show error page when gitlab is not available ([#1489](https://github.com/SwissDataScienceCenter/renku-ui/issues/1489), [#805](https://github.com/SwissDataScienceCenter/renku-ui/issues/805))
* show new version info banner to logged-in users ([#1469](https://github.com/SwissDataScienceCenter/renku-ui/issues/1469))

### Bug Fixes

**datasets**
* send dataset creators correctly ([#1482](https://github.com/SwissDataScienceCenter/renku-ui/issues/1482), [#1470](https://github.com/SwissDataScienceCenter/renku-ui/issues/1470))
* proper error handling when dataset add fails ([#1488](https://github.com/SwissDataScienceCenter/renku-ui/issues/1488))

**sessions**
* allow scripts on docs iframe to quiet complaints ([#1483](https://github.com/SwissDataScienceCenter/renku-ui/issues/1483))
* be more generous on iframe privileges ([#1465](https://github.com/SwissDataScienceCenter/renku-ui/issues/1465), [#1483](https://github.com/SwissDataScienceCenter/renku-ui/issues/1483))
* revive the fork button on the sessions page ([#1278](https://github.com/SwissDataScienceCenter/renku-ui/issues/1278), [#1480](https://github.com/SwissDataScienceCenter/renku-ui/issues/1480))
* make improvements to messages when no image is available ([#1492](https://github.com/SwissDataScienceCenter/renku-ui/issues/1492), [#1448](https://github.com/SwissDataScienceCenter/renku-ui/issues/1448))

**general**
* handle projects with primary branches named other than "master" ([#1457](https://github.com/SwissDataScienceCenter/renku-ui/issues/1457), [#1173](https://github.com/SwissDataScienceCenter/renku-ui/issues/1173))
* do not reload when logo is clicked ([#1473](https://github.com/SwissDataScienceCenter/renku-ui/issues/1473))

## [1.0.0-beta5](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0-beta4...1.0.0-beta5) (2021-08-10)

### Bug Fixes


* prevent values duplication on session enumerations ([#1440](https://github.com/SwissDataScienceCenter/renku-ui/issues/1440), [#1436](https://github.com/SwissDataScienceCenter/renku-ui/issues/1436))

### Features

* redesign the header to take less vertical space ([#1420](https://github.com/SwissDataScienceCenter/renku-ui/issues/1420), [#1389](https://github.com/SwissDataScienceCenter/renku-ui/issues/1389))

# Changes

## [1.0.0-beta4](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0-beta3...1.0.0-beta4) (2021-07-16)

### Bug Fixes

* correct start button behavior for pinned images ([#1418](https://github.com/SwissDataScienceCenter/renku-ui/issues/1418))
* update URL for session config documentation

### Features

* extend the list of extensions for code files in lineage display ([#1421](https://github.com/SwissDataScienceCenter/renku-ui/issues/1421))
* make appearance of switch state clearer ([#1357](https://github.com/SwissDataScienceCenter/renku-ui/issues/1357),  [#1412](https://github.com/SwissDataScienceCenter/renku-ui/issues/1412))
* use switch for notebook launch ([#1357](https://github.com/SwissDataScienceCenter/renku-ui/issues/1357)  [#1412](https://github.com/SwissDataScienceCenter/renku-ui/issues/1412))


## [1.0.0-beta3](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0-beta2...1.0.0-beta3)  (2021-07-09)

### Bug Fixes

* do not autostart sessions if no image is available ([#1413](https://github.com/SwissDataScienceCenter/renku-ui/issues/1413), [#1415](https://github.com/SwissDataScienceCenter/renku-ui/issues/1415))

### Features

* display issues and MRs in iframes ([#1330](https://github.com/SwissDataScienceCenter/renku-ui/issues/1330), [#1361](https://github.com/SwissDataScienceCenter/renku-ui/issues/1361))
* switch to tile display for project datasets ([#1402](https://github.com/SwissDataScienceCenter/renku-ui/issues/1402), [#1414](https://github.com/SwissDataScienceCenter/renku-ui/issues/1414))
* use new color scheme for lineage view ([#1402](https://github.com/SwissDataScienceCenter/renku-ui/issues/1402), [#1414](https://github.com/SwissDataScienceCenter/renku-ui/issues/1414))


## [1.0.0-beta2](https://github.com/SwissDataScienceCenter/renku-ui/compare/1.0.0-beta1...1.0.0-beta2)  (2021-07-01)


The second beta, focusing on the new look and feel for RenkuLab.

### Features

**design**

* switch to minimalist project header ([#1385](https://github.com/SwissDataScienceCenter/renku-ui/issues/1385), [#1371](https://github.com/SwissDataScienceCenter/renku-ui/issues/1371))
* use colors to identify entities ([#1398](https://github.com/SwissDataScienceCenter/renku-ui/issues/1398), [#1376](https://github.com/SwissDataScienceCenter/renku-ui/issues/1376))
* implement small fixes to the UI design ([#1388](https://github.com/SwissDataScienceCenter/renku-ui/issues/1388))
* display title and slug in search result ([#1399](https://github.com/SwissDataScienceCenter/renku-ui/issues/1399))

**sessions**

* add link to registry images ([#1404](https://github.com/SwissDataScienceCenter/renku-ui/issues/1404))
* simplify starting new sessions ([#1403](https://github.com/SwissDataScienceCenter/renku-ui/issues/1403), [#1152](https://github.com/SwissDataScienceCenter/renku-ui/issues/1152))

**misc**

* add xml files preview ([#1401](https://github.com/SwissDataScienceCenter/renku-ui/issues/1401))

### Bug Fixes

* prevent duplication of falsy options ([#1406](https://github.com/SwissDataScienceCenter/renku-ui/issues/1406), [#1122](https://github.com/SwissDataScienceCenter/renku-ui/issues/1122))


## [1.0.0-beta1](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.11...1.0.0-beta1) (2021-06-17)

The first beta, focusing on the new look and feel for RenkuLab.

### Features

**sessions**

* switch to iframe-based sessions ([#1394](https://github.com/SwissDataScienceCenter/renku-ui/issues/1394), [#1370](https://github.com/SwissDataScienceCenter/renku-ui/issues/1370), [#1344](https://github.com/SwissDataScienceCenter/renku-ui/issues/1344), [#1220](https://github.com/SwissDataScienceCenter/renku-ui/issues/1220), [#1291](https://github.com/SwissDataScienceCenter/renku-ui/issues/1291), [#1318](https://github.com/SwissDataScienceCenter/renku-ui/issues/1318))
* support editing project defaults for sessions ([#1114](https://github.com/SwissDataScienceCenter/renku-ui/issues/1114), [#1386](https://github.com/SwissDataScienceCenter/renku-ui/issues/1386))

**design**

* implement new look and feel for UI ([#1372](https://github.com/SwissDataScienceCenter/renku-ui/issues/1372), [#1327](https://github.com/SwissDataScienceCenter/renku-ui/issues/1327), [#1254](https://github.com/SwissDataScienceCenter/renku-ui/issues/1254), [#1232](https://github.com/SwissDataScienceCenter/renku-ui/issues/1232), [#1262](https://github.com/SwissDataScienceCenter/renku-ui/issues/1262)   [#1335](https://github.com/SwissDataScienceCenter/renku-ui/issues/1335), [#1287](https://github.com/SwissDataScienceCenter/renku-ui/issues/1287), [#1268](https://github.com/SwissDataScienceCenter/renku-ui/issues/1268), [#1360](https://github.com/SwissDataScienceCenter/renku-ui/issues/1360), [#1327](https://github.com/SwissDataScienceCenter/renku-ui/issues/1327), [#1319](https://github.com/SwissDataScienceCenter/renku-ui/issues/1319), [#1315](https://github.com/SwissDataScienceCenter/renku-ui/issues/1315), [#1303](https://github.com/SwissDataScienceCenter/renku-ui/issues/1303), [#1285](https://github.com/SwissDataScienceCenter/renku-ui/issues/1285), [#1316](https://github.com/SwissDataScienceCenter/renku-ui/issues/1316), [#1286](https://github.com/SwissDataScienceCenter/renku-ui/issues/1286), [#1281](https://github.com/SwissDataScienceCenter/renku-ui/issues/1281))

**misc**

* handle non blocking errors on fork ([#1351](https://github.com/SwissDataScienceCenter/renku-ui/issues/1351), [#1341](https://github.com/SwissDataScienceCenter/renku-ui/issues/1341))
* show lineage on folders ([#1356](https://github.com/SwissDataScienceCenter/renku-ui/issues/1356), [#1342](https://github.com/SwissDataScienceCenter/renku-ui/issues/1342))
* support svg preview and fix image path ([#1353](https://github.com/SwissDataScienceCenter/renku-ui/issues/1353), [#1339](https://github.com/SwissDataScienceCenter/renku-ui/issues/1339))

### Bug Fixes

* adjust GitLab forks links ([#1368](https://github.com/SwissDataScienceCenter/renku-ui/issues/1368))
* handle namespaces that start with numbers ([#1359](https://github.com/SwissDataScienceCenter/renku-ui/issues/1359), [#1257](https://github.com/SwissDataScienceCenter/renku-ui/issues/1257))
* handle markdown in GitLab descriptions ([#1354](https://github.com/SwissDataScienceCenter/renku-ui/issues/1354), [#1346](https://github.com/SwissDataScienceCenter/renku-ui/issues/1346))

## [0.11.11](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.10...0.11.11) (2021-04-22)

### Bug Fixes

* prevent occasional crashes after project creation ([#1325](https://github.com/SwissDataScienceCenter/renku-ui/issues/1325), [#1324](https://github.com/SwissDataScienceCenter/renku-ui/issues/1324))

## [0.11.10](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.9...0.11.10) (2021-04-13)

### Features

* generate project-creation links, embedding metadata to automatically pre-fill input fields ([#1288](https://github.com/SwissDataScienceCenter/renku-ui/issues/1288), [#1194](https://github.com/SwissDataScienceCenter/renku-ui/issues/1194))
* add preview for common hidden files ([#1309](https://github.com/SwissDataScienceCenter/renku-ui/issues/1309))

### Bug Fixes

* restore support for project-level default environments parameters ([#1308](https://github.com/SwissDataScienceCenter/renku-ui/issues/1308), [#1306](https://github.com/SwissDataScienceCenter/renku-ui/issues/1306))

## [0.11.9](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.8...0.11.9) (2021-04-01)

### Features

* improve UX when forking a project, and handle up to 1000 namespaces ([#1296](https://github.com/SwissDataScienceCenter/renku-ui/issues/1296), [#1294](https://github.com/SwissDataScienceCenter/renku-ui/issues/1294), [#1277](https://github.com/SwissDataScienceCenter/renku-ui/issues/1277), [#1271](https://github.com/SwissDataScienceCenter/renku-ui/issues/1271))
* allow setting project avatar ([#1206](https://github.com/SwissDataScienceCenter/renku-ui/issues/1206), [#1273](https://github.com/SwissDataScienceCenter/renku-ui/issues/1273))
* simplify getting the registry image URL for running sessions ([#1290](https://github.com/SwissDataScienceCenter/renku-ui/issues/1290))

### Bug Fixes

* fix issue pages not loading the content ([#1295](https://github.com/SwissDataScienceCenter/renku-ui/issues/1295), [#1293](https://github.com/SwissDataScienceCenter/renku-ui/issues/1293))
* preserve query parameters when logging in ([#1282](https://github.com/SwissDataScienceCenter/renku-ui/issues/1282))

### BREAKING CHANGES

* requires renku-gateway version >= 0.9.4

## [0.11.8](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.7...0.11.8) (2021-03-09)

### Bug Fixes

* **datasets** handle datasets with ',' in the name correctly ([#1265](https://github.com/SwissDataScienceCenter/renku-ui/pull/1265))


## [0.11.7](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.6...0.11.7) (2021-03-08)

### Features

* **datasets** show a notification when uploading big files ([#1247](https://github.com/SwissDataScienceCenter/renku-ui/issues/1247), [#1150](https://github.com/SwissDataScienceCenter/renku-ui/issues/1150))
* **project** update the project fork flow to match project creation ([#1252](https://github.com/SwissDataScienceCenter/renku-ui/issues/1252), [#1118](https://github.com/SwissDataScienceCenter/renku-ui/issues/1118))


### Bug Fixes

**datasets**

* fix creation date when searching datasets ([#1240](https://github.com/SwissDataScienceCenter/renku-ui/issues/1240), [#1226](https://github.com/SwissDataScienceCenter/renku-ui/issues/1226))
* fail gracefully when trying to access a missing dataset ([#1258](https://github.com/SwissDataScienceCenter/renku-ui/issues/1258), [#1003](https://github.com/SwissDataScienceCenter/renku-ui/issues/1003))

**general**

* check lfs status properly when previewing a file ([#1242](https://github.com/SwissDataScienceCenter/renku-ui/issues/1242))
* fix broken markdown preview caused by links without a reference ([#1250](https://github.com/SwissDataScienceCenter/renku-ui/issues/1250))
* handle sub-groups on projects list ([#1253](https://github.com/SwissDataScienceCenter/renku-ui/issues/1253), [#1248](https://github.com/SwissDataScienceCenter/renku-ui/issues/1248))


## [0.11.6](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.5...0.11.6) (2021-02-15)

### Bug Fixes

* fix markdown files when they contain a file preview ([#1237](https://github.com/SwissDataScienceCenter/renku-ui/issues/1237))
* prevent accessing stats for non existing projects ([#1235](https://github.com/SwissDataScienceCenter/renku-ui/issues/1235), [#1234](https://github.com/SwissDataScienceCenter/renku-ui/issues/1234))
* change url to instructions for manual migration ([#1238](https://github.com/SwissDataScienceCenter/renku-ui/issues/1238), [#1213](https://github.com/SwissDataScienceCenter/renku-ui/issues/1213))


### Features

* store form state in redux  ([#1228](https://github.com/SwissDataScienceCenter/renku-ui/issues/1228), [#1216](https://github.com/SwissDataScienceCenter/renku-ui/issues/1216))


## [0.11.5](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.4...0.11.5) (2021-02-09)

### Bug Fixes

* preserve any input when clicking on buttons and links on the projects list page, and improve UX for non-logged users ([#1229](https://github.com/SwissDataScienceCenter/renku-ui/issues/1229) [#1181](https://github.com/SwissDataScienceCenter/renku-ui/issues/1181) [#1189](https://github.com/SwissDataScienceCenter/renku-ui/issues/1189))


## [0.11.4](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.3...0.11.4) (2021-02-01)

### Bug Fixes

* adjust parameter value on repository tree api (#1212) 2be72c2, closes  [#1212](https://github.com/SwissDataScienceCenter/renku-ui/issues/1212)
* do not attach trailing '/' on routes that end in a number (#1148) (#1202) 91d451e, closes  [#1148](https://github.com/SwissDataScienceCenter/renku-ui/issues/1148)  [#1202](https://github.com/SwissDataScienceCenter/renku-ui/issues/1202)
* fetch and store project statistics (#1192) 66ee302, closes  [#1192](https://github.com/SwissDataScienceCenter/renku-ui/issues/1192)  [#1074](https://github.com/SwissDataScienceCenter/renku-ui/issues/1074)
* prevent crashes on lineage with short node labels (#1193) c7dce1f, closes  [#1193](https://github.com/SwissDataScienceCenter/renku-ui/issues/1193)  [#1101](https://github.com/SwissDataScienceCenter/renku-ui/issues/1101)
* **datasets** get datasets even if user is not logged in (#1222) (#1223) e6ed756, closes  [#1222](https://github.com/SwissDataScienceCenter/renku-ui/issues/1222)  [#1223](https://github.com/SwissDataScienceCenter/renku-ui/issues/1223)
* **sessions** prevent changing params when other fetches are ongoing on new environment page (#1184) c7bd565, closes  [#1184](https://github.com/SwissDataScienceCenter/renku-ui/issues/1184)  [#1127](https://github.com/SwissDataScienceCenter/renku-ui/issues/1127)

### Features

* improve and speed up file preview (#1186) 99726cf, closes  [#1186](https://github.com/SwissDataScienceCenter/renku-ui/issues/1186)  [#1147](https://github.com/SwissDataScienceCenter/renku-ui/issues/1147)
* make fetching commits resilient to exceptions (#1184) 023f1e3, closes  [#1184](https://github.com/SwissDataScienceCenter/renku-ui/issues/1184)


## [0.11.3](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.2...0.11.3) (2020-12-11)

### Features

**dataset**

* description display has been shortened (#960) 58ecbc3, closes  [#960](https://github.com/SwissDataScienceCenter/renku-ui/issues/960)  [#952](https://github.com/SwissDataScienceCenter/renku-ui/issues/952)
* progress bar for file upload (#1145) 2d73048, closes  [#1145](https://github.com/SwissDataScienceCenter/renku-ui/issues/1145)  [#972](https://github.com/SwissDataScienceCenter/renku-ui/issues/972)
* remove dataset from projects (#1164) 3697008, closes  [#1164](https://github.com/SwissDataScienceCenter/renku-ui/issues/1164)  [#1151](https://github.com/SwissDataScienceCenter/renku-ui/issues/1151)

**file view**

* add preview for C++ and fortran files (#1137) 60bfa61, closes  [#1137](https://github.com/SwissDataScienceCenter/renku-ui/issues/1137)
* added download button to top bar and file size (#1133) 126d844, closes  [#1133](https://github.com/SwissDataScienceCenter/renku-ui/issues/1133)  [#1083](https://github.com/SwissDataScienceCenter/renku-ui/issues/1083)
* improvement in file and lineage view bar (#1135) 1cd0424, closes  [#1135](https://github.com/SwissDataScienceCenter/renku-ui/issues/1135)  [#864](https://github.com/SwissDataScienceCenter/renku-ui/issues/864)

**environments**

* mark commits with autosaved content when starting a new environment (#1134) 06935b4, closes  [#1134](https://github.com/SwissDataScienceCenter/renku-ui/issues/1134)  [#1113](https://github.com/SwissDataScienceCenter/renku-ui/issues/1113)
* support pinned images for environments (#1109) 79fca82, closes  [#1109](https://github.com/SwissDataScienceCenter/renku-ui/issues/1109)  [#1105](https://github.com/SwissDataScienceCenter/renku-ui/issues/1105)


**general**

* add client side notification system (#1055) (#1123) 10030ae, closes  [#1055](https://github.com/SwissDataScienceCenter/renku-ui/issues/1055)  [#1123](https://github.com/SwissDataScienceCenter/renku-ui/issues/1123)
* migration improvements (#1068) 7b220e6, closes  [#1068](https://github.com/SwissDataScienceCenter/renku-ui/issues/1068)  [#1026](https://github.com/SwissDataScienceCenter/renku-ui/issues/1026)
* sync tabs on authentication events (#1163) 57c8a25, closes  [#1163](https://github.com/SwissDataScienceCenter/renku-ui/issues/1163)  [#1048](https://github.com/SwissDataScienceCenter/renku-ui/issues/1048)

### Bug Fixes

* error message for form panel is now correct (#1174) 400b69c, closes  [#1174](https://github.com/SwissDataScienceCenter/renku-ui/issues/1174)  [#1172](https://github.com/SwissDataScienceCenter/renku-ui/issues/1172)

### BREAKING CHANGES

* Requires renku-notebooks version >= 0.8.6


## [0.11.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.1...0.11.2) (2020-11-17)

### Features

* improve title validation on new project creation 51e5ea4, closes [#1107](https://github.com/SwissDataScienceCenter/renku-ui/issues/1107) [#1115](https://github.com/SwissDataScienceCenter/renku-ui/issues/1115)

### Bug Fixes

* dataset form is much simpler now but it keeps all fields d96faf2, closes [#1116](https://github.com/SwissDataScienceCenter/renku-ui/issues/1116) [#1117](https://github.com/SwissDataScienceCenter/renku-ui/issues/1117)


### BREAKING CHANGES

* requires renku-python version >0.12.0


## [0.11.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.11.0...0.11.1) (2020-11-05)

### Features

* better explain that renku clone is preferred to git clone fa369b0, closes [#1057](https://github.com/SwissDataScienceCenter/renku-ui/issues/1057) [#1058](https://github.com/SwissDataScienceCenter/renku-ui/issues/1058)
* improve file preview 617c886, closes [#1069](https://github.com/SwissDataScienceCenter/renku-ui/issues/1069)
* **datasets:** new fields to dataset creation and edit of fields 9918ae5, closes [#965](https://github.com/SwissDataScienceCenter/renku-ui/issues/965) [#790](https://github.com/SwissDataScienceCenter/renku-ui/issues/790) [#526](https://github.com/SwissDataScienceCenter/renku-ui/issues/526) [#791](https://github.com/SwissDataScienceCenter/renku-ui/issues/791)
* **server:** initial express/typescript server 0462c77, closes [#225](https://github.com/SwissDataScienceCenter/renku-ui/issues/225) [#1043](https://github.com/SwissDataScienceCenter/renku-ui/issues/1043)
* kg activation and kg in datasets improvements ea22703, closes [#1108](https://github.com/SwissDataScienceCenter/renku-ui/issues/1108) [#1104](https://github.com/SwissDataScienceCenter/renku-ui/issues/1104)
* stick file tree component and set max height e35cba7, closes [#1102](https://github.com/SwissDataScienceCenter/renku-ui/issues/1102) [#1021](https://github.com/SwissDataScienceCenter/renku-ui/issues/1021)
* unify kg integration and renku version warning ebcd6ed, closes [#1079](https://github.com/SwissDataScienceCenter/renku-ui/issues/1079) [#1051](https://github.com/SwissDataScienceCenter/renku-ui/issues/1051)

### Bug Fixes

* add dataset to project redirects well and doesn't wait for the kg after submit dc4e876, closes [#1103](https://github.com/SwissDataScienceCenter/renku-ui/issues/1103) [#1075](https://github.com/SwissDataScienceCenter/renku-ui/issues/1075)
* handle objects in error responses when fetching custom templates f53ddfa, closes [#1071](https://github.com/SwissDataScienceCenter/renku-ui/issues/1071)


## [0.11.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.5...0.11.0) (2020-10-06)

### Features

* allow user to provide custom templates for project initialization ee79e8e, closes [#1006](https://github.com/SwissDataScienceCenter/renku-ui/issues/1006) [#976](https://github.com/SwissDataScienceCenter/renku-ui/issues/976)
* show commit details on-request in environments pages c672ae6, closes [#1052](https://github.com/SwissDataScienceCenter/renku-ui/issues/1052) [#853](https://github.com/SwissDataScienceCenter/renku-ui/issues/853) [#880](https://github.com/SwissDataScienceCenter/renku-ui/issues/880)
* add dataset to project active and with migration check fb9900b, closes [#1000](https://github.com/SwissDataScienceCenter/renku-ui/issues/1000) [#964](https://github.com/SwissDataScienceCenter/renku-ui/issues/964)
* use core service to fetch templates and create projects f9871b1, closes [#963](https://github.com/SwissDataScienceCenter/renku-ui/issues/963) [#703](https://github.com/SwissDataScienceCenter/renku-ui/issues/703) [#641](https://github.com/SwissDataScienceCenter/renku-ui/issues/641)
* user can add files to datasets with urls dacfd4b, closes [#985](https://github.com/SwissDataScienceCenter/renku-ui/issues/985) [#800](https://github.com/SwissDataScienceCenter/renku-ui/issues/800)
* message explaining what create and import operation do in datasets 8d302a4, closes [#988](https://github.com/SwissDataScienceCenter/renku-ui/issues/988) [#971](https://github.com/SwissDataScienceCenter/renku-ui/issues/971)
* user can perform migration from the UI e975126, closes [#975](https://github.com/SwissDataScienceCenter/renku-ui/issues/975) [#942](https://github.com/SwissDataScienceCenter/renku-ui/issues/942)


### Bug Fixes

* change name ordering with title ordering 0fb4716, closes [#1040](https://github.com/SwissDataScienceCenter/renku-ui/issues/1040) [#1039](https://github.com/SwissDataScienceCenter/renku-ui/issues/1039)
* dataset displays kg message correctly f8301d1, closes [#1060](https://github.com/SwissDataScienceCenter/renku-ui/issues/1060) [#1061](https://github.com/SwissDataScienceCenter/renku-ui/issues/1061)
* go to source and source button only displayed when inside project 6b3d2a8, closes [#1001](https://github.com/SwissDataScienceCenter/renku-ui/issues/1001) [#729](https://github.com/SwissDataScienceCenter/renku-ui/issues/729)
* properly handle missing description field in project page e5423fd, closes [#978](https://github.com/SwissDataScienceCenter/renku-ui/issues/978)
* set first user namespace as default on new project page f905771, closes [#1005](https://github.com/SwissDataScienceCenter/renku-ui/issues/1005) [#999](https://github.com/SwissDataScienceCenter/renku-ui/issues/999)
* when user clicks on dataset tabs they see an initial search c510f95, closes [#1002](https://github.com/SwissDataScienceCenter/renku-ui/issues/1002) [#826](https://github.com/SwissDataScienceCenter/renku-ui/issues/826)
* new message for file upload limits on dataset creation c66aeb1, closes [#996](https://github.com/SwissDataScienceCenter/renku-ui/issues/996) [#973](https://github.com/SwissDataScienceCenter/renku-ui/issues/973)


### Performance Improvements

* query 100 projects instead of 20 c6fced4, [#983](https://github.com/SwissDataScienceCenter/renku-ui/issues/983)
* refactor code fetching member and starred projects 7a47e6c, closes [#989](https://github.com/SwissDataScienceCenter/renku-ui/issues/989) [#986](https://github.com/SwissDataScienceCenter/renku-ui/issues/986)


### BREAKING CHANGES

* requires renku-core service supporting templates migrations, endpoints, new naming for datasets >=0.11.2
* requires renku-kg service supporting new naming for datasets >=0.7.0


## [0.10.5](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.4...0.10.5) (2020-09-28)


### Bug Fixes

* can go directly to new interactive environment page without logging in (#1044) 85ad989, closes [#1044](https://github.com/SwissDataScienceCenter/renku-ui/issues/1044) [#1030](https://github.com/SwissDataScienceCenter/renku-ui/issues/1030)
* a project-specific CPU/GPU/Memory option does not change the options configured for the server (#1025) (#1041) 5d77fbe, closes [#1025](https://github.com/SwissDataScienceCenter/renku-ui/issues/1025) [#1041](https://github.com/SwissDataScienceCenter/renku-ui/issues/1041)


### Features

* handle any number of project branches on the interactive environments page (#1042) 755c753, closes [#1042](https://github.com/SwissDataScienceCenter/renku-ui/issues/1042) [#1037](https://github.com/SwissDataScienceCenter/renku-ui/issues/1037) [#764](https://github.com/SwissDataScienceCenter/renku-ui/issues/764)

## [0.10.4](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.3...0.10.4) (2020-09-14)

### Features

* get all code resources from renkulab (not general internet) (#1027) (#1034) 94a2fe1, closes [#1027](https://github.com/SwissDataScienceCenter/renku-ui/issues/1027) [#1034](https://github.com/SwissDataScienceCenter/renku-ui/issues/1034)
* add privacy page and cookie consent banner (#981) dcad09a, closes [#981](https://github.com/SwissDataScienceCenter/renku-ui/issues/981) [#949](https://github.com/SwissDataScienceCenter/renku-ui/issues/949)
* allow anonymous user navigation in the project's collaboration tab (#987) f6723f8, closes [#987](https://github.com/SwissDataScienceCenter/renku-ui/issues/987) [#905](https://github.com/SwissDataScienceCenter/renku-ui/issues/905)
* display of relative paths in markdown and improvement in file preview in markdown (#1008)(#941)(#667) cf05ebe, closes [#1008](https://github.com/SwissDataScienceCenter/renku-ui/issues/1008) [#941](https://github.com/SwissDataScienceCenter/renku-ui/issues/941) [#667](https://github.com/SwissDataScienceCenter/renku-ui/issues/667)
* notify user of app status using statuspage.io (#938) (#980) 3310247, closes [#938](https://github.com/SwissDataScienceCenter/renku-ui/issues/938) [#980](https://github.com/SwissDataScienceCenter/renku-ui/issues/980)
* remove superfluous server setup documentation (#1018) c3c34ab, closes [#1018](https://github.com/SwissDataScienceCenter/renku-ui/issues/1018)
* render julia source and project files in the file browser 80797f4 [#979](https://github.com/SwissDataScienceCenter/renku-ui/issues/979)

### Bug Fixes

* handle response-code 500 in calls to start notebooks (#992) 13a5d76, closes [#992](https://github.com/SwissDataScienceCenter/renku-ui/issues/992)
* fix rendering issues with WYSIWYG editor toolbar (#1023) (#1022) 3c87369, closes [#1023](https://github.com/SwissDataScienceCenter/renku-ui/issues/1023) [#1022](https://github.com/SwissDataScienceCenter/renku-ui/issues/1022)


# [0.10.3](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.2...0.10.3) (2020-06-30)

### Features

**merge requests**
* group opaque changes together 49f2494, closes [#854](https://github.com/SwissDataScienceCenter/renku-ui/issues/854) [#959](https://github.com/SwissDataScienceCenter/renku-ui/issues/959)
* reorder the MR tabs as changes, commits, discussion 1311e57, closes [#854](https://github.com/SwissDataScienceCenter/renku-ui/issues/854)  [#959](https://github.com/SwissDataScienceCenter/renku-ui/issues/959)
* show merged merge requests 378958b, closes [#959](https://github.com/SwissDataScienceCenter/renku-ui/issues/959)
* show the notebook changes first 920c124, closes [#854](https://github.com/SwissDataScienceCenter/renku-ui/issues/854) [#959](https://github.com/SwissDataScienceCenter/renku-ui/issues/959)

**project search / list**
* improve projects search d43397a, closes [#961](https://github.com/SwissDataScienceCenter/renku-ui/issues/961)
* make project visualization dynamic 5afdf8a, closes [#961](https://github.com/SwissDataScienceCenter/renku-ui/issues/961) [#703](https://github.com/SwissDataScienceCenter/renku-ui/issues/703)


### Bug Fixes

**environments**
* prevent project options from disappearing on change a2a5216, closes [#950](https://github.com/SwissDataScienceCenter/renku-ui/issues/950) [#935](https://github.com/SwissDataScienceCenter/renku-ui/issues/935)
* only merge notebook server globalOptions and projectOptions for those of type enum. ba79a4d, closes [#967](https://github.com/SwissDataScienceCenter/renku-ui/issues/967) [#968](https://github.com/SwissDataScienceCenter/renku-ui/issues/968)

**project search / list**
* adjust top bar layout cd3605c, closes [#961](https://github.com/SwissDataScienceCenter/renku-ui/issues/961)
* update projects layout and navigation link f9ac9f9, closes [#961](https://github.com/SwissDataScienceCenter/renku-ui/issues/961)

**project**
* allow changes of project tags 7825315, closes [#955](https://github.com/SwissDataScienceCenter/renku-ui/issues/955) [#951](https://github.com/SwissDataScienceCenter/renku-ui/issues/951)

**dataset**
* the space after the dataset buttons is now bigger 59387fc, closes [#954](https://github.com/SwissDataScienceCenter/renku-ui/issues/954) [#958](https://github.com/SwissDataScienceCenter/renku-ui/issues/958)
* editing is disabled when modifications are not possible 620576c, closes [#953](https://github.com/SwissDataScienceCenter/renku-ui/issues/953) [#957](https://github.com/SwissDataScienceCenter/renku-ui/issues/957)


## [0.10.2](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.1...0.10.2) (2020-05-28)


### Bug Fixes

* **dataset:** add to project button removed from datasets UI (#944) 4f81797 , closes (#943) ([#943](https://github.com/SwissDataScienceCenter/renku-ui/issues/943)) ([#944](https://github.com/SwissDataScienceCenter/renku-ui/issues/944))

### Features

* **collaboration:** display separated for open and closed issues/merge requests and pagination added (#939) cb074bd, closes (#851)  ([#851](https://github.com/SwissDataScienceCenter/renku-ui/issues/851)) ([#939](https://github.com/SwissDataScienceCenter/renku-ui/issues/939))

## [0.10.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.10.0...0.10.1) (2020-05-26)


### Features

**editor**
* ckeditor partially integrated inside renku (#926) (#927) 355fca7, closes [#926](https://github.com/SwissDataScienceCenter/renku-ui/issues/926) [#927](https://github.com/SwissDataScienceCenter/renku-ui/issues/927)

**datasets**
* users can add datasets that are inside renku to other projects (#527) (#873) 5e992ef, closes [#527](https://github.com/SwissDataScienceCenter/renku-ui/issues/527) [#873](https://github.com/SwissDataScienceCenter/renku-ui/issues/873)

**environments**
* filter autosaved branches per username (#920) dca40ca, closes [#920](https://github.com/SwissDataScienceCenter/renku-ui/issues/920) [#906](https://github.com/SwissDataScienceCenter/renku-ui/issues/906)


**markdown**
*  code is highlighted a bit more  (#930) (#931) ae8cf14, closes [#930](https://github.com/SwissDataScienceCenter/renku-ui/issues/930) [#931](https://github.com/SwissDataScienceCenter/renku-ui/issues/931)

**project**
* show commit list (#917) 1128a5d, closes [#917](https://github.com/SwissDataScienceCenter/renku-ui/issues/917) [#852](https://github.com/SwissDataScienceCenter/renku-ui/issues/852)

### Bug Fixes

**datasets**
* dataset has all folders from unzipped file (#896) (#898) 8cbdf6f, closes [#896](https://github.com/SwissDataScienceCenter/renku-ui/issues/896) [#898](https://github.com/SwissDataScienceCenter/renku-ui/issues/898)
* buttons changed in dataset add and dataset takes too long error (#921) (#934) 083a9cb, closes [#921](https://github.com/SwissDataScienceCenter/renku-ui/issues/921) [#934](https://github.com/SwissDataScienceCenter/renku-ui/issues/934)
* if a dataset fails we display non-failed datasets (#924) (#933) 506f5f2, closes [#924](https://github.com/SwissDataScienceCenter/renku-ui/issues/924) [#933](https://github.com/SwissDataScienceCenter/renku-ui/issues/933)



## [0.10.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.9.1...0.10.0) (2020-04-24)


### Features

**environments**
* allow anonymous users to start environments 9cdaadf, closes [#857](https://github.com/SwissDataScienceCenter/renku-ui/issues/857)
* allow unprivileged users to start environments 2a0e4d0, closes [#857](https://github.com/SwissDataScienceCenter/renku-ui/issues/857)

**datasets**
* creation and import unified (#904) da2101f, closes [#904](https://github.com/SwissDataScienceCenter/renku-ui/issues/904)

**help/documentation**
* add links to renku docs to the help dropdown menu (#911) e595263, closes [#911](https://github.com/SwissDataScienceCenter/renku-ui/issues/911) [#892](https://github.com/SwissDataScienceCenter/renku-ui/issues/892)
* add links to renku docs to the help page (#911) a390cd7, closes [#911](https://github.com/SwissDataScienceCenter/renku-ui/issues/911) [#892](https://github.com/SwissDataScienceCenter/renku-ui/issues/892)
* update links to new renku tutorial url (#911) 80bf4f3, closes [#911](https://github.com/SwissDataScienceCenter/renku-ui/issues/911) [#892](https://github.com/SwissDataScienceCenter/renku-ui/issues/892)


**misc**
* add links to gitlab (#890) 4538959, closes [#890](https://github.com/SwissDataScienceCenter/renku-ui/issues/890) [#867](https://github.com/SwissDataScienceCenter/renku-ui/issues/867)
* hide cells hidden in papermill report mode (#870) 8e1c035, closes [#870](https://github.com/SwissDataScienceCenter/renku-ui/issues/870) [#838](https://github.com/SwissDataScienceCenter/renku-ui/issues/838)
* add maintenace page (#900) 8a4685a, closes [#900](https://github.com/SwissDataScienceCenter/renku-ui/issues/900) [#894](https://github.com/SwissDataScienceCenter/renku-ui/issues/894)
* expose web-ide to all logged users cca8431
* provide UI for hiding/showing code cells (#870) 396d0cb, closes [#870](https://github.com/SwissDataScienceCenter/renku-ui/issues/870) [#838](https://github.com/SwissDataScienceCenter/renku-ui/issues/838)


### Bug Fixes

* consider falsy string values for maintenance page (#903) 7c6bb8c, closes [#903](https://github.com/SwissDataScienceCenter/renku-ui/issues/903)
* improve styling of notebooks (#870) edc6c6d, closes [#870](https://github.com/SwissDataScienceCenter/renku-ui/issues/870)
* remove conditional variables from template file (#910) 927a6d3, closes [#910](https://github.com/SwissDataScienceCenter/renku-ui/issues/910)
* update the jupyter button used in file view (#909) c359034, closes [#909](https://github.com/SwissDataScienceCenter/renku-ui/issues/909)


### BREAKING CHANGES

**environments**
* Requires backend components supporting anonymous users environments ([renku-notebooks 0.7.2](https://github.com/SwissDataScienceCenter/renku-notebooks/releases/tag/0.7.2) or later)

**datasets**
* dataset_name changed to short_name in renku-core 0.10.3 [#907](https://github.com/SwissDataScienceCenter/renku-ui/issues/907) [#913](https://github.com/SwissDataScienceCenter/renku-ui/issues/913)


## [0.9.1](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.9.0...0.9.1) (released 2020-04-01)

### Features

**help**
* Refresh links and information, add a new help menu to the top navigation bar [#607](https://github.com/SwissDataScienceCenter/renku-ui/issues/607), [#872](https://github.com/SwissDataScienceCenter/renku-ui/pull/872)

**collaboration**
* Improve markdown tables layout [#882](https://github.com/SwissDataScienceCenter/renku-ui/pull/882)
* Show markdown content in the issues list [#847](https://github.com/SwissDataScienceCenter/renku-ui/issues/847), [#885](https://github.com/SwissDataScienceCenter/renku-ui/pull/885)


## [0.9.0](https://github.com/SwissDataScienceCenter/renku-ui/compare/0.8.0...0.9.0) (released 2020-03-25)

### Features

**dataset**
* User can cancel a file upload [#738](https://github.com/SwissDataScienceCenter/renku-ui/issues/738), [#813](https://github.com/SwissDataScienceCenter/renku-ui/pull/813)
* Allow import of datasets from data repositories though the UI [#528](https://github.com/SwissDataScienceCenter/renku-ui/issues/528), [#778](https://github.com/SwissDataScienceCenter/renku-ui/pull/778)
* Allow uploading file hierarchies in zip format [#796](https://github.com/SwissDataScienceCenter/renku-ui/issues/796),  [#849](https://github.com/SwissDataScienceCenter/renku-ui/pull/849)


**environments**
* Easy access to the branch/commit file listing [#493](https://github.com/SwissDataScienceCenter/renku-ui/issues/493), [#836](https://github.com/SwissDataScienceCenter/renku-ui/pull/836)
* Display the resources requested by an environment [#788](https://github.com/SwissDataScienceCenter/renku-ui/issues/788), [#834](https://github.com/SwissDataScienceCenter/renku-ui/pull/834)

**project**
* Improvements to the handling of markdown content [#845](https://github.com/SwissDataScienceCenter/renku-ui/pull/845), [#846](https://github.com/SwissDataScienceCenter/renku-ui/pull/846)


### Bug Fixes

**dataset**
* Show file listing with folder hierarchy [#840](https://github.com/SwissDataScienceCenter/renku-ui/pull/840)

**project**
* Search uses clearer labeling [#771](https://github.com/SwissDataScienceCenter/renku-ui/pull/771), [#807](https://github.com/SwissDataScienceCenter/renku-ui/pull/807)

### BREAKING CHANGES

* Requires renku-notebooks 0.7.0
* Requires renku-core 0.9.2


## [0.8.0](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.8.0) (released 2020-03-04)


### Features

**dataset**

* Creating datasets from UI [#524](https://github.com/SwissDataScienceCenter/renku-ui/issues/524), [#679](https://github.com/SwissDataScienceCenter/renku-ui/pull/679)
* Adding files to datasets from UI [#650](https://github.com/SwissDataScienceCenter/renku-ui/issues/650), [#744](https://github.com/SwissDataScienceCenter/renku-ui/pull/744)

**r-markdown**

* Display rmd files [#739](https://github.com/SwissDataScienceCenter/renku-ui/issues/739), [#740](https://github.com/SwissDataScienceCenter/renku-ui/pull/740)

**project**

* Show useful information for a project/namespace [#750](https://github.com/SwissDataScienceCenter/renku-ui/issues/750), [#780](https://github.com/SwissDataScienceCenter/renku-ui/pull/780)
* Make GitLab IDE available for working with repo [#699](https://github.com/SwissDataScienceCenter/renku-ui/issues/699), [#752](https://github.com/SwissDataScienceCenter/renku-ui/pull/752)
* Link to GitLab forks page for viewing fork information [#765](https://github.com/SwissDataScienceCenter/renku-ui/issues/765), [#746](https://github.com/SwissDataScienceCenter/renku-ui/issues/746), [#768](https://github.com/SwissDataScienceCenter/renku-ui/pull/768)

**collaboration**

* Update presentation of merge requests [#692](https://github.com/SwissDataScienceCenter/renku-ui/issues/692), [#774](https://github.com/SwissDataScienceCenter/renku-ui/pull/774)
* Update presentation of issues [#690](https://github.com/SwissDataScienceCenter/renku-ui/issues/690), [#760](https://github.com/SwissDataScienceCenter/renku-ui/pull/760)

**environments**

* Support project-level default settings [#481](https://github.com/SwissDataScienceCenter/renku-ui/issues/481), [#717](https://github.com/SwissDataScienceCenter/renku-ui/pull/717)

**misc**

* Show group avatars [#733](https://github.com/SwissDataScienceCenter/renku-ui/issues/733), [#751](https://github.com/SwissDataScienceCenter/renku-ui/pull/751)


### Bug Fixes

**general**

* User profile is verified before opening UI [#756](https://github.com/SwissDataScienceCenter/renku-ui/issues/756), [#782](https://github.com/SwissDataScienceCenter/renku-ui/pull/782)

**project**

* Close the fork dialog after forking [#723](https://github.com/SwissDataScienceCenter/renku-ui/issues/723), [#745](https://github.com/SwissDataScienceCenter/renku-ui/pull/745)

**project search**

* Show public projects when filtering by group [#726](https://github.com/SwissDataScienceCenter/renku-ui/issues/726), [#762](https://github.com/SwissDataScienceCenter/renku-ui/pull/762)

**environments**

* LFS Data is now retrieved when the checkbox is selected [#736](https://github.com/SwissDataScienceCenter/renku-ui/issues/736)


### BREAKING CHANGES

* Requires renku-gateway 0.7.0
* Requires renku-graph 0.47.2


## [0.7.3](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.7.3) (released 2020-01-13)


### Features

**datasets**

* Support pagination in display of data sets ([#713](https://github.com/SwissDataScienceCenter/renku-ui/issues/713), [#714](https://github.com/SwissDataScienceCenter/renku-ui/pull/714))

### Bug Fixes

**nested groups**

* Correctly handle nested groups in the URLs ([#716](https://github.com/SwissDataScienceCenter/renku/issues/716), [#708](https://github.com/SwissDataScienceCenter/renku-ui/pull/708))


## [0.7.2](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.7.2) (released 2019-11-22)

### Features

**datasets**

* Add global dataset tab to search through all datasets ([#521](https://github.com/SwissDataScienceCenter/renku-ui/issues/521), [#647](https://github.com/SwissDataScienceCenter/renku-ui/pull/647), [#676](https://github.com/SwissDataScienceCenter/renku-ui/pull/676))
* Add more details on dataset pages ([#674](https://github.com/SwissDataScienceCenter/renku-ui/issues/674), [#687](https://github.com/SwissDataScienceCenter/renku-ui/issues/687), [#684](https://github.com/SwissDataScienceCenter/renku-ui/pull/684), [#688](https://github.com/SwissDataScienceCenter/renku-ui/pull/688))

**project templates**

* Update name variables to be fully [Jinja2](https://www.palletsprojects.com/p/jinja/) compliant ([#675](https://github.com/SwissDataScienceCenter/renku-ui/issues/675), [#672](https://github.com/SwissDataScienceCenter/renku-ui/pull/672))

**stability**

* Update libraries to the latest version (except react-redux) ([#657](https://github.com/SwissDataScienceCenter/renku-ui/issues/657), [#666](https://github.com/SwissDataScienceCenter/renku-ui/issues/666), [#673](https://github.com/SwissDataScienceCenter/renku-ui/pull/673))


### Bug Fixes

**collaboration**

* Selecting merge requests doesn't remove the active state from the collaboration tab icon anymore ([#668](https://github.com/SwissDataScienceCenter/renku-ui/issues/668), [#685](https://github.com/SwissDataScienceCenter/renku-ui/pull/685))

**stability**

* Address icon flickering issues in Chrome ([#680](https://github.com/SwissDataScienceCenter/renku-ui/issues/680), [#681](https://github.com/SwissDataScienceCenter/renku-ui/pull/681))


## [0.7.1](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.7.1) (released 2019-11-05)

### Features

**collaboration**

* Move *Ku* and *Pending Changes* to a **Collaboration** tab and renamed to *Issues* and *Merge Requests*, respectively ([#599](https://github.com/SwissDataScienceCenter/renku-ui/issues/599), [#649](https://github.com/SwissDataScienceCenter/renku-ui/pull/649))

**project templates**

* Use latest project templates ([#665](https://github.com/SwissDataScienceCenter/renku-ui/pull/665))


### Bug Fixes

**environments**

* Show correct commit list ([#663](https://github.com/SwissDataScienceCenter/renku-ui/issues/663), [#664](https://github.com/SwissDataScienceCenter/renku-ui/pull/664))

**projects**

* Show meaningful error message when project creation fails ([#636](https://github.com/SwissDataScienceCenter/renku-ui/issues/636), [#656](https://github.com/SwissDataScienceCenter/renku-ui/pull/656))


## [0.7.0](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.7.0) (released 2019-10-30)

### Features

**notebooks/interactive environments**

* Use *interactive environment* instead of inaccurate term *notebook* ([#568](https://github.com/SwissDataScienceCenter/renku-ui/issues/568), [#614](https://github.com/SwissDataScienceCenter/renku-ui/pull/614))
* More logical structure of launch and manage pages ([#482](https://github.com/SwissDataScienceCenter/renku-ui/issues/482), [#618](https://github.com/SwissDataScienceCenter/renku-ui/pull/618))
* Provide tools for controlling and getting info about interactive environments ([#361](https://github.com/SwissDataScienceCenter/renku-ui/issues/361), [#499](https://github.com/SwissDataScienceCenter/renku-ui/issues/499), [#414](https://github.com/SwissDataScienceCenter/renku-ui/issues/414), [#596](https://github.com/SwissDataScienceCenter/renku-ui/issues/596), [#633](https://github.com/SwissDataScienceCenter/renku-ui/pull/633), [#646](https://github.com/SwissDataScienceCenter/renku-ui/pull/646))
* The interactive environment button works better ([#559](https://github.com/SwissDataScienceCenter/renku-ui/issues/559), [#582](https://github.com/SwissDataScienceCenter/renku-ui/pull/582))
* Show project name in interactive environment server url ([#584](https://github.com/SwissDataScienceCenter/renku-ui/issues/584))

**datasets**

* Display datasets inside a project ([#525](https://github.com/SwissDataScienceCenter/renku-ui/issues/525), [#562](https://github.com/SwissDataScienceCenter/renku-ui/pull/562), [#555](https://github.com/SwissDataScienceCenter/renku-ui/pull/555) [#580](https://github.com/SwissDataScienceCenter/renku-ui/pull/580))

**miscellaneous**

* **project search** Added search by username and group ([#560](https://github.com/SwissDataScienceCenter/renku-ui/issues/560), [#593](https://github.com/SwissDataScienceCenter/renku-ui/pull/593))
* **project fork** Allow changing the project name when forking ([#616](https://github.com/SwissDataScienceCenter/renku-ui/issues/616), [#626](https://github.com/SwissDataScienceCenter/renku-ui/pull/626))
* **file browser** Show commit hash nad timestamp in the file browser ([#487](https://github.com/SwissDataScienceCenter/renku-ui/issues/487), [#606](https://github.com/SwissDataScienceCenter/renku-ui/pull/606))
* **url:** Project URLs use namespace and name like gitlab ([#167](https://github.com/SwissDataScienceCenter/renku-ui/issues/167), [#579](https://github.com/SwissDataScienceCenter/renku-ui/pull/579))
* **copy urls** Added button to copy URLs for git remotes and paths to files ([#653](https://github.com/SwissDataScienceCenter/renku-ui/issues/653), [#654](https://github.com/SwissDataScienceCenter/renku-ui/pull/654))


### Bug Fixes

* **profile** Open profile page in a new window ([#401](https://github.com/SwissDataScienceCenter/renku-ui/issues/401), [#608](https://github.com/SwissDataScienceCenter/renku-ui/pull/608))
* **project search** Your projects tab is updated when a new project is created ([#408](https://github.com/SwissDataScienceCenter/renku-ui/issues/408), #[598](https://github.com/SwissDataScienceCenter/renku-ui/pull/598))
* **project** Handle larger font user setting correctly ([#537](https://github.com/SwissDataScienceCenter/renku-ui/issues/537), [#651](https://github.com/SwissDataScienceCenter/renku-ui/pull/651))
* **project** Show correct user name when creating a new project ([#635](https://github.com/SwissDataScienceCenter/renku-ui/issues/635), [#645](https://github.com/SwissDataScienceCenter/renku-ui/pull/645))
* **interactive environments** Display more accurate image availability information during notebook launch ([#590](https://github.com/SwissDataScienceCenter/renku-ui/issues/590), [#592](https://github.com/SwissDataScienceCenter/renku-ui/pull/592))
* **interactive environments** Handle repos with no master branch ([#595](https://github.com/SwissDataScienceCenter/renku-ui/issues/595), [#597](https://github.com/SwissDataScienceCenter/renku-ui/pull/597))
* **file browser** Display R file formats in UI ([#600](https://github.com/SwissDataScienceCenter/renku-ui/issues/600), [#602](https://github.com/SwissDataScienceCenter/renku-ui/pull/602))
* **ui** Render HTML in markdown correctly ([#605](https://github.com/SwissDataScienceCenter/renku-ui/issues/605), [#625](https://github.com/SwissDataScienceCenter/renku-ui/pull/625))

### BREAKING CHANGES

* Requires renku-gateway 0.6.0
* Requires renku-graph 0.22.0

## [0.6.4](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=%E2%9C%93&q=is%3Aclosed+milestone%3A0.6.4) (released 2019-08-28)

### Features

* **notebooks:** Check Docker image status before starting a new interactive environment ([#495](https://github.com/SwissDataScienceCenter/renku-ui/issues/495), [#575](https://github.com/SwissDataScienceCenter/renku-ui/pull/575))
* **notebooks:** Help users without sufficient permission starting an interactive enviroment ([#565](https://github.com/SwissDataScienceCenter/renku-ui/issues/565), [#578](https://github.com/SwissDataScienceCenter/renku-ui/pull/578))
* **notebooks:** Commit time is now local timezone aware ([#571](https://github.com/SwissDataScienceCenter/renku-ui/issues/571), [#577](https://github.com/SwissDataScienceCenter/renku-ui/pull/577))

### Bug Fixes

* **notebooks:** Allow user to set interactive environments GPU's number (available only for specific deployments) ([#574](https://github.com/SwissDataScienceCenter/renku-ui/issues/574), [#576](https://github.com/SwissDataScienceCenter/renku-ui/pull/576))


## [0.6.3](https://github.com/SwissDataScienceCenter/renku-ui/issues?utf8=✓&q=is%3Aclosed+milestone%3A0.6.3) (released 2019-08-20)

### Features
* **lineage:** Style data and code differently in lineage view ([#553](https://github.com/SwissDataScienceCenter/renku-ui/pull/553))
* **templates:** The repo and ref for the base templates is now configurable ([#561](https://github.com/SwissDataScienceCenter/renku-ui/issues/561), [#566](https://github.com/SwissDataScienceCenter/renku-ui/pull/566))


### Bug Fixes
* Restore Jupyter button functionality in notebook file preview ([#428](https://github.com/SwissDataScienceCenter/renku-ui/issues/428), [#556](https://github.com/SwissDataScienceCenter/renku-ui/pull/556/commits))
* Edit project metadata works again ([#427](https://github.com/SwissDataScienceCenter/renku-ui/issues/427), [#554](https://github.com/SwissDataScienceCenter/renku-ui/pull/554))

### BREAKING CHANGES

* Requires renku-notebooks 0.5.0
* Requires renku-gateway 0.5.0
* Requires renku-graph 0.11.0


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
