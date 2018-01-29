# incubator-renga-ui

Repo for exploring UI ideas

# Running GitLab as Metadata Server

The easiest way to get a local GitLab instance up and running is to use the [GitLab community edition docker image](https://hub.docker.com/r/gitlab/gitlab-ce/).

## Example configuration

You can create the necessary directories through `mkdir config git-data lfs-data logs` and then run `docker-compose up -d --build` using a docker-compose.yml file similar to this:

```
web:
  image: 'gitlab/gitlab-ce:latest'
  restart: always
  hostname: 'localhost'
  environment:
    GITLAB_OMNIBUS_CONFIG: |
      external_url 'http://localhost'
      gitlab_rails['lfs_enabled'] = true      
      gitlab_rails['lfs_storage_path'] = '/var/storage/lfs-objects'
      gitlab_rails['initial_root_password'] = 'root_password'
      # Add any other gitlab.rb configuration here, each on its own line
  ports:
    - '80:80'
    - '443:443'
    - '22:22'
  volumes:
    - './config:/etc/gitlab'
    - './logs:/var/log/gitlab'
    - './git-data:/var/opt/gitlab'
    - './lfs-data:/var/storage/lfs-objects'

```

## Creating a GitLab token
After starting GitLab locally you can open http://localhost in your browser and explore the GitLab user interface, create projects, users, issues, etc. For the first login, use "root" as username and the initial password you have set in the docker-compose file ("root-password" above). In order to act on behalf of a user through the incubator UI, you first **have to create an access token** for that user through the GitLab client http://localhost/profile/personal_access_tokens.

# Running the incubator UI

Export the created access token and start the development server:
```
$ export GITLAB_SECRET_TOKEN=previously-created-token
$ npm install        # normally only necessary the first time or if dependencies have changed
$ npm start
```
Then point your browser at http://localhost:3000/ (this should automatically happen). This will show you a welcome page.
