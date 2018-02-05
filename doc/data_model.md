# Data Model

This document describes the structure of entities and provides guidelines for how entities should be defined.

We looked at the following sources for inspiration:

- https://developer.github.com/v3/issues/#list-issues
- https://docs.gitlab.com/ce/api/projects.html
- https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets

This should be conceptually backend-agnostic, but this document provides a mapping to the GitLab API.

# Recurring Keys

## metadata

Metadata is not a self-contained entity, but it appears as a key in many places. It contains information about who created the entity, when it was created, etc.

- author (a User object)
- visibility
- created_at
- updated_at
- last_activity_at
- id

## display

Display includes information that is commonly used to display the entity

- title (project:name, issue:title in Gitlab)
- slug (project:path or issue:iid in GitLab)
- display_id (project:path_with_namespace or issue:tail of web_url in GitLab)
- description

# Entities

## User

- metadata (see above)
- username
- name
- avatar_url

## Project

These are GitLab projects. https://docs.gitlab.com/ce/api/projects.html

- metadata (see above)
- display (see above)
- long_description (Contents of readme file)
- forks_count
- star_count
- kus
- datasets
- notebooks
- workflows
- sources
- libraries
- tags

## Ku

These are GitLab issues. https://docs.gitlab.com/ce/api/issues.html

- project_id
- metadata (see above)
- display (see above)
- long_description
- labels
- notes
- assignees
- reactions (issue:award_emoji)

## Note (previously Contribution)

These are GitLab Notes. https://docs.gitlab.com/ce/api/notes.html

- noteable_id
- metadata (see above)
- body
