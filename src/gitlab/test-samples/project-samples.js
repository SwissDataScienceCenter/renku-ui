export const projects = [
  {
    'id': 3,
    'description': 'This is a test project.',
    'name': 'A-first-project',
    'name_with_namespace': 'Administrator / A-first-project',
    'path': 'A-first-project',
    'path_with_namespace': 'root/A-first-project',
    'created_at': '2018-02-02T15:12:23.034Z',
    'default_branch': null,
    'tag_list': [],
    'ssh_url_to_repo': 'git@localhost:root/A-first-project.git',
    'http_url_to_repo': 'http://localhost/root/A-first-project.git',
    'web_url': 'http://localhost/root/A-first-project',
    'avatar_url': null,
    'star_count': 0,
    'forks_count': 0,
    'last_activity_at': '2018-02-02T15:12:23.034Z',
    '_links': {
      'self': 'http://localhost/api/v4/projects/3',
      'issues': 'http://localhost/api/v4/projects/3/issues',
      'merge_requests': 'http://localhost/api/v4/projects/3/merge_requests',
      'repo_branches': 'http://localhost/api/v4/projects/3/repository/branches',
      'labels': 'http://localhost/api/v4/projects/3/labels',
      'events': 'http://localhost/api/v4/projects/3/events',
      'members': 'http://localhost/api/v4/projects/3/members'
    },
    'archived': false,
    'visibility': 'public',
    'owner': {
      'id': 1,
      'name': 'Administrator',
      'username': 'root',
      'state': 'active',
      'avatar_url': 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
      'web_url': 'http://localhost/root'
    },
    'resolve_outdated_diff_discussions': false,
    'container_registry_enabled': true,
    'issues_enabled': true,
    'merge_requests_enabled': true,
    'wiki_enabled': true,
    'jobs_enabled': true,
    'snippets_enabled': true,
    'shared_runners_enabled': true,
    'lfs_enabled': true,
    'creator_id': 1,
    'namespace': {
      'id': 1,
      'name': 'root',
      'path': 'root',
      'kind': 'user',
      'full_path': 'root',
      'parent_id': null
    },
    'import_status': 'none',
    'open_issues_count': 0,
    'public_jobs': true,
    'ci_config_path': null,
    'shared_with_groups': [],
    'only_allow_merge_if_pipeline_succeeds': false,
    'request_access_enabled': false,
    'only_allow_merge_if_all_discussions_are_resolved': false,
    'printing_merge_request_link_enabled': true,
    'permissions': {
      'project_access': {
        'access_level': 40,
        'notification_level': 3
      },
      'group_access': null
    }
  },
  {
    'id': 2,
    'description': '',
    'name': 'A-second-project',
    'name_with_namespace': 'Administrator / A-second-project',
    'path': 'A-second-project',
    'path_with_namespace': 'root/A-second-project',
    'created_at': '2018-02-02T15:10:13.794Z',
    'default_branch': null,
    'tag_list': [],
    'ssh_url_to_repo': 'git@localhost:root/A-second-project.git',
    'http_url_to_repo': 'http://localhost/root/A-second-project.git',
    'web_url': 'http://localhost/root/A-second-project',
    'avatar_url': null,
    'star_count': 0,
    'forks_count': 0,
    'last_activity_at': '2018-02-02T15:10:13.794Z',
    '_links': {
      'self': 'http://localhost/api/v4/projects/2',
      'issues': 'http://localhost/api/v4/projects/2/issues',
      'merge_requests': 'http://localhost/api/v4/projects/2/merge_requests',
      'repo_branches': 'http://localhost/api/v4/projects/2/repository/branches',
      'labels': 'http://localhost/api/v4/projects/2/labels',
      'events': 'http://localhost/api/v4/projects/2/events',
      'members': 'http://localhost/api/v4/projects/2/members'
    },
    'archived': false,
    'visibility': 'private',
    'owner': {
      'id': 1,
      'name': 'Administrator',
      'username': 'root',
      'state': 'active',
      'avatar_url': 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
      'web_url': 'http://localhost/root'
    },
    'resolve_outdated_diff_discussions': false,
    'container_registry_enabled': true,
    'issues_enabled': true,
    'merge_requests_enabled': true,
    'wiki_enabled': true,
    'jobs_enabled': true,
    'snippets_enabled': true,
    'shared_runners_enabled': true,
    'lfs_enabled': true,
    'creator_id': 1,
    'namespace': {
      'id': 1,
      'name': 'root',
      'path': 'root',
      'kind': 'user',
      'full_path': 'root',
      'parent_id': null
    },
    'import_status': 'none',
    'open_issues_count': 0,
    'public_jobs': true,
    'ci_config_path': null,
    'shared_with_groups': [],
    'only_allow_merge_if_pipeline_succeeds': false,
    'request_access_enabled': false,
    'only_allow_merge_if_all_discussions_are_resolved': false,
    'printing_merge_request_link_enabled': true,
    'permissions': {
      'project_access': {
        'access_level': 40,
        'notification_level': 3
      },
      'group_access': null
    }
  }
];

export const projectReadme = '# Project Title' +
  'One Paragraph of project description goes here' +
  '## Getting Started' +
  'These instructions will get you a copy of the project up and running on your local machine for development' +
  'and testing purposes. See deployment for notes on how to deploy the project on a live system.' +
  '### Prerequisites' +
  'What things you need to install the software and how to install them' +
  '```' +
  'Give examples' +
  '```' +
  '### Installing' +
  'A step by step series of examples that tell you have to get a development env running';

