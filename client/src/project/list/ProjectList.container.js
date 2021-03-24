/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React, { useState, useEffect } from "react";

import { ProjectList as ProjectListPresent } from "./ProjectList.present";
import { Url, getSearchParams } from "../../utils/url";


// *** Constants ***
const PROJECT_NEW_URL = Url.get(Url.pages.project.new);

const CONVERSIONS = {
  q: "query", currentTab: "section", currentPage: "page", orderSearchAsc: "ascending", usersOrGroup: "targetUser"
};

const SECTION_MAP = {
  own: "own",
  starred: "starred",
  all: "all",
};

const SEARCH_IN_MAP = {
  projects: { value: "projects", text: "Project" },
  users: { value: "users", text: "User" },
  groups: { value: "groups", text: "Group" }
};

const ORDER_BY_MAP = {
  name: { value: "name", text: "Name" },
  creationDate: { value: "created_at", text: "Creation date" },
  updateDate: { value: "last_activity_at", text: "Update date" }
};

const URL_MAP = {
  projectsUrl: Url.get(Url.pages.projects), // TODO: remove?
  projectsSearchUrl: Url.get(Url.pages.projects.all), // --> all --> /all
  projectNewUrl: Url.get(Url.pages.project.new),
  starred: Url.get(Url.pages.projects.starred), // --> starred --> /starred
  yourProjects: Url.get(Url.pages.projects) // --> your --> null
};


// *** Defaults ***

const DEFAULT_PROJECTS = { fetched: null, fetching: null, total: null, pages: null, list: [] };

const DEFAULT_USERS_GROUPS = { fetched: null, fetching: null, list: [] };

const DEFAULT_PARAMS = {
  query: "",
  page: 1,
  perPage: 10, // TODO: change to 10
  searchIn: SEARCH_IN_MAP.projects.value,
  orderBy: ORDER_BY_MAP.updateDate.value,
  ascending: false,
};


// *** Helper functions ***

/**
 * Return section based on current location.
 *
 * @param {object} location - React location object.
 * @returns {string} current section, as defined in the enum SECTION_MAP.
 */
function getSection(location) {
  let section = SECTION_MAP.own;
  if (location && location.pathname) {
    if (location.pathname.endsWith("/starred"))
      section = SECTION_MAP.starred;
    else if (location.pathname.endsWith("/all"))
      section = SECTION_MAP.all;
  }
  return section;
}

/**
 * Return full URL based on current parameters and an optional target section.
 *
 * @param {object} params - parameters object.
 * @param {string} [target] - optional target section. It's taken from `params` when not provided.
 */
function buildPreciseUrl(params, target) {
  const section = target ?
    target :
    params.section;

  let page = Url.pages.projects.all;
  if (section === SECTION_MAP.own)
    page = Url.pages.projects.base;
  else if (section === SECTION_MAP.starred)
    page = Url.pages.projects.starred;

  let cleanParams = params ?
    { ...params } :
    {};
  if (cleanParams.section)
    delete cleanParams.section;

  const url = Url.get(page, cleanParams);
  return url;
}

/**
 * Remove the default parameters from the list of params.
 * This contributes in keeping the URLs as short and clean as possible.
 *
 * @param {object} params - parameters object.
 * @param {boolean} [removeSection] - whether to remove the `section` field form the params. Default is false.
 */
function removeDefaultParams(params, removeSection = false) {
  let modifiedParams = {};
  for (let [param, value] of Object.entries(params)) {
    if (value !== DEFAULT_PARAMS[param])
      modifiedParams[param] = value;
  }
  if (removeSection && Object.keys(modifiedParams).includes("section"))
    delete modifiedParams.section;
  return modifiedParams;
}

/** React hook to monitor location changes and set params */
function useLocation(props, setParams, setTargetUser) {
  useEffect(() => {
    const newSection = getSection(props.location);
    let newSearchParams = getSearchParams(null, CONVERSIONS);

    // consider the default params when setting the new default
    let newParamsFull = { ...newSearchParams };
    const newParamsKeys = Object.keys(newParamsFull);
    for (let [param, value] of Object.entries(DEFAULT_PARAMS)) {
      if (!newParamsKeys.includes(param))
        newParamsFull[param] = value;
    }

    // prevent illegal searchIn
    if (newSection !== SECTION_MAP.all && newParamsFull.searchIn !== SEARCH_IN_MAP.projects.value)
      newParamsFull.searchIn = SEARCH_IN_MAP.projects.value;

    setParams(p => {
      const newParams = { ...p, ...newParamsFull, section: newSection };
      // prevent extra queries when changing searchIn
      if (newParams.searchIn !== p.searchIn)
        setTargetUser(null);

      return newParams;
    });
  }, [props.location, setParams, setTargetUser]);
}

