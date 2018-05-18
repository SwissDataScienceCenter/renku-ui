# Data Model

This document describes the structure of entities and provides guidelines for how entities should be defined.

We looked at the following sources for inspiration:

- https://developer.github.com/v3/issues/#list-issues
- https://docs.gitlab.com/ce/api/projects.html
- https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets

This should be conceptually backend-agnostic, but this document provides a mapping to the GitLab API.

# Guidelines



# Recurring Keys

## display

Display includes information that is commonly used to display the entity. Almost every entity contains a display field, and these values contained therein are computed from entity metadata and not directly editable, but they fields used to compute the values may vary from entity to entity. 

- title (project:name, issue:title in GitLab)
- slug (project:path or issue:iid in GitLab)
- display_id (project:path_with_namespace or issue:tail of web_url in GitLab)
- short_description (project:description, issue:title in GitLab)

## metadata

Metadata is not a self-contained entity, but it appears as a key in many places. It contains system information about the entity, such as who created the entity, when it was created, etc. Not all keys apppear for all entities, but these are some common ones. 

- author (a User object)
- created_at
- updated_at
- last_activity_at
- permissions
- id
- iid (this is an id that is only unique in the context of the parent entity, but not globablly unique)

## settings

Settings is not a self-contained entity, but appears as a key in many places.

- visibility
- user_permissions
- group_permissions

# Entities

## User

- metadata (see above)
- username
- name
- avatar_url

## Project

These are GitLab projects. https://docs.gitlab.com/ce/api/projects.html

- display (see above)
- metadata (see above)
- settings (see above)
- description
- long_description (Contents of readme file)
- name
- namespace
- forks_count
- star_count
- tags
- kus
- repository_content (these are computed values based on the content in the repo)
  - datasets
  - notebooks
  - workflows
  - sources
  - libraries

## Ku

These are GitLab issues. https://docs.gitlab.com/ce/api/issues.html

- project_id
- display (see above)
- metadata (see above)
- settings (see above)
- long_description
- labels
- notes
- assignees
- reactions (issue:award_emoji)

## Contribution

These are GitLab Notes. https://docs.gitlab.com/ce/api/notes.html

- ku_id (noteable_id in GitLab)
- ku_iid (noteable_iid in GitLab)
- metadata (see above)
- body
