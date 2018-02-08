# incubator-renga-ui

Repo for exploring UI ideas

# Quickstart
After cloning the repository simply run `./start.sh`. This will launch create any needed folders, start a
a [GitLab instance](https://hub.docker.com/r/gitlab/gitlab-ce/) and the incubator-renga-ui in two separate docker containers.
Note that the GitLab instance might take several minutes to start. Once everything is up and running you can access
the Renga ui under `http://localhost:5000` and the GitLab UI under `http://localhost:5080`.

# First Time
For the time being, you have to create a GitLab token before you can do anything useful through the UI.
Open `http://localhost:5080`. You should go through the steps to create a user and then log in.

\[ If you prefer not to create a user, you can use `root/root-password` as initial username/password and the initial password ("root-password" or whatever you have set
in the docker-compose file). \]

Once you have logged in, you should create an access token for the current user
`http://localhost:5080/profile/personal_access_tokens`. Now export the created access token and restart the services:

Bash 
```bash
$ export GITLAB_SECRET_TOKEN=access-token
$ docker-compose up -d
```

Fish
```fish
$ set -x GITLAB_SECRET_TOKEN access-token
$ docker-compose up -d
```

# Developing the UI
The docker-compose file mounts the `./src` and `./public` into the ui container. You can therefore simply open the source
code files and start editing. The development server running inside the container will detect these changes and update
the UI automatically. However, for serious development you might want to run the development server on your machine directly
and not inside a docker container. For this, change the target of the proxy definition inside `package.json` from
`http://dev.gitlab:5080` to `http://localhost:5080` and the following commands:
```
npm install
npm start
```
This will make the ui available under `http://localhost:3000` (a browser tab should open automatically).

As long as you have executed `npm install` in your environment, you will have other commands defined in `package.json`,
such as `npm run lint`, `npm build`, etc., available to you.