/** React hook to update project search results when parameters change */
function useProjectSearchParams(client, params, setParams, setProjects) {
  useEffect(() => {
    if (params.searchIn !== SEARCH_IN_MAP.projects.value)
      return;

    // prepare fetching projects
    setProjects(p => ({ ...p, fetched: null, fetching: true }));
    let queryParams = {
      search: params.query,
      page: params.page,
      per_page: params.perPage,
      order_by: params.orderBy,
      sort: params.ascending ? "asc" : "desc",
    };
    if (params.section === SECTION_MAP.own)
      queryParams.membership = true;
    else if (params.section === SECTION_MAP.starred)
      queryParams.starred = true;
    const pageRequest = params.page;

    // fetch projects when feasible
    client.getProjects(queryParams).then((response) => {
      // search again for page 1 if the user was trying to get content for an un-existing page
      if (response.pagination.totalPages && response.pagination.totalPages < pageRequest) {
        setParams(p => ({ ...p, page: 1 })); // TODO: use removeDefaultParams + buildPreciseUrl
        return;
      }
      setProjects({
        fetching: false,
        fetched: new Date(),
        total: response.pagination.totalItems,
        pages: response.pagination.totalPages,
        list: response.data,
      });
    });
  }, [params, client, setParams, setProjects]);
}

/** React hook to update user search results when parameters change */
function useUserSearchParams(client, params, setUsers, setTargetUser) {
  useEffect(() => {
    if (params.searchIn === SEARCH_IN_MAP.projects.value)
      return;

    // reset target user
    //setTargetUser(null);

    // Never fetch when filtering for something shorter than 3 chars
    if (params.query == null || !params.query.toString().length || params.query.toString().length < 3) {
      setUsers({ ...DEFAULT_USERS_GROUPS, fetching: false, fetched: new Date() });
      return;
    }

    // prepare fetching users
    setUsers(u => ({ ...u, fetched: null, fetching: true }));
    let queryParams = { search: params.query, per_page: 100 };

    // fetch users when feasible
    client.searchUsersOrGroups(queryParams, params.searchIn).then((response) => {
      const data = response.data ?
        response.data :
        response;

      // Set new target // ? mind that targetUser is not currently used
      let target = params.targetUser ?
        params.targetUser :
        null;
      if (!target && data && data.length) {
        target = data[0].full_path ?
          encodeURIComponent(data[0].full_path) :
          data[0].username;
      }
      setTargetUser(target);

      // set users at the end to prevent flickering
      setUsers({
        fetching: false,
        fetched: new Date(),
        list: data,
      });
    });

  }, [params.targetUser, params.query, params.searchIn, setUsers, setTargetUser, client]);
}

/** React hook to update project search results when the targetUser changes */
function useUserProjectSearch(client, params, targetUser, setParams, setProjects) {
  useEffect(() => {
    if (params.searchIn === SEARCH_IN_MAP.projects.value)
      return;

    // If no users were found, we already know there won't be any project.
    if (!targetUser) {
      setProjects({
        ...DEFAULT_PROJECTS,
        fetching: false,
        fetched: new Date(),
      });
      return;
    }

    // Prepare fetching user or group projects
    setProjects(p => ({ ...p, fetched: null, fetching: true }));
    let queryParams = {
      page: params.page,
      per_page: params.perPage,
      order_by: params.orderBy,
      sort: params.ascending ? "asc" : "desc",
    };
    const pageRequest = params.page;

    // Fetch user or group projects
    client.getProjectsBy(params.searchIn, targetUser, queryParams)
      .then((response) => {
        // search again for page 1 if the user was trying to get content for an nonexistent page
        if (response.pagination.totalPages && response.pagination.totalPages < pageRequest) {
          setParams(p => ({ ...p, page: 1 })); // TODO: use removeDefaultParams + buildPreciseUrl
          return;
        }
        setProjects({
          fetching: false,
          fetched: new Date(),
          total: response.pagination.totalItems,
          pages: response.pagination.totalPages,
          list: response.data,
        });
      });
  }, [client, params.searchIn, params.page, params.perPage, params.orderBy, params.ascending,
    targetUser, setParams, setProjects]);
}


// *** React functional components ***

/**
 * Show list of projects, allowing advanced search.
 *
 * @param {object} props.location - React location object.
 * @param {object} props.history - React history object.
 * @param {object} props.client - client object.
 * @param {object} props.user - user object.
 */
function ProjectList(props) {
  // *** Setup ***
  // Redirect anonymous users when trying to perform an invalid search (manually modified link)
  if (!props.user.logged) {
    const section = getSection(props.location);
    const searchParams = getSearchParams();
    // Searching in own or starred projects
    if (section !== SECTION_MAP.all) {
      const newUrl = Url.get(Url.pages.projects.all, searchParams);
      props.history.push(newUrl);
    }
    // filtering per user or group
    if (searchParams.searchIn !== SEARCH_IN_MAP.projects.value) {
      const newParams = { ...searchParams, searchIn: SEARCH_IN_MAP.projects.value };
      const newUrl = Url.get(Url.pages.projects.all, newParams);
      props.history.push(newUrl);
    }
  }

  // Initial setup
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [users, setUsers] = useState(DEFAULT_USERS_GROUPS);
  const [targetUser, setTargetUser] = useState(null);
  const [params, setParams] = useState({
    ...(getSearchParams(DEFAULT_PARAMS, CONVERSIONS)),
    section: getSection(props.location),
  });

  // *** Hooks ***
  // Monitor location changes and set params
  useLocation(props, setParams, setTargetUser);

  // Get new projects when params change (ONLY when searching in projects)
  useProjectSearchParams(props.client, params, setParams, setProjects);

  // Get new users when params change (ONLY when searching in user or groups)
  useUserSearchParams(props.client, params, setUsers, setTargetUser);

  // Get new projects when targetUser change (ONLY when searching in user or groups)
  useUserProjectSearch(props.client, params, targetUser, setParams, setProjects);

  // *** Functions ***
  // Set the selected user or group, if it's different from the current
  // ? We can remove this is we want to always re-fetch when clicking on user/group
  const setTarget = (target) => {
    if (target === targetUser)
      return;
    setTargetUser(target);
  };

  // Perform the new search by moving to page a with proper query params
  const search = (newParams, section) => {
    let modifiedParams = removeDefaultParams(params, true);

    // Use the section to decide the target URL.
    const targetSection = section ?
      section :
      params.section;
    let target = Url.pages.projects.all;
    if (targetSection === SECTION_MAP.own)
      target = Url.pages.projects.base;
    else if (targetSection === SECTION_MAP.starred)
      target = Url.pages.projects.starred;

    // Fix illegal searchIn
    if (targetSection !== SECTION_MAP.all && modifiedParams.searchIn !== SEARCH_IN_MAP.projects.value)
      modifiedParams.searchIn = SEARCH_IN_MAP.projects.value;

    // Move to the target url.
    let addedParams = { ...modifiedParams, ...(newParams || {}) };
    const finalParams = removeDefaultParams(addedParams, true);
    const url = Url.get(target, finalParams);
    props.history.push(url);
  };

  // Get the url for other sections, params included
  const getPreciseUrl = (section) => {
    let modifiedParams = removeDefaultParams(params, true);
    if (section !== SECTION_MAP.all && modifiedParams.searchIn !== SEARCH_IN_MAP.projects.value)
      modifiedParams.searchIn = SEARCH_IN_MAP.projects.value;
    return buildPreciseUrl(modifiedParams, section);
  };

  return (
    <ProjectListPresent
      fetched={projects.fetched}
      fetching={projects.fetching}
      getAvatar={id => this.client.getAvatarFromNamespace(id)}
      getPreciseUrl={getPreciseUrl}
      loggedIn={props.user ? props.user.logged : false}
      orderByMap={ORDER_BY_MAP}
      params={params}
      projectNew={PROJECT_NEW_URL}
      projects={projects.list}
      users={users}
      search={search}
      searchInMap={SEARCH_IN_MAP}
      sectionsMap={SECTION_MAP}
      setTarget={setTarget}
      target={targetUser}
      totalProjects={projects.total}
    />
  );
}


export { URL_MAP as urlMap, ProjectList };

// test only
const tests = {
  defaults: { DEFAULT_PROJECTS, DEFAULT_USERS_GROUPS, DEFAULT_PARAMS },
  maps: { ORDER_BY_MAP, SEARCH_IN_MAP, SECTION_MAP },
  functions: { buildPreciseUrl, getSection, removeDefaultParams }
};
export { tests };
